import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { initialDatabase } from "./src/initialData";
import { AppDatabase, InspectionId, DeficiencyItem, CertificateItem, NetworkUser } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// File path for local disk persistence
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "kilo_moana_db.json");

// Load or initialize DB
let db: AppDatabase;

function loadDatabase(): AppDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      // Ensure basic structure exists
      return { ...initialDatabase, ...parsed };
    }
  } catch (e) {
    console.error("Error reading persistence file, falling back to initial data", e);
  }
  return JSON.parse(JSON.stringify(initialDatabase));
}

function saveDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving database file", e);
  }
}

db = loadDatabase();

// SSE Clients for Real-time Simultaneous Network Sync
const sseClients: Response[] = [];

function broadcastChange(type: string, payload: any) {
  saveDatabase();
  const eventData = `data: ${JSON.stringify({ type, payload, timestamp: new Date().toISOString() })}\n\n`;
  sseClients.forEach(client => {
    try {
      client.write(eventData);
    } catch (err) {
      // client disconnected
    }
  });
}

// SSE endpoint
app.get("/api/events", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.push(res);

  // Send initial ping and current connected users count
  res.write(`data: ${JSON.stringify({ type: "INIT", payload: { activeUsers: db.connectedUsers } })}\n\n`);

  req.on("close", () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) {
      sseClients.splice(idx, 1);
    }
  });
});

// Helper: Recalculate Master Calendar & Binder metrics
function recalculateMetrics() {
  let openDefCount = db.deficiencyLog.filter(d => d.status === "Open" || d.status === "In Progress").length;
  let certsCriticalCount = db.certificateRegister.filter(c => c.daysRemaining <= 30 || c.status === "Critical" || c.status === "Due Soon").length;
  let overdueCount = 0;
  let due4DaysCount = 0;

  const today = new Date();

  db.masterCalendar.forEach(item => {
    // Count open deficiencies for this specific sheet
    const sheetDefs = db.deficiencyLog.filter(
      d => d.inspectionId === item.id && (d.status === "Open" || d.status === "In Progress")
    );
    item.openDeficienciesCount = sheetDefs.length;

    // Calculate days remaining based on nextDue
    if (item.nextDue) {
      const due = new Date(item.nextDue);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      item.daysRemaining = diffDays;

      if (diffDays < 0) {
        item.status = "Overdue";
        overdueCount++;
      } else if (diffDays <= 4) {
        item.status = "Due Soon";
        due4DaysCount++;
      } else {
        item.status = "Current";
      }
    }
  });

  db.binderSummary = {
    ...db.binderSummary,
    totalInspections: db.masterCalendar.length,
    dueWithin4Days: due4DaysCount,
    overdue: overdueCount,
    openDeficiencies: openDefCount,
    certsDue30Days: certsCriticalCount,
  };
}

recalculateMetrics();

// --- REST API ENDPOINTS ---

// 1. Get full database state
app.get("/api/db", (req: Request, res: Response) => {
  recalculateMetrics();
  res.json(db);
});

// 2. Master Calendar
app.get("/api/master-calendar", (req: Request, res: Response) => {
  recalculateMetrics();
  res.json(db.masterCalendar);
});

// 3. Get single sheet or all sheets
app.get("/api/sheets/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const sheet = db.sheets[id as InspectionId];
  if (!sheet) {
    res.status(404).json({ error: "Sheet not found" });
    return;
  }
  res.json(sheet);
});

// 4. Update items in a sheet
app.post("/api/sheets/:id/items", (req: Request, res: Response) => {
  const { id } = req.params;
  const { items, user } = req.body;
  const sheet = db.sheets[id as InspectionId];

  if (!sheet) {
    res.status(404).json({ error: "Sheet not found" });
    return;
  }

  sheet.items = items;

  // Log action
  db.systemLogs.unshift({
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    user: user || "Officer on Network",
    action: `Updated items in ${sheet.title}`
  });

  recalculateMetrics();
  broadcastChange("SHEET_UPDATED", { sheetId: id, sheet });
  res.json(sheet);
});

