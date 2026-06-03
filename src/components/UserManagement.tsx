import React, { useState } from "react";
import { DashboardUser, UserRole } from "../types";
import { User, Shield, Users, Lock, Key, Trash2, Plus, Check } from "lucide-react";

interface UserManagementProps {
  users: DashboardUser[];
  onAddUser: (data: { username: string; role: UserRole; permissions: string[]; password?: string }) => void;
  onUpdateUser: (id: string, updateData: Partial<DashboardUser>) => void;
  onDeleteUser: (id: string) => void;
}

const AVAILABLE_PERMISSIONS = [
  { key: "read", name: "Server lesen", description: "Darf Serverlisten, Performancedaten und Metriken einsehen." },
  { key: "start_stop", name: "Starten / Stoppen", description: "Darf Docker Container booten oder gefahrlos herunterfahren." },
  { key: "install", name: "Server installieren", description: "Darf neue Instanzen über die Applikationsbibliothek anlegen." },
  { key: "backups", name: "Backup-Rechte", description: "Darf Snapshots erzeugen, einspielen oder Server-Archive bereinigen." },
  { key: "update", name: "Updates einspielen", description: "Darf Systemupdates sowie Spielupgrades (SteamCMD) anstoßen." },
  { key: "users", name: "Nutzerverwaltung", description: "Darf Rollen und Zugriffsrechte von Dashboard-Konten editieren." }
];

