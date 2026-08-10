import React, { useState } from 'react';
import { Users, Wifi, Edit, Plus, Check, Trash2, UserPlus, Shield, Smartphone } from 'lucide-react';
import { NetworkUser } from '../types';

interface NetworkUsersModalProps {
  users: NetworkUser[];
  activeUser: NetworkUser;
  onSelectUser: (user: NetworkUser) => void;
  onUpdateUser: (user: NetworkUser) => void;
  onAddUser: (user: NetworkUser) => void;
  onClose: () => void;
}

export const NetworkUsersModal: React.FC<NetworkUsersModalProps> = ({
  users,
  activeUser,
  onSelectUser,
  onUpdateUser,
  onAddUser,
  onClose,
}) => {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<NetworkUser>>({});
  const [addingNew, setAddingNew] = useState(false);
  const [newForm, setNewForm] = useState<Partial<NetworkUser>>({
    name: '',
    role: 'Duty Officer',
    device: 'Mobile Phone',
    currentSheet: 'Master Calendar',
    lastActive: 'Just now',
  });

  const handleStartEdit = (user: NetworkUser) => {
    setEditingUserId(user.id);
    setEditForm(user);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUserId && editForm.name) {
      onUpdateUser(editForm as NetworkUser);
      setEditingUserId(null);
    }
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (newForm.name && newForm.role) {
      const newUser: NetworkUser = {
        id: `usr-${Date.now()}`,
        name: newForm.name,
        role: newForm.role,
        device: newForm.device || 'Mobile Phone',
        currentSheet: newForm.currentSheet || 'Dashboard',
        lastActive: 'Just now',
      };
      onAddUser(newUser);
      setAddingNew(false);
      setNewForm({
        name: '',
        role: 'Duty Officer',
        device: 'Mobile Phone',
        currentSheet: 'Master Calendar',
        lastActive: 'Just now',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Active Shipboard Officers & Personnel</h3>
              <p className="text-xs text-slate-500">Edit active officer profiles or switch active user on vessel network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg font-bold w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">
            Current Active Roster ({users.length} Personnel)
          </span>
          <button
            onClick={() => setAddingNew(!addingNew)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{addingNew ? 'Cancel' : 'Add New Officer'}</span>
          </button>
        </div>

        {/* Add New Form */}
        {addingNew && (
          <form onSubmit={handleSaveNew} className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-3 text-xs">
            <h4 className="font-bold text-blue-900 text-xs">Add New Active Officer Profile</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Officer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lt. Dan"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="w-full bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rank / Position</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2nd Engineer"
                  value={newForm.role}
                  onChange={(e) => setNewForm({ ...newForm, role: e.target.value })}
                  className="w-full bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Device Station</label>
              <input
                type="text"
                placeholder="e.g. Deck Tablet / ECR Phone"
                value={newForm.device}
                onChange={(e) => setNewForm({ ...newForm, device: e.target.value })}
                className="w-full bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAddingNew(false)}
                className="px-3 py-1 bg-slate-200 text-slate-700 rounded-md font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-blue-600 text-white rounded-md font-bold text-xs shadow-sm hover:bg-blue-700"
              >
                Save Officer
              </button>
            </div>
          </form>
        )}

        {/* User Roster List */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {users.map((u) => {
            const isSelf = u.id === activeUser.id;
            const isEditing = editingUserId === u.id;

            if (isEditing) {
              return (
                <form
                  key={u.id}
                  onSubmit={handleSaveEdit}
                  className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs"
                >
                  <div className="font-bold text-amber-900">Editing Officer Profile: {u.name}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700">Name</label>
                      <input
                        type="text"
                        required
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full bg-white px-2 py-1 rounded border border-slate-300 text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700">Role</label>
                      <input
                        type="text"
                        required
                        value={editForm.role || ''}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full bg-white px-2 py-1 rounded border border-slate-300 text-slate-900 font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700">Device Station</label>
                    <input
                      type="text"
                      value={editForm.device || ''}
                      onChange={(e) => setEditForm({ ...editForm, device: e.target.value })}
                      className="w-full bg-white px-2 py-1 rounded border border-slate-300 text-slate-900 font-medium"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingUserId(null)}
                      className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1 bg-amber-600 text-white font-bold rounded text-xs shadow-sm hover:bg-amber-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <div
                key={u.id}
                className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 transition ${
                  isSelf
                    ? 'bg-blue-50/90 border-blue-300 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>

                  <div>
                    <div className="font-extrabold text-slate-900 flex items-center gap-2">
                      <span>{u.name}</span>
                      {isSelf && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold tracking-wider">
                          ACTIVE USER
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      {u.role} • <span className="text-slate-500 font-medium">{u.device}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(u)}
                    className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition"
                    title="Edit Officer Profile"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  {!isSelf && (
                    <button
                      type="button"
                      onClick={() => onSelectUser(u)}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-blue-600 hover:text-white text-slate-800 font-bold text-[11px] rounded-lg transition"
                    >
                      Switch To
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <Wifi className="w-4 h-4 text-emerald-600" />
            <span>Port 3000 Broadcast Network Ready</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
