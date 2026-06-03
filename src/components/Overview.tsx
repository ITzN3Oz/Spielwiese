import { useEffect, useState } from "react";
import { SystemStats, GameServer } from "../types";
import { Cpu, Database, Network, HardDrive, ShieldCheck, Play, Square, Activity } from "lucide-react";
import GameIcon from "./GameIcon";

interface OverviewProps {
  stats: SystemStats | null;
  servers: GameServer[];
  onToggleServer: (id: string) => void;
  accentColor?: "indigo" | "emerald" | "orange" | "pink";
}

export default function Overview({ stats, servers, onToggleServer, accentColor = "indigo" }: OverviewProps) {
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(15).fill(15));
  const [ramHistory, setRamHistory] = useState<number[]>(Array(15).fill(40));

  // Capture history for live visual charts
  useEffect(() => {
    if (stats) {
      setCpuHistory((prev) => [...prev.slice(1), stats.cpuLoad]);
      // RAM usage percentage relative to total ram (32GB)
      const ramPercent = Math.round((stats.ramUsed / stats.ramTotal) * 100);
      setRamHistory((prev) => [...prev.slice(1), ramPercent]);
    }
  }, [stats]);

  const activeServers = servers.filter((s) => s.status === "running");
  const ramPercent = stats ? Math.round((stats.ramUsed / stats.ramTotal) * 100) : 0;
  const diskPercent = stats ? Math.round((stats.diskUsed / stats.diskTotal) * 100) : 0;

  // Convert history array to SVG polyline coordinates
  const getCoordinates = (history: number[]) => {
    const width = 300;
    const height = 60;
    const padding = 2;
    const pointsCount = history.length;
    
    return history
      .map((val, idx) => {
        const x = (idx / (pointsCount - 1)) * (width - padding * 2) + padding;
        const y = height - (val / 100) * (height - padding * 2) - padding;
        return `${x},${y}`;
      })
      .join(" ");
  };

  const accentColorHex = {
    indigo: "#6366f1",
    emerald: "#10b981",
    orange: "#f97316",
    pink: "#ec4899"
  }[accentColor];

  const accentColorText = {
    indigo: "text-indigo-400",
    emerald: "text-emerald-400",
    orange: "text-orange-400",
    pink: "text-pink-400"
  }[accentColor];

  const accentColorBgIcon = {
    indigo: "bg-indigo-950/45 text-indigo-400 border border-indigo-900/30",
    emerald: "bg-emerald-950/45 text-emerald-400 border border-emerald-900/30",
    orange: "bg-orange-950/45 text-orange-400 border border-orange-900/30",
    pink: "bg-pink-950/45 text-pink-400 border border-pink-900/30"
  }[accentColor];

  const accentColorBgBar = {
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    orange: "bg-orange-500",
    pink: "bg-pink-500"
  }[accentColor];

  const accentColorBorderHover = {
    indigo: "hover:border-indigo-550/40 hover:shadow-lg hover:shadow-indigo-500/5",
    emerald: "hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5",
    orange: "hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/5",
    pink: "hover:border-pink-500/40 hover:shadow-lg hover:shadow-pink-500/5"
  }[accentColor];

  const playerBadgeClass = {
    indigo: "bg-indigo-950/40 text-indigo-400 border-indigo-900/30",
    emerald: "bg-emerald-950/40 text-emerald-400 border-emerald-900/30",
    orange: "bg-orange-950/40 text-orange-400 border-orange-900/30",
    pink: "bg-pink-950/40 text-pink-400 border-pink-900/30"
  }[accentColor];

  return (
    <div className="space-y-6" id="overview-dashboard text-neutral-200">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* CPU Card */}
        <div className={`bg-[#121216]/90 border border-neutral-850 rounded-xl p-5 transition-all duration-300 shadow-md ${accentColorBorderHover}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">CPU-Auslastung</p>
              <h3 className={`text-2xl font-bold font-mono mt-1 ${accentColorText}`}>
                {stats ? `${stats.cpuLoad}%` : "Lade..."}
              </h3>
              <p className="text-neutral-550 text-xxs font-mono mt-0.5">{stats ? `${stats.cpuCores} x 3.8 GHz Cores` : ""}</p>
            </div>
            <div className={`p-2.5 rounded-lg ${accentColorBgIcon}`}>
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          {/* Sparkline */}
          <div className="mt-4 h-[60px] w-full bg-neutral-950/40 rounded-lg overflow-hidden border border-neutral-900 flex items-end">
            <svg viewBox="0 0 300 60" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accentColorHex} stopOpacity="0.45" />
                  <stop offset="100%" stopColor={accentColorHex} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d={`M 2,60 L ${getCoordinates(cpuHistory)} L 298,60 Z`}
                fill="url(#cpuGrad)"
              />
              <polyline
                fill="none"
                stroke={accentColorHex}
                strokeWidth="2"
                points={getCoordinates(cpuHistory)}
              />
            </svg>
          </div>
        </div>

        {/* RAM Card */}
        <div className={`bg-[#121216]/90 border border-neutral-850 rounded-xl p-5 transition-all duration-300 shadow-md ${accentColorBorderHover}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Arbeitsspeicher</p>
              <h3 className={`text-2xl font-bold font-mono mt-1 ${accentColorText}`}>
                {stats ? `${stats.ramUsed} GB` : "Lade..."}
              </h3>
              <p className="text-neutral-550 text-xxs font-mono mt-0.5">von {stats ? `${stats.ramTotal} GB` : "32 GB"}</p>
            </div>
            <div className={`p-2.5 rounded-lg ${accentColorBgIcon}`}>
              <Database className="w-5 h-5" />
            </div>
          </div>
          {/* Live Progress Bar and Sparkline */}
          <div className="mt-4 h-[60px] w-full bg-neutral-950/40 rounded-lg overflow-hidden border border-neutral-900 flex items-end">
            <svg viewBox="0 0 300 60" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accentColorHex} stopOpacity="0.45" />
                  <stop offset="100%" stopColor={accentColorHex} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d={`M 2,60 L ${getCoordinates(ramHistory)} L 298,60 Z`}
                fill="url(#ramGrad)"
              />
              <polyline
                fill="none"
                stroke={accentColorHex}
                strokeWidth="2"
                points={getCoordinates(ramHistory)}
              />
            </svg>
          </div>
        </div>

        {/* Disk Storage Card */}
        <div className={`bg-[#121216]/90 border border-neutral-850 rounded-xl p-5 transition-all duration-300 shadow-md ${accentColorBorderHover}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Festplattenspeicher</p>
              <h3 className="text-2xl font-bold font-mono text-white mt-1">
                {stats ? `${stats.diskUsed} GB` : "Lade..."}
              </h3>
              <p className="text-neutral-550 text-xxs font-mono mt-0.5">frei: {stats ? `${(stats.diskTotal - stats.diskUsed).toFixed(1)} GB` : "loading..."}</p>
            </div>
            <div className={`p-2.5 rounded-lg bg-neutral-900 text-neutral-400 border border-neutral-850`}>
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-6">
            <div className="w-full bg-neutral-850 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${accentColorBgBar}`}
                style={{ width: `${diskPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xxs font-mono text-neutral-500 mt-2">
              <span>{diskPercent}% Belegt</span>
              <span>Gesamt: {stats ? stats.diskTotal : 500} GB</span>
            </div>
          </div>
        </div>

        {/* Network & Traffic Card */}
        <div className={`bg-[#121216]/90 border border-neutral-850 rounded-xl p-5 transition-all duration-300 shadow-md ${accentColorBorderHover}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Netzwerktraffic</p>
              <h3 className="text-2xl font-bold font-mono text-white mt-1">
                {stats ? `${stats.networkOut.toFixed(1)} MB/s` : "0.0 MB/s"}
              </h3>
              <p className="text-neutral-550 text-xxs font-mono mt-0.5">Inbound: {stats ? `${stats.networkIn.toFixed(1)} MB/s` : "0.0 MB/s"}</p>
            </div>
            <div className={`p-2.5 rounded-lg bg-neutral-900 border border-neutral-850 text-neutral-400`}>
              <Network className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-6 flex justify-between items-center bg-neutral-950/50 rounded-lg p-2.5 border border-neutral-950">
            <span className="text-xxs font-mono text-neutral-500 uppercase">Docker daemon</span>
            <span className="text-xxs font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-900/30">
              Aktiv (v25)
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Server Quick Actions & Info Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Docker Containers Overview */}
        <div className="lg:col-span-2 bg-[#121216]/90 border border-neutral-850 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-neutral-850">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className={`w-4.5 h-4.5 ${accentColorText}`} />
              Aktive Spieleserver ({activeServers.length})
            </h3>
            <span className="text-xs font-mono text-neutral-500">
              Docker-status: <strong className={accentColorText}>Verbunden</strong>
            </span>
          </div>

          <div className="divide-y divide-neutral-800/40">
            {activeServers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-neutral-500 text-sm">Zurzeit laufen keine Spieleserver im Container.</p>
                <p className="text-neutral-600 text-xs mt-1">Starten Sie einen Server unter "Spieleserver verwalten".</p>
              </div>
            ) : (
              activeServers.map((srv) => (
                <div key={srv.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <GameIcon game={srv.game} className="w-10 h-10 flex-shrink-0" iconUrl={srv.iconUrl} />
                    <div>
                      <h4 className="font-semibold text-white text-sm">{srv.name}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-neutral-450 font-mono">
                        <span className="bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-400 border border-neutral-850">{srv.portMapping}</span>
                        <span>•</span>
                        <span>{srv.version}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* CPU & Memory bars */}
                    <div className="hidden sm:flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs font-mono text-neutral-400 block">{srv.cpuUsage}% CPU</span>
                        <span className="text-xxs font-mono text-neutral-500">Usage</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono text-neutral-450 block">{(srv.memoryUsage / 1024).toFixed(1)} GB</span>
                        <span className="text-xxs font-mono text-neutral-500">RAM ({Math.round(srv.memoryUsage / srv.maxMemory * 100)}%)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="text-right">
                        <span className={`text-xs font-mono font-medium border px-2 py-0.5 rounded ${playerBadgeClass}`}>
                          {srv.activePlayers} / {srv.maxPlayers} Spieler
                        </span>
                      </div>

                      <button
                        onClick={() => onToggleServer(srv.id)}
                        className="bg-neutral-800 hover:bg-red-950/40 hover:text-red-400 border border-neutral-700 hover:border-red-900/40 p-2 rounded-lg text-neutral-300 transition-colors"
                        title="Server stoppen"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Server Host Health Panel */}
        <div className="bg-[#121216]/90 border border-neutral-850 rounded-xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4 pb-3 border-b border-neutral-850">
              <ShieldCheck className={`w-4.5 h-4.5 ${accentColorText}`} />
              Sicherheitsprüfungen
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2`}></div>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200">UFW Firewall aktiv</h4>
                  <p className="text-neutral-525 text-[11px] mt-0.5 font-mono">Spiele-Ports (25565, 27015, 2456) werden dynamisch für Docker freigegeben.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2`}></div>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200">Container-Sandbox Isolation</h4>
                  <p className="text-neutral-525 text-[11px] mt-0.5 font-mono">Jeder Server läuft als unprivilegierter Benutzer mit isolierten Mount-Points.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2"></div>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200">Backups synchronisiert</h4>
                  <p className="text-neutral-525 text-[11px] mt-0.5 font-mono">Tägliche verschlüsselte Systemsicherungen auf dem lokalen System Pool aktiv.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2`}></div>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200">Ubuntu Server Updates</h4>
                  <p className="text-neutral-525 text-[11px] mt-0.5 font-mono">Sicherheitsupdates sind auf automatisch eingerichtet.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-850 pt-4 mt-6">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>Linux Kernel:</span>
              <span className="text-white">6.2.0-39-generic</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mt-1.5">
              <span>System-Uptime:</span>
              <span className="text-white">14 Tage, 6 Stunden</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