export default function UserManagement({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}: UserManagementProps) {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("operator");
  const [newPermissions, setNewPermissions] = useState<string[]>(["read", "start_stop"]);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUsername, setEditingUsername] = useState("");
  const [editingPassword, setEditingPassword] = useState("");
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [editingRole, setEditingRole] = useState<UserRole>("viewer");

  const handleToggleNewPermission = (perm: string) => {
    if (newPermissions.includes(perm)) {
      setNewPermissions(newPermissions.filter((p) => p !== perm));
    } else {
      setNewPermissions([...newPermissions, perm]);
    }
  };

  const handleToggleEditingPermission = (perm: string) => {
    if (editingPermissions.includes(perm)) {
      setEditingPermissions(editingPermissions.filter((p) => p !== perm));
    } else {
      setEditingPermissions([...editingPermissions, perm]);
    }
  };

  const submitAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    onAddUser({
      username: newUsername,
      role: newRole,
      permissions: newPermissions,
      password: newPassword || "123456"
    });

    setNewUsername("");
    setNewPassword("");
    setNewRole("operator");
    setNewPermissions(["read", "start_stop"]);
  };

  const startEditUser = (u: DashboardUser) => {
    setEditingUserId(u.id);
    setEditingUsername(u.username);
    setEditingPassword(u.password || (u.id === "usr-admin" ? "admin" : u.id === "usr-mod" ? "moderator" : "viewer"));
    setEditingRole(u.role);
    setEditingPermissions([...u.permissions]);
  };

  const saveEditedUser = (id: string) => {
    onUpdateUser(id, {
      username: editingUsername,
      role: editingRole,
      permissions: editingPermissions,
      password: editingPassword
    });
    setEditingUserId(null);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-red-954/40 text-red-400 border border-red-900/40";
      case "operator":
        return "bg-indigo-950/40 text-indigo-400 border border-indigo-900/40";
      default:
        return "bg-[#1c1c24] text-neutral-400 border border-neutral-800";
    }
  };

  return (
    <div className="space-y-6" id="user-permissions-panel">
      {/* Top setup screen */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Side: Create User Form */}
        <div className="xl:col-span-5 bg-[#121216] border border-[#24242a] rounded-xl p-5 h-fit">
          <div className="flex items-center gap-2 pb-3 border-b border-[#24242a] mb-5">
            <User className="w-4.5 h-4.5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Neuen Benutzer anlegen
            </h3>
          </div>

          <form onSubmit={submitAddUser} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-450 mb-1.5 font-mono">
                  Benutzername
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Moderator_Tim"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-505 font-sans"
                />
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-450 mb-1.5 font-mono">
                  Zugangs-Kennwort
                </label>
                <input
                  type="password"
                  placeholder="Passwort eingeben"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-505 font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-450 mb-1.5">
                  System-Rolle
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-505"
                >
                  <option value="admin">Super Admin</option>
                  <option value="operator">Operator (Moderator)</option>
                  <option value="viewer">Viewer (Beobachter)</option>
                </select>
              </div>
              <div className="flex flex-col justify-end pb-1 text-xxs text-neutral-500 leading-normal">
                <span>Rollen steuern vordefinierte Zugriffe und API-Berechtigungstoken.</span>
              </div>
            </div>

            {/* Custom permissions check grid */}
            <div className="space-y-3 pt-3 border-t border-neutral-850">
              <span className="block text-xxs font-bold uppercase tracking-wider text-neutral-450">
                Zugriffsrechte (Granular Permissions)
              </span>
              <div className="grid grid-cols-1 gap-2.5 max-h-[190px] overflow-y-auto pr-1">
                {AVAILABLE_PERMISSIONS.map((perm) => {
                  const isChecked = newPermissions.includes(perm.key);
                  return (
                    <button
                      key={perm.key}
                      type="button"
                      onClick={() => handleToggleNewPermission(perm.key)}
                      className={`text-left p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? "bg-indigo-950/20 border-indigo-500/30 text-white"
                          : "bg-[#1c1c24]/50 border-neutral-850 text-neutral-400 hover:border-neutral-800"
                      }`}
                    >
                      <div className="pr-2">
                        <span className="text-xs font-semibold block">{perm.name}</span>
                        <span className="text-[10px] text-neutral-550 leading-relaxed block mt-0.5">
                          {perm.description}
                        </span>
                      </div>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        isChecked ? "bg-indigo-600 border-indigo-500 text-white" : "border-neutral-700 bg-neutral-900"
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Konto erstellen
            </button>
          </form>
        </div>

        {/* Right Side: Users List, editable table */}
        <div className="xl:col-span-7 bg-[#121216] border border-[#24242a] rounded-xl flex flex-col justify-between overflow-hidden">
          <div>
            <div className="px-5 py-3.5 bg-gradient-to-r from-neutral-900 via-[#121216] to-[#0c0c0d] border-b border-[#24242a] flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Registrierte Konten ({users.length})
              </h3>
              <span className="text-[10px] text-neutral-500 font-mono">Linux Host Access Pool</span>
            </div>

            <div className="divide-y divide-neutral-800/60 max-h-[500px] overflow-y-auto">
              {users.map((u) => {
                const isEditing = editingUserId === u.id;

                return (
                  <div key={u.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-850 bg-neutral-900/10 hover:bg-neutral-900/20 transition-all">
                    <div className="flex gap-3 flex-1">
                      <div className="w-9 h-9 bg-neutral-950 border border-neutral-850 text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold uppercase flex-shrink-0">
                        {u.username.slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingUsername}
                              onChange={(e) => setEditingUsername(e.target.value)}
                              className="bg-neutral-950 border border-neutral-800 rounded px-2 py-0.5 text-xs text-white max-w-[130px] font-semibold"
                            />
                          ) : (
                            <h4 className="font-bold text-white text-sm tracking-wide">{u.username}</h4>
                          )}
                          <span className={`px-2 py-0.5 text-[9px] font-mono font-semibold rounded-md uppercase ${getRoleBadgeColor(u.role)}`}>
                            {u.role}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1.5">
                          <p className="text-[10px] text-neutral-500 font-mono">
                            Letzter Login: <strong className="text-neutral-400 font-normal">{u.lastLogin}</strong>
                          </p>

                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                            <Key className="w-3 h-3 text-indigo-400" />
                            <span>Kennwort:</span>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingPassword}
                                onChange={(e) => setEditingPassword(e.target.value)}
                                className="bg-neutral-950 border border-neutral-800 rounded px-1.5 py-0.5 text-[10px] text-white max-w-[100px]"
                                placeholder="Passwort"
                              />
                            ) : (
                              <span className="text-neutral-300 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-900 font-bold tracking-wide">
                                {u.password || (u.id === "usr-admin" ? "admin" : u.id === "usr-mod" ? "moderator" : "viewer")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isEditing ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-neutral-500 uppercase font-bold">Rolle:</span>
                            <select
                              value={editingRole}
                              onChange={(e) => setEditingRole(e.target.value as UserRole)}
                              className="bg-neutral-950 border border-neutral-800 rounded text-xxs text-white px-2 py-1 focus:outline-none"
                            >
                              <option value="admin">Super Admin</option>
                              <option value="operator">Operator</option>
                              <option value="viewer">Viewer</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => saveEditedUser(u.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[9px] py-1 px-2 rounded-md transition-all flex items-center gap-1 cursor-pointer font-mono"
                            >
                              <Check className="w-3 h-3" />
                              SICHERN
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-[9px] py-1 px-2 rounded-md transition-all cursor-pointer font-mono"
                            >
                              ABBRECHEN
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Standard display of permissions */
                        <div className="flex items-center gap-3">
                          <div className="flex flex-wrap gap-1 max-w-[150px] sm:max-w-[200px] justify-end">
                            {u.permissions.map((perm) => (
                              <span
                                key={perm}
                                className="bg-neutral-950 text-neutral-400 text-[8px] font-mono border border-neutral-850 px-1 py-0.5 rounded"
                              >
                                {perm}
                              </span>
                            ))}
                          </div>

                          {/* Quick Admin action buttons */}
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => startEditUser(u)}
                              className="text-indigo-400 hover:bg-neutral-850 px-2 py-1 rounded text-[10px] border border-transparent hover:border-neutral-800 transition-colors cursor-pointer"
                            >
                              Editieren
                            </button>
                            {u.id !== "usr-admin" && (
                              <button
                                onClick={() => {
                                  if (confirm(`Benutzer ${u.username} endgültig löschen?`)) onDeleteUser(u.id);
                                }}
                                className="p-1 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-red-952/10 transition-colors"
                                title="Nutzer löschen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-neutral-850 p-4 bg-neutral-950/20 text-xxs text-neutral-500 flex gap-2">
            <Lock className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Zugriffstoken-Sicherheit:</strong> Alle API-Aktionen werden durch das Token-System verifiziert. Super Admins besitzen uneingeschränkten Zugriff auf Host-Befehle, wohingegen Beobachter (Viewer) nur lesende Anfragen stellen können.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
