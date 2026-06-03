import React, { useState, useEffect } from "react";
import { GameTemplate } from "../types";
import { Server, Cpu, Layers, HardDrive, Plus, Info, Globe, Sparkles, Search, Command } from "lucide-react";
import { useLanguage } from "../LanguageContext";
import GameIcon from "./GameIcon";

interface ServerCatalogProps {
  onInstall: (data: {
    name: string;
    game: string;
    dockerImage: string;
    portMapping: string;
    recommendedRam: number;
    variables: Record<string, string>;
    iconUrl?: string;
  }) => void;
  isInstalling: boolean;
}

export const GAME_TEMPLATES: GameTemplate[] = [
  {
    gameKey: "minecraft",
    name: "Minecraft Server (Paper/Vanilla)",
    defaultImage: "itzg/minecraft-server:latest",
    defaultPort: "25565:25565",
    icon: "⛏️",
    description: "Hochleistungsfähiger Minecraft-Server mit automatischem EULA-Einverständnis, konfigurierbaren Schwierigkeiten und RCON-Support.",
    recommendedRam: 4096,
    defaultVariables: {
      EULA: "TRUE",
      MOTD: "Willkommen auf Gameserver Labor Minecraft-Server!",
      DIFFICULTY: "normal",
      TYPE: "PAPER",
      ONLINE_MODE: "true"
    }
  },
  {
    gameKey: "dayz",
    name: "DayZ Survival (DaZ / Chernarus)",
    defaultImage: "steamcmd/steamcmd:latest",
    defaultPort: "2302:2302",
    icon: "🧟",
    description: "Hardcore postapokalyptischer Online-Überlebenskampf. Beinhaltet vorkonfiguriertes Epoch/DayZ-Expansion System und BattlEye-Schutz.",
    recommendedRam: 8192,
    defaultVariables: {
      SERVER_NAME: "Gameserver Labor DayZ Server",
      PASSWORD: "",
      ADMIN_PASSWORD: "rconSecureDayZ1",
      MAX_PLAYERS: "40",
      BATTLEYE: "1",
      MISSION: "dayzOffline.chernarusplus"
    }
  },
  {
    gameKey: "cs2",
    name: "Counter-Strike 2 Dedicated",
    defaultImage: "joedev/cs2-dedicated:latest",
    defaultPort: "27015:27015",
    icon: "🔫",
    description: "Niedrige Latenzzeiten für kompetitive oder Gelegenheitsspiele mit Tickrate-Tuning und RCON-Passwortschutz.",
    recommendedRam: 8192,
    defaultVariables: {
      GAME_ALIAS: "cs2",
      MAP: "de_dust2",
      TICKRATE: "128",
      RCON_PASSWORD: "rconSecurePassword1"
    }
  },
  {
    gameKey: "valheim",
    name: "Valheim Co-op Server",
    defaultImage: "lloesche/valheim-server:latest",
    defaultPort: "2456:2456",
    icon: "🛡️",
    description: "Entdecke das Fegefeuer der Wikinger mit Freunden. Automatischer Sleep-Mode zur Ressourceneinsparung, falls kein Spieler online ist.",
    recommendedRam: 6144,
    defaultVariables: {
      SERVER_NAME: "Odin Land",
      WORLD_NAME: "Midgard",
      SERVER_PASS: "valheimsecret"
    }
  },
  {
    gameKey: "rust",
    name: "Rust Oxide & Vanilla",
    defaultImage: "didier/rust-server:latest",
    defaultPort: "28015:28015",
    icon: "🪵",
    description: "Überlebenskampf pur. Mit Support für Oxide Mods, benutzerdefinierte Kartengrößen und automatisierte Wipe-Intervalle.",
    recommendedRam: 10244,
    defaultVariables: {
      RUST_SERVER_NAME: "Survival",
      RUST_SERVER_LEVEL: "Procedural Map",
      RUST_SERVER_SEED: "123456",
      RUST_SERVER_WORLD_SIZE: "3000",
      RUST_SERVER_MAX_PLAYERS: "50"
    }
  },
  {
    gameKey: "palworld",
    name: "Palworld Server Instance",
    defaultImage: "thijsvanloef/palworld-server:latest",
    defaultPort: "8211:8211",
    icon: "🐾",
    description: "Kämpfe, farme und baue an der Seite mysteriöser Pals im Multiplayer. Optimierte RAM-Bereinigung gegen Serverlecks.",
    recommendedRam: 12288,
    defaultVariables: {
      SERVER_NAME: "Palworld Paradise",
      ADMIN_PASSWORD: "palAdminSecure123",
      PLAYERS: "32",
      PUBLIC_PORT: "8211"
    }
  },
  {
    gameKey: "factorio",
    name: "Factorio Automation Hub",
    defaultImage: "factoriotools/factorio-server:latest",
    defaultPort: "34197:34197",
    icon: "⚙️",
    description: "Die Fabrik muss wachsen. Automatische Spielstandsicherungen und unübertroffener CPU-Sync für gigantische Megafabriken.",
    recommendedRam: 3072,
    defaultVariables: {
      AUTOSAVE_INTERVAL: "10",
      AFK_KICK_INTERVAL: "0",
      ALLOW_COMMANDS: "true"
    }
  },
  {
    gameKey: "satisfactory",
    name: "Satisfactory Factory Dedicated",
    defaultImage: "wolveix/satisfactory-server:latest",
    defaultPort: "7777:7777",
    icon: "🏭",
    description: "Kooperative Fabrikplanung aus der Ego-Perspektive. Stabiles Threading zur Vermeidung von Sync-Latenzen bei großen Konstrukten.",
    recommendedRam: 8192,
    defaultVariables: {
      SERVER_NAME: "Gameserver Labor FICSIT Plant",
      MAX_PLAYERS: "10",
      LOG_LEVEL: "info"
    }
  },
  {
    gameKey: "gmod",
    name: "Garry's Mod (SteamCMD Sandbox)",
    defaultImage: "steamcmd/steamcmd:latest",
    defaultPort: "27015:27015",
    icon: "🔧",
    description: "Physik-Sandbox ohne vordefinierte Ziele. Kinderleichte Addon-Synchronisation über Steam Collection-Mappen ID.",
    recommendedRam: 4096,
    defaultVariables: {
      SERVER_NAME: "GMod Physics Ground",
      GAMEMODE: "sandbox",
      COLLECTION_ID: "0",
      MAX_PLAYERS: "16"
    }
  },
  {
    gameKey: "terraria",
    name: "Terraria TShock Pro",
    defaultImage: "ryanshea/terraria-tshock:latest",
    defaultPort: "7777:7777",
    icon: "🌳",
    description: "2D Abenteuer- und Sandbox-Server. Inklusive TShock-Berechtigungsmodul und automatischem Welt-Generator.",
    recommendedRam: 2048,
    defaultVariables: {
      WORLD_NAME: "Terrastate",
      DIFFICULTY: "1",
      MAX_PLAYERS: "8",
      SERVER_PASS: ""
    }
  }
];

