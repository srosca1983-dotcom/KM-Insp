import { AppDatabase, InspectionSheetData, DeficiencyItem, CertificateItem, InspectionSignoff, NetworkUser } from '../types';

export const api = {
  async getDb(): Promise<AppDatabase> {
    const res = await fetch('/api/db');
    if (!res.ok) throw new Error('Failed to fetch database');
    return res.json();
  },

  async getSheet(id: string): Promise<InspectionSheetData> {
    const res = await fetch(`/api/sheets/${id}`);
    if (!res.ok) throw new Error('Failed to fetch sheet');
    return res.json();
  },

  async updateSheetItems(id: string, items: any[], user?: string): Promise<InspectionSheetData> {
    const res = await fetch(`/api/sheets/${id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, user }),
    });
    if (!res.ok) throw new Error('Failed to update items');
    return res.json();
  },

  async signoffSheet(id: string, signoff: InspectionSignoff, user?: string) {
    const res = await fetch(`/api/sheets/${id}/signoff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signoff, user }),
    });
    if (!res.ok) throw new Error('Failed to signoff sheet');
    return res.json();
  },

  async saveDeficiency(deficiency: DeficiencyItem) {
    const res = await fetch('/api/deficiencies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deficiency),
    });
    if (!res.ok) throw new Error('Failed to save deficiency');
    return res.json();
  },

  async deleteDeficiency(id: string) {
    const res = await fetch(`/api/deficiencies/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete deficiency');
    return res.json();
  },

  async saveCertificate(cert: CertificateItem) {
    const res = await fetch('/api/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cert),
    });
    if (!res.ok) throw new Error('Failed to save certificate');
    return res.json();
  },

  async sendPresence(user: NetworkUser) {
    try {
      await fetch('/api/users/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user }),
      });
    } catch (e) {
      // silent heartbeat retry
    }
  },

  async resetData() {
    const res = await fetch('/api/reset-data', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset data');
    return res.json();
  },

  async analyzeDeficiency(deficiencyText: string, inspectionTitle: string, equipmentName: string) {
    const res = await fetch('/api/ai/analyze-deficiency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deficiencyText, inspectionTitle, equipmentName }),
    });
    if (!res.ok) throw new Error('Failed to analyze deficiency');
    return res.json();
  }
};