// 5. Signoff / Complete an inspection
app.post("/api/sheets/:id/signoff", (req: Request, res: Response) => {
  const { id } = req.params;
  const { signoff, user } = req.body;
  const sheet = db.sheets[id as InspectionId];

  if (!sheet) {
    res.status(404).json({ error: "Sheet not found" });
    return;
  }

  sheet.signoff = signoff;

  // Update Master Calendar for this sheet
  const calItem = db.masterCalendar.find(m => m.id === id);
  if (calItem) {
    calItem.lastCompleted = signoff.dateCompleted || new Date().toISOString().substring(0, 10);
    calItem.mateOic = signoff.mateName ? `${signoff.mateName} (${signoff.position})` : calItem.mateOic;
    
    // Calculate next due based on frequency
    const completedDate = new Date(calItem.lastCompleted);
    if (calItem.frequency === "Daily") {
      completedDate.setDate(completedDate.getDate() + 1);
    } else if (calItem.frequency === "Weekly") {
      completedDate.setDate(completedDate.getDate() + 7);
    } else if (calItem.frequency === "Monthly") {
      completedDate.setMonth(completedDate.getMonth() + 1);
    } else if (calItem.frequency === "Annual") {
      completedDate.setFullYear(completedDate.getFullYear() + 1);
    }
    calItem.nextDue = completedDate.toISOString().substring(0, 10);
  }

  // Add / Update Audit Log entry
  const auditIdx = db.auditLog.findIndex(a => a.inspectionId === id);
  const auditEntry = {
    id: `AUD-${Date.now().toString().slice(-4)}`,
    inspectionId: id as InspectionId,
    inspectionTitle: sheet.title,
    mateName: signoff.mateName,
    position: signoff.position,
    signatureInitials: signoff.signatureInitials,
    dateCompleted: signoff.dateCompleted,
    timeCompleted: signoff.timeCompleted,
    auditStatus: "Verified" as const,
    dueDate: calItem ? calItem.nextDue : "",
    notes: `Completed signoff by ${signoff.mateName} (${signoff.position})`
  };

  if (auditIdx !== -1) {
    db.auditLog[auditIdx] = auditEntry;
  } else {
    db.auditLog.unshift(auditEntry);
  }

  // Increment completedThisMonth metric
  db.binderSummary.completedThisMonth += 1;

  // Log action
  db.systemLogs.unshift({
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    user: signoff.mateName || user || "Officer on Network",
    action: `Signed off and completed ${sheet.title} inspection`
  });

  recalculateMetrics();
  broadcastChange("INSPECTION_COMPLETED", { sheetId: id, sheet, calItem, auditEntry });
  res.json({ success: true, sheet, masterCalendar: db.masterCalendar, auditLog: db.auditLog });
});

// 6. Deficiency Log Routes
app.get("/api/deficiencies", (req: Request, res: Response) => {
  res.json(db.deficiencyLog);
});