export default function ServerCatalog({ onInstall, isInstalling }: ServerCatalogProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GameTemplate[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null);
  const [customMode, setCustomMode] = useState(false);

  // Custom configuration fields
  const [customName, setCustomName] = useState("");
  const [customImage, setCustomImage] = useState("");
  const [customPort, setCustomPort] = useState("");
  const [customRam, setCustomRam] = useState(4096);
  const [customVars, setCustomVars] = useState<string>("EULA=TRUE\nPORT=25565");

  // Template override fields
  const [serverName, setServerName] = useState("");
  const [serverPort, setServerPort] = useState("");
  const [serverRam, setServerRam] = useState(4096);
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({});

  // Initialize with first template
  useEffect(() => {
    if (!selectedTemplate && GAME_TEMPLATES[0]) {
      handleSelectTemplate(GAME_TEMPLATES[0]);
    }
  }, []);

  // Live premium web discovery fetcher
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoadingSearch(true);
    const delayDebounce = setTimeout(() => {
      fetch(`/api/catalog/search?query=${encodeURIComponent(query)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Search network error");
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setSearchResults(data);
          }
        })
        .catch((err) => console.error("Dynamic web catalogue lookup failed:", err))
        .finally(() => setIsLoadingSearch(false));
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // When a template is clicked, synchronize defaults
  const handleSelectTemplate = (tpl: GameTemplate) => {
    setSelectedTemplate(tpl);
    setCustomMode(false);
    setServerName(`${tpl.name.split(" ")[0]} Server`);
    setServerPort(tpl.defaultPort);
    setServerRam(tpl.recommendedRam);
    setTemplateVars({ ...tpl.defaultVariables });
  };

  const handleVariableChange = (key: string, value: string) => {
    setTemplateVars((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const submitInstallation = (e: React.FormEvent) => {
    e.preventDefault();

    if (customMode) {
      if (!customName || !customImage || !customPort) {
        alert("Bitte füllen Sie alle erforderlichen Felder aus.");
        return;
      }

      // Parse env variables from textbook format key=value
      const parsedVars: Record<string, string> = {};
      customVars.split("\n").forEach((line) => {
        const index = line.indexOf("=");
        if (index !== -1) {
          const key = line.substring(0, index).trim();
          const val = line.substring(index + 1).trim();
          if (key) parsedVars[key] = val;
        }
      });

      onInstall({
        name: customName,
        game: "custom-docker",
        dockerImage: customImage,
        portMapping: customPort,
        recommendedRam: customRam,
        variables: parsedVars
      });

      // Clear custom fields
      setCustomName("");
      setCustomImage("");
      setCustomPort("");
    } else if (selectedTemplate) {
      onInstall({
        name: serverName || `${selectedTemplate.name.split(" ")[0]} Server`,
        game: selectedTemplate.gameKey,
        dockerImage: selectedTemplate.defaultImage,
        portMapping: serverPort || selectedTemplate.defaultPort,
        recommendedRam: serverRam || selectedTemplate.recommendedRam,
        variables: templateVars,
        iconUrl: selectedTemplate.iconUrl
      });
    }
  };

  // Perform filtering on search string input (supporting custom alias "DaZ" -> DayZ matching)
  const getFilteredTemplates = () => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return GAME_TEMPLATES;

    // Specifically handle the user's explicit request: "DaZ" -> DayZ alias
    const cleanedQuery = query === "daz" ? "dayz" : query;

    return GAME_TEMPLATES.filter(
      (tpl) =>
        tpl.name.toLowerCase().includes(cleanedQuery) ||
        tpl.gameKey.toLowerCase().includes(cleanedQuery) ||
        tpl.description.toLowerCase().includes(cleanedQuery)
    );
  };

  const filtered = getFilteredTemplates();
  const showDynamicFallback = searchQuery.trim().length > 1;

  // Handle building dynamic GameTemplate out-of-the-box for ANY game searched
  const selectDynamicSetup = (name: string) => {
    const cleanName = name.trim();
    const key = cleanName.toLowerCase().replace(/\s+/g, "-");
    const portBase = 27000 + Math.floor(Math.random() * 500);
    
    const dynamicTpl: GameTemplate = {
      gameKey: key,
      name: `${cleanName} Dedicated (Dynamic Hub)`,
      defaultImage: `steamcmd/${key}-server:latest`,
      defaultPort: `${portBase}:${portBase}`,
      icon: "🎮",
      description: `Automatisch generiertes isolated Docker Volume-Setup für '${cleanName}'. Initialisiert mit SteamCMD-Diensten und Linux-Bridge Netzwerkports.`,
      recommendedRam: 6144,
      defaultVariables: {
        SERVER_NAME: `Gameserver Labor ${cleanName} Server`,
        EULA: "TRUE",
        STEAM_APP_ID: "00000",
        RCON_ENABLED: "true"
      }
    };

    setSelectedTemplate(dynamicTpl);
    setCustomMode(false);
    setServerName(`${cleanName} Dedicated`);
    setServerPort(dynamicTpl.defaultPort);
    setServerRam(dynamicTpl.recommendedRam);
    setTemplateVars({ ...dynamicTpl.defaultVariables });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="server-catalog-section">
      {/* Grid Left: Select Game Templates catalog */}
      <div className="xl:col-span-7 space-y-4">
        
        {/* Search & Custom Docker selector header */}
        <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center border-b border-[#24242a] pb-4">
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide uppercase">
              Server-Setup Anwendungsbibliothek
            </h3>
            <p className="text-[11px] text-neutral-500 font-medium">1-Klick Installationspakete und flexible Container-Zuweisung.</p>
          </div>
          <button
            onClick={() => setCustomMode(true)}
            className={`px-3 py-1.5 text-xxs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
              customMode
                ? "bg-indigo-600 text-white"
                : "bg-neutral-800 text-neutral-400 hover:bg-neutral-750"
            }`}
          >
            Anderes Docker-Image verwenden
          </button>
        </div>

        {/* Live Fuzzy Search field */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-550">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("catalog.searchPlaceholder", "Search games or docker images...")}
            className="w-full bg-[#121216] border border-[#24242a] rounded-lg pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-505 placeholder-neutral-550 font-sans shadow"
          />
        </div>

        {/* Templates cards list grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[520px] overflow-y-auto pr-1 scroller">
          
          {/* Dynamic Fallback Card to install "ANY" game directly which was typed in search field */}
          {showDynamicFallback && (
            <button
              onClick={() => selectDynamicSetup(searchQuery)}
              type="button"
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer col-span-1 sm:col-span-2 flex items-center gap-4 bg-gradient-to-r from-indigo-950/20 via-[#121216] to-[#0c0c0d] ${
                selectedTemplate?.gameKey === searchQuery.toLowerCase().replace(/\s+/g, "-")
                  ? "border-indigo-500 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]"
                  : "border-indigo-900/40 hover:border-indigo-750/70"
              }`}
            >
              <div className="w-10 h-10 bg-indigo-600/10 border border-indigo-554/30 rounded-xl flex items-center justify-center text-xl flex-shrink-0 animate-pulse">
                🎮
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-extrabold text-white text-xs tracking-wider uppercase truncate">Instanziere '{searchQuery}'</h4>
                  <span className="bg-indigo-950/40 text-indigo-400 font-mono text-[8px] border border-indigo-900/30 px-1.5 py-0.5 rounded font-bold">GENERIC STEAMCMD</span>
                </div>
                <p className="text-neutral-450 mt-1 text-[11px] leading-relaxed">
                  Keine Direkt-Treffer? Klicken Sie hier, um ein automatisiertes SteamCMD-Profil für <strong>{searchQuery}</strong> zu generieren.
                </p>
              </div>
              <Plus className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            </button>
          )}

          {/* SECTION 1: Local Templates (Schnell-Pakete) */}
          {filtered.length > 0 && (
            <div className="col-span-1 sm:col-span-2 space-y-3">
              <div className="flex items-center gap-1.5 border-b border-neutral-800/60 pb-1.5">
                <Layers className="w-3.5 h-3.5 text-neutral-500" />
                <h5 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                  Vorgefertigte Kern-Templates (Schnellinstallationspakete)
                </h5>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map((tpl) => {
                  const isSelected = !customMode && selectedTemplate?.gameKey === tpl.gameKey;
                  return (
                    <button
                      key={tpl.gameKey}
                      onClick={() => handleSelectTemplate(tpl)}
                      type="button"
                      className={`text-left p-4 rounded-xl border transition-all text-neutral-200 cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#1c1c24] border-indigo-500/50 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]"
                          : "bg-[#121216] border-[#24242a] hover:border-neutral-750 hover:bg-[#16161b]"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <GameIcon game={tpl.gameKey} className="w-9 h-9 flex-shrink-0" iconUrl={tpl.iconUrl} />
                          <span className="text-[9px] font-mono text-neutral-500 bg-neutral-950/60 px-1.5 py-0.5 rounded border border-neutral-900 font-bold tracking-wider">
                            TEMPLATE
                          </span>
                        </div>
                        <h4 className="font-bold text-white mt-3 text-sm tracking-wide">{tpl.name}</h4>
                        <p className="text-neutral-450 text-xs mt-1.5 leading-relaxed line-clamp-2">
                          {tpl.description}
                        </p>
                      </div>

                      <div className="flex gap-4 mt-4 pt-3 border-t border-neutral-850 text-xxs font-mono text-neutral-550">
                        <span className="flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-indigo-400" /> {Math.round(tpl.recommendedRam / 1024)}GB Min
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-indigo-400" /> Port {tpl.defaultPort.split(":")[0]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: Dynamic Web API Search results via Steam, GitHub & Docker Hub */}
          {searchQuery.trim().length >= 2 && (
            <div className="col-span-1 sm:col-span-2 space-y-3 pt-2">
              <div className="flex items-center gap-1.5 border-b border-neutral-800/60 pb-1.5 font-sans">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <h5 className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                  Gefundene Installations-Pakete im Web (Live Steam, GitHub, Docker Hub)
                </h5>
              </div>

              {isLoadingSearch ? (
                <div className="text-center py-10 bg-[#121216]/20 rounded-xl border border-[#24242a]/60">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500 mx-auto mb-2"></div>
                  <p className="text-[11px] text-neutral-500">Suche Web-Paketquellen auf Steam, GitHub & DockerHub...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8 bg-[#121216]/10 rounded-xl border border-neutral-850/40">
                  <p className="text-neutral-550 text-xs font-sans">Keine Web-Dienste liefern Treffer für "{searchQuery}". Verwenden Sie oben das manuelle Setup.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {searchResults.map((tpl) => {
                    const isSelected = !customMode && selectedTemplate?.gameKey === tpl.gameKey;
                    const isSteam = tpl.gameKey.startsWith("steam-");
                    const isGitHub = tpl.gameKey.startsWith("github-");
                    const isDockerHub = tpl.gameKey.startsWith("dockerhub-");

                    const badgeText = isSteam ? "STEAM DOCKER" : isGitHub ? "GITHUB REPO" : isDockerHub ? "DOCKER HUB" : "WEB DOCKED";
                    const badgeStyle = isSteam 
                      ? "text-indigo-400 bg-indigo-950/40 border-indigo-900/30"
                      : isGitHub
                        ? "text-emerald-400 bg-emerald-950/40 border-emerald-900/30"
                        : "text-sky-400 bg-sky-950/40 border-sky-900/30";

                    return (
                      <button
                        key={tpl.gameKey}
                        onClick={() => handleSelectTemplate(tpl)}
                        type="button"
                        className={`text-left p-4 rounded-xl border transition-all text-neutral-200 cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-[#1c1c24] border-indigo-505/50 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]"
                            : "bg-[#121216] border-[#24242a] hover:border-neutral-750 hover:bg-[#16161b]"
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border font-bold tracking-wider uppercase ${badgeStyle}`}>
                              {badgeText}
                            </span>
                            <div className="w-10 h-10 overflow-hidden rounded bg-neutral-900 flex-shrink-0 border border-neutral-800 flex items-center justify-center p-1">
                              {tpl.iconUrl ? (
                                <img src={tpl.iconUrl} alt="logo" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-lg">{tpl.icon || "🎲"}</span>
                              )}
                            </div>
                          </div>
                          <h4 className="font-bold text-white mt-1.5 text-xs tracking-wide truncate max-w-full font-sans">{tpl.name}</h4>
                          <p className="text-neutral-400 text-[11px] mt-1.5 leading-relaxed line-clamp-3 font-sans">
                            {tpl.description}
                          </p>
                        </div>

                        <div className="flex gap-4 mt-4 pt-3 border-t border-neutral-855 text-xxs font-mono text-neutral-550">
                          <span className="flex items-center gap-1">
                            <Cpu className="w-3 h-3 text-indigo-400" /> {Math.round(tpl.recommendedRam / 1024)}GB Min
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3 text-indigo-400" /> Port {tpl.defaultPort.split(":")[0]}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {filtered.length === 0 && searchResults.length === 0 && !isLoadingSearch && (
            <div className="col-span-1 sm:col-span-2 text-center py-12 bg-neutral-950/20 rounded-xl border border-neutral-850">
              <Command className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
              <p className="text-xs text-neutral-500">Keine Minecraft- oder Presets-Treffer filtriert für '{searchQuery}'.</p>
              <p className="text-[10px] text-neutral-600 mt-1.5">Geben Sie oben einfach den Wunschnamen ein, um die dynamische Generierung zu nutzen!</p>
            </div>
          )}
        </div>

        {/* Dedicated Docker info panel */}
        <div className="bg-[#121216]/50 border border-[#24242a] rounded-xl p-4 flex gap-3 text-xs text-neutral-400">
          <Info className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-white">Docker-basierte Sandbox-Technologie</p>
            <p className="leading-relaxed text-xxs text-neutral-500">
              Jeder Spieleserver läuft in einem isolierten Linux-Container. Dies garantiert absolute Sicherheit vor unbefugten Dateizugriffen und schützt das Host-Betriebssystem. Systemressourcen wie RAM und CPU-Kerne werden dediziert zugewiesen und automatisch gedrosselt, falls Grenzwerte überschritten werden.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Right: Setup Details Form */}
      <div className="xl:col-span-5 bg-[#121216] border border-[#24242a] rounded-xl p-6 flex flex-col justify-between">
        <form onSubmit={submitInstallation} className="space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#24242a]">
            {customMode ? (
              <>
                <div className="w-7 h-7 bg-amber-950/40 border border-amber-500/20 text-amber-400 rounded flex items-center justify-center font-bold">🐳</div>
                <div>
                  <h3 className="text-sm font-bold text-white">Custom Docker Container</h3>
                  <p className="text-[10px] text-neutral-500">Volle Freiheit für jeden Server</p>
                </div>
              </>
            ) : (
              <>
                <GameIcon game={selectedTemplate?.gameKey || ""} className="w-8 h-8 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-wide">{selectedTemplate?.name}</h3>
                  <p className="text-[10px] text-indigo-400 uppercase font-mono tracking-wider">Konfiguration verifizieren</p>
                </div>
              </>
            )}
          </div>

          {!customMode ? (
            /* Standard Template Form fields */
            <div className="space-y-4">
              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-455 mb-1.5">
                  Server Name
                </label>
                <input
                  type="text"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  placeholder={selectedTemplate ? `${selectedTemplate.name.split(" ")[0]} Server` : ""}
                  className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-455 mb-1.5">
                    Port-Freigabe (Host:Client)
                  </label>
                  <input
                    type="text"
                    value={serverPort}
                    onChange={(e) => setServerPort(e.target.value)}
                    placeholder={selectedTemplate?.defaultPort}
                    className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-505 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-455 mb-1.5">
                    Limitierter RAM (MB)
                  </label>
                  <input
                    type="number"
                    value={serverRam}
                    onChange={(e) => setServerRam(Number(e.target.value))}
                    className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-505 transition-colors"
                  />
                </div>
              </div>

              {/* Dynamic env variables depending on template */}
              <div className="space-y-3 pt-2">
                <span className="block text-xxs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-800/40 pb-1">
                  Container Umgebungsvariablen (Environments)
                </span>
                <div className="grid grid-cols-1 gap-3 max-h-[170px] overflow-y-auto pr-1">
                  {Object.entries(templateVars).map(([key, value]) => (
                    <div key={key} className="flex flex-col space-y-1">
                      <span className="text-[10px] font-mono text-neutral-450">{key}</span>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleVariableChange(key, e.target.value)}
                        className="w-full bg-neutral-900 border border-[#24242a] rounded px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500/50 font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Custom Docker Image Form fields */
            <div className="space-y-4">
              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Anzeigename des Spieleservers
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Minecraft Modded Infinity"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Docker Image Registry Link
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. steamcmd/steamcmd:latest oder itzg/minecraft-server"
                  value={customImage}
                  onChange={(e) => setCustomImage(e.target.value)}
                  className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Port-Zuweisung (Host:Container)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="25565:25565"
                    value={customPort}
                    onChange={(e) => setCustomPort(e.target.value)}
                    className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Maximaler Arbeitsspeicher (MB)
                  </label>
                  <input
                    type="number"
                    value={customRam}
                    onChange={(e) => setCustomRam(Number(e.target.value))}
                    className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-500 mb-1 flex justify-between">
                  <span>Umgebungsvariablen (PRO ZEILE KEY=WERT)</span>
                  <span className="text-gray-600 font-mono">YAML / Env format</span>
                </label>
                <textarea
                  rows={4}
                  value={customVars}
                  onChange={(e) => setCustomVars(e.target.value)}
                  placeholder={"EULA=TRUE\nMEMORY=4G\nOP=ServerAdmin"}
                  className="w-full bg-[#1c1c24] border border-[#24242a] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 focus:ring-0"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isInstalling || (!selectedTemplate && !customMode)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-md transition-all duration-300 cursor-pointer"
            >
              {isInstalling ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  Installationsbefehl übertragen...
                </>
              ) : (
                <>
                  <Plus className="w-4.5 h-4.5" />
                  Container installieren & hosten
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-neutral-500 mt-2">
              Der Server wird automatisch im isolated Network-Bridge Modus gestartet.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
