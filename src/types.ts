export type InspectionId = 
  | 'fixed-fire'
  | 'weekly-lifesaving'
  | 'lifesaving-monthly'
  | 'pyrotechnics-locker'
  | 'rescue-boat'
  | 'lifejackets-immersion'
  | 'dewatering-pumps'
  | 'fire-stations'
  | 'turnout-gear'
  | 'damage-control'
  | 'fire-extinguishers'
  | 'dg-locker'
  | 'eebd'
  | 'eyewash-firstaid'
  | 'watertight-doors'
  | 'gmdss-bridge';

export type StatusType = 'Current' | 'Due Soon' | 'Overdue' | 'Open' | 'In Progress' | 'Completed';

export type NavTab = 
  | 'dashboard'
  | 'master-calendar'
  | 'audit-log'
  | 'deficiency-log'
  | 'certificates'
  | 'binder'
  | InspectionId;

export interface InspectionMeta {
  id: InspectionId;
  title: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual';
  department: string;
  regBasis: string;
  lastCompleted: string;
  nextDue: string;
  daysRemaining: number;
  status: StatusType;
  mateOic: string;
  notes: string;
  openDeficienciesCount: number;
}

export type SatUnsat = 'SAT' | 'UNSAT' | 'N/A' | '';

export interface InspectionItem {
  id: string;
  section?: string;
  name: string;
  amosNo?: string;
  modelNo?: string;
  serialNo?: string;
  partNo?: string;
  capacity?: string;
  quantity?: string | number;
  pfdCount?: number;
  suitCount?: number;
  where?: string;
  criteria: string;
  satStatus: SatUnsat;
  lastServiceDate?: string;
  expirationDate?: string;
  hydroDate?: string;
  comments?: string;
  dryChemRotated?: 'Yes' | 'No' | '';
  // For weekly checks (Weeks 1 to 5)
  w1?: SatUnsat;
  w2?: SatUnsat;
  w3?: SatUnsat;
  w4?: SatUnsat;
  w5?: SatUnsat;
  // Specific pump checks
  fuelOilCheck?: SatUnsat;
  hosesStrainersCheck?: SatUnsat;
  operationalTestCheck?: SatUnsat;
  // Specific eyewash restock/exp
  restockExp?: string;
  // Fire station items
  missingDefective?: string;
  itemsToVerify?: string;
}

export interface DeficiencyItem {
  id: string;
  dateFound: string;
  inspectionId: InspectionId | string;
  inspectionTitle: string;
  deficiency: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  workOrder: string;
  assignedTo: string;
  dueDate: string;
  dateCorrected: string;
  verifiedBy: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  notes: string;
  initials: string;
}

export interface InspectionSignoff {
  mateName: string;
  position: string;
  signatureInitials: string;
  dateCompleted: string;
  timeCompleted: string;
}

export interface InspectionSheetData {
  id: InspectionId;
  title: string;
  subtitle: string;
  items: InspectionItem[];
  deficiencies: DeficiencyItem[];
  signoff: InspectionSignoff;
  // Additional specific headers/fields if any
  extraFields?: Record<string, string>;
}

export interface CertificateItem {
  id: string;
  certificateSystem: string;
  vendor: string;
  inspector: string;
  issueDate: string;
  serviceTestDate: string;
  expirationNextDue: string;
  daysRemaining: number;
  status: 'Current' | 'Due Soon' | 'Expired' | 'Critical';
  equipmentNotes: string;
}

export interface AuditLogEntry {
  id: string;
  inspectionId: InspectionId;
  inspectionTitle: string;
  mateName: string;
  position: string;
  signatureInitials: string;
  dateCompleted: string;
  timeCompleted: string;
  auditStatus: 'Open' | 'Verified' | 'Pending Review' | 'Flagged';
  dueDate: string;
  notes: string;
}

export interface MonthlyBinderData {
  monthStart: string;
  totalInspections: number;
  completedThisMonth: number;
  dueWithin4Days: number;
  overdue: number;
  openDeficiencies: number;
  certsDue30Days: number;
}

export interface NetworkUser {
  id: string;
  name: string;
  role: string;
  device: string;
  currentSheet: string;
  lastActive: string;
}

export interface AppDatabase {
  masterCalendar: InspectionMeta[];
  sheets: Record<InspectionId, InspectionSheetData>;
  deficiencyLog: DeficiencyItem[];
  certificateRegister: CertificateItem[];
  auditLog: AuditLogEntry[];
  binderSummary: MonthlyBinderData;
  connectedUsers: NetworkUser[];
  systemLogs: { timestamp: string; user: string; action: string }[];
}
