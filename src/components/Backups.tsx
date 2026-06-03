import React, { useState } from "react";
import { Backup, GameServer } from "../types";
import {
  ShieldAlert,
  Archive,
  Clock,
  HardDrive,
  Undo,
  Trash2,
  Plus,
  ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react";

interface BackupsProps {
  backups: Backup[];
  servers: GameServer[];
  onCreateBackup: (serverId: string, backupName?: string) => void;
  onRestoreBackup: (backupId: string) => void;
  onDeleteBackup: (backupId: string) => void;
  isProcessing: boolean;
}

export default function Backups({
  backups,
  servers,
  onCreateBackup,
  onRestoreBackup,
  onDeleteBackup,
  isProcessing
}: BackupsProps) {
  const [selectedServer, setSelectedServer] = useState("");
  const [backupName, setBackupName] = useState("");
  const [restoredId, setRestoredId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServer) {
      alert("Bitte wählen Sie einen Spieleserver aus.");
      return;
    }
    onCreateBackup(selectedServer, backupName || undefined);
    setBackupName("");
  };

  const handleRestore = (b: Backup) => {
    if (confirm(`Sind Sie sicher, dass Sie '${b.name}' wiederherstellen wollen? Alle aktuellen Serverdaten werden auf diesen Zeitpunkt zurückgesetzt.`)) {
      onRestoreBackup(b.id);
      setRestoredId(b.id);
      setTimeout(() => setRestoredId(null), 3500);
    }
  };

  return (
    <div className="space-y-6" id="backups-manager">
      {/* Top action grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Manual Backup snapshot trigger */}
        <div className="lg:col-span-1 bg-[#121216] border border-[#24242a] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[#24242a] mb-4">
              <Archive className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Sicherung erstellen
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-450 mb-1.5">
                  Spieleserver auswählen
                </label>
                <select
                  value={selectedServer}
                  onChange={(e) => setSelectedServer(e.target.value)}
                  className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 max-h-[140px]"
                >
                  <option value="" className="bg-[#121216]">
                    -- Server auswählen --
                  </option>
                  {servers.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#121216]">
                      {s.name} ({s.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-450 mb-1.5">
                  Sicherungs-Bezeichnung
                </label>
                <input
                  type="text"
                  placeholder="z.B. Vor Mod-Installation"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-505"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing || !selectedServer}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Snapshot-Prozess starten
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-neutral-850 mt-4">
            <div className="flex items-center gap-2.5 text-neutral-450 text-xxs leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                Backups komprimieren Weltenarchive vollautomatisch als GZIP-Dateien, um Host-Plattenspeicher einzusparen.
              </span>
            </div>
          </div>
        </div>

        {/* Right Info blocks: Auto-backup strategy guidelines */}
        <div className="lg:col-span-2 bg-[#121216]/40 border border-[#24242a] p-6 rounded-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4.5 h-4.5 text-amber-500" />
              Automatisierte Notfallwiederherstellung & Backup-Strategie
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Dank des integrierten Docker-Volume-Mappings speichert Kilians Spielwiese die Welten- und Nutzerdaten völlig isoliert vom Spielcontainer ab. Bei jedem automatischen nächtlichen Sicherungsintervall (falls in den Servereinstellungen aktiviert) führt Kilians Spielwiese folgende automatisierte Schritte aus:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-[#121216] border border-[#24242a] rounded-lg">
                <span className="font-semibold text-white block mb-1">1. Hot-Backup per RCON</span>
                <p className="text-neutral-500 text-xxs leading-relaxed">
                  Zuerst wird die Spielwelt temporär schreibgeschützt (z.B. <code>/save-off</code> in Minecraft), um beschädigte Chunks während der Spiegelung zu verhindern.
                </p>
              </div>

              <div className="p-3.5 bg-[#121216] border border-[#24242a] rounded-lg">
                <span className="font-semibold text-white block mb-1">2. Docker-Spiegelung</span>
                <p className="text-neutral-500 text-xxs leading-relaxed">
                  Die Volume-Daten werden mittels GZIP-Algorithmus inkrementell gepackt und mit Zeitstempel im lokalen Host-Verzeichnis abgelegt.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-850/60 p-3 rounded-lg flex items-center justify-between text-xs mt-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4.5 h-4.5 text-indigo-400" />
              <span className="text-neutral-300 font-medium">Backup-Plattennutzung des Hosts:</span>
            </div>
            <strong className="text-white font-mono">230 MB belegt</strong>
          </div>
        </div>
      </div>

      {/* Backups List */}
      <div className="bg-[#121216] border border-[#24242a] rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-3.5 bg-gradient-to-r from-neutral-900 via-[#121216] to-[#0c0c0d] border-b border-[#24242a] flex justify-between items-center">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            Archivierte Spielstände ({backups.length})
          </h3>
          <span className="text-[10px] text-neutral-500 font-mono">Wiederherstellen per Mausklick</span>
        </div>

        {backups.length === 0 ? (
          <div className="text-center py-12">
            <Archive className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-xs text-neutral-500">Bisher wurden keine Sicherungen angelegt.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/50">
            {backups.map((bak) => {
              const matchedServer = servers.find((s) => s.id === bak.serverId);
              const isJustRestored = restoredId === bak.id;

              return (
                <div
                  key={bak.id}
                  className={`px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${
                    isJustRestored ? "bg-emerald-950/20" : "hover:bg-neutral-900/40"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-450 text-xs shadow-inner">
                      📦
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm tracking-wide">{bak.name}</h4>
                        {isJustRestored && (
                          <span className="bg-emerald-950/40 text-emerald-400 text-[9px] font-mono border border-emerald-900/30 px-1.5 py-0.5 rounded animate-bounce">
                            ERFOLGREICH INTEGRIERT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-xxs text-neutral-500 font-mono">
                        <span className="text-indigo-400 font-semibold uppercase">
                          {matchedServer ? matchedServer.name : "Unbekannter Server"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {new Date(bak.date).toLocaleString("de-DE")}</span>
                        <span>•</span>
                        <span className="bg-[#1c1c24] px-1 py-0.2 rounded text-neutral-400">ID: {bak.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 justify-between md:justify-end">
                    <div className="text-right">
                      <span className="text-xs font-mono text-neutral-300 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                        {bak.size}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestore(bak)}
                        disabled={isProcessing}
                        className="bg-neutral-800 hover:bg-neutral-750 disabled:opacity-40 border border-neutral-700 py-1.5 px-3 rounded-lg text-xs font-semibold text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Diesen Snapshot wiederherstellen"
                      >
                        <Undo className="w-3.5 h-3.5" />
                        Restore
                      </button>

                      <button
                        onClick={() => {
                          if (confirm("Dieses Backup unwiderruflich löschen?")) onDeleteBackup(bak.id);
                        }}
                        disabled={isProcessing}
                        className="bg-neutral-800 hover:bg-red-950/50 hover:text-red-400 disabled:opacity-40 border border-neutral-700 p-2 rounded-lg text-zinc-500 transition-colors cursor-pointer"
                        title="Archiv löschen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
