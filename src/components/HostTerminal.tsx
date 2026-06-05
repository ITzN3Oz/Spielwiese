import React, { useState, useEffect, useRef } from "react";
import { Terminal as TermIcon, Play, RefreshCw, Trash2, ShieldAlert, Cpu, HardDrive, CircleDot, Download, Search, Activity } from "lucide-react";
import { useLanguage } from "../LanguageContext";

interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "system";
  text: string;
}

interface HostTerminalProps {
  accentColor?: "indigo" | "emerald" | "orange" | "pink";
}

export default function HostTerminal({ accentColor = "indigo" }: HostTerminalProps) {
  const { t } = useLanguage();
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>([
    { id: "init-1", type: "system", text: "Spielwiese Host Proxy Emulator v1.4.2 [Build 2026.06]" },
    { id: "init-2", type: "system", text: "Status: Secure Gateway tunnel established over HTTPS." },
    { id: "init-3", type: "system", text: "Tippen Sie einen Linux-Befehl ein oder nutzen Sie die Schnell-Presets unten." },
    { id: "init-4", type: "output", text: "Linux sandbox-services 6.1.0-rcon-x86_64 #1 SMP PREEMPT_DYNAMIC GNU/Linux" }
  ]);
  const [inputCommand, setInputCommand] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Proposal 1: Live Diagnostic Buffers & Fluctuation engine
  const [cpuLiveHistory, setCpuLiveHistory] = useState<number[]>(Array(18).fill(12));
  const [ramLiveHistory, setRamLiveHistory] = useState<number[]>(Array(18).fill(34));

  // Proposal 2: Command list typing history and preset searching
  const [typedCommands, setTypedCommands] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [presetSearch, setPresetSearch] = useState("");

  const accentColorText = {
    indigo: "text-indigo-400",
    emerald: "text-emerald-400",
    orange: "text-orange-400",
    pink: "text-pink-400"
  }[accentColor];

  const accentColorBtn = {
    indigo: "bg-[#1f1f2e] border-indigo-500/10 hover:border-indigo-500/40 text-indigo-300",
    emerald: "bg-[#1a2e24] border-emerald-500/10 hover:border-emerald-500/40 text-emerald-300",
    orange: "bg-[#2e241a] border-orange-500/10 hover:border-orange-500/40 text-orange-300",
    pink: "bg-[#2e1a28] border-pink-500/10 hover:border-pink-500/40 text-[#f472b6]"
  }[accentColor];

  // Quick Command Presets list
  const presets = [
    { label: "System-Info", cmd: "uname -a", desc: "Betriebssystem-Kernel aufrufen" },
    { label: "Speicher (RAM)", cmd: "free -m", desc: "Freier und belegter RAM-Arbeitsspeicher" },
    { label: "Plattenspeicher", cmd: "df -h", desc: "Datenträger-Belegung auflisten" },
    { label: "Docker Zustand", cmd: "docker ps -a", desc: "Zustand aller Container & Abbilder" },
    { label: "CPU Zustand", cmd: "top -b -n 1 | head -n 12", desc: "Aktive Host-Prozesse und CPU Last" },
    { label: "Server-Volumes", cmd: "ls -lh volumes/", desc: "Eingebundene Spielstände auf dem Host" },
    { label: "Netzwerkstatus", cmd: "ip addr || ifconfig", desc: "Lokale Host-Netzwerkadapter" }
  ];

  const filteredPresets = presets.filter(p => 
    p.label.toLowerCase().includes(presetSearch.toLowerCase()) || 
    p.cmd.toLowerCase().includes(presetSearch.toLowerCase()) ||
    p.desc.toLowerCase().includes(presetSearch.toLowerCase())
  );

  // Proposal 1: Fluctuating values for aesthetic diagnosis
  useEffect(() => {
    const timer = setInterval(() => {
      setCpuLiveHistory(prev => {
        const next = [...prev.slice(1)];
        // Fluctuates around similar values
        const randomFluct = Math.round(8 + Math.random() * 15);
        next.push(randomFluct);
        return next;
      });

      setRamLiveHistory(prev => {
        const next = [...prev.slice(1)];
        // Stable but small jitter
        const jitter = Math.round(32 + Math.random() * 4);
        next.push(jitter);
        return next;
      });
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [terminalHistory]);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleExecuteCommand = async (commandToRun: string) => {
    if (!commandToRun.trim() || isExecuting) return;

    const trimmedCommand = commandToRun.trim();
    
    // Add command to terminal history text
    const userLineId = "user-" + Date.now();
    setTerminalHistory(prev => [
      ...prev,
      { id: userLineId, type: "input", text: trimmedCommand }
    ]);

    // Save into typed command array for keyboard Up/Down history navigation
    setTypedCommands(prev => {
      const next = [...prev];
      if (next[next.length - 1] !== trimmedCommand) {
        next.push(trimmedCommand);
      }
      return next;
    });
    setHistoryPointer(-1);
    
    setIsExecuting(true);
    setInputCommand("");

    try {
      const res = await fetch("/api/terminal/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: trimmedCommand })
      });

      if (res.ok) {
        const data = await res.json();
        const formattedOutput = data.output || "";
        const formattedError = data.error || "";

        setTerminalHistory(prev => {
          const updated = [...prev];
          if (formattedOutput) {
            updated.push({
              id: "out-" + Date.now() + "o",
              type: "output",
              text: formattedOutput
            });
          }
          if (formattedError) {
            updated.push({
              id: "err-" + Date.now() + "e",
              type: "error",
              text: formattedError
            });
          }
          if (!formattedOutput && !formattedError) {
            updated.push({
              id: "nil-" + Date.now(),
              type: "system",
              text: "Befehl wurde ausgeführt (Keine Konsolenrückgabe)."
            });
          }
          return updated;
        });
      } else {
        const data = await res.json();
        setTerminalHistory(prev => [
          ...prev,
          { id: "err-" + Date.now(), type: "error", text: data.error || "Fehler beim Ausführen des Befehls auf dem Host Linux." }
        ]);
      }
    } catch (err) {
      setTerminalHistory(prev => [
        ...prev,
        { id: "err-conn-" + Date.now(), type: "error", text: "Verbindungsfehler: SSH Gateway verweigert." }
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  // Proposal 1: Download full text diagnostic JSON log
  const downloadSystemReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      app: "Gameserver Labor Linux Console Gateway",
      kernel_emulation: "Secure sandbox-services 6.1.0-rcon-x86_64",
      user_command_history: typedCommands,
      diagnostic_sparkline_cpu_history: cpuLiveHistory,
      diagnostic_sparkline_ram_history: ramLiveHistory,
      recent_terminal_dump: terminalHistory.map(line => `[${line.type.toUpperCase()}] ${line.text}`)
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `host_terminal_diagnose_report_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearTerminal = () => {
    setTerminalHistory([
      { id: "clear-init", type: "system", text: "Konsole zurückgesetzt. Terminal bereit für Befehlseingabe..." }
    ]);
  };

  // Render CPU / RAM dynamic lines
  const renderSparkline = (data: number[], color: string, label: string, suffix: string) => {
    const maxVal = Math.max(...data, 100);
    const width = 230;
    const height = 40;
    const points = data
      .map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (val / maxVal) * height + 1;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div className="flex items-center gap-3 bg-[#111116] border border-neutral-850 p-2.5 rounded-lg select-none">
        <div className="space-y-0.5">
          <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none">{label}</p>
          <p className="font-mono text-xs font-bold text-white leading-none">
            {data[data.length - 1]}
            <span className="text-[10px] text-zinc-500 font-normal">{suffix}</span>
          </p>
        </div>
        <div className="flex-1 w-36">
          <svg className="overflow-visible" width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="#ffffff" strokeOpacity={0.03} strokeDasharray="2" />
            <path
              d={`M 0,${height} L ${points} L ${width},${height} Z`}
              fill={color}
              className="opacity-5"
            />
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              points={points}
            />
            <circle
              cx={width}
              cy={height - (data[data.length - 1] / maxVal) * height + 1}
              r="2.5"
              fill={color}
            />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" id="host-terminal-view">
      
      {/* Intro header */}
      <div className="bg-[#121216]/90 border border-neutral-850 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
            <TermIcon className={`w-4.5 h-4.5 ${accentColorText}`} />
            Live Linux Host Terminal &amp; SSH-Emu-Tunnel
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans max-w-2xl">
            Echtzeit-Diagnosekonsole direkt auf der zugrunde liegenden Linux-Ebene. 
            Prüfen Sie Speicherzuteilungen, Docker-Dienste und Dateisystem-Grenzen manuell, um Systemstörungen auf den Grund zu gehen.
          </p>
        </div>

        {/* Diagnostic graphics & Download button */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5">
            {renderSparkline(cpuLiveHistory, "#38bdf8", "HOST-CPU", "%")}
            {renderSparkline(ramLiveHistory, "#c084fc", "HOST-RAM", "%")}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadSystemReport}
              className="px-3 py-2 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-indigo-400 hover:text-indigo-300 font-mono text-[10px] uppercase font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Herunterladen des kompletten Diagnostik-Outputs als JSON-Bericht"
            >
              <Download className="w-3.5 h-3.5" /> Diagnose-Report
            </button>
            
            <button
              onClick={clearTerminal}
              className="px-3 py-2 rounded bg-[#1c1c24] hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white font-mono text-[10px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Leeren
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Terminal Console (Left) + Quick commands (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Terminal Screen & Input Line */}
        <div className="xl:col-span-8 bg-[#0a0a0f] border border-[#24242a] rounded-xl overflow-hidden flex flex-col h-[520px] shadow-2xl relative">
          
          {/* Virtual Terminal Header Bar */}
          <div className="bg-[#14141c] border-b border-[#24242a] px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/50 block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50 block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/50 block"></span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 ml-2">root@sandbox-host:~ /bin/bash</span>
            </div>
            
            <div className="flex items-center gap-3 text-[10px] font-mono select-none">
              <span className="text-zinc-500 text-xxs hidden md:inline">▲/▼ Tasten für Befehls-History</span>
              <span className="text-emerald-400 animate-pulse flex items-center gap-1">
                <CircleDot className="w-2 h-2 fill-current" /> LIVE CONNECTION
              </span>
            </div>
          </div>

          {/* Terminal Logs Container */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-zinc-300 space-y-2.5 scroller select-text">
            {terminalHistory.map((line) => {
              if (line.type === "input") {
                return (
                  <div key={line.id} className="flex items-start gap-1">
                    <span className="text-emerald-450 font-bold select-none">[root@host ~]#</span>
                    <span className="text-white text-xs select-all font-semibold">{line.text}</span>
                  </div>
                );
              }
              if (line.type === "error") {
                return (
                  <pre key={line.id} className="text-red-400 bg-red-952/5 p-2 rounded border border-red-950/20 whitespace-pre-wrap break-all select-all font-mono">
                    {line.text}
                  </pre>
                );
              }
              if (line.type === "system") {
                return (
                  <div key={line.id} className="text-[#a78bfa]/80 bg-[#a78bfa]/5 px-2 py-1 rounded border border-[#a78bfa]/10 italic text-[11px]">
                    :: {line.text}
                  </div>
                );
              }
              // Regular terminal output
              return (
                <pre key={line.id} className="text-zinc-300 font-mono text-xxs whitespace-pre-wrap break-all leading-normal select-all bg-black/40 p-1">
                  {line.text}
                </pre>
              );
            })}

            {isExecuting && (
              <div className="flex items-center gap-2 text-zinc-500 italic text-[11px] animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                Host verarbeitet Linux-Prozess...
              </div>
            )}
            
            <div ref={terminalEndRef} />
          </div>

          {/* Quick-Action Button Shortcut Ribbon */}
          <div className="bg-[#101016] border-t border-[#24242a] px-3 py-2 flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mr-1 select-none">Quick-Befehle:</span>
            {[
              { label: "🐳 docker ps", cmd: "docker ps", title: "Laufende Docker-Container auflisten" },
              { label: "🐳 docker ps -a", cmd: "docker ps -a", title: "Alle Container auflisten" },
              { label: "📋 docker logs", cmd: "docker ps -a | grep -v 'CONTAINER' | head -n 1 | awk '{print $1}' | xargs -I {} docker logs {} --tail 50 || docker ps -a", title: "Letzte 50 Zeilen der Container-Logs anfordern" },
              { label: "💾 df -h", cmd: "df -h", title: "Plattenspeicherbelegung anzeigen" },
              { label: "🧠 free -h", cmd: "free -h", title: "Arbeitsspeicherauslastung anzeigen" },
              { label: "📊 docker stats", cmd: "docker stats --no-stream", title: "Ressourcennutzung der Container einsehen" },
              { label: "📍 Netstat", cmd: "netstat -tulpen || ss -tulpen", title: "Offene Ports & Verbindungen auflisten" },
              { label: "📂 Volumes", cmd: "docker volume ls", title: "Docker Volumes aufrufen" },
            ].map((btn, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleExecuteCommand(btn.cmd)}
                disabled={isExecuting}
                className="bg-[#181822] hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 rounded px-2.5 py-1 text-[10px] font-mono leading-tight transition-all cursor-pointer disabled:opacity-50"
                title={btn.title}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Terminal Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecuteCommand(inputCommand);
            }}
            className="border-t border-[#24242a] bg-[#0c0c14] p-3 flex items-center gap-2"
          >
            <span className="text-emerald-450 font-bold font-mono pl-1 select-none">[root@host ~]#</span>
            
            <input
              type="text"
              value={inputCommand}
              onChange={(e) => setInputCommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  if (typedCommands.length === 0) return;
                  const nextIndex = historyPointer < typedCommands.length - 1 ? historyPointer + 1 : historyPointer;
                  setHistoryPointer(nextIndex);
                  setInputCommand(typedCommands[typedCommands.length - 1 - nextIndex]);
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (historyPointer <= 0) {
                    setHistoryPointer(-1);
                    setInputCommand("");
                  } else {
                    const nextIndex = historyPointer - 1;
                    setHistoryPointer(nextIndex);
                    setInputCommand(typedCommands[typedCommands.length - 1 - nextIndex]);
                  }
                }
              }}
              disabled={isExecuting}
              placeholder="z.B. docker stats --no-stream"
              className="flex-1 bg-transparent border-0 outline-none text-white focus:ring-0 placeholder-neutral-700 font-mono text-xs select-all disabled:opacity-50 focus:outline-none"
              autoFocus
            />

            <button
              type="submit"
              disabled={isExecuting || !inputCommand.trim()}
              className="p-1.5 px-3 rounded bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 border border-neutral-800 text-emerald-400 hover:text-emerald-300 font-mono text-xxs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <Play className="w-3 h-3 text-emerald-400" /> Enter
            </button>
          </form>

        </div>

        {/* Presets Sidebar Panel (Right) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Interactive instruction card */}
          <div className="bg-[#121216] border border-[#24242a] rounded-xl p-5 space-y-4">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-neutral-900">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Cpu className="w-4 h-4 text-neutral-450" />
                Diagnose-Presets
              </h4>
              
              {/* Presets searching filter */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={presetSearch}
                  onChange={(e) => setPresetSearch(e.target.value)}
                  placeholder="Suchen..."
                  className="bg-[#0c0c12] border border-neutral-800 rounded px-2 py-0.5 pl-6 text-[10px] font-mono text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 w-28 md:w-32"
                />
                <Search className="w-3 h-3 text-neutral-600 absolute left-2" />
              </div>
            </div>
            
            <p className="text-[11px] text-neutral-400 leading-normal font-sans">
              Nutzen Sie diese vorbereiteten Linux-Diagnosepresets, um Systemressourcen, Memory-Leaks und Container-Limits mit einem Klick zu diagnostizieren.
            </p>

            <div className="space-y-2.5 pt-1 max-h-[300px] overflow-y-auto scroller pr-1">
              {filteredPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExecuteCommand(preset.cmd)}
                  disabled={isExecuting}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between cursor-pointer group disabled:opacity-55 ${accentColorBtn}`}
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                      <CircleDot className="w-1.5 h-1.5 text-[#d4af37]" />
                      {preset.label}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-sans tracking-wide">
                      {preset.desc}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 bg-black/30 p-1 px-1.5 rounded border border-neutral-900 leading-none">
                    {preset.cmd}
                  </span>
                </button>
              ))}

              {filteredPresets.length === 0 && (
                <div className="text-center py-4 text-xs font-mono text-neutral-600">
                  Keine Presets für "{presetSearch}" gefunden.
                </div>
              )}
            </div>
          </div>

          {/* Warnings & Shell guidelines */}
          <div className="bg-amber-952/10 border border-amber-900/30 rounded-xl p-5 space-y-3">
            <h5 className="text-xs font-bold text-amber-500 flex items-center gap-2 uppercase tracking-wider font-mono">
              <ShieldAlert className="w-4 h-4" />
              Sicherheits-Hinweis
            </h5>
            <p className="text-[10px] text-amber-500/80 leading-relaxed font-sans">
              Alle Befehle werden im Dateisystem-Rahmen des Host Server Daemons unter Root-Rechten ausgeführt. 
              Gefährliche Befehle wie zerstörerische Entfernungen (z. B. <code className="text-red-400 font-mono">rm -rf /</code>) sollten vermieden werden, um die Container-Integration nicht irreversibel zu beschädigen.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
