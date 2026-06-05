import React, { useEffect, useState } from "react";
import { GameServer, SystemStats, Backup, DashboardUser, UserRole } from "./types";
import { useLanguage } from "./LanguageContext";
import Overview from "./components/Overview";
import ServerCatalog from "./components/ServerCatalog";
import ServerList from "./components/ServerList";
import Backups from "./components/Backups";
import UserManagement from "./components/UserManagement";
import ApiDocs from "./components/ApiDocs";
import Scheduler from "./components/Scheduler";
import HostTerminal from "./components/HostTerminal";
import DiskManager from "./components/DiskManager";
import SystemUpdater from "./components/SystemUpdater";
import {
  Activity,
  Server,
  Archive,
  Users,
  Terminal,
  Cpu,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  Clock,
  Plus,
  Key,
  Lock,
  HardDrive,
  RefreshCw
} from "lucide-react";

type NavigationTab = "overview" | "servers" | "install" | "backups" | "users" | "api" | "scheduler" | "terminal" | "storage" | "updates";

export default function App() {
  const { t, language, setLanguage } = useLanguage();
  const [currentUser, setCurrentUser] = useState<DashboardUser | null>(() => {
    const saved = localStorage.getItem("gcore_current_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Ersteinrichtung / Super-Admin Setup states
  const [isSetupNeeded, setIsSetupNeeded] = useState<boolean | null>(null);
  const [setupUsername, setSetupUsername] = useState("");
  const [setupPassword, setSetupPassword] = useState("");
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  const checkSetupStatus = async () => {
    try {
      const res = await fetch("/api/setup-status");
      if (res.ok) {
        const data = await res.json();
        setIsSetupNeeded(!data.initialized);
      }
    } catch (err) {
      console.error("Checking setup status failed:", err);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupUsername || !setupPassword) {
      setSetupError("Bitte füllen Sie alle Pflichtfelder aus (Benutzername & Passwort)!");
      return;
    }
    setIsSettingUp(true);
    setSetupError(null);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: setupUsername, password: setupPassword })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem("gcore_current_user", JSON.stringify(data.user));
        setIsSetupNeeded(false);
        showNotification("Ersteinrichtung erfolgreich! Super-Admin wurde registriert.");
      } else {
        const err = await res.json();
        setSetupError(err.error || "Unerwarteter Fehler bei der Ersteinrichtung.");
      }
    } catch (err) {
      setSetupError("Verbindung zum Setup-Server verweigert.");
    } finally {
      setIsSettingUp(false);
    }
  };

  const [activeTab, setActiveTab] = useState<NavigationTab>("overview");
  const [accentColor, setAccentColor] = useState<"indigo" | "emerald" | "orange" | "pink">(() => {
    const saved = localStorage.getItem("gcore_accent_color");
    return (saved as any) || "indigo";
  });
  const [atmosphere, setAtmosphere] = useState<"solid" | "cybernet" | "nebula" | "terminal">(() => {
    const saved = localStorage.getItem("gcore_atmosphere");
    return (saved as any) || "cybernet";
  });

  const updateAccentColor = (color: "indigo" | "emerald" | "orange" | "pink") => {
    setAccentColor(color);
    localStorage.setItem("gcore_accent_color", color);
  };

  const updateAtmosphere = (atmo: "solid" | "cybernet" | "nebula" | "terminal") => {
    setAtmosphere(atmo);
    localStorage.setItem("gcore_atmosphere", atmo);
  };
  const [servers, setServers] = useState<GameServer[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [users, setUsers] = useState<DashboardUser[]>([]);

  // Async load indicators
  const [isInstalling, setIsInstalling] = useState(false);
  const [isBackupProcessing, setIsBackupProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem("gcore_current_user", JSON.stringify(data.user));
        showNotification(`Willkommen zurück, ${data.user.username}!`);
        // Clear login page fields
        setLoginUsername("");
        setLoginPassword("");
      } else {
        const err = await res.json();
        setLoginError(err.error || "Login fehlgeschlagen");
      }
    } catch (err) {
      setLoginError("Verbindungsfehler zur RCON-Datenbank");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("gcore_current_user");
    setCurrentUser(null);
    showNotification("Erfolgreich abgemeldet.");
  };

  // Load everything on mount
  useEffect(() => {
    checkSetupStatus();
    fetchData();

    // Periodically update statistics & servers state to simulate active host terminal polling
    const intervalStats = setInterval(fetchStats, 3000);
    const intervalServers = setInterval(fetchServers, 4000);

    return () => {
      clearInterval(intervalStats);
      clearInterval(intervalServers);
    };
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchServers(), fetchStats(), fetchBackups(), fetchUsers()]);
  };

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const fetchServers = async () => {
    try {
      const res = await fetch("/api/servers");
      if (res.ok) {
        const data = await res.json();
        setServers(data);
      }
    } catch (err) {
      console.error("Servers mapping failed", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Stats fetching failed", err);
    }
  };

  const fetchBackups = async () => {
    try {
      const res = await fetch("/api/backups");
      if (res.ok) {
        const data = await res.json();
        setBackups(data);
      }
    } catch (err) {
      console.error("Backups retrieval failed", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Users retrieval failed", err);
    }
  };

  // Actions
  const checkPermission = (permissionKey: string, actionLabel: string): boolean => {
    if (!currentUser) return false;
    // Super Administrators override all granular permission checks
    if (currentUser.role === "admin") return true;
    if (currentUser.permissions && currentUser.permissions.includes(permissionKey)) {
      return true;
    }
    showNotification(`Zugriff verweigert: Sie besitzen nicht das Recht '${actionLabel}' (${permissionKey}).`, true);
    return false;
  };

  const handleInstallServer = async (installData: any) => {
    if (!checkPermission("install", "Server installieren")) return;
    setIsInstalling(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(installData)
      });
      if (res.ok) {
        const newSrv = await res.json();
        showNotification(`Server '${newSrv.name}' wurde erfolgreich in die Docker-Warteschlange eingereiht.`);
        await fetchServers();
        setActiveTab("servers"); // Switch to list to witness install progress
      } else {
        const err = await res.json();
        showNotification(err.error || "Installationsübermittlung fehlgeschlagen", true);
      }
    } catch (err) {
      showNotification("Netzwerkfehler beim Absenden der Installationsanforderung", true);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleToggleServer = async (id: string) => {
    if (!checkPermission("start_stop", "Server Starten / Stoppen")) return;
    try {
      const res = await fetch(`/api/servers/${id}/toggle`, {
        method: "POST"
      });
      if (res.ok) {
        const updated = await res.json();
        showNotification(
          `Server '${updated.name}' wird ${updated.status === "running" ? "gestartet" : "gestoppt"}...`
        );
        await fetchServers();
        await fetchStats();
      }
    } catch (err) {
      showNotification("Konnte den Power-State des Containers nicht umschalten", true);
    }
  };

  const handleUpdateServer = async (id: string) => {
    if (!checkPermission("update", "Updates einspielen")) return;
    try {
      const res = await fetch(`/api/servers/${id}/update`, {
        method: "POST"
      });
      if (res.ok) {
        showNotification("SteamCMD Suchvorgang eingeleitet. Update läuft im Hintergrund...");
        await fetchServers();
      }
    } catch (err) {
      showNotification("Update-Prozess fehlgeschlagen", true);
    }
  };

  const handleDeleteServer = async (id: string) => {
    if (!checkPermission("install", "Server deinstallieren")) return;
    try {
      const res = await fetch(`/api/servers/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showNotification("Server erfolgreich deinstalliert und Volumes bereinigt.");
        await fetchServers();
        await fetchBackups(); // Clears backups linked to it
      }
    } catch (err) {
      showNotification("Konnte die Deinstallation nicht abschließen", true);
    }
  };

  const handleSaveConfig = async (id: string, updateData: Partial<GameServer>) => {
    if (!checkPermission("update", "Updates & Mods verwalten")) return;
    try {
      const res = await fetch(`/api/servers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        showNotification("Änderungen an der Serverkonfiguration wurden dauerhaft gespeichert.");
        await fetchServers();
      }
    } catch (err) {
      showNotification("Fehler beim Speichern der Konfiguration", true);
    }
  };

  const handleCreateBackup = async (serverId: string, backupName?: string) => {
    if (!checkPermission("backups", "Backup-Rechte")) return;
    setIsBackupProcessing(true);
    try {
      const res = await fetch(`/api/backups/${serverId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: backupName })
      });
      if (res.ok) {
        showNotification("Inkrementelle Sicherung (GZIP Snapshot) im Volume Pool angelegt.");
        await fetchBackups();
      }
    } catch (err) {
      showNotification("Backup snapshot konnte nicht generiert werden", true);
    } finally {
      setIsBackupProcessing(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!checkPermission("backups", "Backup-Rechte")) return;
    setIsBackupProcessing(true);
    try {
      const res = await fetch(`/api/backups/restore/${backupId}`, {
        method: "POST"
      });
      if (res.ok) {
        showNotification("Wiederherstellung (Restore) erfolgreich ins Volume gemountet.");
        await fetchServers();
      }
    } catch (err) {
      showNotification("Fehler bei der Snapshot-Wiederherstellung", true);
    } finally {
      setIsBackupProcessing(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!checkPermission("backups", "Backup-Rechte")) return;
    try {
      const res = await fetch(`/api/backups/${backupId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showNotification("Backupdatei endgültig aus dem Speicherpool gelöscht.");
        await fetchBackups();
      }
    } catch (err) {
      showNotification("Konnte das Backup nicht löschen", true);
    }
  };

  const handleAddUser = async (userData: { username: string; role: UserRole; permissions: string[] }) => {
    if (!checkPermission("users", "Nutzerverwaltung")) return;
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        showNotification(`Benutzer ${userData.username} erfolgreich angelegt.`);
        await fetchUsers();
      }
    } catch (err) {
      showNotification("Benutzererstellung fehlgeschlagen", true);
    }
  };

  const handleUpdateUser = async (id: string, updateData: Partial<DashboardUser>) => {
    if (!checkPermission("users", "Nutzerverwaltung")) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        showNotification("Zugriffsrechte wurden im System aktualisiert.");
        await fetchUsers();
      }
    } catch (err) {
      showNotification("Konnte Benutzerrechte nicht speichern", true);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!checkPermission("users", "Nutzerverwaltung")) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showNotification("Benutzerkonto gelöscht.");
        await fetchUsers();
      }
    } catch (err) {
      showNotification("Konnte den Benutzer nicht entfernen", true);
    }
  };

  if (isSetupNeeded === null) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-xs text-neutral-500 font-mono">{t("common.loading", "Lese Systemeinrichtung...")}</p>
        </div>
      </div>
    );
  }

  if (isSetupNeeded) {
    return (
      <div className="min-h-screen bg-[#070709] bg-gradient-to-tr from-[#070709] via-[#0d0d12] to-[#040406] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-indigo-500/10 to-transparent blur-[120px] pointer-events-none opacity-50" />
        <div className="w-full max-w-sm bg-[#121216]/90 border border-neutral-850 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col space-y-6 animate-fade-in backdrop-blur-md relative z-10">
          
          <div className="flex flex-col items-center text-center">
            <div className={`w-12 h-12 bg-indigo-600/15 border border-indigo-505/30 text-indigo-400 rounded-xl flex items-center justify-center shadow-lg mb-3`}>
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-lg font-extrabold tracking-tight text-white uppercase font-sans">
              {t("login.setupRequired", "ERSTEINRICHTUNG")}
            </h1>
            <p className="text-xs text-indigo-400 font-mono mt-1">{t("login.setupRequired", "Super-Administrator anlegen")}</p>
            <p className="text-neutral-450 text-[11px] mt-3 leading-relaxed">
              {t("login.setupSubtitle", "Willkommen bei Ihrer Spieleserver-Umgebung! Erstellen Sie hier den initialen Haupt-Admin-Account mit vollen Berechtigungen.")}
            </p>
          </div>

          <form onSubmit={handleSetupSubmit} className="space-y-4">
            <div>
              <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-450 mb-1.5 font-mono">
                {t("login.username", "Super-Admin Benutzername")}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. admin"
                value={setupUsername}
                onChange={(e) => setSetupUsername(e.target.value)}
                className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-450 mb-1.5 font-mono">
                {t("login.password", "Sicheres Admin-Passwort")}
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={setupPassword}
                onChange={(e) => setSetupPassword(e.target.value)}
                className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            {setupError && (
              <div className="bg-red-952/10 border border-red-900/30 text-red-400 p-2.5 rounded-lg text-xxs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{setupError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSettingUp}
              className="w-full disabled:opacity-55 text-white font-extrabold text-xs py-3 px-4 rounded-lg shadow-lg cursor-pointer bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10 uppercase tracking-wide transition-all"
            >
              {isSettingUp ? t("common.loading", "Richtet ein...") : t("login.setupBtn", "ERSTEINRICHTUNG ABSCHLIESSEN & EINLOGGEN")}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070709] bg-gradient-to-tr from-[#070709] via-[#0d0d12] to-[#040406] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated ambient background logic inside Login Screen */}
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-indigo-500/10 to-transparent blur-[120px] pointer-events-none opacity-50" />
        <div className="w-full max-w-sm bg-[#121216]/90 border border-neutral-850 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col space-y-6 animate-fade-in backdrop-blur-md relative z-10">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg mb-3 transition-all duration-300 ${
              accentColor === "indigo" ? "bg-indigo-600 shadow-indigo-600/20" :
              accentColor === "emerald" ? "bg-emerald-600 shadow-emerald-500/20" :
              accentColor === "orange" ? "bg-orange-600 shadow-orange-500/20" :
              "bg-pink-600 shadow-pink-500/20"
            }`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black tracking-widest text-[#d4af37] uppercase font-royal animate-pulse">
              Gameserver Labor
            </h1>
            <p className="text-xs text-neutral-400 font-mono mt-1">{t("login.subtitle", "Docker Linux Control Login System")}</p>
          </div>

          {/* Language Switcher inside Login card */}
          <div className="flex bg-[#1c1c24] border border-[#24242a] p-1.5 rounded-xl justify-between items-center text-xs">
            <span className="text-[10px] font-mono text-neutral-450 uppercase pl-2 font-bold">Language / Sprache:</span>
            <div className="flex gap-1 pr-1 bg-neutral-950/40 rounded-lg p-0.5 border border-neutral-900">
              {[
                { code: "en", label: "EN" },
                { code: "de", label: "DE" },
                { code: "fr", label: "FR" },
                { code: "es", label: "ES" }
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code as any)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase transition-all cursor-pointer ${
                    language === lang.code
                      ? (
                          accentColor === "indigo" ? "bg-indigo-650 text-white" :
                          accentColor === "emerald" ? "bg-emerald-650 text-white" :
                          accentColor === "orange" ? "bg-orange-650 text-white" :
                          "bg-pink-650 text-white"
                        )
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-450 mb-1.5 font-mono">
                {t("login.username", "Benutzername")}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. admin"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className={`w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all ${
                  accentColor === "indigo" ? "focus:border-indigo-500" :
                  accentColor === "emerald" ? "focus:border-emerald-500" :
                  accentColor === "orange" ? "focus:border-orange-500" :
                  "focus:border-pink-500"
                } font-sans`}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-450 font-mono">
                  {t("login.password", "Kennwort / Passwort")}
                </label>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className={`w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all ${
                  accentColor === "indigo" ? "focus:border-indigo-500" :
                  accentColor === "emerald" ? "focus:border-emerald-500" :
                  accentColor === "orange" ? "focus:border-orange-500" :
                  "focus:border-pink-500"
                } font-sans`}
              />
            </div>

            {loginError && (
              <div className="bg-red-952/10 border border-red-900/30 text-red-400 p-2.5 rounded-lg text-xxs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 animate-bounce" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full disabled:opacity-55 text-white font-extrabold text-[#ffffff] text-xs py-2.8 px-4 rounded-lg shadow-lg cursor-pointer flex justify-center items-center gap-1 uppercase tracking-wide transition-all ${
                accentColor === "indigo" ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10" :
                accentColor === "emerald" ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10" :
                accentColor === "orange" ? "bg-orange-600 hover:bg-orange-500 shadow-orange-500/10" :
                "bg-pink-600 hover:bg-pink-500 shadow-pink-500/10"
              }`}
            >
              {isLoggingIn ? t("common.loading", "Authentifizierung...") : t("login.submitBtn", "IM SYSTEM ANMELDEN")}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const getNavButtonClass = (tab: NavigationTab) => {
    const isSelected = activeTab === tab;
    if (!isSelected) {
      return "text-neutral-400 hover:text-white hover:bg-neutral-900/40";
    }
    return {
      indigo: "bg-[#181822] text-indigo-450 border-l-4 border-indigo-500 shadow-inner",
      emerald: "bg-[#0b1c15] text-emerald-450 border-l-4 border-emerald-500 shadow-inner",
      orange: "bg-[#20150e] text-orange-450 border-l-4 border-orange-500 shadow-inner",
      pink: "bg-[#210f19] text-pink-450 border-l-4 border-pink-500 shadow-inner"
    }[accentColor];
  };

  const accentColorText = {
    indigo: "text-indigo-400",
    emerald: "text-emerald-400",
    orange: "text-orange-400",
    pink: "text-pink-400"
  }[accentColor];

  const accentBrandBg = {
    indigo: "bg-indigo-600 shadow-indigo-600/20",
    emerald: "bg-emerald-600 shadow-emerald-500/20",
    orange: "bg-orange-600 shadow-orange-500/20",
    pink: "bg-pink-600 shadow-pink-500/20"
  }[accentColor];

  return (
    <div className={`min-h-screen bg-[#08080a] text-neutral-200 font-sans flex overflow-hidden relative ${
      atmosphere === "terminal" ? "scanlines" : ""
    }`}>
      {/* Scanline FX overlay for Terminal atmosphere */}
      {atmosphere === "terminal" && <div className="scanlines-overlay" />}

      {/* Aurora glow indicators for Nebula atmosphere */}
      {atmosphere === "nebula" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[5%] left-[10%] w-[35%] h-[35%] rounded-full blur-[140px] animate-glow-1 transition-all duration-700" style={{
            backgroundColor: 
              accentColor === "indigo" ? "rgba(99, 102, 241, 0.08)" :
              accentColor === "emerald" ? "rgba(16, 185, 129, 0.08)" :
              accentColor === "orange" ? "rgba(249, 115, 22, 0.08)" :
              "rgba(236, 72, 153, 0.08)"
          }} />
          <div className="absolute bottom-[15%] right-[10%] w-[40%] h-[40%] rounded-full blur-[160px] animate-glow-2 transition-all duration-700" style={{
            backgroundColor: 
              accentColor === "indigo" ? "rgba(236, 72, 153, 0.06)" :
              accentColor === "emerald" ? "rgba(99, 102, 241, 0.06)" :
              accentColor === "orange" ? "rgba(236, 72, 153, 0.06)" :
              "rgba(236, 72, 153, 0.06)"
          }} />
        </div>
      )}

      {/* Cyber Blueprints Grid */}
      {atmosphere === "cybernet" && (
        <div className="absolute inset-0 bg-grid-cyber pointer-events-none z-0 opacity-80" />
      )}

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#121216]/95 border-r border-[#24242a] flex flex-col justify-between flex-shrink-0 relative z-10 backdrop-blur-md">
        <div>
          {/* Brand header */}
          <div className="p-6 flex items-center gap-3 border-b border-[#24242a]/60">
            <div className={`w-8 h-8 rounded flex items-center justify-center shadow-md transition-all duration-300 ${accentBrandBg}`}>
              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider text-white uppercase font-royal flex flex-col leading-tight">
                <span className="text-[#d4af37]">Gameserver</span>
                <span className={`text-[10px] tracking-widest transition-colors duration-300 ${accentColorText}`}>Labor</span>
              </h1>
              <p className="text-[9px] text-neutral-500 font-mono tracking-widest uppercase">Linux Control v2.4</p>
            </div>
          </div>

          {/* Navigation menus */}
          <nav className="p-3.5 space-y-1.5 mt-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getNavButtonClass("overview")}`}
            >
              <Activity className="w-4.5 h-4.5" />
              {t("nav.overview", "Ressourcen-Überwachung")}
            </button>

            <button
              onClick={() => setActiveTab("servers")}
              className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getNavButtonClass("servers")}`}
            >
              <Server className="w-4.5 h-4.5" />
              {t("nav.servers", "Spieleserver verwalten")}
            </button>

            <button
              onClick={() => setActiveTab("install")}
              className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getNavButtonClass("install")}`}
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 4v16m8-8H4" />
              </svg>
              {t("nav.install", "Server installieren")}
            </button>

            <button
              onClick={() => setActiveTab("backups")}
              className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getNavButtonClass("backups")}`}
            >
              <Archive className="w-4.5 h-4.5" />
              {t("nav.backups", "Backup & Recovery")}
            </button>

            <button
              onClick={() => setActiveTab("storage")}
              className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getNavButtonClass("storage")}`}
            >
              <HardDrive className="w-4.5 h-4.5" />
              {t("nav.storage", "Host-Speicherplatz (Storage)")}
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getNavButtonClass("users")}`}
            >
              <Users className="w-4.5 h-4.5" />
              {t("nav.users", "Nutzerrechte verwalten")}
            </button>

            <button
              onClick={() => setActiveTab("scheduler")}
              className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getNavButtonClass("scheduler")}`}
            >
              <Clock className="w-4.5 h-4.5" />
              {t("nav.scheduler", "Aufgabenplanung (Cron)")}
            </button>

            <button
              onClick={() => setActiveTab("terminal")}
              className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getNavButtonClass("terminal")}`}
            >
              <Terminal className="w-4.5 h-4.5" />
              {t("nav.terminal", "Live Host-Terminal")}
            </button>

            <button
              onClick={() => setActiveTab("updates")}
              className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getNavButtonClass("updates")}`}
            >
              <RefreshCw className="w-4.5 h-4.5" />
              {t("nav.updates", "Updates & Releases")}
            </button>

            <button
              onClick={() => setActiveTab("api")}
              className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getNavButtonClass("api")}`}
            >
              <Key className="w-4.5 h-4.5" />
              {t("nav.api", "API Dokumentation")}
            </button>
          </nav>
        </div>

        {/* User profile section footer inside Left Side nav */}
        <div className="p-4 mt-auto border-t border-[#24242a]">
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-950/65 border border-indigo-500/50 flex items-center justify-center text-indigo-300 text-[11px] font-extrabold tracking-wider uppercase flex-shrink-0">
                {currentUser.username.slice(0, 2)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate leading-tight">{currentUser.username}</p>
                <p className="text-[9px] text-neutral-500 font-mono capitalize leading-none pt-0.5">{currentUser.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-2 py-1 bg-red-952/15 text-red-500 hover:text-red-400 hover:bg-red-952/35 border border-red-900/30 hover:border-red-500/30 text-[9px] font-extrabold rounded cursor-pointer transition-colors font-mono tracking-wider"
              title="Sichere Abmeldung aus der Host-Session"
            >
              OUT
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-transparent relative z-10">
        {/* Top Header */}
        <header className="h-16 px-8 flex items-center justify-between border-b border-[#24242a]/60 flex-shrink-0 bg-[#070709]/80 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-bold text-white tracking-wide uppercase">
              {activeTab === "overview" && t("nav.headerOverview", "System Dashboard")}
              {activeTab === "servers" && t("nav.headerServers", "Server Control")}
              {activeTab === "install" && t("nav.headerInstall", "Application Catalog")}
              {activeTab === "backups" && t("nav.headerBackups", "Data Backups")}
              {activeTab === "storage" && t("nav.headerStorage", "Massenspeicher-Verwaltung")}
              {activeTab === "users" && t("nav.headerUsers", "User Permissions")}
              {activeTab === "scheduler" && t("nav.headerScheduler", "Aufgabenplanung (Cron)")}
              {activeTab === "terminal" && t("nav.headerTerminal", "Live Host-Terminal")}
              {activeTab === "updates" && t("nav.headerUpdates", "Updates & Releases")}
              {activeTab === "api" && t("nav.headerApi", "API Connection")}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/30 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {t("nav.hostOnline", "LINUX HOST ONLINE")}
            </span>
          </div>

          <div className="flex items-center gap-4 md:gap-5">
            {/* Language Selection Switcher */}
            <div className="flex items-center gap-2 bg-[#121216] border border-neutral-850 px-2.5 py-1.5 rounded-xl text-neutral-350 select-none">
              <span className="text-[9px] font-mono text-neutral-500 uppercase font-bold tracking-wider">LANG:</span>
              <div className="flex bg-neutral-950/70 p-0.5 rounded-lg border border-neutral-900">
                {[
                  { code: "en", label: "EN" },
                  { code: "de", label: "DE" },
                  { code: "fr", label: "FR" },
                  { code: "es", label: "ES" }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code as any)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase transition-all cursor-pointer ${
                      language === lang.code
                        ? (
                            accentColor === "indigo" ? "bg-indigo-650 text-white" :
                            accentColor === "emerald" ? "bg-emerald-650 text-white" :
                            accentColor === "orange" ? "bg-orange-650 text-white" :
                            "bg-pink-650 text-white"
                          )
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Atmosphere Mode Switcher */}
            <div className="flex items-center gap-2 bg-[#121216] border border-neutral-850 px-2.5 py-1.5 rounded-xl text-neutral-350 select-none">
              <span className="text-[9px] font-mono text-neutral-500 uppercase font-bold tracking-wider">{t("nav.atmosphere", "Hintergrund:")}</span>
              <div className="flex bg-neutral-950/70 p-0.5 rounded-lg border border-neutral-900">
                {[
                  { name: "solid", label: "Sleek" },
                  { name: "cybernet", label: "Grid" },
                  { name: "nebula", label: "Aura" },
                  { name: "terminal", label: "Retro" }
                ].map((at) => (
                  <button
                    key={at.name}
                    type="button"
                    onClick={() => updateAtmosphere(at.name as any)}
                    className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase transition-all cursor-pointer ${
                      atmosphere === at.name
                        ? (
                            accentColor === "indigo" ? "bg-indigo-650 text-white" :
                            accentColor === "emerald" ? "bg-emerald-650 text-white" :
                            accentColor === "orange" ? "bg-orange-650 text-white" :
                            "bg-pink-650 text-white"
                          )
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {at.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Design Config Mode Switcher */}
            <div className="flex items-center gap-2 bg-[#121216] border border-neutral-850 px-3 py-1.5 rounded-xl text-neutral-350 select-none">
              <span className="text-[9px] font-mono text-neutral-500 uppercase font-bold tracking-wider">{t("nav.accentColor", "Farbe:")}</span>
              <div className="flex items-center gap-1.5">
                {[
                  { name: "indigo", color: "bg-indigo-600", label: "Midnight Blue" },
                  { name: "emerald", color: "bg-emerald-500", label: "Active Terminal Green" },
                  { name: "orange", color: "bg-orange-500", label: "DayZ Tactical Rust" },
                  { name: "pink", color: "bg-pink-500", label: "Synthwave Magenta" }
                ].map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => updateAccentColor(c.name as any)}
                    className={`w-3.5 h-3.5 rounded-full ${c.color} cursor-pointer hover:scale-120 transition-all ${
                      accentColor === c.name ? "ring-2 ring-white scale-125 shadow-md shadow-white/10" : "opacity-50 hover:opacity-100"
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {activeTab !== "install" && (
              <button
                onClick={() => setActiveTab("install")}
                className={`text-white text-xs px-3.5 py-1.8 rounded-lg font-bold tracking-wide transition-all duration-300 flex items-center gap-1.5 shadow-md cursor-pointer ${
                  accentColor === "indigo" ? "bg-indigo-600 hover:bg-indigo-505" :
                  accentColor === "emerald" ? "bg-emerald-650 text-white" :
                  accentColor === "orange" ? "bg-orange-600 hover:bg-orange-500" :
                  "bg-pink-650 hover:bg-pink-500"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                {t("nav.quickInstall", "Server installieren")}
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Screen View Wrapper */}
        <div className="flex-1 overflow-y-auto p-8 scroller relative max-w-full">
          
          {/* Action Notifications/Toasts */}
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2.5 shadow-md animate-fade-in">
              <CheckCircle className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-954/30 border border-red-500/30 text-red-405 text-xs rounded-xl flex items-center gap-2.5 shadow-md animate-fade-in">
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Navigated component screens */}
          {activeTab === "overview" && (
            <Overview stats={stats} servers={servers} onToggleServer={handleToggleServer} accentColor={accentColor} />
          )}

          {activeTab === "servers" && (
            <ServerList
              servers={servers}
              onToggleServer={handleToggleServer}
              onUpdateServer={handleUpdateServer}
              onDeleteServer={handleDeleteServer}
              onSaveConfig={handleSaveConfig}
              onCreateBackup={handleCreateBackup}
              accentColor={accentColor}
            />
          )}

          {activeTab === "install" && (
            <ServerCatalog onInstall={handleInstallServer} isInstalling={isInstalling} />
          )}

          {activeTab === "backups" && (
            <Backups
              backups={backups}
              servers={servers}
              onCreateBackup={handleCreateBackup}
              onRestoreBackup={handleRestoreBackup}
              onDeleteBackup={handleDeleteBackup}
              isProcessing={isBackupProcessing}
            />
          )}

          {activeTab === "storage" && (
            <DiskManager accentColor={accentColor} />
          )}

          {activeTab === "updates" && (
            <SystemUpdater accentColor={accentColor} />
          )}

          {activeTab === "users" && (
            <UserManagement
              users={users}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === "scheduler" && (
            <Scheduler
              servers={servers}
              accentColor={accentColor}
              onTriggerAction={(msg, isError) => {
                if (isError) {
                  showNotification(msg, true);
                } else {
                  showNotification(msg);
                }
              }}
            />
          )}

          {activeTab === "terminal" && (
            <HostTerminal accentColor={accentColor} />
          )}

          {activeTab === "api" && <ApiDocs />}
        </div>

        {/* Footer info strip */}
        <footer className="h-12 bg-[#121216]/50 border-t border-[#24242a] px-8 flex items-center justify-between flex-shrink-0 text-gray-550">
          <div className="flex items-center gap-5 text-[10px] uppercase font-mono tracking-widest text-neutral-500">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Update System: OK
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Container-Isolation: Aktiv
            </div>
            <button
              onClick={() => setActiveTab("api")}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer font-sans normal-case tracking-normal"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              API Anbindung
            </button>
          </div>
          <div className="text-[10px] text-neutral-600 font-mono uppercase">
            KILIANS SPIELWIESE v2.4 | PORT: 3000
          </div>
        </footer>
      </main>
    </div>
  );
}
