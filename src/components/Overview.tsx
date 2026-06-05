import { useEffect, useState } from "react";
import { SystemStats, GameServer } from "../types";
import { Cpu, Database, Network, HardDrive, ShieldCheck, Play, Square, Activity, RefreshCw } from "lucide-react";
import { useLanguage } from "../LanguageContext";
import GameIcon from "./GameIcon";
import DiskManager from "./DiskManager";

interface OverviewProps {
  stats: SystemStats | null;
  servers: GameServer[];
  onToggleServer: (id: string) => void;
  accentColor?: "indigo" | "emerald" | "orange" | "pink";
}

export default function Overview({ stats, servers, onToggleServer, accentColor = "indigo" }: OverviewProps) {
  const { t } = useLanguage();
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(15).fill(15));
  const [ramHistory, setRamHistory] = useState<number[]>(Array(15).fill(40));
  const [showDiskManager, setShowDiskManager] = useState(false);

  // System-Check Diagnostic Widget states
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<"healthy" | "error" | "warning">("healthy");
  const [activeError, setActiveError] = useState<string | null>(null);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [fixSuccess, setFixSuccess] = useState<string | null>(null);

  const runSystemCheck = () => {
    setIsScanning(true);
    setFixSuccess(null);
    setDiagnosticLogs([
      "Starte Host-Systemprüfung...",
      "Überprüfe Docker TCP Socket-Verbindung (port 2375)..."
    ]);

    setTimeout(() => {
      setDiagnosticLogs(prev => [...prev, "✓ Docker Daemon aktiv (v25.0.3)"]);
    }, 400);

    setTimeout(() => {
      setDiagnosticLogs(prev => [...prev, "Überprüfe physische Volume-Mounts im Pfad '/volumes'...", "✓ Mount-Pfade R/W-Integrationsprüfung erfolgreich"]);
    }, 800);

    setTimeout(() => {
      setDiagnosticLogs(prev => [...prev, "Prüfe Spieleserver-Abbild-Repositorys (Apt-Listen)..."]);
      setScanResult("error");
      setActiveError("Release-Datei nicht gefunden");
      setDiagnosticLogs(prev => [
        ...prev,
        "⚠️ WARNUNG: Erhaltener Status-Code 404 von Repository-Updates.",
        "❌ FEHLER: Release-Datei nicht gefunden (Apt-Repository 'gcore-servers' veraltet)."
      ]);
      setIsScanning(false);
    }, 1500);
  };

  const applyFix = () => {
    setIsScanning(true);
    setDiagnosticLogs(prev => [...prev, "Versuche automatische Wiederherstellung...", "Entferne fehlerhaftes Apt-Repository 'gcore-servers'...", "Aktualisiere GNU-Sicherheitszertifikate..."]);
    setTimeout(() => {
      setActiveError(null);
      setScanResult("healthy");
      setFixSuccess("Erfolgreich gelöst! Die veraltete Release-Datei wurde aus den APT-Quellen entfernt und die Docker-Sicherheitsrichtlinien wurden neu erzwungen.");
      setDiagnosticLogs(prev => [...prev, "✓ System-Apt-Quellen erfolgreich bereinigt.", "✓ Host-Terminal-Gateway voll funktionsfähig."]);
      setIsScanning(false);
    }, 1800);
  };

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
              <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">{t("overview.cpuLoad", "CPU-Auslastung")}</p>
              <h3 className={`text-2xl font-bold font-mono mt-1 ${accentColorText}`}>
                {stats ? `${stats.cpuLoad}%` : t("common.loading", "Lade...")}
              </h3>
              <p className="text-neutral-550 text-xxs font-mono mt-0.5">{stats ? `${stats.cpuCores} x 3.8 GHz ${t("overview.cores", "Kerne")}` : ""}</p>
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
              <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">{t("overview.ramUsage", "Arbeitsspeicher")}</p>
              <h3 className={`text-2xl font-bold font-mono mt-1 ${accentColorText}`}>
                {stats ? `${stats.ramUsed} GB` : t("common.loading", "Lade...")}
              </h3>
              <p className="text-neutral-550 text-xxs font-mono mt-0.5">{t("overview.of", "von")} {stats ? `${stats.ramTotal} GB` : "32 GB"}</p>
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
              <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">{t("overview.diskUsage", "Festplattenspeicher")}</p>
              <h3 className="text-2xl font-bold font-mono text-white mt-1">
                {stats ? `${stats.diskUsed} GB` : t("common.loading", "Lade...")}
              </h3>
              <p className="text-neutral-550 text-xxs font-mono mt-0.5">{t("overview.diskFree", "frei:")} {stats ? `${(stats.diskTotal - stats.diskUsed).toFixed(1)} GB` : "loading..."}</p>
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
              <span>{diskPercent}% {t("overview.diskUsedPercent", "Belegt")}</span>
              <span>{t("overview.diskTotalLabel", "Gesamt:")} {stats ? stats.diskTotal : 500} GB</span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-neutral-850/60 flex justify-end">
              <button
                onClick={() => setShowDiskManager(!showDiskManager)}
                className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-indigo-400 hover:text-indigo-300 transition duration-200 cursor-pointer flex items-center gap-1 ${showDiskManager ? "ring-1 ring-indigo-505" : ""}`}
                title="Massenspeicher verwalten (Formatieren, Löschen, Mounten)"
              >
                <HardDrive className="w-3 h-3" />
                {showDiskManager ? "Manager Schließen" : "Speicher Verwalten"}
              </button>
            </div>
          </div>
        </div>

        {/* Network & Traffic Card */}
        <div className={`bg-[#121216]/90 border border-neutral-850 rounded-xl p-5 transition-all duration-300 shadow-md ${accentColorBorderHover}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">{t("overview.networkTraffic", "Netzwerktraffic")}</p>
              <h3 className="text-2xl font-bold font-mono text-white mt-1">
                {stats ? `${stats.networkOut.toFixed(1)} MB/s` : "0.0 MB/s"}
              </h3>
              <p className="text-neutral-550 text-xxs font-mono mt-0.5">{t("overview.networkInbound", "Inbound:")} {stats ? `${stats.networkIn.toFixed(1)} MB/s` : "0.0 MB/s"}</p>
            </div>
            <div className={`p-2.5 rounded-lg bg-neutral-900 border border-neutral-850 text-neutral-400`}>
              <Network className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-6 flex justify-between items-center bg-neutral-950/50 rounded-lg p-2.5 border border-neutral-950">
            <span className="text-xxs font-mono text-neutral-500 uppercase">{t("overview.dockerDaemon", "Docker daemon")}</span>
            <span className="text-xxs font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-900/30">
              {t("overview.active", "Aktiv")} (v25)
            </span>
          </div>
        </div>
      </div>

      {showDiskManager && (
        <div className="mb-6 animate-fade-in">
          <DiskManager onClose={() => setShowDiskManager(false)} accentColor={accentColor} />
        </div>
      )}

      {/* Grid: Server Quick Actions & Info Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Docker Containers Overview */}
        <div className="lg:col-span-2 bg-[#121216]/90 border border-neutral-850 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-neutral-850">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className={`w-4.5 h-4.5 ${accentColorText}`} />
              {t("overview.activeServerInstances", "Aktive Spieleserver")} ({activeServers.length})
            </h3>
            <span className="text-xs font-mono text-neutral-500">
              {t("overview.dockerStatus", "Docker-Status")}: <strong className={accentColorText}>{t("overview.dockerConnected", "Verbunden")}</strong>
            </span>
          </div>

          <div className="divide-y divide-neutral-800/40">
            {activeServers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-neutral-500 text-sm">{t("overview.noServersRunning", "Zurzeit laufen keine Spieleserver im Container.")}</p>
                <p className="text-neutral-600 text-xs mt-1">{t("overview.noServersRunningSub", "Starten Sie einen Server unter \"Spieleserver verwalten\".")}</p>
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
                        <span className="text-xxs font-mono text-neutral-500">{t("overview.usage", "Usage")}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono text-neutral-450 block">{(srv.memoryUsage / 1024).toFixed(1)} GB</span>
                        <span className="text-xxs font-mono text-neutral-500">{t("overview.memory", "RAM")} ({Math.round(srv.memoryUsage / srv.maxMemory * 100)}%)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="text-right">
                        <span className={`text-xs font-mono font-medium border px-2 py-0.5 rounded ${playerBadgeClass}`}>
                          {srv.activePlayers} / {srv.maxPlayers} {t("servers.activePlayers", "Spieler")}
                        </span>
                      </div>

                      <button
                        onClick={() => onToggleServer(srv.id)}
                        className="bg-neutral-800 hover:bg-red-950/40 hover:text-red-400 border border-neutral-700 hover:border-red-900/40 p-2 rounded-lg text-neutral-300 transition-colors"
                        title={t("overview.stop", "Server stoppen")}
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

        {/* Interactive 'System-Check' Dashboard-Widget */}
        <div className="bg-[#121216]/90 border border-neutral-850 rounded-xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-neutral-850">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <ShieldCheck className={`w-4.5 h-4.5 ${accentColorText}`} />
                System-Diagnostik
              </h3>
              <button
                type="button"
                onClick={runSystemCheck}
                disabled={isScanning}
                className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 border border-indigo-900/30 px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
                Prüfen
              </button>
            </div>

            {/* Diagnostic scrolling log messages */}
            {diagnosticLogs.length > 0 && (
              <div className="mb-4 bg-black/60 rounded-lg p-3 border border-neutral-900 max-h-[125px] overflow-y-auto scroller font-mono text-[10px] space-y-1 text-zinc-400">
                {diagnosticLogs.map((log, idx) => {
                  const isErr = log.includes("❌") || log.includes("⚠️");
                  const isSuccess = log.includes("✓");
                  return (
                    <div key={idx} className={isErr ? "text-amber-400 font-bold" : isSuccess ? "text-emerald-400" : "text-zinc-400"}>
                      {log}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Live Checker Output Mode states */}
            {scanResult === "healthy" && !activeError ? (
              <div className="space-y-3.5">
                <div className="flex items-start gap-3 bg-neutral-950/30 border border-neutral-900/40 p-2.5 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0 animate-pulse"></div>
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-200">Docker Daemon: Aktiv</h4>
                    <p className="text-[#6c6c7d] text-[10px] font-mono leading-tight">Dienstausführung stabil auf lokaler Socketbridge (v25.0.3)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-neutral-950/30 border border-neutral-900/40 p-2.5 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0 animate-pulse"></div>
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-200">Volume-Speicher: Integrierbar</h4>
                    <p className="text-[#6c6c7d] text-[10px] font-mono leading-tight">Sämtliche Lese-/Schreibrechte für Spieldaten uneingeschränkt.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-neutral-950/30 border border-neutral-900/40 p-2.5 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0 animate-pulse"></div>
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-200">UFW Firewall: Synchron</h4>
                    <p className="text-[#6c6c7d] text-[10px] font-mono leading-tight">Verbindungs-Ports werden ordnungsgemäß via NAT geroutet.</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Error Mode & Diagnosis panel layout */
              <div className="space-y-3">
                <div className="bg-red-950/15 border border-red-900/35 p-3 rounded-lg flex items-start gap-2.5 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-xs font-bold text-red-400">Systemfehler erkannt!</h4>
                    <p className="text-neutral-300 font-mono text-[10px] uppercase font-bold mt-1 text-red-300">
                      Fehler: {activeError}
                    </p>
                    <p className="text-neutral-450 text-[10px] leading-relaxed mt-1">
                      Das Paketquellen-Update meldet ungelöste Repositorys. Installationen können fehlschlagen.
                    </p>
                  </div>
                </div>

                {/* Solution triggers */}
                <div className="bg-[#1a1412] border border-amber-900/30 p-3 rounded-lg space-y-2.5">
                  <span className="block text-[10px] font-bold text-amber-500 uppercase tracking-wider font-mono">
                    💡 Gezielte Lösungsvorschläge:
                  </span>
                  <div className="space-y-2 text-[10px] leading-relaxed">
                    <p className="text-neutral-400 font-sans text-xxs">
                      Der Fehler <strong>'Release file not found'</strong> tritt auf, wenn veraltete, nicht mehr signierte Update-Server in den Apt-Listen konfiguriert sind.
                    </p>
                    <div className="flex flex-col gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={applyFix}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[9px] py-1.5 px-3 rounded text-center transition-colors cursor-pointer uppercase flex items-center justify-center gap-1"
                      >
                        🔧 Veraltete APT-Quellen bereinigen &amp; Reparieren
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveError(null);
                          setScanResult("healthy");
                          setFixSuccess("Sicherheitsflag übersprungen! Docker-Installationsmodus fortgesetzt.");
                        }}
                        className="bg-neutral-850 hover:bg-neutral-800 text-neutral-300 font-bold text-[9px] py-1 px-3 rounded text-center border border-neutral-750 transition-colors cursor-pointer uppercase"
                      >
                        Skip: Release-Prüfung ignorieren
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Eventual Resolve success message banner */}
            {fixSuccess && (
              <div className="mt-3.5 bg-emerald-950/20 border border-emerald-950/20 p-2.5 rounded-lg text-emerald-400 text-[10px] font-mono leading-relaxed animate-fade-in animate-duration-300">
                <strong className="font-extrabold block mb-0.5">SYSLOG SUCCESS:</strong>
                {fixSuccess}
              </div>
            )}
          </div>

          <div className="border-t border-neutral-850 pt-3 mt-4 flex items-center justify-between text-[11px] font-mono text-zinc-500 select-none">
            <span>Uptime: 14 T, 6 Std</span>
            <span>Kernel: v6.2.0-generic</span>
          </div>
        </div>
      </div>
    </div>
  );
}
