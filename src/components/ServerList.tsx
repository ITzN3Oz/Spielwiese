import React, { useState, useEffect, useRef } from "react";
import { GameServer, ServerLog } from "../types";
import {
  Play,
  Square,
  RefreshCw,
  Terminal,
  Settings,
  Trash2,
  X,
  Send,
  Sliders,
  Check,
  Cpu,
  Database,
  Users,
  AlertCircle,
  Puzzle,
  HelpCircle,
  Copy,
  BookOpen,
  Compass,
  Hammer,
  Maximize2,
  Minimize2
} from "lucide-react";
import ServerModsManager from "./ServerModsManager";
import GameIcon from "./GameIcon";
import FloatingWindow from "./FloatingWindow";

interface ServerListProps {
  servers: GameServer[];
  onToggleServer: (id: string) => void;
  onUpdateServer: (id: string) => void;
  onDeleteServer: (id: string) => void;
  onSaveConfig: (id: string, updateData: Partial<GameServer>) => void;
  onCreateBackup: (serverId: string, backupName?: string) => void;
  accentColor?: "indigo" | "emerald" | "orange" | "pink";
}

export default function ServerList({
  servers,
  onToggleServer,
  onUpdateServer,
  onDeleteServer,
  onSaveConfig,
  onCreateBackup,
  accentColor = "indigo"
}: ServerListProps) {
  const [activeConsoleServer, setActiveConsoleServer] = useState<GameServer | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<ServerLog[]>([]);
  const [consoleInput, setConsoleInput] = useState("");
  const [activeSettingsServer, setActiveSettingsServer] = useState<GameServer | null>(null);
  const [activeModsServer, setActiveModsServer] = useState<GameServer | null>(null);

  // Help guides & Game Launcher states
  const [activeGuidesServer, setActiveGuidesServer] = useState<GameServer | null>(null);
  const [activeGuideTab, setActiveGuideTab] = useState<"commands" | "modding" | "worldbuilding">("commands");
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [launcherPaths, setLauncherPaths] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("gcore_launcher_paths");
    return saved ? JSON.parse(saved) : {};
  });

  // Resizable window/modal scale states
  const [isConsoleMaximized, setIsConsoleMaximized] = useState(false);
  const [isGuidesMaximized, setIsGuidesMaximized] = useState(false);

  const handleSetLauncherPath = (gameKey: string) => {
    const current = launcherPaths[gameKey] || "";
    const path = prompt(
      `Geben Sie den lokalen Pfad zu Ihrem Spiel-Launcher oder Modding-Tool für ${gameKey.toUpperCase()} ein:\n(z.B. C:\\Program Files (x86)\\Steam\\steamapps\\common\\DayZ\\DayZLauncher.exe)`,
      current
    );
    if (path !== null) {
      const updated = { ...launcherPaths, [gameKey]: path };
      setLauncherPaths(updated);
      localStorage.setItem("gcore_launcher_paths", JSON.stringify(updated));
    }
  };

  const handleLaunchGame = (gameKey: string) => {
    const path = launcherPaths[gameKey];
    if (!path) {
      handleSetLauncherPath(gameKey);
    } else {
      alert(`Starte Spiel über lokalen Launcher-Pfad:\n"${path}"\n\nRCON Auto-Connect wurde initialisiert.`);
    }
  };

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(cmd);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  // Settings form elements
  const [settingsName, setSettingsName] = useState("");
  const [settingsImage, setSettingsImage] = useState("");
  const [settingsPort, setSettingsPort] = useState("");
  const [settingsMaxMemory, setSettingsMaxMemory] = useState(4096);
  const [settingsPlayers, setSettingsPlayers] = useState(10);
  const [settingsAutoUpdate, setSettingsAutoUpdate] = useState(true);
  const [settingsAutoBackup, setSettingsAutoBackup] = useState(true);
  const [settingsVars, setSettingsVars] = useState<Record<string, string>>({});

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Fetch logs periodically when a console drawer is open
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (activeConsoleServer) {
      const fetchLogs = async () => {
        try {
          const res = await fetch(`/api/servers/${activeConsoleServer.id}/logs`);
          if (res.ok) {
            const data = await res.json();
            setConsoleLogs(data);
          }
        } catch (err) {
          console.error("Failed to load logs dynamically", err);
        }
      };

      fetchLogs();
      intervalId = setInterval(fetchLogs, 3000);
    } else {
      setConsoleLogs([]);
    }
    return () => clearInterval(intervalId);
  }, [activeConsoleServer]);

  // Scroll console screen to help read commands
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleLogs]);

  const openConsole = (srv: GameServer) => {
    setActiveConsoleServer(srv);
  };

  const closeConsole = () => {
    setActiveConsoleServer(null);
    setIsConsoleMaximized(false);
  };

  const sendConsoleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consoleInput.trim() || !activeConsoleServer) return;

    try {
      const res = await fetch(`/api/servers/${activeConsoleServer.id}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: consoleInput })
      });
      if (res.ok) {
        setConsoleInput("");
        // Instantly reload local logs state
        const logRes = await fetch(`/api/servers/${activeConsoleServer.id}/logs`);
        if (logRes.ok) {
          const data = await logRes.json();
          setConsoleLogs(data);
        }
      }
    } catch (err) {
      console.error("Failed to post command over RCON interface", err);
    }
  };

  const runPresetMacro = async (cmd: string) => {
    if (!activeConsoleServer) return;
    try {
      await fetch(`/api/servers/${activeConsoleServer.id}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd })
      });
      // reload console logs instantly
      const logRes = await fetch(`/api/servers/${activeConsoleServer.id}/logs`);
      if (logRes.ok) {
        const data = await logRes.json();
        setConsoleLogs(data);
      }
    } catch (err) {
      console.error("Macro triggering error", err);
    }
  };

  const getMacrosForGame = (gameKey: string) => {
    switch (gameKey) {
      case "minecraft":
        return [
          { label: "👑 OP Kilian duchschnittlich", cmd: "op Kilian" },
          { label: "☀️ Zeit auf Tag setzen", cmd: "time set day" },
          { label: "🌙 Zeit auf Nacht setzen", cmd: "time set night" },
          { label: "☔ Regen klären (Wetter)", cmd: "weather clear" },
          { label: "👥 Spieler auflisten", cmd: "list" },
          { label: "💾 Welt sichern (Save)", cmd: "save-all" }
        ];
      case "dayz":
        return [
          { label: "📋 Admins.txt neu einlesen", cmd: "reload admins" },
          { label: "⚠️ Server-Neustart Warnung", cmd: "say -1 'Achtung: Server Neustart in 5 Minuten!'" },
          { label: "🎁 Heli Crash Event spawnen", cmd: "expansion spawn helicopter" },
          { label: "📦 Munitionskiste liefern", cmd: "spawn loot AmmoBox" }
        ];
      case "cs2":
        return [
          { label: "🦾 Practice Modus laden", cmd: "mp_warmup_start" },
          { label: "❌ Alle Host-Bots kicken", cmd: "bot_kick" },
          { label: "🔄 Runden-Reset durchführen", cmd: "mp_restartgame 1" },
          { label: "🗺️ Karte Dust 2 laden", cmd: "map de_dust2" }
        ];
      default:
        return [
          { label: "⚙️ Serverstatus RCON", cmd: "status" },
          { label: "📋 Hilfe erhalten", cmd: "help" },
          { label: "🖧 Netzwerk Ping", cmd: "ping" }
        ];
    }
  };

  const isPortColliding = activeSettingsServer && servers.some(
    s => s.id !== activeSettingsServer.id && s.portMapping.split(":")[0] === settingsPort.split(":")[0]
  );

  const handleResolvePortCollision = () => {
    if (!activeSettingsServer) return;
    const activePorts = servers
      .filter(s => s.id !== activeSettingsServer.id)
      .map(s => Number(s.portMapping.split(":")[0]));
    
    let candidate = 25565;
    if (activeSettingsServer.game === "dayz") candidate = 2302;
    if (activeSettingsServer.game === "cs2") candidate = 27015;
    
    while (activePorts.includes(candidate)) {
      candidate++;
    }
    setSettingsPort(`${candidate}:${candidate}`);
  };

  const openSettings = (srv: GameServer) => {
    setActiveSettingsServer(srv);
    setSettingsName(srv.name);
    setSettingsImage(srv.dockerImage);
    setSettingsPort(srv.portMapping);
    setSettingsMaxMemory(srv.maxMemory);
    setSettingsPlayers(srv.maxPlayers);
    setSettingsAutoUpdate(srv.autoUpdate);
    setSettingsAutoBackup(srv.autoBackup);
    setSettingsVars({ ...srv.variables });
  };

  const closeSettings = () => {
    setActiveSettingsServer(null);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSettingsServer) return;

    onSaveConfig(activeSettingsServer.id, {
      name: settingsName,
      dockerImage: settingsImage,
      portMapping: settingsPort,
      maxMemory: Number(settingsMaxMemory),
      maxPlayers: Number(settingsPlayers),
      autoUpdate: settingsAutoUpdate,
      autoBackup: settingsAutoBackup,
      variables: settingsVars
    });

    closeSettings();
  };

  const handleVariableChange = (key: string, value: string) => {
    setSettingsVars((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  // Status mapping badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
            ONLINE
          </span>
        );
      case "stopped":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-neutral-950/60 text-neutral-450 border border-neutral-800">
            OFFLINE
          </span>
        );
      case "updating":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-amber-950/40 text-amber-400 border border-amber-500/30 animate-pulse">
            UPDATING
          </span>
        );
      case "installing":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-indigo-950/40 text-indigo-400 border border-indigo-500/30 animate-pulse">
            INSTALLING
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-red-955/40 text-red-400 border border-red-500/30">
            ERROR
          </span>
        );
    }
  };

  return (
    <div className="space-y-6" id="server-list-component">
      {/* Title & Stats Ribbon */}
      <div className="flex justify-between items-center bg-[#121216]/20 border-b border-[#24242a] pb-4">
        <div>
          <h3 className="text-base font-semibold text-white uppercase tracking-wider">
            Game Server Instanzen
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Verwalten Sie installierte Server, patchen Sie Binaries und bearbeiten Sie Docker-Variablen.
          </p>
        </div>
        <div className="flex bg-[#121216] border border-[#24242a] px-3 py-1.5 rounded-lg text-xs gap-4 font-mono">
          <span className="flex items-center gap-1.5 text-neutral-450">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {servers.filter((s) => s.status === "running").length} Aktiv
          </span>
          <span className="text-neutral-700">|</span>
          <span className="text-neutral-450 font-sans">
            Gesamt: {servers.length}
          </span>
        </div>
      </div>

      {servers.length === 0 ? (
        <div className="bg-[#121216]/40 border border-[#24242a] rounded-xl text-center py-16 px-4">
          <AlertCircle className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-neutral-300">Keine Server installiert</h4>
          <p className="text-xs text-neutral-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            Es wurden noch keine Docker Game-Server auf diesem Host eingerichtet. Gehen Sie auf den Reiter <strong>"Server installieren"</strong>, um mit 1-Klick loszulegen.
          </p>
        </div>
      ) : (
        /* Server Cards Grid spacing */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {servers.map((srv) => {
            const isRunning = srv.status === "running";
            const isPending = srv.status === "installing" || srv.status === "updating";
            const ramPercent = Math.min(100, Math.round((srv.memoryUsage / srv.maxMemory) * 100));

            return (
              <div
                key={srv.id}
                className="bg-[#121216] border border-[#24242a] rounded-xl p-5 flex flex-col justify-between hover:border-[#1c1c24] transition-all duration-300 shadow-md relative overflow-hidden"
              >
                {/* Glowing status line indicator */}
                <div
                  className={`absolute top-0 left-0 right-0 h-0.5 ${
                    isRunning ? "bg-emerald-500" : isPending ? "bg-amber-500 animate-pulse" : "bg-neutral-850"
                  }`}
                />

                {/* Card Top */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <GameIcon game={srv.game} className="w-11 h-11 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-white text-sm tracking-wide">{srv.name}</h4>
                      <p className="text-[10px] text-neutral-500 mt-1 font-mono tracking-tight truncate max-w-[185px] sm:max-w-[220px]">
                        {srv.dockerImage}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    {getStatusBadge(srv.status)}
                    <span className="text-[10px] text-neutral-500 font-mono mt-2 tracking-wide uppercase">
                      Port: {srv.portMapping.split(":")[0]}
                    </span>
                  </div>
                </div>

                {/* Card Middle: Usage stats inline display */}
                <div className="my-5 grid grid-cols-3 gap-2.5">
                  <div className="bg-neutral-950/50 border border-neutral-850 p-2 rounded-lg text-center">
                    <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wide">CPU Last</p>
                    <p className="text-white font-mono text-sm font-bold mt-1">
                      {isRunning ? `${srv.cpuUsage}%` : "0%"}
                    </p>
                  </div>
                  <div className="bg-neutral-950/50 border border-neutral-850 p-2 rounded-lg text-center">
                    <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wide">RAM Auslastung</p>
                    <p className="text-white font-mono text-sm font-bold mt-1">
                      {isRunning ? `${(srv.memoryUsage / 1024).toFixed(1)} GB` : "0.0 GB"}
                    </p>
                  </div>
                  <div className="bg-neutral-950/50 border border-neutral-850 p-2 rounded-lg text-center">
                    <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wide">Mitglieder</p>
                    <p className="text-white font-mono text-sm font-bold mt-1">
                      {isRunning ? `${srv.activePlayers} / ${srv.maxPlayers}` : `0 / ${srv.maxPlayers}`}
                    </p>
                  </div>
                </div>

                {/* Progress bar info for RAM */}
                {isRunning && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xxs text-neutral-500 mb-1 font-mono">
                      <span>RAM Limitierung</span>
                      <span>{ramPercent}% ({srv.memoryUsage} / {srv.maxMemory} MB)</span>
                    </div>
                    <div className="w-full bg-neutral-950 h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          accentColor === "indigo" ? "bg-indigo-500" :
                          accentColor === "emerald" ? "bg-emerald-500" :
                          accentColor === "orange" ? "bg-orange-500" :
                          "bg-pink-500"
                        }`}
                        style={{ width: `${ramPercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Launcher Integration Widget */}
                <div className="bg-[#181822]/40 border border-[#24242a]/80 rounded-lg p-2.5 mb-4 flex items-center justify-between text-xxs mt-2.5">
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isRunning ? (
                        accentColor === "indigo" ? "bg-indigo-400 animate-pulse" :
                        accentColor === "emerald" ? "bg-emerald-400 animate-pulse" :
                        accentColor === "orange" ? "bg-orange-400 animate-pulse" :
                        "bg-pink-450 animate-pulse"
                      ) : "bg-neutral-600"
                    }`} />
                    <div className="overflow-hidden">
                      <p className="text-neutral-300 font-bold font-mono tracking-wide text-[9px] uppercase">LOCAL LAUNCHER</p>
                      <p className="text-[#6c6c7d] font-mono text-[9px] truncate max-w-[130px] sm:max-w-[170px]" title={launcherPaths[srv.game] || "Kein Pfad"}>
                        {launcherPaths[srv.game] ? `Pfad: ...${launcherPaths[srv.game].slice(-25)}` : "Kein Pfad konfiguriert"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0 ml-2">
                    <button
                      onClick={() => handleSetLauncherPath(srv.game)}
                      className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white rounded text-[10px] font-mono hover:bg-neutral-800 transition-colors"
                      title="Lokalen Pfad eingeben"
                    >
                      Pfad
                    </button>
                    <button
                      onClick={() => handleLaunchGame(srv.game)}
                      className={`px-2 py-0.5 text-white rounded text-[10px] font-bold hover:shadow transition-all flex items-center gap-1 cursor-pointer ${
                        accentColor === "indigo" ? "bg-indigo-600 hover:bg-indigo-500" :
                        accentColor === "emerald" ? "bg-emerald-600 hover:bg-emerald-500" :
                        accentColor === "orange" ? "bg-orange-600 hover:bg-orange-500" :
                        "bg-pink-650 hover:bg-pink-500"
                      }`}
                      title="Spiel über Launcher starten"
                    >
                      <span>STARTEN</span>
                    </button>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="flex gap-1.5 border-t border-neutral-850 pt-3.5 mt-1 text-xs">
                  {/* Start/Stop Power toggle */}
                  <button
                    onClick={() => onToggleServer(srv.id)}
                    disabled={isPending}
                    className={`flex-1 flex items-center justify-center gap-1 font-semibold py-1.5 px-2 rounded-lg border text-xxs transition-all cursor-pointer ${
                      isRunning
                        ? "bg-red-952/15 text-red-400 border-red-500/20 hover:bg-red-900/40"
                        : "bg-emerald-952/15 text-emerald-400 border-emerald-500/15 hover:bg-emerald-900/40"
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        Stoppen
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        Starten
                      </>
                    )}
                  </button>

                  {/* Core Utilities Buttons */}
                  <button
                    onClick={() => openConsole(srv)}
                    className="bg-neutral-900 hover:bg-[#181822] border border-neutral-800 hover:border-neutral-700 px-2.5 py-1.5 rounded-lg text-neutral-300 text-xxs transition-colors flex items-center gap-1 cursor-pointer"
                    title="Console CLI"
                  >
                    <Terminal className={`w-3 h-3 ${
                      accentColor === "indigo" ? "text-indigo-400" :
                      accentColor === "emerald" ? "text-emerald-400" :
                      accentColor === "orange" ? "text-orange-400" :
                      "text-pink-450"
                    }`} />
                    Console
                  </button>

                  {/* Interactive guides & help */}
                  <button
                    onClick={() => {
                      setActiveGuidesServer(srv);
                      setActiveGuideTab("commands");
                    }}
                    className={`border p-1.5 rounded-lg transition-colors cursor-pointer ${
                      accentColor === "indigo" ? "bg-neutral-900 hover:bg-[#1a1a24] text-indigo-400 border-neutral-800 hover:border-indigo-900/50" :
                      accentColor === "emerald" ? "bg-neutral-900 hover:bg-[#112419] text-emerald-400 border-neutral-800 hover:border-emerald-900/50" :
                      accentColor === "orange" ? "bg-neutral-900 hover:bg-[#2b1f15] text-orange-400 border-neutral-800 hover:border-orange-900/50" :
                      "bg-neutral-900 hover:bg-[#2a1320] text-pink-400 border-neutral-800 hover:border-pink-900/50"
                    }`}
                    title="Server Commands, Modding-Tipps & Worldbuilding-Anleitung"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>

                  {/* Config settings */}
                  <button
                    onClick={() => openSettings(srv)}
                    className="bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 hover:border-neutral-600 p-1.5 rounded-lg text-neutral-300 transition-colors"
                    title="Konfigurieren"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>

                  {/* Quick Auto-update system patch */}
                  <button
                    onClick={() => onUpdateServer(srv.id)}
                    disabled={isPending}
                    className="bg-neutral-800 hover:bg-neutral-750 disabled:opacity-40 border border-neutral-700 hover:border-neutral-600 p-1.5 rounded-lg text-neutral-300 transition-colors"
                    title="Update erzwingen (SteamCMD)"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                  </button>

                  {/* Instant Backup Snapshot */}
                  <button
                    onClick={() => onCreateBackup(srv.id, `Backup-${srv.name}-Snapshot`)}
                    disabled={isPending}
                    className="bg-neutral-850 hover:bg-neutral-800 border border-neutral-700/80 p-1.5 rounded-lg text-neutral-300 transition-colors"
                    title="Snapshot erstellen"
                  >
                    <Database className="w-3.5 h-3.5 text-emerald-500" />
                  </button>

                  {/* Mods & Dateimanager button */}
                  <button
                    onClick={() => setActiveModsServer(srv)}
                    className="bg-neutral-855 hover:bg-neutral-800 border-indigo-900/40 hover:border-indigo-505/40 border p-1.5 rounded-lg text-indigo-400 transition-colors cursor-pointer"
                    title="Mods & Dateimanager"
                  >
                    <Puzzle className="w-3.5 h-3.5" />
                  </button>

                  {/* Uninstall container */}
                  <button
                    onClick={() => {
                      if (confirm(`Sind Sie sicher, dass Sie '${srv.name}' löschen und uninstalleiren wollen?`)) {
                        onDeleteServer(srv.id);
                      }
                    }}
                    disabled={isRunning}
                    className="bg-neutral-800 hover:bg-red-950/50 hover:text-red-400 disabled:opacity-30 border border-neutral-700 hover:border-red-900/20 p-1.5 rounded-lg text-neutral-500 transition-colors ml-auto"
                    title="Server deinstallieren (Nur im gestoppten Zustand)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. Live Console View Panel (CLI Terminal Modal) */}
      {activeConsoleServer && (
        <FloatingWindow
          onClose={closeConsole}
          title={`Echtzeit-Terminal für ${activeConsoleServer.name}`}
          subtitle="[Kilians Core CLI Container Sync Engine v2.0] • RCON ACTIVE"
          icon={<Terminal className="w-5 h-5 text-indigo-400" />}
          initialWidth={950}
          initialHeight={620}
        >
          {/* Split Screen Container */}
          <div className="flex-1 flex overflow-hidden">
              
            {/* Left Pane - Terminal Scrolling Stream */}
            <div className="flex-1 flex flex-col justify-between bg-black/95">
              <div className="flex-1 p-5 overflow-y-auto font-mono text-xs text-neutral-300 space-y-2 select-text scroller">
                <div className="text-neutral-600 text-xxs border-b border-neutral-900 pb-2 flex justify-between">
                  <span>[Kilians Core CLI Container Sync Engine v2.0]</span>
                  <span>Session: UTC Live</span>
                </div>
                
                {consoleLogs.map((log) => {
                  const isCmdOut = log.type === "output";
                  const isErr = log.type === "error";
                  const isWarning = log.type === "warn";

                  return (
                    <div key={log.id} className="leading-relaxed flex items-start gap-2 animate-fade-in">
                      <span className="text-neutral-600 text-[10px] select-none flex-shrink-0 pt-0.5">
                        [{new Date(log.timestamp).toLocaleTimeString()}]
                      </span>
                      <span
                        className={`block font-mono text-xs whitespace-pre-wrap ${
                          isCmdOut
                            ? "text-indigo-400 font-bold"
                            : isErr
                            ? "text-red-500"
                            : isWarning
                            ? "text-amber-500"
                            : "text-neutral-300"
                        }`}
                      >
                        {log.message}
                      </span>
                    </div>
                  );
                })}
                <div ref={logsEndRef} />
              </div>

              {/* Command Input panel */}
              <form
                onSubmit={sendConsoleCommand}
                className="p-3 bg-neutral-950 border-t border-neutral-900 flex gap-2"
              >
                <span className="text-indigo-400 font-mono text-xs flex items-center pl-2 font-bold select-none">
                  $
                </span>
                <input
                  type="text"
                  value={consoleInput}
                  onChange={(e) => setConsoleInput(e.target.value)}
                  placeholder="Werte eingeben oder Makro rechts aufrufen..."
                  className="flex-1 bg-transparent border-0 ring-0 focus:ring-0 text-white font-mono text-xs focus:outline-none placeholder-neutral-600 px-1 py-1"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-505 text-white px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Senden
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Right Pane - RCON Preset Command Macros */}
            <div className="w-85 border-l border-neutral-850 bg-[#0c0c0d] p-4 flex flex-col justify-between overflow-y-auto scroller text-neutral-300">
              <div className="space-y-4">
                <div>
                  <span className="text-xxs font-bold uppercase tracking-wider text-neutral-500 block mb-1">Schnellbefehle & Makros</span>
                  <p className="text-[10px] text-neutral-550 leading-normal">
                    Senden Sie vorkonfigurierte Game-Command-Strings sofort mit einem Klick an die RCON-Schnittstelle.
                  </p>
                </div>

                <div className="space-y-2">
                  {getMacrosForGame(activeConsoleServer.game).map((macro, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        runPresetMacro(macro.cmd);
                        // Append immediate visual UI log hint as a simulated output
                        const logItem = {
                          id: Math.random().toString(),
                          serverId: activeConsoleServer.id,
                          timestamp: new Date().toISOString(),
                          type: "output" as const,
                          message: `[MACRO RUN] Executed: /${macro.cmd}`
                        };
                        setConsoleLogs(prev => [...prev, logItem]);
                      }}
                      className="w-full text-left bg-[#121216] border border-neutral-850 hover:border-indigo-500/45 hover:bg-indigo-950/10 p-2.5 rounded-lg text-xs text-white transition-all font-medium flex items-center justify-between cursor-pointer group"
                    >
                      <span className="truncate">{macro.label}</span>
                      <span className="opacity-0 group-hover:opacity-100 font-mono text-[9px] text-indigo-400 font-bold transition-opacity">RUN</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-905 text-[9px] text-neutral-600 font-mono bg-neutral-950/20 -mx-4 -mb-4 p-4 mt-4 leading-normal">
                <span className="text-indigo-400 font-bold uppercase block mb-1">Operator Info</span>
                Makros interagieren im Live-Modus direkt mit der aktiven Container-Simulations-Instanz.
              </div>
            </div>

          </div>
        </FloatingWindow>
      )}

      {/* 2. Advanced Game Server Settings Side Drawer / Modal */}
      {activeSettingsServer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="h-full w-full max-w-lg bg-[#0c0c0d] border-l border-[#24242a] p-6 shadow-2xl overflow-y-auto flex flex-col justify-between animate-slide-in">
            {/* Form Container */}
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="flex justify-between items-center border-b border-[#24242a] pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4.5 h-4.5 text-indigo-400" />
                  <h3 className="font-bold text-white text-base">Server konfigurieren</h3>
                </div>
                <button
                  type="button"
                  onClick={closeSettings}
                  className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-850"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Server Name Override */}
              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-450 mb-1.5">
                  Server Name
                </label>
                <input
                  type="text"
                  required
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                  className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-505"
                />
              </div>

              {/* Image & Port */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-450 mb-1.5">
                    Docker Image Registry Link
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsImage}
                    onChange={(e) => setSettingsImage(e.target.value)}
                    className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-450 mb-1.5">
                      Netzwerkport-Mapping
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsPort}
                      onChange={(e) => setSettingsPort(e.target.value)}
                      className={`w-full bg-[#1c1c24] border rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none ${isPortColliding ? "border-amber-500/55" : "border-[#24242a]"}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-450 mb-1.5">
                      Max Players (Mitglieder)
                    </label>
                    <input
                      type="number"
                      required
                      value={settingsPlayers}
                      onChange={(e) => setSettingsPlayers(Number(e.target.value))}
                      className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>

                {isPortColliding && (
                  <div className="bg-amber-950/20 border border-amber-905/40 p-3 rounded-lg flex flex-col gap-2 mt-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-semibold font-mono">
                      <AlertCircle className="w-3.5 h-3.5 animate-bounce" />
                      PORT-KOLLISION MIT ANDEREM SERVER!
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-normal">
                      Der Port {settingsPort.split(":")[0]} wird bereits belegt.
                    </p>
                    <button
                      type="button"
                      onClick={handleResolvePortCollision}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[9px] py-1 px-2.5 rounded hover:scale-98 transition-transform cursor-pointer font-mono inline-self-start uppercase"
                    >
                      Automatischer Port-Vorschlag
                    </button>
                  </div>
                )}
              </div>

              {/* Max Hardware Allocation memory inside Settings */}
              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-450 mb-1.5 flex justify-between">
                  <span>Zugeordneter Arbeitsspeicher limit (MB)</span>
                  <span className="text-zinc-500 text-xs font-mono">{settingsMaxMemory} MB</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1024"
                    max="16384"
                    step="1024"
                    value={settingsMaxMemory}
                    onChange={(e) => setSettingsMaxMemory(Number(e.target.value))}
                    className="flex-1 accent-indigo-554 bg-[#1c1c24] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-mono text-neutral-300 w-16 text-right">
                    {(settingsMaxMemory / 1024).toFixed(1)} GB
                  </span>
                </div>
              </div>

              {/* Automatic routines (Automatic Updates & Backups engine) */}
              <div className="space-y-3 pt-3 border-t border-neutral-850">
                <span className="block text-xxs font-bold uppercase tracking-wider text-neutral-450">
                  Automatisierte Betriebs-Routinen
                </span>

                <div className="flex items-center justify-between bg-[#121216] p-3 rounded-lg border border-[#24242a]">
                  <div>
                    <p className="text-xs font-bold text-white">Automatisches Update-System</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Sucht täglich per SteamCMD nach Patches.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsAutoUpdate}
                      onChange={(e) => setSettingsAutoUpdate(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-450 after:border-gray-500 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between bg-[#121216] p-3 rounded-lg border border-[#24242a]">
                  <div>
                    <p className="text-xs font-bold text-white">Automatische Backups</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Generiert nächtliche Archivdateien der Welten.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsAutoBackup}
                      onChange={(e) => setSettingsAutoBackup(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-450 after:border-gray-500 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              {/* Variables Panel */}
              {Object.keys(settingsVars).length > 0 && (
                <div className="space-y-3 pt-3 border-t border-neutral-850">
                  <span className="block text-xxs font-bold uppercase tracking-wider text-neutral-450">
                    Spiele-Konfigurationsvariablen (Docker Env)
                  </span>
                  <div className="grid grid-cols-1 gap-3 max-h-[140px] overflow-y-auto pr-1">
                    {Object.entries(settingsVars).map(([key, value]) => (
                      <div key={key} className="flex flex-col space-y-1">
                        <span className="text-[10px] font-mono text-neutral-500">{key}</span>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleVariableChange(key, e.target.value)}
                          className="w-full bg-[#1c1c24] border border-[#24242a] rounded px-2.5 py-1 text-xs text-neutral-200 font-mono focus:outline-none focus:border-indigo-500/40"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>

            <div className="pt-6 border-t border-neutral-850 mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeSettings}
                className="flex-1 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center border border-neutral-700 transition-colors cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Mods & Dateimanager Overlay Component */}
      {activeModsServer && (
        <ServerModsManager
          server={activeModsServer}
          onClose={() => setActiveModsServer(null)}
          onAddConsoleLog={async (message, type = "info") => {
            try {
              await fetch(`/api/servers/${activeModsServer.id}/command`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command: `[LOG-INBOUND] ${message}` })
              });
            } catch (err) {
              console.error("Failed to append custom manager log to terminal", err);
            }
          }}
        />
      )}

      {/* 4. Host-Terminal, Modding & Worldbuilding Guides Manual Overlay Modal */}
      {activeGuidesServer && (
        <FloatingWindow
          onClose={() => {
            setActiveGuidesServer(null);
            setIsGuidesMaximized(false);
          }}
          title="Support-Handbuch & RCON Guides"
          subtitle={`Instanz: ${activeGuidesServer.name} (${activeGuidesServer.game.toUpperCase()})`}
          icon={<BookOpen className="w-5 h-5 text-indigo-400" />}
          initialWidth={960}
          initialHeight={625}
        >
          {/* Guides Tab switcher */}
            <div className="flex border-b border-neutral-850/80 bg-[#121216]/50 px-6 py-2.5 gap-2">
              <button
                onClick={() => setActiveGuideTab("commands")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xxs font-extrabold tracking-wider uppercase transition-all cursor-pointer ${
                  activeGuideTab === "commands"
                    ? "bg-indigo-650 text-white shadow-md shadow-indigo-650/10"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/30"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Dienstbefehle (RCON)
              </button>
              <button
                onClick={() => setActiveGuideTab("modding")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xxs font-extrabold tracking-wider uppercase transition-all cursor-pointer ${
                  activeGuideTab === "modding"
                    ? "bg-indigo-650 text-white shadow-md shadow-indigo-650/10"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/30"
                }`}
              >
                <Hammer className="w-3.5 h-3.5" />
                Eigene Mods & Bearbeitung
              </button>
              <button
                onClick={() => setActiveGuideTab("worldbuilding")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xxs font-extrabold tracking-wider uppercase transition-all cursor-pointer ${
                  activeGuideTab === "worldbuilding"
                    ? "bg-indigo-650 text-white shadow-md shadow-indigo-650/10"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/30"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Worldbuilding & Loot-Economy
              </button>
            </div>

            {/* Guides Content Panel */}
            <div className="flex-1 overflow-y-auto p-6 scroller bg-[#0a0a0d]">
              {activeGuideTab === "commands" && (
                <div className="space-y-4">
                  <div className="bg-[#181822]/30 border border-indigo-950/40 p-4 rounded-xl">
                    <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-2 uppercase tracking-wide">
                      <Terminal className="w-4 h-4" />
                      Interaktives RCON-Terminal Handbuch
                    </h4>
                    <p className="text-xxs text-neutral-400 leading-relaxed mt-2">
                      Führen Sie diese Befehle direkt in der Live-Konsole aus. Parameter in spitzen Klammern wie <code className="text-indigo-400 font-semibold font-mono">&lt;Name&gt;</code> müssen durch echte Werte ersetzt werden. Klicken Sie auf Befehle, um sie sofort in die Zwischenablage zu kopieren.
                    </p>
                  </div>

                  <div className="border border-neutral-850 rounded-xl overflow-hidden bg-neutral-900/10">
                    <table className="w-full text-left text-xxs border-collapse">
                      <thead>
                        <tr className="bg-[#121216] border-b border-neutral-850 text-neutral-400 font-mono">
                          <th className="p-3">Befehl (Klicken zum Kopieren)</th>
                          <th className="p-3">Beschreibung</th>
                          <th className="p-3">Berechtigung</th>
                          <th className="p-3 text-center">Aktion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-850 font-sans">
                        {(activeGuidesServer.game === "dayz" ? [
                          { cmd: "#login <Passwort>", desc: "Meldet Sie als Administrator an der Spielkonsole an.", perm: "Admin" },
                          { cmd: "say -1 'Serverneustart in 5 Min!'", desc: "Sendet eine globale Systemwarnung an alle Spieler.", perm: "Operator" },
                          { cmd: "kick <SpielerName>", desc: "Entfernt einen bestimmten Spieler für die aktuelle Session.", perm: "Operator" },
                          { cmd: "ban <SpielerName>", desc: "Sperrt den Spieler permanent und schreibt ihn in die banlist.txt.", perm: "Admin" },
                          { cmd: "reloadadmins", desc: "Zwingt den Host, die admins.txt Zugriffsrechte neu einzulesen.", perm: "Admin" },
                          { cmd: "settime 12:00", desc: "Ändert die aktuelle Server-Uhrzeit instant auf High-noon (Mittag).", perm: "Admin" },
                          { cmd: "expansionspawn heli", desc: "Spawnt ein animiertes Heli-Crash Event an zufälligen Koordinaten.", perm: "Operator" }
                        ] : [
                          { cmd: "/op <Benutzer>", desc: "Deklariert den gewählten Spieler zum Super-Administrator (OP).", perm: "Admin" },
                          { cmd: "/whitelist add <Benutzer>", desc: "Schreibt den Spieler auf die Whitelist Ihres Servers.", perm: "Operator" },
                          { cmd: "/save-all", desc: "Sichert alle Chunk-Dateien und Weltensegmente sofort im Speicher.", perm: "Operator" },
                          { cmd: "/difficulty hard", desc: "Schaltet den globalen Schwierigkeitsgrad der Spielwelt auf Hart.", perm: "Admin" },
                          { cmd: "/gamerule keepInventory true", desc: "Aktiviert den Erhalt des gesamten Inventars beim Ableben.", perm: "Admin" },
                          { cmd: "/kick <Benutzer>", desc: "Entfernt den störenden Spieler aus dieser Session.", perm: "Operator" }
                        ]).map((c) => (
                          <tr key={c.cmd} className="hover:bg-neutral-950/45 transition-colors group">
                            <td className="p-3 font-mono text-indigo-400 font-semibold cursor-pointer select-all" onClick={() => handleCopyCommand(c.cmd)}>
                              <span className="bg-neutral-950/80 px-2 py-1 rounded border border-neutral-900 group-hover:border-indigo-900/50 block w-max">
                                {c.cmd}
                              </span>
                            </td>
                            <td className="p-3 text-neutral-300 leading-normal">{c.desc}</td>
                            <td className="p-3">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${c.perm === "Admin" ? "bg-red-952/20 text-red-400" : "bg-neutral-950 text-neutral-400"}`}>
                                {c.perm}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleCopyCommand(c.cmd)}
                                className="px-2 py-1 bg-neutral-950 hover:bg-indigo-950/20 text-[10px] rounded border border-neutral-850 hover:border-indigo-900/30 text-neutral-400 hover:text-white transition-all cursor-pointer font-mono"
                              >
                                {copiedCommand === c.cmd ? "KOPIERT!" : "KOPIEREN"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeGuideTab === "modding" && (
                <div className="space-y-6 text-xxs leading-relaxed text-neutral-300 font-sans">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-neutral-905/30 border border-neutral-850 p-4 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <Puzzle className="w-4 h-4 text-indigo-400" />
                        1. Mods bearbeiten & anpassen
                      </h4>
                      <p className="text-neutral-400">
                        Um installierte Mod-Dateien (z.B. Konfigurationen, JSON-Skripte oder Server-Side Parameter) anzupassen:
                      </p>
                      <ol className="list-decimal pl-4 space-y-1.5 text-neutral-400 mt-2">
                        <li>Klicken Sie in der Hauptansicht beim entsprechenden Server auf das <strong>Puzzleteilsymbol (Mods & Dateimanager)</strong>.</li>
                        <li>Wechseln Sie im Manager in den Reiter <strong>"Server-Dateien manipulieren"</strong> oder <strong>"Mod-Dateien"</strong>.</li>
                        <li>Dort sehen Sie eine Liste aller Skripte. Verwenden Sie den Action-Button <strong>"Editieren"</strong>, um den Inline-Dateimanager zu öffnen.</li>
                        <li>Hier können Sie JSON-Keys umschreiben, Variablen editieren und Änderungen mit <strong>Sichern</strong> direkt anwenden.</li>
                      </ol>
                    </div>

                    <div className="bg-neutral-905/30 border border-neutral-850 p-4 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <Hammer className="w-4 h-4 text-indigo-400" />
                        2. Eigene / Third-party Mods erstellen
                      </h4>
                      <p className="text-neutral-400">
                        Wollen Sie eigene Mod-Zusammenstellungen installieren oder selbst programmieren:
                      </p>
                      <ul className="list-disc pl-4 space-y-1.5 text-neutral-400 mt-2">
                        <li><strong>Eigene Dateien hochladen:</strong> Im Dateimanager können Sie eigene <code className="text-indigo-400 font-semibold font-mono">.zip</code> Archive oder Konfigurationen auf den Server einspielen.</li>
                        <li><strong>ID-Registrierung:</strong> Falls Sie einen Mod im Steam Workshop oder Minecraft Modrinth pflegen, tragen Sie einfach die ID in der Mod-Suchleiste ein und klicken auf "Installieren".</li>
                        <li><strong>Pre-Build Toolchains:</strong> Wir empfehlen für DayZ die Nutzung der <i>DayZ Tools Workbench</i> und für Minecraft die <i>Fabric/Forge Dev Toolchain</i> auf Ihrem Rechner.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-[#181822]/20 border border-indigo-950/40 p-4 rounded-xl">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest font-mono">
                      ACHTUNG BEI DRITTHFESTPLATTEN-MODS (ZIP-ARCHIVE)
                    </h4>
                    <p className="text-neutral-400 mt-2">
                      Wenn Sie manuelle ZIP-Archive einpflegen, stellen Sie stets sicher, dass die Dateistruktur im Stammverzeichnis mit den Vorgaben des Entwicklers übereinstimmt. Für DayZ-Server müssen modifizierte Keys (z.B. <code className="text-amber-500 font-mono">.bikey</code>) manuell in den <code className="text-emerald-400 font-mono">/keys</code>-Ordner hochgeladen werden, da Spieler ansonsten wegen Signatur-Fehlern vom Host getrennt werden. Use den Dateimanager, um Files dorthin zu kopieren.
                    </p>
                  </div>
                </div>
              )}

              {activeGuideTab === "worldbuilding" && (
                <div className="space-y-6 text-xxs leading-relaxed text-neutral-300 font-sans">
                  <div className="border-l-4 border-indigo-500 bg-neutral-905/20 p-4 rounded-r-xl">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-indigo-400" />
                      Worldbuilding & Loot-Verteilung steuern (types.xml)
                    </h4>
                    <p className="text-neutral-400 mt-1.5">
                      Die XML-Struktur von Server-Welten (insb. DayZ) bestimmt genau, wann, wo und wie viele Gegenstände auf der Karte geladen werden. Sie steuert das gesamte Überlebens-Erlebnis.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-neutral-900/30 border border-neutral-850 p-3.5 rounded-lg">
                      <span className="block font-mono text-[10px] font-bold text-indigo-400 uppercase">1. NOMINAL-WERTE</span>
                      <p className="text-neutral-500 mt-1.5 leading-normal">
                        Der Nominalwert legt fest, wie viele Gegenstände dieses Typs sich zeitgleich maximal auf der gesamten Spiel-Map befinden dürfen. Ist dieser Wert erreicht, spawnt dieses Item erst wieder, sobald ein anderes verbraucht oder gelöscht wurde.
                      </p>
                    </div>

                    <div className="bg-neutral-900/30 border border-neutral-850 p-3.5 rounded-lg">
                      <span className="block font-mono text-[10px] font-bold text-indigo-400 uppercase">2. LIFETIME-TIMER</span>
                      <p className="text-neutral-500 mt-1.5 leading-normal">
                        Die Lebensdauer (in Sekunden) bestimmt, wie lange ein auf der Erde abgelegter Gegenstand im System verbleibt, bevor er de-spawnt, um Server-Ressourcen einzusparen. Zelte haben z.B. 3888000 Sekunden (45 Tage) Lifetime!
                      </p>
                    </div>

                    <div className="bg-neutral-900/30 border border-[#24242a] p-3.5 rounded-lg">
                      <span className="block font-mono text-[10px] font-bold text-indigo-400 uppercase">3. ZONEN-FILTER</span>
                      <p className="text-neutral-500 mt-1.5 leading-normal">
                        Unterteilen Sie Spawns in "Tier1" (Küste/Anfänger), "Tier2" und "Tier3" (Zentraler Norden/Militärbasen), um eine natürliche Beute-Progression zu erzeugen, die Spieler dazu ermutigt, das Inland zu erkunden.
                      </p>
                    </div>
                  </div>

                  <div className="bg-neutral-950 p-4 border border-neutral-850 rounded-xl space-y-3">
                    <span className="block font-bold text-white tracking-widest text-[10px] font-mono">TUTORIAL: STARTAUSRÜSTUNG (STARTING KIT) BEARBEITEN</span>
                    <p className="text-neutral-400">
                      Um festzulegen, welche Items neue Spieler beim ersten Beitritt im Inventar tragen, müssen Sie das Start-Skript editieren:
                    </p>
                    <div className="bg-neutral-900 border border-neutral-850 p-2.5 rounded text-[10px] font-mono text-[#a8a8b5] leading-normal">
                      <p className="text-[#a586c0]">// Suchen Sie im Dateimanager nach scripts/4_World/Classes/PlayerModifiers.c ...</p>
                      <p>&lt;<span className="text-[#bf616a]">init</span>&gt; PlayerBase.GetInventory().CreateInInventory("<span className="text-[#a3be8c]">Apple</span>");</p>
                      <p>&lt;<span className="text-[#bf616a]">init</span>&gt; PlayerBase.GetInventory().CreateInInventory("<span className="text-[#a3be8c]">BandageDressing</span>");</p>
                      <p>&lt;<span className="text-[#bf616a]">init</span>&gt; PlayerBase.GetInventory().CreateInInventory("<span className="text-[#a3be8c]">Flashlight</span>");</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#121216] border-t border-neutral-850 px-6 py-4 flex justify-between items-center bg-gradient-to-r from-neutral-950 to-neutral-900">
              <span className="text-[10px] text-zinc-500 font-mono tracking-tight flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-500" strokeWidth={3} />
                Verschlüsselte RCON Rpt-Anleitung v2.4 (Kilans Spielwiese Engine)
              </span>
              <button
                onClick={() => setActiveGuidesServer(null)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-5 rounded-lg transition-colors cursor-pointer"
              >
                Schließen
              </button>
            </div>
        </FloatingWindow>
      )}
    </div>
  );
}
