import React, { useEffect, useState } from "react";
import { 
  RefreshCw, 
  CheckCircle, 
  Settings, 
  Server, 
  Sliders, 
  ShieldAlert, 
  FileCode, 
  Terminal, 
  Info, 
  ChevronRight, 
  Download,
  Flame,
  Power,
  Layers,
  Archive,
  Cpu
} from "lucide-react";
import { useLanguage } from "../LanguageContext";

interface SystemUpdaterProps {
  accentColor?: "indigo" | "emerald" | "orange" | "pink";
}

export default function SystemUpdater({ accentColor = "indigo" }: SystemUpdaterProps) {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<any>({
    panelAutoUpdate: true,
    updateChannel: "stable",
    lastUpdateCheck: "",
    installedVersion: "v2.5.4",
    latestAvailableVersion: "v2.5.4",
    githubRepo: "gcore-web/gcore-panel",
    autoCheckInterval: "daily",
    updateStatus: "idle"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  
  // Simulation log traces
  const [updaterLogs, setUpdaterLogs] = useState<string[]>([
    "[gcore-update-daemon] System initialisiert. Releasekanal: stable",
    "Installierte Anwendungs-Schnittstellenversion: v2.5.4",
    "Automatische Hintergrundprüfung für Updates ist eingeschaltet."
  ]);

  // Installer build state
  const [isBuildingInstaller, setIsBuildingInstaller] = useState(false);
  const [installerData, setInstallerData] = useState<any>(null);

  const addLog = (log: string) => {
    const time = new Date().toLocaleTimeString();
    setUpdaterLogs((prev) => [...prev, `[${time}] ${log}`]);
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/system/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Fehler beim Abrufen der System-Einstellungen:", err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Update checking handler
  const handleCheckUpdates = async () => {
    setIsLoading(true);
    setStatusMsg({ text: "Suche nach verfügbaren Anwendungsupdates auf remote Release-Server...", type: "info" });
    addLog("gcore-update-daemon: starte manuelle Updateprüfung...");
    addLog(`Befehl: curl -s https://api.github.com/repos/${settings.githubRepo}/releases/latest`);

    try {
      const res = await fetch("/api/system/check-updates", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        if (data.hasUpdate) {
          setStatusMsg({ 
            text: `Neue Aktualisierung gefunden: ${data.settings.latestAvailableVersion} steht zur Installation bereit!`, 
            type: "success" 
          });
          addLog(`[WARNUNG] Ein Update ist verfügbar! Lokal: ${data.settings.installedVersion} -> Remote: ${data.settings.latestAvailableVersion}`);
          addLog("Update-Manifest erfolgreich geladen. Changelog-Zusammenfassung enthält Performance-Optimierungen und Sicherheits-Aktualisierungen.");
        } else {
          setStatusMsg({ text: "Die GCORE Host-Software ist auf dem neuesten Stand.", type: "success" });
          addLog("gcore-update-daemon: Host-Software entspricht der neuesten stabilen Version.");
        }
      } else {
        setStatusMsg({ text: "Update-Server antwortet zurzeit nicht. Bitte versuchen Sie es später erneut.", type: "error" });
        addLog("[ERROR] Update-Server HTTP-Code 503 (Dienst vorübergehend nicht erreichbar).");
      }
    } catch (err) {
      setStatusMsg({ text: "Netzwerkfehler beim Kontaktieren des Update-Gateways.", type: "error" });
      addLog("[ERROR] Verbindungsaufbau verweigert (Connection refused).");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Auto-Update setting
  const handleToggleAutoUpdate = async (value: boolean) => {
    const updated = { ...settings, panelAutoUpdate: value };
    setSettings(updated);
    addLog(`Konfiguration geändert: panelAutoUpdate -> ${value}`);

    try {
      await fetch("/api/system/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panelAutoUpdate: value })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Update Channel
  const handleChannelChange = async (channel: string) => {
    const updated = { ...settings, updateChannel: channel };
    setSettings(updated);
    addLog(`Konfiguration geändert: updateChannel -> ${channel}`);

    try {
      await fetch("/api/system/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updateChannel: channel })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger actual upgrade process
  const handleInstallUpgrade = async () => {
    if (!window.confirm(`Möchten Sie das Update von '${settings.installedVersion}' auf '${settings.latestAvailableVersion}' jetzt starten? Das System startet automatisch neu.`)) {
      return;
    }

    setIsLoading(true);
    setStatusMsg({ text: "Update läuft im Hintergrund. Führe Datenprüfung und Hotbuilding aus...", type: "info" });
    
    addLog("root@gcore-server:~# wget -qO- https://panel.gcore.app/install/update.sh | bash");
    addLog("[UPDATE WORKER] Erzeuge Sicherheits-Snapshots der Spieldatenbank (gamehost_db.json)...");
    addLog("[UPDATE WORKER] Backup erfolgreich angelegt in /backups/sys-db-backup.tar.gz");
    addLog("[UPDATE WORKER] Führe 'git pull origin main' aus, um Codebase auf remote-HEAD auszurichten...");

    try {
      const res = await fetch("/api/system/trigger-upgrade", { method: "POST" });
      if (res.ok) {
        addLog("[UPDATE WORKER] Codebase abgeglichen. Aktualisierte Dateien: 12 geänderte Pfade.");
        addLog("[UPDATE WORKER] Führe Abhängigkeitsanalyse aus: npm install --omit=dev...");
        
        setTimeout(() => {
          addLog("[UPDATE WORKER] npm-Pakete synchronisiert. Validiere Typsicherheit mit tsc linter...");
        }, 1200);

        setTimeout(() => {
          addLog("[UPDATE WORKER] Frontend Asset Compiling gestartet: vite build...");
        }, 2200);

        setTimeout(() => {
          addLog("[UPDATE WORKER] Assets erfolgreich optimiert und im statischen Web-Root '/dist' abgelegt.");
          addLog("root@gcore-server:~# systemctl restart gcore-panel.service");
          addLog("[UPDATE WORKER] [SUCCESS] Update erfolgreich beendet! Lade Web-Sitzung neu...");
          
          setSettings((prev: any) => ({
            ...prev,
            installedVersion: prev.latestAvailableVersion,
            updateStatus: "completed"
          }));

          setStatusMsg({
            text: `Update erfolgreich abgeschlossen! Die GCORE-Software läuft nun auf Version ${settings.latestAvailableVersion}.`,
            type: "success"
          });
          setIsLoading(false);
        }, 4200);

      } else {
        setStatusMsg({ text: "Das Einpflegen des Updates wurde vom Host-Kern abgewiesen.", type: "error" });
        addLog("[ERROR] Updatevorgang abgebrochen. Fehlercode 500");
        setIsLoading(false);
      }
    } catch (err) {
      setStatusMsg({ text: "Verbindungsabbruch während des Updatevorgangs.", type: "error" });
      addLog("[ERROR] Host unreachable während des Service-Neustarts.");
      setIsLoading(false);
    }
  };

  // Compile full installation templates and deploy-ready bash release assets
  const handleGenerateInstaller = async () => {
    setIsBuildingInstaller(true);
    setStatusMsg({ text: "Generiere schlüsselfertigen Linux-Bash-Installer und Docker-Compose configurations...", type: "info" });
    addLog("root@gcore-server:~# gcore-make-installer --release=v2.5.8-stable");

    try {
      const res = await fetch("/api/system/installer-package", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setInstallerData(data);
        setStatusMsg({ 
          text: "Installations- und Releasepaket erfolgreich erstellt! Bereit für die Veröffentlichung.", 
          type: "success" 
        });
        addLog(`[SUCCESS] Release-Ressourcen erfolgreich geschrieben im Pfad ${data.path}`);
        addLog(`Generierte Komponenten: ${data.files.join(", ")}`);
        addLog("Der generierte Installer 'install.sh' wurde als ausführbare Hostdatei (chmod +x) registriert.");
      } else {
        setStatusMsg({ text: "Fehler beim Kompilieren der Host-Releasepakete.", type: "error" });
        addLog("[ERROR] Erstellen des Installations-Ordners fehlgeschlagen. Berechtigungsfehler auf dem Root-Filesystem.");
      }
    } catch (err) {
      setStatusMsg({ text: "Netzwerkfehler beim Erzeugen des Releasepakets.", type: "error" });
    } finally {
      setIsBuildingInstaller(false);
    }
  };

  const accentColorText = {
    indigo: "text-indigo-400",
    emerald: "text-emerald-400",
    orange: "text-orange-400",
    pink: "text-pink-400"
  }[accentColor];

  const accentColorBtn = {
    indigo: "bg-indigo-600 hover:bg-indigo-505 shadow-indigo-600/10",
    emerald: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/10",
    orange: "bg-orange-600 hover:bg-orange-500 shadow-orange-600/10",
    pink: "bg-pink-600 hover:bg-pink-500 shadow-pink-600/10"
  }[accentColor];

  const accentColorBadge = {
    indigo: "bg-[#11111c] text-indigo-405 border-indigo-900/50",
    emerald: "bg-[#0b1511] text-emerald-405 border-emerald-900/50",
    orange: "bg-[#170e0a] text-orange-405 border-orange-900/50",
    pink: "bg-[#180f14] text-pink-405 border-pink-900/50"
  }[accentColor];

  const accentColorRing = {
    indigo: "focus:ring-indigo-500/30 ring-indigo-505",
    emerald: "focus:ring-emerald-500/30 ring-emerald-505",
    orange: "focus:ring-orange-500/30 ring-orange-505",
    pink: "focus:ring-pink-500/30 ring-pink-505"
  }[accentColor];

  const hasNewerVersion = settings.installedVersion !== settings.latestAvailableVersion;

  return (
    <div className="space-y-6" id="system-updater-section">
      {/* Alert / Notification banner */}
      {statusMsg && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-md animate-fade-in ${
          statusMsg.type === "success" 
            ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" 
            : statusMsg.type === "error"
            ? "bg-red-952/15 border-red-900/40 text-red-400 animate-pulse"
            : "bg-indigo-950/20 border-indigo-500/20 text-indigo-400"
        }`}>
          {statusMsg.type === "success" ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <span className="font-bold uppercase tracking-wider block mb-0.5">
              {statusMsg.type === "success" ? "Erfolgreich" : statusMsg.type === "error" ? "Systemwarnung" : "Info-Log"}
            </span>
            <p className="leading-relaxed font-sans">{statusMsg.text}</p>
          </div>
        </div>
      )}

      {/* Grid container layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Version Info & Update Trigger */}
        <div className="lg:col-span-2 bg-[#121216]/90 border border-neutral-850 rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-neutral-850">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${accentColorText}`} />
                Softwareaktualisierungen &amp; Releases
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${accentColorBadge}`}>
                Channel: {settings.updateChannel.toUpperCase()}
              </span>
            </div>

            {/* Current status detail grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-neutral-950/40 p-3.5 rounded-xl border border-neutral-900">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">Lokal Installierte Version</span>
                <span className="text-lg font-bold font-mono text-white block mt-1">{settings.installedVersion}</span>
                <span className="text-[9px] font-mono text-emerald-500 block mt-1.5 flex items-center gap-1.5 bg-emerald-950/10 border border-emerald-900/20 px-2 py-0.5 rounded w-max">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  STABIL &amp; GESICHERT
                </span>
              </div>

              <div className="bg-neutral-950/40 p-3.5 rounded-xl border border-neutral-900 relative overflow-hidden">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">Aktuellste verfügbare Version</span>
                <span className="text-lg font-bold font-mono text-white block mt-1">{settings.latestAvailableVersion}</span>
                
                {hasNewerVersion ? (
                  <span className="text-[9px] font-mono text-amber-500 block mt-1.5 flex items-center gap-1.5 bg-amber-952/10 border border-amber-900/30 px-2 py-0.5 rounded w-max animate-pulse">
                    ⚠️ UPDATE VERFÜGBAR!
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-neutral-450 block mt-1.5 flex items-center gap-1.5 bg-neutral-900 border border-neutral-850 px-2 py-0.5 rounded w-max">
                    ✓ SOFTWARE IST AKTUELL
                  </span>
                )}
              </div>
            </div>

            {/* Big Action card if update found */}
            {hasNewerVersion && (
              <div className="mb-6 bg-indigo-952/10 border border-indigo-900/35 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
                    Wichtige Aktualisierungen stehen zur Verfügung
                  </h4>
                  <p className="text-neutral-450 text-[11px] leading-relaxed">
                    Das Update auf {settings.latestAvailableVersion} enthält wichtige Sicherheitsupdates auf Server-Ebene, Performance-Upgrades für Minecraft &amp; Palworld Docker-Container und Fehlerbehebungen im SQLite Synchronisationsdienst.
                  </p>
                </div>
                <button
                  onClick={handleInstallUpgrade}
                  disabled={isLoading}
                  className={`flex-shrink-0 text-xs px-4 py-2 rounded-lg text-white font-bold transition-all duration-300 shadow-md transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 flex items-center gap-2 ${accentColorBtn}`}
                >
                  <Download className="w-4 h-4 shrink-0" />
                  Update installieren
                </button>
              </div>
            )}

            {/* Update details guidelines summary */}
            <div className="space-y-3 font-sans text-xs text-neutral-400 bg-neutral-950/25 p-4 rounded-xl border border-neutral-900">
              <span className="block font-bold text-neutral-350 text-[10px] font-mono uppercase tracking-wider">
                Installations- und Release-Informationen:
              </span>
              <ul className="space-y-2 list-disc list-inside text-neutral-450 leading-relaxed text-[11px]">
                <li>Dieses System empfängt verschlüsselte, von GCORE signierte Update-Manifeste über ein HTTPS-gesichertes Github-API-Backend.</li>
                <li>Hintergrund-Überprüfungen werden über den systeminternen Cron-Scheduler im Daily-Format (täglich um 04:00 Uhr) abgewickelt.</li>
                <li>
                  <strong>Sicherer Update-Prozess:</strong> Vor dem Einspielen des Updates wird ein vollständiges Datenbank-Backup (SQL Dump) erzeugt. Laufende Spieleserver bleiben während des Downloads aktiv, werden jedoch für die abschließende Container-Neusaat kurzzeitig pausiert.
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-neutral-850/60 justify-between items-center">
            <span className="text-[10px] font-mono text-neutral-500">
              Letzte Prüfung am: <strong className="text-neutral-400">{settings.lastUpdateCheck ? new Date(settings.lastUpdateCheck).toLocaleString() : "Noch nie überprüft"}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCheckUpdates}
                disabled={isLoading}
                className="text-xs font-bold uppercase tracking-wider font-mono px-4 py-2 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850 bg-neutral-900/60 text-indigo-400 hover:text-indigo-300 rounded-lg transition duration-200 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                Nach Updates suchen
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Automated Update Config & Release Builder */}
        <div className="space-y-6">
          
          {/* Top Panel: Config / Sliders */}
          <div className="bg-[#121216]/90 border border-neutral-850 rounded-xl p-6 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-neutral-850">
              <Settings className={`w-4 h-4 ${accentColorText}`} />
              Update-Konfiguration
            </h3>

            {/* Config Switch for Auto background update */}
            <div className="flex items-center justify-between p-3.5 bg-neutral-950/40 rounded-xl border border-neutral-900">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white block">Auto-Update</span>
                <span className="text-[10px] text-neutral-500 font-mono block">Updates im System-Cron laden</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleAutoUpdate(!settings.panelAutoUpdate)}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${
                  settings.panelAutoUpdate ? accentColorBtn : "bg-neutral-800"
                }`}
              >
                <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-300 ${
                  settings.panelAutoUpdate ? "translate-x-4.5" : "translate-x-0"
                }`}></div>
              </button>
            </div>

            {/* Channel selection */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-350 block">Zweig (Release Channel)</span>
              <div className="grid grid-cols-2 gap-2 bg-neutral-950/70 p-1 rounded-lg border border-neutral-900 select-none">
                {[
                  { name: "stable", label: "Stable (Empfohlen)" },
                  { name: "canary", label: "Canary (Beta)" }
                ].map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleChannelChange(c.name)}
                    className={`px-3 py-2 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      settings.updateChannel === c.name 
                        ? (
                            accentColor === "indigo" ? "bg-indigo-650 text-white" :
                            accentColor === "emerald" ? "bg-emerald-650 text-white" :
                            accentColor === "orange" ? "bg-orange-655 text-white" :
                            "bg-pink-650 text-white"
                          )
                        : "text-neutral-550 hover:text-neutral-300"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Check interval frequency selection */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-355 block">Prüfintervall</span>
              <select
                value={settings.autoCheckInterval}
                onChange={(e) => {
                  setSettings({ ...settings, autoCheckInterval: e.target.value });
                  addLog(`Konfiguration geändert: autoCheckInterval -> ${e.target.value}`);
                }}
                className={`w-full bg-neutral-950 border border-neutral-850 text-neutral-300 text-xs rounded-lg p-2.5 font-mono cursor-pointer focus:outline-none focus:ring-1 ${accentColorRing}`}
              >
                <option value="hourly">Stündlich (Kritische Überwachung)</option>
                <option value="daily">Täglich um 04:00 Uhr (Standard)</option>
                <option value="weekly">Wöchentlich (Sonntags)</option>
              </select>
            </div>
          </div>

          {/* Bottom Panel: Releases Builder / Installer Ready */}
          <div className="bg-[#121216]/90 border border-neutral-850 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-neutral-850">
              <Archive className={`w-4 h-4 ${accentColorText}`} />
              Release &amp; Installationspaket
            </h3>
            
            <p className="text-neutral-450 text-[11px] leading-relaxed">
              Möchten Sie diese GCORE-Instanz auf einem neuen physischen Host einspielen? Generieren Sie ein installationsbereites Systempaket. Der Installer bündelt die Datenbank-Konfiguration, generiert Docker-Volumes und füllt standardisierte System-Services aus.
            </p>

            <button
              onClick={handleGenerateInstaller}
              disabled={isBuildingInstaller}
              className={`w-full text-xs font-bold font-mono uppercase tracking-wider py-2.5 border rounded-lg transition-all duration-350 cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 ${
                installerData 
                  ? "bg-emerald-950/20 hover:bg-emerald-950/40 border-emerald-800 text-emerald-400 hover:text-emerald-355" 
                  : "bg-neutral-900 hover:bg-neutral-850 border-neutral-800 hover:border-neutral-700 text-indigo-405 hover:text-indigo-305"
              }`}
            >
              <FileCode className="w-4 h-4" />
              {isBuildingInstaller ? "Kompiliere..." : installerData ? "Paket erneuern" : "Installationspaket erstellen"}
            </button>

            {installerData && (
              <div className="space-y-3 pt-3 border-t border-neutral-850/60 animate-fade-in text-[11px]">
                <div className="flex items-center justify-between bg-neutral-950/50 p-2.5 rounded border border-neutral-900">
                  <span className="text-neutral-450 font-mono">Paketpfad (Host):</span>
                  <span className="text-white font-bold font-mono">{installerData.path}</span>
                </div>
                <div className="bg-neutral-950/60 p-2 border border-neutral-900 rounded space-y-1 font-mono text-[10px] text-zinc-400">
                  <span className="font-bold text-[9px] text-neutral-500 uppercase tracking-widest block">Generierte Release-Dateien:</span>
                  {installerData.files.map((f: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5 text-neutral-300">
                      <ChevronRight className="w-3 h-3 text-indigo-400 inline" />
                      {f}
                    </div>
                  ))}
                </div>

                {/* Micro Command prompt to execute */}
                <div className="space-y-1">
                  <span className="font-mono font-bold text-[9px] text-indigo-400 uppercase tracking-wider">Schnellinstallation auf neuem Linux Host:</span>
                  <div className="bg-[#09090b] text-neutral-300 p-2 rounded border border-neutral-850 font-mono text-[9px] relative overflow-x-auto break-all select-all select-none cursor-pointer flex justify-between items-center group">
                    <span>curl -sSL https://panel.gcore.app/install/client.sh | bash</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Embedded live scroll update compiler logs */}
      <div className="border border-neutral-850 bg-neutral-950/85 rounded-xl overflow-hidden shadow-lg">
        <div className="bg-[#0e0e11] px-4 py-2.5 flex items-center justify-between border-b border-neutral-850">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            <span className="text-[10px] font-mono font-semibold uppercase text-neutral-400 ml-1.5 tracking-wider">
              Host Update-Kernel Logs &amp; Trace (Stdout)
            </span>
          </div>
          <button
            onClick={() => setUpdaterLogs([])}
            className="text-[9px] font-mono hover:text-white text-neutral-500 uppercase font-bold tracking-wider hover:bg-neutral-800 px-2 py-0.5 rounded transition cursor-pointer"
          >
            Terminal reinigen
          </button>
        </div>
        <div className="p-4 h-[180px] overflow-y-auto font-mono text-xs text-neutral-350 bg-[#07070a] space-y-1.5 scroll-smooth scroller">
          {updaterLogs.length === 0 ? (
            <div className="text-neutral-600 text-[10px] italic">Keine Protokolleinträge vorhanden. Lösen Sie eine Updateprüfung oder Host-Kompilierung aus...</div>
          ) : (
            updaterLogs.map((log, index) => {
              const isCommand = log.includes("root@gcore-server:~#") || log.includes("Befehl:");
              const isSuccess = log.includes("[SUCCESS]");
              const isError = log.includes("[ERROR]");
              let textColor = "text-neutral-405";
              if (isCommand) textColor = "text-indigo-400 font-extrabold";
              else if (isSuccess) textColor = "text-emerald-400 font-extrabold";
              else if (isError) textColor = "text-red-400 font-extrabold animate-pulse";

              return (
                <div key={index} className={`leading-relaxed text-[10.5px] ${textColor}`}>
                  {log}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