app.post("/api/deficiencies", (req: Request, res: Response) => {
  const defData: DeficiencyItem = req.body;
  
  if (!defData.id) {
    defData.id = `DEF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  }

  const existingIdx = db.deficiencyLog.findIndex(d => d.id === defData.id);
  if (existingIdx !== -1) {
    db.deficiencyLog[existingIdx] = defData;
  } else {
    db.deficiencyLog.unshift(defData);
  }

  // Also attach to sheet deficiency array if matching
  if (defData.inspectionId && db.sheets[defData.inspectionId as InspectionId]) {
    const sheet = db.sheets[defData.inspectionId as InspectionId];
    const sDefIdx = sheet.deficiencies.findIndex(d => d.id === defData.id);
    if (sDefIdx !== -1) {
      sheet.deficiencies[sDefIdx] = defData;
    } else {
      sheet.deficiencies.unshift(defData);
    }
  }

  recalculateMetrics();
  broadcastChange("DEFICIENCY_UPDATED", { deficiency: defData, deficiencyLog: db.deficiencyLog });
  res.json({ success: true, deficiency: defData, deficiencyLog: db.deficiencyLog });
});

app.delete("/api/deficiencies/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  db.deficiencyLog = db.deficiencyLog.filter(d => d.id !== id);

  Object.values(db.sheets).forEach(sheet => {
    sheet.deficiencies = sheet.deficiencies.filter(d => d.id !== id);
  });

  recalculateMetrics();
  broadcastChange("DEFICIENCY_DELETED", { id, deficiencyLog: db.deficiencyLog });
  res.json({ success: true, deficiencyLog: db.deficiencyLog });
});

// 7. Certificate Register Routes
app.get("/api/certificates", (req: Request, res: Response) => {
  res.json(db.certificateRegister);
});

app.post("/api/certificates", (req: Request, res: Response) => {
  const cert: CertificateItem = req.body;
  if (!cert.id) {
    cert.id = `CERT-${Math.floor(100 + Math.random() * 900)}`;
  }

  const idx = db.certificateRegister.findIndex(c => c.id === cert.id);
  if (idx !== -1) {
    db.certificateRegister[idx] = cert;
  } else {
    db.certificateRegister.unshift(cert);
  }

  recalculateMetrics();
  broadcastChange("CERTIFICATE_UPDATED", { certificate: cert, certificateRegister: db.certificateRegister });
  res.json({ success: true, certificateRegister: db.certificateRegister });
});

// 8. User Presence / Simultaneous Users Heartbeat
app.post("/api/users/presence", (req: Request, res: Response) => {
  const { user } = req.body as { user: NetworkUser };
  if (!user || !user.id) {
    res.status(400).json({ error: "User payload required" });
    return;
  }

  user.lastActive = "Just now";
  const existingIdx = db.connectedUsers.findIndex(u => u.id === user.id);
  
  let changed = false;
  if (existingIdx !== -1) {
    const existing = db.connectedUsers[existingIdx];
    if (existing.currentSheet !== user.currentSheet || existing.role !== user.role || existing.name !== user.name) {
      db.connectedUsers[existingIdx] = user;
      changed = true;
    } else {
      // Just update the timestamp quietly without broadcasting
      db.connectedUsers[existingIdx].lastActive = "Just now";
    }
  } else {
    db.connectedUsers.push(user);
    changed = true;
  }

  // Cleanup inactive users older than 5 minutes if any
  if (changed) {
    broadcastChange("USER_PRESENCE", { users: db.connectedUsers });
  }
  res.json({ users: db.connectedUsers });
});

// 9. Reset Factory Data
app.post("/api/reset-data", (req: Request, res: Response) => {
  db = JSON.parse(JSON.stringify(initialDatabase));
  recalculateMetrics();
  broadcastChange("DATABASE_RESET", db);
  res.json({ success: true, db });
});

// 10. AI Assistant / Gemini Route for Maritime Compliance & Deficiencies
app.post("/api/ai/analyze-deficiency", async (req: Request, res: Response) => {
  try {
    const { deficiencyText, inspectionTitle, equipmentName } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.status(400).json({
        recommendation: `Recommended Corrective Action for ${equipmentName}: Conduct immediate visual and functional overhaul, isolate affected component, document in SMS work order, and assign responsible department.`,
        priority: "High",
        workOrderSuggestion: `WO-${Math.floor(80000 + Math.random() * 10000)}`,
        basisReference: "USCG 46 CFR & Vessel Safety Management System (SMS)"
      });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a Chief Mate & Safety Compliance Specialist on the research vessel R/V Kilo Moana.
An inspection discrepancy was noted:
Inspection Sheet: ${inspectionTitle}
Equipment/Item: ${equipmentName}
Deficiency Observed: ${deficiencyText}

Provide a concise, professional maritime recommendation in JSON format with keys:
- "recommendation": step-by-step corrective action for the crew and work order
- "priority": one of "Low", "Medium", "High", "Critical"
- "workOrderSuggestion": suggested work order tag like "WO-88xxx"
- "basisReference": relevant CFR or SMS regulations (e.g. 46 CFR 189/199 or SOLAS/SMS)`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    if (response.text) {
      res.json(JSON.parse(response.text));
    } else {
      throw new Error("No response from Gemini");
    }
  } catch (err) {
    console.error("Gemini AI API error:", err);
    res.json({
      recommendation: `Conduct immediate visual inspection and functional test. Replace defective seals/components and issue work order for closeout verification.`,
      priority: "Medium",
      workOrderSuggestion: `WO-${Math.floor(80000 + Math.random() * 10000)}`,
      basisReference: "USCG 46 CFR / SMS Compliance"
    });
  }
});

// --- VITE / STATIC SERVING ---
async function startServer() {
  const isDev = process.env.NODE_ENV !== "production" && !(process.argv[1] && process.argv[1].endsWith("server.cjs"));
  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`⚓ R/V KILO MOANA Safety Compliance Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
