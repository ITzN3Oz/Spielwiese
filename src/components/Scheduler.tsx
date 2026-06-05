import React, { useState, useEffect } from "react";
import { GameServer } from "../types";
import { useLanguage } from "../LanguageContext";
import {
  Calendar,
  Clock,
  Play,
  Trash2,
  Plus,
  Check,
  Zap,
  Tag,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Sliders,
  Terminal
} from "lucide-react";

export interface CronJob {
  id: string;
  name: string;
  serverId: string;
  serverName: string;
  action: "backup" | "restart" | "command" | "broadcast";
  command?: string;
  interval: "interval_30s" | "hourly" | "daily" | "weekly";
  time?: string; // HH:MM for daily/weekly
  active: boolean;
  lastRun?: string;
}

export interface CronJobLog {
  id: string;
  jobId: string;
  jobName: string;
  serverId: string;
  serverName: string;
  timestamp: string;
  status: "success" | "warn" | "error";
  message: string;
}

interface SchedulerProps {
  servers: GameServer[];
  accentColor?: "indigo" | "emerald" | "orange" | "pink";
  onTriggerAction?: (msg: string, isError?: boolean) => void;
}

export default function Scheduler({ servers, accentColor = "indigo", onTriggerAction }: SchedulerProps) {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [logs, setLogs] = useState<CronJobLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [newJobName, setNewJobName] = useState("");
  const [newServerId, setNewServerId] = useState("");
  const [newAction, setNewAction] = useState<"backup" | "restart" | "command" | "broadcast">("backup");
  const [newCommand, setNewCommand] = useState("");
  const [newInterval, setNewInterval] = useState<"interval_30s" | "hourly" | "daily" | "weekly">("daily");
  const [newTime, setNewTime] = useState("04:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Styling guides based on theme AccentColor
  const accentColorText = {
    indigo: "text-indigo-400",
    emerald: "text-emerald-400",
    orange: "text-orange-400",
    pink: "text-pink-400"
  }[accentColor];

  const accentColorBtn = {
    indigo: "bg-indigo-600 hover:bg-indigo-500 text-white",
    emerald: "bg-emerald-600 hover:bg-emerald-500 text-white",
    orange: "bg-orange-600 hover:bg-orange-500 text-white",
    pink: "bg-pink-600 hover:bg-pink-500 text-white"
  }[accentColor];

  const accentColorBorderHover = {
    indigo: "hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5",
    emerald: "hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5",
    orange: "hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/5",
    pink: "hover:border-pink-500/40 hover:shadow-lg hover:shadow-pink-500/5"
  }[accentColor];

  useEffect(() => {
    fetchJobsAndLogs();
    const interval = setInterval(fetchJobsAndLogs, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobsAndLogs = async () => {
    try {
      const [jobsRes, logsRes] = await Promise.all([
        fetch("/api/scheduler/jobs"),
        fetch("/api/scheduler/logs")
      ]);
      if (jobsRes.ok && logsRes.ok) {
        const jData = await jobsRes.json();
        const lData = await logsRes.json();
        setJobs(jData);
        setLogs(lData);
      }
    } catch (err) {
      console.error("Failed to load scheduler sync state", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobName.trim() || !newServerId) {
      if (onTriggerAction) onTriggerAction("Bitte füllen Sie den Namen und den Server aus!", true);
      return;
    }

    setIsSubmitting(true);
    const targetServer = servers.find(s => s.id === newServerId);
    const postBody = {
      name: newJobName,
      serverId: newServerId,
      serverName: targetServer ? targetServer.name : "Unknown",
      action: newAction,
      command: (newAction === "command" || newAction === "broadcast") ? newCommand : undefined,
      interval: newInterval,
      time: (newInterval === "daily" || newInterval === "weekly") ? newTime : undefined,
      active: true
    };

    try {
      const res = await fetch("/api/scheduler/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postBody)
      });
      if (res.ok) {
        if (onTriggerAction) onTriggerAction("Automatisierte Betriebs-Aufgabe erfolgreich erstellt!");
        setNewJobName("");
        setNewCommand("");
        // Select first server if exists
        if (servers.length > 0) setNewServerId(servers[0].id);
        fetchJobsAndLogs();
      } else {
        const err = await res.json();
        if (onTriggerAction) onTriggerAction(err.error || "Fehler beim Erstellen der Aufgabe", true);
      }
    } catch (err) {
      if (onTriggerAction) onTriggerAction("Verbindungsfehler zum Scheduler-Dienst", true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleJob = async (id: string, activeState: boolean) => {
    try {
      const res = await fetch(`/api/scheduler/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: activeState })
      });
      if (res.ok) {
        if (onTriggerAction) onTriggerAction(`Aufgabe wurde ${activeState ? 'aktiviert' : 'deaktiviert'}.`);
        fetchJobsAndLogs();
      }
    } catch (err) {
      if (onTriggerAction) onTriggerAction("Aufgaben-Statusänderung verweigert", true);
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      const res = await fetch(`/api/scheduler/jobs/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        if (onTriggerAction) onTriggerAction("Betriebs-Aufgabe dauerhaft gelöscht.");
        fetchJobsAndLogs();
      }
    } catch (err) {
      if (onTriggerAction) onTriggerAction("Fehler beim Löschen der Aufgabe", true);
    }
  };

  const handleRunNow = async (id: string) => {
    try {
      if (onTriggerAction) onTriggerAction("Sende manuelles Trigger-Signal an Cron-Dispatcher...");
      const res = await fetch(`/api/scheduler/jobs/${id}/run`, {
        method: "POST"
      });
      if (res.ok) {
        if (onTriggerAction) onTriggerAction("Aufgabe wurde sofort gestartet! Ergebnisse im Journal.");
        fetchJobsAndLogs();
      }
    } catch (err) {
      if (onTriggerAction) onTriggerAction("Trigger-Fehler beim manuellen Dispatching", true);
    }
  };

  // Convert internal interval key to readable label
  const getIntervalLabel = (job: CronJob) => {
    switch (job.interval) {
      case "interval_30s":
        return "Alle 30 Sekunden (Simulator-Test)";
      case "hourly":
        return "Stündlich (zu Beginn der Stunde)";
      case "daily":
        return `Täglich um ${job.time || "00:00"} Uhr`;
      case "weekly":
        return `Wöchentlich um ${job.time || "00:00"} Uhr`;
      default:
        return job.interval;
    }
  };

  return (
    <div className="space-y-6" id="scheduler-view">
      
      {/* Intro info bar */}
      <div className="bg-[#121216]/90 border border-neutral-850 rounded-xl p-5 flex items-center justify-between">
        <div className="space-y-1 max-w-2xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className={`w-4.5 h-4.5 ${accentColorText}`} />
            Automatische Betriebssystem-Cronjobs & Task Scheduler
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            Planen Sie zeitgesteuerte Wartungsaufgaben, Backups oder RCON-Konsolenbefehle für all Ihre Container.
            Die <span className="text-emerald-400 font-semibold font-mono">Realtime Engine</span> führt Aufgaben vollautomatisch im Hintergrund aus, selbst wenn kein Webinterface-Benutzer aktiv ist.
          </p>
        </div>
        <div className="hidden lg:flex flex-col items-end font-mono text-[10px] text-zinc-500 border-l border-neutral-805 pl-6 gap-0.5">
          <span>SCHEDULER: ACTIVE</span>
          <span>DISPATCH POOL: {jobs.length} JOBS</span>
          <span>LATENCY: LIVE G-SYNC</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left pane: New Task Form */}
        <form onSubmit={handleAddJob} className="xl:col-span-4 bg-[#121216] border border-[#24242a] rounded-xl p-5 h-fit space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#24242a] mb-2">
            <Plus className={`w-4.5 h-4.5 ${accentColorText}`} />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Geplante Aufgabe anlegen
            </h4>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-450 mb-1.5 font-mono">
              Aufgabenname (Label)
            </label>
            <input
              type="text"
              required
              placeholder="z.B. Minecraft Backup Nacht"
              value={newJobName}
              onChange={(e) => setNewJobName(e.target.value)}
              className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Destination server */}
          <div>
            <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-450 mb-1.5">
              Ziel-Gameserver
            </label>
            <select
              value={newServerId}
              onChange={(e) => setNewServerId(e.target.value)}
              required
              className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none"
            >
              <option value="" disabled>-- Bitte auswählen --</option>
              {servers.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.game.toUpperCase()})</option>
              ))}
            </select>
          </div>

          {/* Action type */}
          <div>
            <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-450 mb-1.5">
              Aktion ausführen
            </label>
            <select
              value={newAction}
              onChange={(e) => setNewAction(e.target.value as any)}
              className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none"
            >
              <option value="backup">Backup-Snapshot anlegen (GZIP-Archiv)</option>
              <option value="restart">Server-Container sicher neu starten</option>
              <option value="command">Konsolenbefehl ausführen (RCON-Sync)</option>
              <option value="broadcast">RCON Server-Durchsage (Achtung Broadcast)</option>
            </select>
          </div>

          {/* CMD input if action type is command or broadcast */}
          {(newAction === "command" || newAction === "broadcast") && (
            <div>
              <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-450 mb-1.5 font-mono">
                {newAction === "broadcast" ? "Globale RCON Durchsage-Meldung" : "RCON Konsolen-Befehl"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={newAction === "broadcast" ? "Achtung: Server-Reboot in 5 Minuten!" : "say Server-Reboot in 5 Minuten!"}
                  value={newCommand}
                  onChange={(e) => setNewCommand(e.target.value)}
                  className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg pl-8 pr-3 py-2 text-xs text-neutral-200 font-mono focus:outline-none"
                />
                <Terminal className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-3" />
              </div>
            </div>
          )}

          {/* Interval settings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-450 mb-1.5">
                Intervall-Zyklus
              </label>
              <select
                value={newInterval}
                onChange={(e) => setNewInterval(e.target.value as any)}
                className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-2 py-2 text-xs text-white focus:outline-none"
              >
                <option value="interval_30s">30 Sek. (Simulator)</option>
                <option value="hourly">Stündlich</option>
                <option value="daily">Täglich</option>
                <option value="weekly">Wöchentlich</option>
              </select>
            </div>

            {/* Time selection */}
            {(newInterval === "daily" || newInterval === "weekly") && (
              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-450 mb-1.5 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-500" /> Uhrzeit
                </label>
                <input
                  type="text"
                  placeholder="04:00"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono text-center"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || servers.length === 0}
            className={`w-full disabled:opacity-50 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 font-mono cursor-pointer ${accentColorBtn}`}
          >
            {isSubmitting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                Dienst-Task Aktivieren
              </>
            )}
          </button>
        </form>

        {/* Right pane: Active Schedules List */}
        <div className="xl:col-span-8 flex flex-col space-y-6">
          
          <div className="bg-[#121216] border border-[#24242a] rounded-xl p-5">
            <div className="flex justify-between items-center pb-3 border-b border-[#24242a] mb-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-neutral-450" />
                Registrierte Cronjobs ({jobs.length})
              </h4>
              <button onClick={fetchJobsAndLogs} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[10px] uppercase font-mono cursor-pointer">
                <RefreshCw className="w-3 h-3" /> Aktualisieren
              </button>
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                <span className="text-xs text-neutral-500 font-mono">Verbinde zur Docker Engine...</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="py-10 text-center border-2 border-dashed border-neutral-900 rounded-lg bg-neutral-950/20">
                <Calendar className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-neutral-400 font-mono">Keine zeitgesteuerten Aufgaben eingetragen.</p>
                <p className="text-[10px] text-neutral-500 max-w-sm mx-auto mt-1 leading-normal">
                  Nutzen Sie das linke Formular um einen zeitgesteuerten Cron-Job zu erstellen.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className={`bg-neutral-950/70 border border-neutral-900 rounded-lg p-4 transition-all flex flex-col justify-between ${accentColorBorderHover}`}
                  >
                    <div>
                      {/* Header */}
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-xs font-bold text-white leading-snug">{job.name}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase tracking-wide">
                            {job.serverName}
                          </p>
                        </div>
                        {/* Toggle */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={job.active}
                            onChange={(e) => handleToggleJob(job.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4.5 bg-neutral-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-450 after:border-gray-500 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      {/* Info details */}
                      <div className="mt-3.5 space-y-1 bg-neutral-900/35 p-2 rounded border border-neutral-850 text-[10px]">
                        <div className="flex items-center gap-1.5 text-neutral-400 text-xxs">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span>AKTION:</span>
                          <span className="font-mono text-white tracking-wider font-bold">
                            {job.action === "backup" ? "Snapshot Backup" : job.action === "restart" ? "Containers Auto-Restart" : job.action === "broadcast" ? "Globale RCON Durchsage" : "Docker command Execution"}
                          </span>
                        </div>
                        {job.command && (
                          <p className="font-mono text-zinc-500 break-all pr-1 mt-0.5 text-xxs ml-5 border-l border-neutral-800 pl-1.5">
                            "{job.command}"
                          </p>
                        )}
                        <div className="flex justify-between items-center text-zinc-500 pt-1 border-t border-neutral-900 mt-1">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {getIntervalLabel(job)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action strip */}
                    <div className="mt-4 pt-3 border-t border-neutral-900 flex justify-between items-center">
                      <span className="text-[9px] font-mono text-neutral-500">
                        {job.lastRun ? `LETZTER RUN: ${new Date(job.lastRun).toLocaleTimeString()}` : "NO RECORD RUN"}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRunNow(job.id)}
                          className="bg-neutral-900 hover:bg-neutral-850 p-1.5 px-2 text-indigo-400 hover:text-indigo-300 font-mono text-[9px] font-bold rounded border border-neutral-800 flex items-center gap-1 cursor-pointer"
                          title="Führt die Aufgabe jetzt sofort manuell aus"
                        >
                          <Play className="w-3 h-3 text-indigo-400" /> JETZT TRIGGERN
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="bg-neutral-900 hover:bg-red-952/10 p-1.5 text-neutral-550 hover:text-red-400 hover:border-red-900/30 rounded border border-neutral-800 cursor-pointer"
                          title="Löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical Run Journal */}
          <div className="bg-[#121216] border border-[#24242a] rounded-xl p-5">
            <div className="pb-3 border-b border-[#24242a] mb-4 flex justify-between items-center">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Terminal className={`w-4 h-4 ${accentColorText}`} />
                Scheduler Execution Journal (Live Logs)
              </h4>
              <span className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider">Cron-Trigger Status: ONLINE</span>
            </div>

            <div className="max-h-[220px] overflow-y-auto scroller font-mono text-[10px] space-y-2 border border-neutral-900 rounded bg-neutral-950/70 p-3 select-text">
              {logs.length === 0 ? (
                <div className="py-6 text-center text-zinc-500 text-xxs block">
                  [JOURNAL] Wartet auf geplante Cron-Trigger oder manuelle Test-Signale...
                </div>
              ) : (
                logs.slice().reverse().map((log) => (
                  <div key={log.id} className="flex gap-2 text-xxs pb-2 border-b border-neutral-900/40 last:border-0 hover:bg-neutral-900/20 px-1 py-0.5 rounded transition-colors">
                    <span className="text-neutral-500 whitespace-nowrap">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    <span className={
                      log.status === "success" ? "text-emerald-400 font-bold" :
                      log.status === "warn" ? "text-amber-500 font-bold" : "text-red-400 font-bold"
                    }>
                      {log.status === "success" ? "[SUCCESS]" : log.status === "warn" ? "[WARN]" : "[CRASH]"}
                    </span>
                    <div className="flex-1 pr-1">
                      <span className="text-zinc-300 font-bold block sm:inline mr-2 underline decoration-neutral-800">{log.jobName}:</span>
                      <span className="text-neutral-400 font-sans">{log.message}</span>
                      <span className="text-[9px] text-zinc-554 font-mono ml-2 uppercase">({log.serverName})</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
