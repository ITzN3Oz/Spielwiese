import React, { useState, useEffect } from "react";
import { GameServer } from "../types";
import FloatingWindow from "./FloatingWindow";
import { useLanguage } from "../LanguageContext";
import { GAME_TEMPLATES } from "./ServerCatalog";
import FileExplorerTree, { getFileDataTypeInfo } from "./FileExplorerTree";
import {
  Folder,
  FolderOpen,
  FileText,
  Search,
  Download,
  Check,
  AlertCircle,
  X,
  Plus,
  Trash2,
  Upload,
  Terminal,
  Save,
  Puzzle,
  FileCode,
  HardDrive,
  RefreshCw,
  Star,
  Play,
  Square,
  Sliders,
  Globe,
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Maximize2,
  Minimize2,
  LayoutGrid,
  List,
  Image,
  Film,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Sparkles
} from "lucide-react";

interface ServerModsManagerProps {
  server: GameServer;
  onClose: () => void;
  onAddConsoleLog?: (message: string, type?: "info" | "warn" | "error" | "output") => void;
  onSaveConfig?: (id: string, updateData: Partial<GameServer>) => void;
}

export interface ServerFile {
  name: string;
  path: string;
  content: string;
  size: string;
}

interface ServerMod {
  id: string;
  name: string;
  version: string;
  description: string;
  downloads: string;
  author: string;
  installed: boolean;
  longDescription: string;
  imageBg: string; // fallback color bg
  videoType: "mc_build" | "dayz_zombies" | "cs2_practice" | "rust_raid" | "custom" | "theme_art";
  origin: "Steam Workshop" | "CurseForge" | "Modrinth" | "SpigotMC" | "GitHub Releases";
  rating: number;
  fileSize: string;
  dependencies: string[];
  defaultConfigs: Record<string, string>;
  previewImages: string[];
  videoUrl?: string;
  detailedFeatures?: string[];
  verificationScore?: number; // 0-100 score
  trustedHub?: boolean;
  compatibleVersions?: string[];
  latestVersion?: string;
  updateAvailable?: boolean;
}

// Preset Mods for games with premium layout metadata fields (pictures representation, videos simulation, origin context)
const PRESET_MODS_RICH: Record<string, Omit<ServerMod, "installed">[]> = {
  minecraft: [
    {
      id: "worldedit",
      name: "WorldEdit Spigot",
      version: "7.3.0",
      author: "sk89q",
      downloads: "4.2M",
      description: "In-game Minecraft Karten-Editor mit fortgeschrittenen Pinsel- und Auswahlwerkzeugen.",
      longDescription: "WorldEdit ist der ultimative in-game Karten-Editor für Minecraft Java Server. Er ermöglicht es Admins und Operators, Tausende von Blöcken in Sekundenschnelle zu platzieren, zu kopieren, zu drehen und zu deformieren. Enthält komplexe Pinsel-Algorithmen, Landschaftsgeneratoren und Schematics-Übertragungen.",
      imageBg: "from-emerald-600 to-teal-900",
      videoType: "mc_build",
      origin: "SpigotMC",
      rating: 4.9,
      fileSize: "4.5 MB",
      dependencies: ["worldedit-core-api"],
      defaultConfigs: {
        "max-blocks-changed": "50000",
        "allowed-brushes": "sphere,cylinder,smooth,raise",
        "save-history-size": "30",
        "bypass-safe-limits": "false",
        "enable-rcon-monitoring": "true"
      },
      previewImages: [
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=60"
      ],
      detailedFeatures: [
        "Extrem schnelles Erschaffen und Transformieren ganzer Bergen oder Täler mit 3D-Brushes.",
        "Ausschneiden, Kopieren und Einfügen von Bauanteilen über das plattformübergreifende Schematics-Format.",
        "Umfangreiche Geometrie-Formen: Sphären, Zylinder, Ellipsoide und fraktale Strukturen auf Knopfdruck.",
        "Kompatibel mit LuckPerms für genaue Editor-Rechtevergaben auf Spigot und Paper hosts."
      ],
      verificationScore: 98,
      trustedHub: true
    },
    {
      id: "essentialsx",
      name: "EssentialsX Core",
      version: "2.20.1",
      author: "Zenexer",
      downloads: "8.5M",
      description: "Über 130 unverzichtbare Befehle für Server-Ökonomie, Teleport-Punkte und Kits.",
      longDescription: "Die EssentialsX Suite bietet das unverzichtbare Rückgrat für moderne Server. Ausgestattet mit Ökonomie-Systemen, Kits, Warp-Punkten, privaten Nachrichten, Teleportierungs-Anfragen, Nicknames und integrierter Chat-Formatierung.",
      imageBg: "from-indigo-600 to-purple-900",
      videoType: "mc_build",
      origin: "CurseForge",
      rating: 4.8,
      fileSize: "2.1 MB",
      dependencies: [],
      defaultConfigs: {
        "ops-name-color": "4",
        "nickname-limit": "16",
        "starting-balance": "500",
        "teleport-cooldown": "3",
        "heal-cooldown": "10"
      },
      previewImages: [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=60"
      ],
      detailedFeatures: [
        "Umfangreiche Admin-Hilfsmittel wie /mute, /kick, /ban und /tempban zur Community-Moderation.",
        "Flexibles Kit-System zur Ausgabe vorkonfigurierter Werkzeug- und Rüstungssets für neue Spieler.",
        "Teleport-Suite mit verzögertem Cooldown, sicherem Lande-Algorithmus und globalen Warp-Zielen.",
        "Integriertes Ökonomiesyste mit Ingame-Shops, steuerbaren Startguthaben und virtuellem Geldaustausch."
      ],
      verificationScore: 97,
      trustedHub: true
    },
    {
      id: "dynmap",
      name: "Dynmap Web Map",
      version: "3.5b",
      author: "mikeprimm",
      downloads: "2.1M",
      description: "Rendert eine interaktive, zoombare 3D-Karte deines Minecraft-Servers im Webbrowser.",
      longDescription: "Dynmap rendert eine hochauflösende 2D/3D-Perspektive deiner Minecraft Welten direkt in einen internen Web-Port deines Containers. Mit Echtzeit-Spieler-Markern, Wetteranzeigen und anpassbaren Zoom-Intervallen.",
      imageBg: "from-blue-600 to-sky-900",
      videoType: "mc_build",
      origin: "Modrinth",
      rating: 4.7,
      fileSize: "8.4 MB",
      dependencies: [],
      defaultConfigs: {
        "web-server-port": "8123",
        "render-triggers": "blockupdate,chunkload",
        "quality-mode": "high-vray",
        "show-player-coordinates": "true"
      },
      previewImages: [
        "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1501534159981-a185121c2555?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=60"
      ],
      detailedFeatures: [
        "Interaktive, browserbasierte Google-Maps-ähnliche Echtzeitkarte deiner Minecraft-Welten.",
        "Live-Spielermarker, die aktuelle Lebenswerte, Avatare, Rüstungen und Chatnachrichten plotten.",
        "Unterstützt mehrere Kartenperspektiven wie flache 2D-Top-Down, isometrische 3D und Höhlenansichten.",
        "Konfigurierbare Aktualisierungsauslöser zur Minimierung der Server-CPU-Last bei Terrainänderungen."
      ],
      verificationScore: 94,
      trustedHub: true
    },
    {
      id: "luckperms",
      name: "LuckPerms Advanced",
      version: "5.4.1",
      author: "Luck",
      downloads: "3.9M",
      description: "Detailliertes Berechtigungssystem mit Web-Editor, Gruppen und temporären Rechten.",
      longDescription: "LuckPerms ist das fortschrittlichste Berechtigungssystem für Minecraft Java. Es bietet erstklassige Kontrolle über Spielränge, Erbschaften, temporäre Erlaubnisse sowie einen vollständig webbasierten interaktiven Editor zur Rechteverwaltung.",
      imageBg: "from-amber-600 to-orange-950",
      videoType: "mc_build",
      origin: "SpigotMC",
      rating: 5.0,
      fileSize: "1.9 MB",
      dependencies: [],
      defaultConfigs: {
        "server-id": "kilian-spielwiese-node",
        "storage-method": "h2",
        "sync-interval-minutes": "10",
        "use-meta-formatting": "true"
      },
      previewImages: [
        "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=600&auto=format&fit=crop&q=60"
      ],
      detailedFeatures: [
        "Branchenführender, interaktiver Web-Editor für eine übersichtliche Verteilung von Server-Rechten.",
        "Leistungsfähige Vererbungs-Bäume zur Erstellung strukturierter Ränge wie Admin, Moderator, VIP und Spieler.",
        "Sichere, transaktionale Datenspeicherung wahlweise in lokaler H2, SQLite oder externer SQL Datenbank.",
        "Live-In-Game-Verifizierung mit detaillierten Suchprotokollen (/lp user login check-permission)."
      ],
      verificationScore: 100,
      trustedHub: true
    }
  ],
  dayz: [
    {
      id: "dayz-expansion",
      name: "DayZ-Expansion Core",
      version: "2.1.2",
      author: "Expansion Team",
      downloads: "820K",
      description: "Riesiges Gameplay-Overhaul mit Hubschraubern, Booten, neuem HUD und Basenbau.",
      longDescription: "DayZ-Expansion bietet ein monumentales Modulationspaket, das das Überlebensspiel von Grund auf erweitert. Bietet flugfähige Helikopter, robuste Wasserfahrzeuge, überarbeitete Navigationssysteme mit 3D-Map, ein modernes User Interface HUD sowie hunderte neue Handwerk-Rezepte.",
      imageBg: "from-red-700 to-rose-950",
      videoType: "dayz_zombies",
      origin: "Steam Workshop",
      rating: 4.9,
      fileSize: "1.2 GB",
      dependencies: ["CF - Community Framework"],
      defaultConfigs: {
        "EnableHelicopters": "1",
        "SurvivalWaterTicks": "25",
        "MapMarkersAllowed": "1",
        "EnableAirdrops": "1",
        "ZombieInfectionRate": "0.15"
      },
      previewImages: [
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1552055265-4f30c6a51cc7?w=600&auto=format&fit=crop&q=60"
      ],
      detailedFeatures: [
        "Voll spielbare Transportflugzeuge und Hubschrauber mit anpassbarer Steuerung und Schadensmodell.",
        "Fortschrittliche Karte mit weitreichenden 3D-Kompassmarkierungen zur besseren Truppenkoordination.",
        "Detaillierter Basenbau mit Wänden, Toren, Generatoren, elektronischen Schlössern und Einbruchschutz.",
        "Automatisierte Versorgungsabwürfe (Airdrops) an zufälligen Koordinaten zur Entfesselung von PvP-Events."
      ],
      verificationScore: 92,
      trustedHub: true
    },
    {
      id: "trader",
      name: "Trader System",
      version: "1.8.5",
      author: "DrJones",
      downloads: "650K",
      description: "Fügt sichere Zonen mit NPCs ein, um Waffen, Fahrzeuge und Vorräte zu handeln.",
      longDescription: "Gibt Administratoren die Macht, feste Safezones mit Händler-NPCs einzurichten. Beinhaltet ein voll konfigurierbares Wirtschaftssystem mit Ingame-Währung, dynamischen Preissteigerungen basierend auf Vorrat und Safezone-Kill-Schutz.",
      imageBg: "from-gray-750 to-neutral-900",
      videoType: "dayz_zombies",
      origin: "Steam Workshop",
      rating: 4.6,
      fileSize: "22 MB",
      dependencies: ["CF - Community Framework"],
      defaultConfigs: {
        "TraderSafeZoneRadius": "150",
        "TraderCurrencyType": "Coins",
        "StartingCapital": "100",
        "DynamicStockPricing": "true"
      },
      previewImages: [
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=60"
      ],
      detailedFeatures: [
        "Erstellung von sicheren Händlerzonen mit automatischen Gottmodus-Schutz gegen Griefing und Angriffe.",
        "Ausführliches Geldsystem mit Münzen oder Bankkonten für ein langlebiges Wirtschaftsfeeling.",
        "Simulierter NPC-Handel mit individuellen 3D-Körpern, eigenen Shopmenüs und Warengruppen.",
        "Dynamische Preisanpassung – knappe Ware wird teurer, während Massenware an Wert verliert."
      ],
      verificationScore: 89,
      trustedHub: true
    },
    {
      id: "cot",
      name: "Community Online Tools (COT)",
      version: "1.9.0",
      author: "Jacob_Mango",
      downloads: "1.2M",
      description: "Das ultimative Administrations- und Moderationswerkzeug für DayZ Server.",
      longDescription: "COT ist das meistgenutzte Ingame-Spielleiter-Tool für DayZ Server-Admins. Es erlaubt Live-Noclip, das Beleben von Spielern, Massen-Entfernung von Items, Spawn-Trigger für Autos, Zombies und Loot, sowie detaillierte Teleport-Wegpunkte.",
      imageBg: "from-indigo-600 to-indigo-950",
      videoType: "dayz_zombies",
      origin: "Steam Workshop",
      rating: 4.9,
      fileSize: "12 MB",
      dependencies: ["CF - Community Framework"],
      defaultConfigs: {
        "AdminLogInteractions": "1",
        "NoclipSpeedFactor": "1.5",
        "ShowGodModeBadge": "0",
        "AllowPlayerSelfRevive": "true"
      },
      previewImages: [
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=600&auto=format&fit=crop&q=60"
      ],
      detailedFeatures: [
        "Mächtiges administratives Overlay-Menü für Admins und Operators direkt im Live-Spiel.",
        "Echtzeit-Teleportation über Koordinateneingabe, Klick-auf-Karte oder Direktwahl von Spielerlisten.",
        "Schneller Item- und Fahrzeug-Spawner mit Konfiguratoren für Füllstände und Haltbarkeiten.",
        "Umfangreiches Logging-System – zeichnet alle administrativen Interaktionen in der Serverkonsole auf."
      ],
      verificationScore: 96,
      trustedHub: true
    }
  ],
  cs2: [
    {
      id: "metamod",
      name: "Metamod:Source CS2",
      version: "1.12.0",
      author: "AlliedModders",
      downloads: "450K",
      description: "Plugin-Manager und C++ Framework zur Integration von Servererweiterungen.",
      longDescription: "Metamod ist der offizielle Industriestandard zur API-Erweiterung für die Valve Source 2 Engine. Er erlaubt es, native C++ Bibliotheken im Hintergrund der Match-Simulation zu betreiben, um Server-Erweiterungen mit hoher Performance zu koordinieren.",
      imageBg: "from-slate-700 to-zinc-900",
      videoType: "cs2_practice",
      origin: "GitHub Releases",
      rating: 4.8,
      fileSize: "840 KB",
      dependencies: [],
      defaultConfigs: {
        "debug-level": "1",
        "load-plugins-async": "true",
        "allow-unsafe-cvars": "false"
      },
      previewImages: [
        "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60"
      ],
      detailedFeatures: [
        "Optimierter Hook-Mechanismus für Match-Ereignisse der Source 2 Engine ohne FPS-Einbußen.",
        "Zuverlässiger Boot-Manager für alle Servererweiterungen – lädt Plugins asynchron beim Konsolenstart.",
        "Eingebaute Schnittstelle zur Manipulation von gesperrten CVars für Turnierzwecke.",
        "Exzellentes Memory-Management und Schutz vor Serverabstürzen bei fehlerhaften Skripten."
      ],
      verificationScore: 99,
      trustedHub: true
    },
    {
      id: "matchzy",
      name: "MatchZy Matchmanager",
      version: "0.8.2",
      author: "Shb",
      downloads: "220K",
      description: "Kompetitives Matchmaking, Practice-Modus und Demo-Aufzeichnungs-Steuerelement.",
      longDescription: "MatchZy ist das fortschrittlichste Match-System für CS2 Server. Es simuliert Turniereinstellungen, koordiniert Knife-Rounds, regelt Backup-Restores bei Verbindungsabbrüchen, speichert Runden-Statistiken in SQLite und verwaltet das Team-Voting.",
      imageBg: "from-yellow-600 to-amber-950",
      videoType: "cs2_practice",
      origin: "GitHub Releases",
      rating: 4.9,
      fileSize: "1.8 MB",
      dependencies: ["metamod"],
      defaultConfigs: {
        "ready-percentage": "100",
        "knife-round-winner-decides": "true",
        "auto-record-demos": "true",
        "warmup-time-seconds": "120"
      },
      previewImages: [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1553481187-be93c21490a9?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=60"
      ],
      detailedFeatures: [
        "Automatischer Messerrunden-Koordinator (Knife Round) mit Seitenwechsel-Aufforderung.",
        "Integriertes Practice-System mit unbegrenzten Granaten, Flugmodus (.noclip) und Aufprall-Markierungen.",
        "Automatisierte GOTV-Aufzeichnungsverwaltung zur Aufbereitung von Server-Match-Demos (.dem).",
        "Robustes Pausensystem und Backup-Rundensicherung bei abrupten Serverplatzverlusten."
      ],
      verificationScore: 95,
      trustedHub: true
    }
  ],
  rust: [
    {
      id: "gathermanager",
      name: "Gather Manager",
      version: "2.1.0",
      author: "OxideTeam",
      downloads: "340K",
      description: "Erhöht die Ausbeute beim Abbauen von Rohstoffen wie Holz, Metall und Schwefel.",
      longDescription: "Gather Manager steuert prozentual die Ressourcenverteilung deines Rust-Servers. Perfekt zur Erstellung von 2x, 5x, 10x Loot-Servern. Admins können die Abbau-Multiplikatoren individuell für Stein, Schwefel, Metallerz, Holz und Fleisch definieren.",
      imageBg: "from-amber-700 to-orange-900",
      videoType: "rust_raid",
      origin: "CurseForge",
      rating: 4.7,
      fileSize: "15 KB",
      dependencies: ["Oxide Core Patch"],
      defaultConfigs: {
        "GatherRateStone": "2.0",
        "GatherRateWood": "2.0",
        "GatherRateSulfur": "3.0",
        "GatherRateMetal": "2.0"
      },
      previewImages: [
        "https://images.unsplash.com/photo-1444653300300-e9fac25f0a0d?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=60"
      ],
      detailedFeatures: [
        "Modifikator für Abbauraten pro Einheit (Holz abreißen, Steine schlagen, Tiere ausnehmen).",
        "Individuelle Deklarierung von Loot-Multiplikatoren für seltene Rohstoffe wie Schwefelerz.",
        "Volle Oxide-Schnittstellenintegration, dadurch Echtzeit-Hotloading im laufenden Spiel.",
        "Erhöhte Transportstapel (Stacks) zur Anpassung an die gesteigerten Sammelgrenzen."
      ],
      verificationScore: 91,
      trustedHub: false
    }
  ]
};

export default function ServerModsManager({ server, onClose, onAddConsoleLog, onSaveConfig }: ServerModsManagerProps) {
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<"mods" | "files">("mods");
  const [viewMode, setViewMode] = useState<"list" | "gallery">("gallery");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  // Mod-related states
  const [modSearch, setModSearch] = useState("");
  const [modsList, setModsList] = useState<ServerMod[]>([]);
  const [selectedMod, setSelectedMod] = useState<ServerMod | null>(null);
  const [installingModId, setInstallingModId] = useState<string | null>(null);
  const [installStep, setInstallStep] = useState("");
  const [installProgress, setInstallProgress] = useState(0);
  const [installedModIds, setInstalledModIds] = useState<string[]>([]);
  const [isLoadingLiveMods, setIsLoadingLiveMods] = useState(false);
  
  // Custom multi-source registry selectors: CurseForge, Steam Workshop, Modrinth, etc.
  const [selectedRegistry, setSelectedRegistry] = useState<string>("All");

  // Selected Spielversion (Game Version) to filter/search mods for
  const [selectedVersion, setSelectedVersion] = useState<string>("All");

  useEffect(() => {
    if (server && server.version) {
      setSelectedVersion(server.version);
    }
  }, [server.id, server.version]);
  
  // Mod Updater and Version Alignment states
  const [updatingModId, setUpdatingModId] = useState<string | null>(null);
  const [updateProgress, setUpdateProgress] = useState<number | null>(null);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [isAligning, setIsAligning] = useState(false);

  // Simulated Video Player status
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [simulatedVideoText, setSimulatedVideoText] = useState("");
  const [videoTick, setVideoTick] = useState(0);
  const [isMaximized, setIsMaximized] = useState(false);

  // Mod config overriding states
  const [modConfigInputs, setModConfigInputs] = useState<Record<string, string>>({});

  // File-related states
  const [filesList, setFilesList] = useState<ServerFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ServerFile | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [isEditingFile, setIsEditingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Expanded Folders layout state
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Visual Form & Datatype configuration states
  const [editorMode, setEditorMode] = useState<"code" | "visual">("code");
  const [visualConfigData, setVisualConfigData] = useState<{key: string; value: any; type: "boolean"|"number"|"text"; originalSeparator?: string}[]>([]);
  const [newParamKey, setNewParamKey] = useState("");
  const [newParamVal, setNewParamVal] = useState("");
  const [newParamType, setNewParamType] = useState<"text" | "boolean" | "number">("text");

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderPath]: !prev[folderPath] }));
  };

  useEffect(() => {
    if (filesList.length > 0) {
      const autoExpand: Record<string, boolean> = {};
      filesList.forEach((file) => {
        const parts = file.path.split(/[/\\]/);
        if (parts.length > 1) {
          let accumulated = "";
          for (let i = 0; i < parts.length - 1; i++) {
            accumulated = accumulated ? `${accumulated}/${parts[i]}` : parts[i];
            autoExpand[accumulated] = true;
          }
        }
      });
      setExpandedFolders(prev => ({ ...autoExpand, ...prev }));
    }
  }, [filesList]);

  // Notification states
  const [notification, setNotification] = useState<{ message: string; isError?: boolean } | null>(null);

  useEffect(() => {
    fetchInstalledModsAndFiles();
  }, [server.id]);

  const showNotification = (message: string, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 4000);
  };

  const buildFolderTree = (files: ServerFile[]) => {
    const root: Record<string, any> = {};

    for (const file of files) {
      if (!file.path) continue;
      const parts = file.path.split(/[/\\]/);
      let currentLevel = root;
      let accumulatedPath = "";

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part;
        const isLast = i === parts.length - 1;

        if (isLast) {
          currentLevel[part] = {
            name: part,
            path: file.path,
            isDirectory: false,
            file: file,
          };
        } else {
          if (!currentLevel[part]) {
            currentLevel[part] = {
              name: part,
              path: accumulatedPath,
              isDirectory: true,
              children: {},
            };
          }
          currentLevel = currentLevel[part].children;
        }
      }
    }
    return root;
  };

  // Parser, Synchronizer, and Visual Configuration Helpers
  const handleParseVisualConfig = (contentStr: string, fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    if (ext === "json") {
      try {
        const parsed = JSON.parse(contentStr);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const list = Object.entries(parsed).map(([key, val]) => {
            let type: "boolean"|"number"|"text" = "text";
            if (typeof val === "boolean") type = "boolean";
            else if (typeof val === "number") type = "number";
            return { key, value: val, type };
          });
          setVisualConfigData(list);
          return;
        }
      } catch (e) {}
    } else if (["properties", "cfg", "conf", "config", "ini"].includes(ext)) {
      const lines = contentStr.split("\n");
      const list: any[] = [];
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith(";")) return;
        const idx = trimmed.indexOf("=");
        const idxColon = trimmed.indexOf(":");
        let splitChar = "";
        let pivotIdx = -1;
        if (idx !== -1 && (idxColon === -1 || idx < idxColon)) {
          splitChar = "=";
          pivotIdx = idx;
        } else if (idxColon !== -1) {
          splitChar = ":";
          pivotIdx = idxColon;
        }
        
        if (pivotIdx !== -1) {
          const k = trimmed.substring(0, pivotIdx).trim();
          const vRaw = trimmed.substring(pivotIdx + 1).trim();
          let v = vRaw;
          if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
            v = v.substring(1, v.length - 1);
          }
          
          let type: "boolean"|"number"|"text" = "text";
          if (v.toLowerCase() === "true" || v.toLowerCase() === "false") {
            type = "boolean";
          } else if (!isNaN(Number(v)) && v !== "") {
            type = "number";
          }
          list.push({ key: k, value: v, type, originalSeparator: splitChar });
        }
      });
      setVisualConfigData(list);
      return;
    }
    setVisualConfigData([]);
  };

  const handleUpdateVisualValue = (idx: number, newVal: any) => {
    const list = [...visualConfigData];
    list[idx].value = newVal;
    setVisualConfigData(list);

    // Sync state visual values back to raw editorText representation layout dynamically
    const fileType = selectedFile?.name.split(".").pop()?.toLowerCase() || "";
    if (fileType === "json") {
      try {
        const obj: Record<string, any> = {};
        list.forEach((item) => {
          let finalVal = item.value;
          if (item.type === "boolean") {
            finalVal = item.value === true || item.value === "true";
          } else if (item.type === "number") {
            finalVal = Number(item.value);
          }
          obj[item.key] = finalVal;
        });
        setEditorContent(JSON.stringify(obj, null, 2));
      } catch (err) {}
    } else {
      const lines = editorContent.split("\n");
      const updatedLines = lines.map((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith(";")) return line;
        
        const idxEq = trimmed.indexOf("=");
        const idxCol = trimmed.indexOf(":");
        let pivot = -1;
        if (idxEq !== -1 && (idxCol === -1 || idxEq < idxCol)) pivot = idxEq;
        else if (idxCol !== -1) pivot = idxCol;

        if (pivot !== -1) {
          const k = trimmed.substring(0, pivot).trim();
          const item = list.find((it) => it.key === k);
          if (item) {
            const separator = item.originalSeparator || "=";
            return `${item.key}${separator}${item.value}`;
          }
        }
        return line;
      });
      setEditorContent(updatedLines.join("\n"));
    }
  };

  const handleAddVisualParam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParamKey.trim() || !selectedFile) return;

    let parsedVal: any = newParamVal;
    if (newParamType === "boolean") {
      parsedVal = newParamVal.toLowerCase() === "true" || newParamVal === "1";
    } else if (newParamType === "number") {
      parsedVal = Number(newParamVal) || 0;
    }

    const newItem = {
      key: newParamKey.trim(),
      value: parsedVal,
      type: newParamType,
      originalSeparator: "="
    };

    const updatedList = [...visualConfigData, newItem];
    setVisualConfigData(updatedList);
    setNewParamKey("");
    setNewParamVal("");

    // Sync newly added visual item back to editor state
    const fileType = selectedFile.name.split(".").pop()?.toLowerCase() || "";
    if (fileType === "json") {
      try {
        const obj: Record<string, any> = {};
        updatedList.forEach((item) => {
          let finalVal = item.value;
          if (item.type === "boolean") {
            finalVal = item.value === true || item.value === "true";
          } else if (item.type === "number") {
            finalVal = Number(item.value);
          }
          obj[item.key] = finalVal;
        });
        setEditorContent(JSON.stringify(obj, null, 2));
      } catch (err) {}
    } else {
      // For properties format, simply append a new line at the end
      const appended = editorContent.trim() + `\n${newItem.key}=${newItem.value}\n`;
      setEditorContent(appended);
    }
    showNotification(`Parameter '${newItem.key}' hinzugefügt! Speichern Sie, um zu schreiben.`);
  };

  const handleDeletePath = async (pathToDelete: string, isDirectory: boolean) => {
    const typeLabel = isDirectory ? "das Verzeichnis" : "die Datei";
    if (!window.confirm(`Möchten Sie ${typeLabel} '${pathToDelete}' wirklich dauerhaft vom Server löschen? Dieser Vorgang ist unumkehrbar.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/servers/${server.id}/files?filename=${encodeURIComponent(pathToDelete)}`, {
        method: "DELETE"
      });

      if (res.ok) {
        showNotification(`${isDirectory ? "Verzeichnis" : "Datei"} erfolgreich gelöscht.`, false);
        if (selectedFile?.path === pathToDelete) {
          setSelectedFile(null);
          setEditorContent("");
        }
        await fetchInstalledModsAndFiles();
      } else {
        const errData = await res.json();
        showNotification(`Löschen fehlgeschlagen: ${errData.error || "Unbekannter Fehler"}`, true);
      }
    } catch (err) {
      showNotification("Netzwerkfehler beim Löschen", true);
    }
  };

  const fetchInstalledModsAndFiles = async () => {
    try {
      // Fetch files from server API
      const resFiles = await fetch(`/api/servers/${server.id}/files`);
      if (resFiles.ok) {
        const filesData = await resFiles.json();
        setFilesList(filesData);
        if (filesData.length > 0 && !selectedFile) {
          setSelectedFile(filesData[0]);
          setEditorContent(filesData[0].content);
        }
      }

      // Fetch mods
      const resMods = await fetch(`/api/servers/${server.id}/mods`);
      if (resMods.ok) {
        const installedModsIds: string[] = await resMods.json();
        setInstalledModIds(installedModsIds);

        const baseMods = PRESET_MODS_RICH[server.game] || PRESET_MODS_RICH["minecraft"]; // Fallback to MC mods

        const initializedMods = baseMods.map((bm) => ({
          ...bm,
          installed: installedModsIds.includes(bm.id)
        })) as ServerMod[];

        // Only overwrite local list if search query is empty
        if (!modSearch.trim()) {
          setModsList(initializedMods);
          if (initializedMods.length > 0 && !selectedMod) {
            handleSelectMod(initializedMods[0]);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching mods and files", err);
    }
  };

  const handleSelectMod = (mod: ServerMod) => {
    setSelectedMod(mod);
    setModConfigInputs({ ...mod.defaultConfigs });
    setIsPlayingVideo(false);
  };

  // Helper to check version compatibility between server and mod supported list
  const isVersionCompatible = (srvVer: string, modVers?: string[]) => {
    if (!modVers || modVers.length === 0) return true;
    if (srvVer === "Updated (Latest)" || srvVer === "1.0.0-Docker" || srvVer === "latest") return true;
    
    return modVers.some((v) => {
      if (v === srvVer) return true;
      if (srvVer.startsWith(v) || v.startsWith(srvVer)) return true;
      return false;
    });
  };

  // One-click server versions alignment action
  const handleAlignServerVersion = async (targetVersion: string) => {
    setIsAligning(true);
    showNotification(`Passe Server-Version von '${server.version}' auf '${targetVersion}' an...`);
    if (onAddConsoleLog) {
      onAddConsoleLog(`[Compat Engine] Initializing versions align lookup. Aligned server.version to -> ${targetVersion}.`, "warn");
    }

    try {
      const updatedServer = { ...server, version: targetVersion };
      const res = await fetch(`/api/servers/${server.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedServer)
      });
      if (!res.ok) throw new Error("Fehler beim Aktualisieren der Server-Version");
      
      showNotification(`Server-Version wurde auf ${targetVersion} angepasst! Konfiguriere Container...`);
      
      // Update template state callback
      if (onSaveConfig) {
        onSaveConfig(server.id, { version: targetVersion });
      }

      // Simulate a docker daemon rebuild
      await fetch(`/api/servers/${server.id}/update`, { method: "POST" });
      if (onAddConsoleLog) {
        onAddConsoleLog(`[Compat Engine] Server successfully updated to version ${targetVersion}. Reboot scheduled.`, "info");
      }

      showNotification(`Server-Version wurde erfolgreich an '${targetVersion}' angeglichen!`, false);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      showNotification(err.message || "Fehler bei der Versions-Synchronisation", true);
    } finally {
      setIsAligning(false);
    }
  };

  // Individual Mod Updater with dynamic countdown timer of state sequences
  const handleUpdateMod = async (mod: ServerMod) => {
    setUpdatingModId(mod.id);
    setUpdateProgress(0);
    if (onAddConsoleLog) {
      onAddConsoleLog(`[Mod Updater] Fetching online repository update for mod ID: ${mod.id}...`, "info");
    }

    const interval = setInterval(() => {
      setUpdateProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 150);

    try {
      const res = await fetch(`/api/servers/${server.id}/mods/${mod.id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latestVersion: mod.latestVersion })
      });
      if (!res.ok) throw new Error("Mod-Update Netzwerkfehler");
      
      await new Promise((resolve) => setTimeout(resolve, 800));

      showNotification(`Mod '${mod.name}' wurde erfolgreich auf Version ${mod.latestVersion || "Latest"} aktualisiert!`, false);
      if (onAddConsoleLog) {
        onAddConsoleLog(`[Mod Updater] Successfully applied file patches. Mod '${mod.id}' is now on v${mod.latestVersion || "v2.2.0"}.`, "info");
      }

      setModsList((prev) =>
        prev.map((m) =>
          m.id === mod.id
            ? { ...m, version: m.latestVersion || "Latest", updateAvailable: false }
            : m
        )
      );

      if (selectedMod?.id === mod.id) {
        setSelectedMod((prev) =>
          prev
            ? { ...prev, version: prev.latestVersion || "Latest", updateAvailable: false }
            : null
        );
      }

    } catch (err: any) {
      showNotification(err.message || "Fehler beim Mod-Update", true);
    } finally {
      clearInterval(interval);
      setUpdatingModId(null);
      setUpdateProgress(null);
    }
  };

  // Full Out-Of-The-Box Bulk Mod Update system action
  const handleUpdateAllMods = async () => {
    const upgradableMods = modsList.filter((m) => m.installed && m.updateAvailable);
    if (upgradableMods.length === 0) {
      showNotification("Alle installierten Modifikationen sind bereits auf dem neuesten Stand!");
      return;
    }

    setIsUpdatingAll(true);
    showNotification(`Starte automatische Bulk-Aktualisierung von ${upgradableMods.length} Mods...`);
    if (onAddConsoleLog) {
      onAddConsoleLog(`[Mod Bulk-Updater] Starting automated sequence for ${upgradableMods.length} out-of-date mods...`, "warn");
    }

    for (const mod of upgradableMods) {
      await handleUpdateMod(mod);
    }

    setIsUpdatingAll(false);
    showNotification("Alle Mods wurden erfolgreich im Hintergrund aktualisiert!", false);
    if (onAddConsoleLog) {
      onAddConsoleLog(`[Mod Bulk-Updater] Bulk sequence completed. All active plugins are synchronized.`, "info");
    }
  };

  // Dynamic live search for Mods via Modrinth / GitHub / CurseForge / Steam Workshop with debounce support
  useEffect(() => {
    const query = modSearch.toLowerCase().trim();
    const baseMods = PRESET_MODS_RICH[server.game] || PRESET_MODS_RICH["minecraft"];

    // Filter local presets by registry and game version selection
    const filterLocalRegistryAndVersion = (m: ServerMod) => {
      const matchRegistry = selectedRegistry === "All" || m.origin === selectedRegistry;
      if (!matchRegistry) return false;
      if (selectedVersion === "All") return true;
      const modCompatVers = m.compatibleVersions || (server.game === "minecraft" ? ["1.20.4", "1.20.1"] : ["1.24", "1.25"]);
      return isVersionCompatible(selectedVersion, modCompatVers);
    };

    if (!query) {
      const initialized = baseMods.filter(filterLocalRegistryAndVersion).map((bm) => ({
        ...bm,
        installed: installedModIds.includes(bm.id),
        // Inject mock compat values for presets if missing
        compatibleVersions: bm.compatibleVersions || (server.game === "minecraft" ? ["1.20.4", "1.20.1"] : ["1.24", "1.25"]),
        latestVersion: bm.latestVersion || bm.version,
        updateAvailable: bm.updateAvailable !== undefined ? bm.updateAvailable : (bm.id === "essentialsx" || bm.id === "trader" ? false : true)
      })) as ServerMod[];
      setModsList(initialized);
      return;
    }

    const filteredLocal = baseMods.filter(filterLocalRegistryAndVersion).filter(
      (m) => m.name.toLowerCase().includes(query) || m.description.toLowerCase().includes(query)
    ).map((bm) => ({
      ...bm,
      installed: installedModIds.includes(bm.id),
      compatibleVersions: bm.compatibleVersions || (server.game === "minecraft" ? ["1.20.4", "1.20.1"] : ["1.24", "1.25"]),
      latestVersion: bm.latestVersion || bm.version,
      updateAvailable: bm.updateAvailable !== undefined ? bm.updateAvailable : true
    })) as ServerMod[];

    setIsLoadingLiveMods(true);

    const delayDebounce = setTimeout(() => {
      fetch(`/api/mods/search?game=${encodeURIComponent(server.game)}&query=${encodeURIComponent(query)}&registry=${selectedRegistry}&version=${selectedVersion}`)
        .then((res) => {
          if (!res.ok) throw new Error("Search mods network error");
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            const externalResults = data.map((item) => ({
              ...item,
              installed: installedModIds.includes(item.id)
            })) as ServerMod[];

            // Merge local & external without duplicates
            const merged = [...filteredLocal];
            externalResults.forEach((ext) => {
              if (!merged.some((m) => m.id === ext.id)) {
                merged.push(ext);
              }
            });

            setModsList(merged);
            if (merged.length > 0 && (!selectedMod || !merged.some((m) => m.id === selectedMod.id))) {
              handleSelectMod(merged[0]);
            }
          }
        })
        .catch((err) => {
          console.error("Dynamic web mods look up failed:", err);
          setModsList(filteredLocal);
        })
        .finally(() => setIsLoadingLiveMods(false));
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [modSearch, installedModIds, server.game, selectedRegistry, selectedVersion]);

  // Procedural ASCII Gameplay video simulation ticker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingVideo && selectedMod) {
      interval = setInterval(() => {
        setVideoTick((v) => v + 1);
        const cycle = videoTick % 5;

        if (selectedMod.videoType === "mc_build") {
          const frames = [
            `[RENDER] WorldEdit brush selected: sphere (radius 5)\n[GRID] Coordinates: X:102, Y:64, Z:-309\n[WORLD] Modifying player active volume chunks...\n\n   ███████\n  █████████\n  ██   ████\n   ███████\n\n[SUCCESS] 2,450 blocks placed by brush action (took 4ms).`,
            `[DYNMAP] Rendering web map viewport zoom factor 3...\n[RENDER] Layer-0 static terrain layout caching.\n\n   ░░░░░░░░\n   ▒▒▒▒▒▒▒▒  [Spawning player: Operator]\n   ▓▓▓▓▓▓▓▓\n\n[STATUS] Map frame successfully written to dynmap_web.bin.`,
            `[SECURITY] Verification of WorldEdit dependencies...\n[OK] Core permissions resolved with standard luckperms rule file.\n\n   [ADMIN_CHECK] Key validated.\n   [DOCKER] Container is healthy.`,
            `[ENGINE] Re-building chunks for WorldEdit operation ID #92\n[WORLD] Undo memory buffered size: 4.1MB.\n\n   ▄▄▄▄▄\n   █   █\n   ▀▀▀▀▀\n\n[INFO] Minecraft Spigot Paper thread is running at stable 20.0 TPS.`
          ];
          setSimulatedVideoText(frames[cycle % frames.length]);
        } else if (selectedMod.videoType === "dayz_zombies") {
          const frames = [
            `[DAYZ WORKSPACE] Compiling community Online Tools scripts...\n[GRID] Spawning Zombie_Spawn_Event in Chernarusplus.\n\n   ▲ (Hostile) - Distance 42m\n   ▲ (Hostile) - Distance 89m\n\n[RADAR] Active players tracked: 4/40 in SafeZone.`,
            `[HELI_ENGINE] Client initialized DayZ-Expansion helicopter prefab.\n[PHYSICS] Rotor angular speed limits: 340rad/s\n\n     _██_ [Helicopter]\n   ===============   \n\n[LOG] Sound package loaded successfully. Flying over Balota.`,
            `[TRADER] safezone initialized at Grid Coordinates [2240; 8920]\n[NPC] trader DrJones spawned near warehouse cabin.\n\n   [NPC] DrJones: "Welcome survivor, let's trade."\n   [COIN_ENGINE] Balance loaded -> 150 gold coins.`
          ];
          setSimulatedVideoText(frames[cycle % frames.length]);
        } else if (selectedMod.videoType === "cs2_practice") {
          const frames = [
            `[METAMOD] Executing game/addons/matchzy.so...\n[READY] Matchmanager ready for competitive layout.\n\n   * KNIFE ROUND ACTIVE *\n   [TEAM A] >>> MATCHZY READY <<<\n\n[SERVER] Match is starting in 3 seconds. sv_cheats reset to 0.`,
            `[PRACTICE] Anti-Cheat counterspy checking client aim coordinates.\n[AIMTRACK] Trace-Check for bullet ID #4492: Perfect Recoil Sync.\n\n   +-------------+\n   |     [+]     |\n   +-------------+\n\n[SUCCESS] sv_cheats warning logs clean.`
          ];
          setSimulatedVideoText(frames[cycle % frames.length]);
        } else {
          const frames = [
            `[DYNAMIC PIPELINE] Workshop telemetry initialized.\n[STREAM] Loading third-party dependencies dynamically...\n\n   [====>       ] 32%\n   [=========>  ] 68%\n\n[CONTAINER] Allocated Host resource mapping verified.`,
            `[SYSTEM] Dynamic sandbox configuration compiled.\n[LOG] Mod runtime initialized correctly with Docker environment v${selectedMod.version}.\n\n   STATUS: STABLE_ACTIVE\n\n[OK] All system integrity checks passed successfully.`
          ];
          setSimulatedVideoText(frames[cycle % frames.length]);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingVideo, videoTick, selectedMod]);

  const handleInstallMod = async (mod: ServerMod) => {
    setInstallingModId(mod.id);
    setInstallProgress(10);
    setInstallStep("Verbinde mit Steam Workshop API / Public Repository...");

    const steps = [
      { progress: 25, label: `Kontaktiere Client-Schnittstelle (${mod.origin}) und lade Metaschnittstelle...` },
      { progress: 50, label: `Lade ZIP-Archiv von ${mod.origin} CDN herunter...` },
      { progress: 75, label: "Entpacke modifiziertes Archiv in das Docker-Volume Wurzelverzeichnis..." },
      { progress: 90, label: "Erstelle Konfigurations-mappings und deklariere Config-Datei..." },
      { progress: 100, label: "Patch erfolgreich in Container eingepflegt." }
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setInstallProgress(step.progress);
      setInstallStep(step.label);
    }

    try {
      const res = await fetch(`/api/servers/${server.id}/mods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modId: mod.id, modName: mod.name })
      });

      if (res.ok) {
        showNotification(`Mod '${mod.name}' erfolgreich installiert!`, false);

        // Bootstrap the file manager automatically with default configurations!
        const fileContent = `# Auto-generiert für Modifikation: ${mod.name}\n# Autor: ${mod.author} | Herkunft: ${mod.origin}\n\n` + 
          Object.entries(mod.defaultConfigs).map(([key, val]) => `${key}=${val}`).join("\n") + "\n";
        
        await fetch(`/api/servers/${server.id}/files`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: `${mod.id}_config.properties`,
            content: fileContent
          })
        });

        if (onAddConsoleLog) {
          onAddConsoleLog(`[Workshop Engine] Mod ${mod.name} (v${mod.version}) has been deployed to container folders.`, "info");
          onAddConsoleLog(`[File Manager] Auto-generated /volumes/${server.id}/${mod.id}_config.properties.`, "info");
          onAddConsoleLog(`[Docker Volume] Updated mods/installed_list.json to resolve steam ID ${mod.id}.`, "info");
        }

        await fetchInstalledModsAndFiles();
        // Update selected mod
        const updatedMod = { ...mod, installed: true };
        setSelectedMod(updatedMod);
      } else {
        showNotification("Installation fehlgeschlagen.", true);
      }
    } catch (err) {
      showNotification("Schnittstellenfehler bei Modinstallation", true);
    } finally {
      setInstallingModId(null);
    }
  };

  const handleUninstallMod = async (mod: ServerMod) => {
    if (!confirm(`Möchten Sie '${mod.name}' wirklich entfernen? Alle Konfigurationen dieser Mod gehen verloren.`)) return;

    try {
      const res = await fetch(`/api/servers/${server.id}/mods/${mod.id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        showNotification(`Mod '${mod.name}' deinstalliert.`, false);

        if (onAddConsoleLog) {
          onAddConsoleLog(`[Workshop Engine] Mod '${mod.name}' uninstalled. Cleared assets directories.`, "warn");
        }

        await fetchInstalledModsAndFiles();
        const updatedMod = { ...mod, installed: false };
        setSelectedMod(updatedMod);
      } else {
        showNotification("Deinstallation fehlgeschlagen.", true);
      }
    } catch (err) {
      showNotification("Schnittstellenfehler beim Entfernen der Mod", true);
    }
  };

  // Directly handle manual config parameters inside Mod details panel
  const handleSaveModConfigInputs = async () => {
    if (!selectedMod) return;

    const fileContent = `# Mod-Konfiguration: ${selectedMod.name}\n# Manuell konfiguriert am ${new Date().toLocaleDateString("de-DE")}\n# Herkunft: ${selectedMod.origin}\n\n` + 
      Object.entries(modConfigInputs).map(([key, val]) => `${key}=${val}`).join("\n") + "\n";

    try {
      const res = await fetch(`/api/servers/${server.id}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: `${selectedMod.id}_config.properties`,
          content: fileContent
        })
      });

      if (res.ok) {
        showNotification(`Datei '${selectedMod.id}_config.properties' aktualisiert!`, false);
        if (onAddConsoleLog) {
          onAddConsoleLog(`[Mod Configuration Override] Parameter block rewritten for ${selectedMod.name}.`, "info");
        }
        await fetchInstalledModsAndFiles();
      } else {
        showNotification("Konnte Konfiguration nicht in Config-Datei schreiben.", true);
      }
    } catch (err) {
      showNotification("Fehler beim Sichern der Mod-Parameter.", true);
    }
  };

  // Dateimanager actions
  const handleSelectFile = (file: ServerFile) => {
    setSelectedFile(file);
    setEditorContent(file.content);
    setIsEditingFile(false);
    
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const isConfigurable = ["json", "properties", "cfg", "conf", "config", "ini", "yml", "yaml"].includes(ext);
    if (isConfigurable) {
      handleParseVisualConfig(file.content, file.name);
    } else {
      setEditorMode("code");
    }
  };

  const handleSaveFileContent = async () => {
    if (!selectedFile) return;
    setIsEditingFile(true);

    try {
      const res = await fetch(`/api/servers/${server.id}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selectedFile.path,
          content: editorContent
        })
      });

      if (res.ok) {
        showNotification(`Datei '${selectedFile.name}' erfolgreich gespeichert!`, false);

        setFilesList((prev) =>
          prev.map((f) => (f.path === selectedFile.path ? { ...f, content: editorContent, size: `${Math.round(editorContent.length / 10.24) / 100} KB` } : f))
        );

        if (onAddConsoleLog) {
          onAddConsoleLog(`[Config Monitor] File '/volumes/${server.id}/${selectedFile.path}' rewritten by super admin.`, "warn");
          onAddConsoleLog(`[Docker Daemon] Hot-reloaded game configuration mappings.`, "info");
        }
      } else {
        showNotification("Speichern fehlgeschlagen.", true);
      }
    } catch (err) {
      showNotification("Dateiverbindungsfehler beim Speichern", true);
    } finally {
      setIsEditingFile(false);
    }
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    let name = newFileName.trim();
    if (!name.includes(".")) name += ".txt";

    try {
      const res = await fetch(`/api/servers/${server.id}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: name,
          content: `# Generierte Konfigurationsdatei für ${server.name}\n# Angelegt am ${new Date().toLocaleDateString("de-DE")}\n\nactive=true\n`
        })
      });

      if (res.ok) {
        showNotification(`Datei '${name}' angelegt.`, false);
        setNewFileName("");
        setShowNewFileDialog(false);
        await fetchInstalledModsAndFiles();
      } else {
        showNotification("Konnte Datei nicht anlegen.", true);
      }
    } catch (err) {
      showNotification("Netzwerkfehler bei Dateierstellung", true);
    }
  };

  // Drag & drop file uploads
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await uploadFileObject(file);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await uploadFileObject(file);
    }
  };

  const uploadFileObject = async (file: File) => {
    setIsUploading(true);
    showNotification(`Lade '${file.name}' auf den Host hoch...`);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string || "";

      try {
        const res = await fetch(`/api/servers/${server.id}/files`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            content: text
          })
        });

        if (res.ok) {
          showNotification(`Erfolgreich hochgeladen: '${file.name}'`, false);

          if (onAddConsoleLog) {
            onAddConsoleLog(`[File Uploader] Uploaded binary/text mod: '${file.name}' (${Math.round(file.size / 1024)} KB) into host storage.`, "info");
          }

          await fetchInstalledModsAndFiles();
        } else {
          showNotification("Upload fehlgeschlagen.", true);
        }
      } catch (err) {
        showNotification("Verbindungsfehler bei Upload", true);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const renderDetailedWorkspace = (selectedMod: ServerMod) => {
    const currentTemplate = GAME_TEMPLATES.find(t => t.gameKey === server.game);

    return (
      <div className="space-y-6">
        
        {/* Carousel / Graphic Header Frame */}
        <div className="relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-850 h-72 md:h-80 flex flex-col group/carousel shadow-inner">
          {selectedMod.previewImages && selectedMod.previewImages.length > 0 ? (
            <div className="relative flex-1 w-full bg-black flex items-center justify-center">
              <img
                src={selectedMod.previewImages[selectedImageIndex] || selectedMod.previewImages[0]}
                alt={`Preview screenshot ${selectedImageIndex}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all"
              />
              
              {/* Carousel Controls */}
              {selectedMod.previewImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(prev => 
                        prev === 0 ? selectedMod.previewImages.length - 1 : prev - 1
                      );
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/75 hover:bg-black border border-white/10 text-white cursor-pointer hover:scale-105 transition-all opacity-0 group-hover/carousel:opacity-100"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(prev => 
                        prev === selectedMod.previewImages.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/75 hover:bg-black border border-white/10 text-white cursor-pointer hover:scale-105 transition-all opacity-0 group-hover/carousel:opacity-100"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Image index overlay */}
              <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md border border-neutral-805 text-white font-mono text-[9px] px-2.5 py-1 rounded-full uppercase">
                Screenshot {selectedImageIndex + 1} / {selectedMod.previewImages.length}
              </div>

              {selectedMod.trustedHub && (
                <div className="absolute top-3 right-3 bg-indigo-600 border border-indigo-400 text-white font-bold font-mono text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 h-3 text-white" /> TRUSTED SOURCE
                </div>
              )}
            </div>
          ) : (
            <div className={`flex-1 w-full bg-gradient-to-br ${selectedMod.imageBg} flex flex-col items-center justify-center p-6 text-center border-b border-neutral-800`}>
              <span className="text-white font-black uppercase text-sm tracking-widest">{selectedMod.id}</span>
              <span className="text-white/60 text-xxs mt-1 font-mono uppercase">Keine Screenshots vorhanden</span>
            </div>
          )}

          {/* Graphic Footer thumbnail bar */}
          {selectedMod.previewImages && selectedMod.previewImages.length > 0 && (
            <div className="bg-neutral-950 px-4 py-2 border-t border-neutral-850 flex items-center justify-between gap-4">
              <div className="flex gap-2">
                {selectedMod.previewImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-12 h-8 rounded border overflow-hidden transition-all duration-200 ${
                      selectedImageIndex === idx
                        ? "border-indigo-500 scale-105 ring-1 ring-indigo-505"
                        : "border-neutral-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
              <span className="bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono text-[10px] px-2 py-0.5 rounded uppercase">
                {selectedMod.origin} HUB
              </span>
            </div>
          )}
        </div>

        {/* Textual Details and metadata card */}
        <div className="bg-[#121216] border border-[#24242a] rounded-xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-850 pb-3 gap-2">
            <div>
              <span className="text-[10px] font-mono tracking-wider bg-indigo-950 text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded font-bold uppercase">
                Mod Version {selectedMod.version}
              </span>
              <h3 className="text-base font-black text-white mt-1.5 tracking-wide leading-none">{selectedMod.name}</h3>
            </div>
            
            <div className="flex items-center gap-3.5 text-[10px] font-mono text-neutral-450 self-start md:self-auto">
              <span>Autor: <strong className="text-neutral-300">{selectedMod.author}</strong></span>
              <span>•</span>
              <span>Downloads: <strong className="text-neutral-300">{selectedMod.downloads}</strong></span>
              <span>•</span>
              <span>Größe: <strong className="text-neutral-300">{selectedMod.fileSize}</strong></span>
            </div>
          </div>

          <p className="text-xs text-neutral-300 leading-normal font-sans">
            {selectedMod.longDescription || selectedMod.description}
          </p>

          {/* Bulleted detailedFeatures representation */}
          {selectedMod.detailedFeatures && selectedMod.detailedFeatures.length > 0 && (
            <div className="pt-2">
              <span className="text-xxs font-bold uppercase tracking-wider text-neutral-450 block mb-2.5">
                Funktionsumfang & Systemmodifikation
              </span>
              <ul className="space-y-2">
                {selectedMod.detailedFeatures.map((feat, idx) => (
                  <li key={idx} className="text-xxs text-neutral-400 flex items-start gap-2">
                    <span className="text-indigo-500 font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedMod.dependencies && selectedMod.dependencies.length > 0 && (
            <div className="pt-3 border-t border-neutral-850 text-xxs flex items-center gap-2">
              <span className="text-neutral-550 font-bold uppercase font-mono">Erforderte Abhängigkeiten:</span>
              <div className="flex gap-1.5 flex-wrap">
                {selectedMod.dependencies.map(dep => (
                  <span key={dep} className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-2.5 py-0.5 rounded font-mono text-xxs">{dep}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Game-Template alignment metrics board */}
        {currentTemplate && (
          <div className="bg-[#121216] border border-[#24242a] rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-850 pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span className="text-xxs font-bold uppercase tracking-wider text-white">Game-Template Match & Ressourcen</span>
              </div>
              <span className="text-[10px] bg-emerald-950/40 text-emerald-400 font-mono border border-emerald-900/30 px-2 py-0.5 rounded leading-none font-bold">
                Umfeld Kompatibel
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Template Match Details */}
              <div className="space-y-1.5">
                <p className="text-neutral-500 font-mono text-[10px] uppercase">Zugeordnetes Docker-Template</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl leading-none">{currentTemplate.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{currentTemplate.name}</p>
                    <p className="text-[9px] text-neutral-500 font-mono truncate">{currentTemplate.defaultImage}</p>
                  </div>
                </div>
              </div>

              {/* RAM Allocation Check */}
              <div className="space-y-1.5 md:border-l md:border-neutral-850 md:pl-4">
                <p className="text-neutral-500 font-mono text-[10px] uppercase">Arbeitsspeicher-Check</p>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-neutral-400">Erfordert:</span>
                  <span className="text-indigo-400 font-bold">{currentTemplate.recommendedRam} MB RAM</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-neutral-400">Server-Zuweisung:</span>
                  <span className="text-emerald-400 font-bold">{server.maxMemory || "8192"} MB (OK)</span>
                </div>
              </div>
            </div>

            {/* Verification details */}
            <div className="bg-neutral-900/40 border border-neutral-850 rounded-lg p-3 text-[10px] text-neutral-400 space-y-2">
              <div className="flex justify-between items-center text-xxxs text-indigo-455 font-mono uppercase">
                <span>Sicherheits- & Integritäts-Score:</span>
                <span className="font-bold text-xs text-indigo-400">{selectedMod.verificationScore || 90} / 100</span>
              </div>
              <div className="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    (selectedMod.verificationScore || 90) >= 95 
                      ? "bg-emerald-500" 
                      : (selectedMod.verificationScore || 90) >= 90
                      ? "bg-indigo-500"
                      : "bg-amber-500"
                  }`} 
                  style={{ width: `${selectedMod.verificationScore || 90}%` }} 
                />
              </div>
              <p className="leading-relaxed text-neutral-550 text-[9px]">
                Diese Modifikation erfüllt die Sicherheitskonventionen des <strong>Game-Templates {currentTemplate.name}</strong>. Beim Aktivieren wird automatisch die Config-Struktur <code>{selectedMod.id}_config.properties</code> ins Serververzeichnis geladen.
              </p>
            </div>
          </div>
        )}

        {/* INTERACTIVE VIDEO GAMEPLAY SIMULATION WIDGET */}
        <div className="bg-[#121216] border border-[#24242a] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 bg-neutral-900/50 border-b border-[#24242a] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xxs font-bold uppercase tracking-wider text-white font-mono">Simulierte Gameplay-Videovorschau</span>
            </div>
            <span className="text-[9px] text-neutral-500 font-mono">CYBER SCANLINE FEED v1.08</span>
          </div>

          <div className="p-4 bg-black flex flex-col items-center">
            {isPlayingVideo ? (
              <div className="w-full h-44 border border-indigo-900/40 rounded-lg p-3.5 bg-black/90 font-mono text-xs text-emerald-400 space-y-1 relative overflow-hidden select-none">
                {/* CRT monitor scanlines scan simulation */}
                <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-[0.14]" />
                <div className="flex justify-between text-xxs border-b border-indigo-950 pb-1.5 mb-1.5 text-neutral-555">
                  <span>FEED: ACTIVE ({selectedMod.videoType.toUpperCase()})</span>
                  <span className="animate-pulse">● PLAYING VIDEO STREAM</span>
                </div>
                <pre className="text-indigo-400 text-xxs leading-relaxed font-mono whitespace-pre-wrap">{simulatedVideoText || "[Warte auf ersten Frame-Buffer...]"}</pre>
              </div>
            ) : (
              <div className="w-full h-44 bg-neutral-950/80 rounded-lg border border-neutral-900 flex flex-col items-center justify-center text-center p-6 space-y-3.5">
                <Play className="w-8 h-8 text-indigo-400 cursor-pointer hover:scale-110 transition-transform" onClick={() => setIsPlayingVideo(true)} />
                <div>
                  <p className="text-xs text-neutral-300 font-bold">{t("mods.previewTitle", "Interaktive Mod-Videovorschau laden")}</p>
                  <p className="text-[10px] text-neutral-550 max-w-sm mt-0.5">{t("mods.previewSub", "Startet eine prozedurale Echtzeit-Dokumentation direkt in der Gameserver Labor Sandbox.")}</p>
                </div>
              </div>
            )}

            <div className="w-full flex justify-between items-center mt-3 text-[10px] text-neutral-500 font-mono">
              <span>Simulated FPS: ~24.0 (Sync: OK)</span>
              {isPlayingVideo ? (
                <button
                  onClick={() => setIsPlayingVideo(false)}
                  className="text-indigo-400 hover:text-white uppercase font-bold text-xxs flex items-center gap-1 cursor-pointer"
                >
                  <Square className="w-3 h-3" /> Stop Video
                </button>
              ) : (
                <button
                  onClick={() => setIsPlayingVideo(true)}
                  className="text-indigo-400 hover:text-white uppercase font-bold text-xxs flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3" /> Start Video-Feed
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MOD SPECIFIC LIVE PARAMETER CONFIGURATIONS PANEL */}
        <div className="bg-[#121216] border border-[#24242a] rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-850 pb-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <span className="text-xxs font-bold uppercase tracking-wider text-white">Live Mod-Variablen tunen</span>
            </div>
            <span className="text-[10px] text-neutral-550 font-mono">Direkt-Injektion</span>
          </div>

          <p className="text-[11px] text-neutral-500 leading-normal">
            Verändern Sie die Standardwerte dieser Mod manuell. Beim Speichern wird automatisch eine entsprechende properties-Datei (<code>{selectedMod.id}_config.properties</code>) in das Docker-Server-Volume geschrieben.
          </p>

          <div className="grid grid-cols-2 gap-3.5 pt-1">
            {Object.entries(modConfigInputs).map(([key, value]) => (
              <div key={key} className="flex flex-col space-y-1">
                <span className="text-[10px] font-mono text-neutral-450 truncate">{key}</span>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => {
                    const val = e.target.value;
                    setModConfigInputs(prev => ({ ...prev, [key]: val }));
                  }}
                  className="bg-neutral-900 border border-[#24242a] focus:border-indigo-500/50 rounded px-2.5 py-1 text-xs text-neutral-200 font-mono focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="pt-2.5 flex justify-end gap-2 text-xxs">
            <button
              onClick={() => setModConfigInputs({ ...selectedMod.defaultConfigs })}
              className="bg-neutral-800 hover:bg-[#1a1a24] text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-neutral-700 transition-colors"
            >
              Defaults wiederherstellen
            </button>
            
            <button
              onClick={handleSaveModConfigInputs}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow"
            >
              <Save className="w-3.5 h-3.5" /> Parameter in Config binden
            </button>
          </div>
        </div>

        {/* GAME VERSION COMPATIBILITY ANALYSIS TOOL */}
        <div className="bg-[#121216] border border-[#24242a] rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-850 pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-xxs font-bold uppercase tracking-wider text-white">Versions-Kompatibilitäts-Prüfung</span>
            </div>
            <span className="text-[10px] text-indigo-500 font-mono">Realtime Check</span>
          </div>

          {(() => {
            const compatible = isVersionCompatible(server.version, selectedMod.compatibleVersions);
            return (
              <div className="space-y-3.5">
                <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  compatible 
                    ? "bg-emerald-950/15 border-emerald-900/40 text-emerald-300" 
                    : "bg-red-950/15 border-red-900/40 text-red-300"
                }`}>
                  {compatible ? (
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-bold leading-normal">
                      {compatible ? "Kompatibilität hervorragend!" : "Versions-Inkompatibilität erkannt!"}
                    </p>
                    <p className="text-[11px] opacity-80 leading-relaxed">
                      Der Server läuft unter der Version <strong className="font-mono text-white bg-neutral-900 px-1 py-0.5 rounded">{server.version}</strong>. 
                      Diese Modifikation zertifiziert die Kompatibilität für: <strong className="font-mono text-white bg-neutral-900 px-1 py-0.5 rounded">{selectedMod.compatibleVersions?.join(", ") || "Alle Versionen"}</strong>.
                    </p>
                  </div>
                </div>

                {!compatible && (
                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold text-white">Ein-Klick Versionsanpassung</p>
                      <p className="text-[10px] text-neutral-500 leading-normal">Pappe das globale Host-Image im Container automatisch an diese Mod an.</p>
                    </div>
                    <button
                      disabled={isAligning}
                      onClick={() => handleAlignServerVersion(selectedMod.compatibleVersions?.[0] || "1.20.1")}
                      className="bg-indigo-600 hover:bg-indigo-550 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow"
                    >
                      {isAligning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      Server anpassen ({selectedMod.compatibleVersions?.[0] || "1.20.1"})
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* MOD SPECIFIC DYNAMIC UPDATER PLATFORM */}
        <div className="bg-[#121216] border border-[#24242a] rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-850 pb-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              <span className="text-xxs font-bold uppercase tracking-wider text-white">Integrierter Mod-Updater</span>
            </div>
            <span className="text-[10px] text-neutral-450 font-mono">Engine v2.0</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-300">Installierte Version: <strong className="font-mono text-white">{selectedMod.version}</strong></span>
                {selectedMod.updateAvailable && (
                  <span className="bg-amber-950/40 text-amber-400 border border-amber-900/50 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wide">
                    Update verfügbar ({selectedMod.latestVersion})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-550 leading-relaxed">
                {selectedMod.updateAvailable 
                  ? "Sicherheits- und Stabilitätspatches in neuer Version enthalten. Ein sicheres Update wird dringend empfohlen."
                  : "Diese Modifikation ist auf dem absolut neuesten Stand der Online-Repositories."}
              </p>
            </div>

            {selectedMod.updateAvailable && selectedMod.installed && (
              <div className="flex-shrink-0">
                {updatingModId === selectedMod.id ? (
                  <div className="w-36 space-y-1.5 text-right">
                    <div className="flex justify-between text-[10px] font-mono text-neutral-450">
                      <span>Aktualisiere...</span>
                      <span>{updateProgress}%</span>
                    </div>
                    <div className="w-full bg-neutral-950 h-1 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${updateProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpdateMod(selectedMod)}
                    className="bg-amber-600 hover:bg-amber-550 border border-amber-500/30 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-amber-600/10"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Update einspielen
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Core Deployment Control bar */}
        <div className="pt-4 border-t border-neutral-850/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs font-bold text-white">Sicherheitsprüfung bestanden</p>
              <p className="text-[10px] text-neutral-550 font-mono">SHA-256 Hash validiert. Frei von Schadcode.</p>
            </div>
          </div>

          {selectedMod.installed ? (
            <div className="flex gap-2">
              <span className="bg-emerald-950/50 text-emerald-400 text-xs font-bold border border-emerald-900/40 px-3.5 py-2 rounded-xl flex items-center gap-1.5 selection:bg-transparent">
                <Check className="w-4 h-4 animate-bounce" /> Installiert auf Server
              </span>
              <button
                onClick={() => handleUninstallMod(selectedMod)}
                className="bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 border border-neutral-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Mod entfernen
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleInstallMod(selectedMod)}
              disabled={installingModId !== null}
              className="bg-indigo-600 hover:bg-indigo-550 disabled:opacity-40 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-indigo-600/10"
            >
              <Download className="w-4 h-4" /> Modifikation downloaden & deployen
            </button>
          )}
        </div>

      </div>
    );
  };

  return (
    <FloatingWindow
      onClose={onClose}
      title="WORKSHOP & DATEIVERWALTUNG PRO"
      subtitle={`Host-Container: ${server.name} (${server.game.toUpperCase()})`}
      icon={<Puzzle className="w-5 h-5 animate-spin-slow text-indigo-400" />}
      initialWidth={1200}
      initialHeight={760}
    >

        {/* Global Notifications */}
        {notification && (
          <div className={`p-3 text-xs flex items-center gap-2 border-b ${
            notification.isError
              ? "bg-red-954/20 border-red-900/40 text-red-400"
              : "bg-emerald-900/25 border-emerald-900/30 text-emerald-400 animate-fade-in"
          }`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{notification.message}</span>
          </div>
        )}

        {/* Tab switcher bar */}
        <div className="px-6 bg-[#0c0c0d] border-b border-neutral-850/80 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveSubTab("mods")}
              className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === "mods"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-neutral-400 hover:text-white"
              }`}
            >
              <Puzzle className="w-4 h-4" />
              Echtzeit Mod-Bibliothek & Marketplace
            </button>

            <button
              onClick={() => setActiveSubTab("files")}
              className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === "files"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-neutral-400 hover:text-white"
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              Konfigurations-Editor (MANUELL)
            </button>
          </div>

          <div className="text-[10px] text-neutral-500 font-mono uppercase bg-neutral-950 px-2 py-0.5 rounded border border-neutral-900">
            Secure Volume Access Mode
          </div>
        </div>

        {/* Active view window container */}
        <div className="flex-1 overflow-hidden flex bg-black/45">

          {/* TAB 1: WORKSHOP MODS */}
          {activeSubTab === "mods" && (
            <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-[#08080a]">
              
              {/* Top Control Bar for search & viewMode switching */}
              <div className="px-6 py-4 border-b border-neutral-850/80 bg-neutral-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
                <div className="flex-1 max-w-lg flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-grow">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                        {isLoadingLiveMods ? (
                          <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </span>
                      <input
                        type="text"
                        value={modSearch}
                        onChange={(e) => setModSearch(e.target.value)}
                        placeholder="Erweiterungspakete filtern (z.B. Edit, trader, expansion...)"
                        className="w-full bg-[#121216] border border-neutral-850 focus:border-indigo-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white focus:outline-none placeholder:text-neutral-500 transition-all"
                      />
                      {modSearch && (
                        <button
                          onClick={() => {
                            setModSearch("");
                          }}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Dynamic Game Spielversion Dropdown Filter */}
                    <div className="flex items-center gap-1.5 bg-[#121216] border border-neutral-850 px-3 py-2 rounded-xl flex-shrink-0">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono">Spielversion:</span>
                      <select
                        value={selectedVersion}
                        onChange={(e) => {
                          setSelectedVersion(e.target.value);
                          setSelectedMod(null); // Reset detail selection
                        }}
                        className="bg-transparent border-none text-white text-xs font-bold focus:ring-0 focus:outline-none cursor-pointer font-mono outline-none"
                      >
                        <option value="All" className="bg-[#121216] text-white">Alle</option>
                        {server.game === "minecraft" ? (
                          <>
                            <option value="1.20.4" className="bg-[#121216] text-white">1.20.4</option>
                            <option value="1.20.1" className="bg-[#121216] text-white">1.20.1</option>
                            <option value="1.19.4" className="bg-[#121216] text-white">1.19.4</option>
                            <option value="1.18.2" className="bg-[#121216] text-white">1.18.2</option>
                          </>
                        ) : server.game === "dayz" ? (
                          <>
                            <option value="1.25" className="bg-[#121216] text-white">1.25</option>
                            <option value="1.24" className="bg-[#121216] text-white">1.24</option>
                            <option value="1.23" className="bg-[#121216] text-white">1.23</option>
                          </>
                        ) : (
                          <>
                            <option value="1.39" className="bg-[#121216] text-white">1.39</option>
                            <option value="1.0.0" className="bg-[#121216] text-white">1.0.0</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Multi-source registry filter tabs (CurseForge, Steam Workshop, Modrinth, Spigot, GitHub) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-[#121216]/50 p-1.5 border border-neutral-850/80 rounded-xl">
                    <div className="flex flex-wrap items-center gap-1">
                      {[
                        { id: "All", label: "Alle" },
                        { id: "CurseForge", label: "CurseForge" },
                        { id: "Steam Workshop", label: "Workshop" },
                        { id: "Modrinth", label: "Modrinth" },
                        { id: "GitHub Releases", label: "GitHub" },
                        { id: "SpigotMC", label: "Spigot" }
                      ].map((reg) => (
                        <button
                          key={reg.id}
                          onClick={() => {
                            setSelectedRegistry(reg.id);
                            setSelectedMod(null); // Clear selected item to avoid state mismatches
                          }}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all uppercase tracking-wide cursor-pointer flex items-center gap-1 ${
                            selectedRegistry === reg.id
                              ? "bg-indigo-600 border border-indigo-500 text-white shadow-sm"
                              : "bg-neutral-900/50 hover:bg-neutral-800 text-neutral-400 border border-neutral-850/50"
                          }`}
                        >
                          <span className={`w-1 h-1 rounded-full ${selectedRegistry === reg.id ? "bg-white" : "bg-neutral-500"}`} />
                          {reg.label}
                        </button>
                      ))}
                    </div>

                    {/* Out of the box update available action banner */}
                    {modsList.some((m) => m.installed && m.updateAvailable) && (
                      <button
                        disabled={isUpdatingAll || updatingModId !== null}
                        onClick={handleUpdateAllMods}
                        className="bg-amber-600 hover:bg-amber-550 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-amber-500/30 transition-all cursor-pointer animate-pulse disabled:opacity-40"
                      >
                        <RefreshCw className={`w-3 h-3 ${isUpdatingAll ? "animate-spin" : ""}`} />
                        {isUpdatingAll ? "Update..." : "Alle updaten"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* View mode switcher tabs */}
                  <div className="bg-neutral-950 p-1 rounded-xl border border-neutral-850/80 flex items-center select-none">
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode("gallery");
                        setSelectedMod(null); // Clear selected mod to show the gallery grid initially
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        viewMode === "gallery"
                          ? "bg-indigo-600 text-white shadow"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      Visuelle Galerie
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode("list");
                        // Select first mod if none active
                        if (!selectedMod && modsList.length > 0) {
                          handleSelectMod(modsList[0]);
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        viewMode === "list"
                          ? "bg-indigo-600 text-white shadow"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      Splitscreen-Liste
                    </button>
                  </div>

                  <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline">
                    {modsList.length} Addons geladen
                  </span>
                </div>
              </div>

              {/* Progress bar info for installation inside top block for gallery or list */}
              {installingModId && (
                <div className="bg-[#121216] border-b border-indigo-900/30 px-6 py-2.5 flex items-center justify-between gap-4 flex-shrink-0 animate-fade-in text-xs">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    <span className="text-neutral-300 font-medium font-mono">{installStep}</span>
                  </div>
                  <div className="flex-1 max-w-md bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-900 mx-4">
                    <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${installProgress}%` }} />
                  </div>
                  <span className="text-indigo-400 font-bold font-mono">{installProgress}%</span>
                </div>
              )}

              {/* VIEWPORT AREA */}
              <div className="flex-1 flex overflow-hidden min-h-0 relative">
                
                {/* 1. VISUAL BENTO GALLERY PATTERN */}
                {viewMode === "gallery" && (
                  <div className="flex-1 flex overflow-hidden min-h-0 w-full">
                    {!selectedMod ? (
                      /* Mod Grid Catalog */
                      <div className="flex-1 overflow-y-auto p-6 scroller">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {modsList.length === 0 ? (
                            <div className="col-span-full text-center py-24">
                              <Puzzle className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                              <p className="text-sm text-neutral-400">Keine Erweiterungen gefiltert.</p>
                              <p className="text-xxs text-neutral-550 mt-1 uppercase">Passen Sie den Suchfilter an</p>
                            </div>
                          ) : (
                            modsList.map((mod) => (
                              <div
                                key={mod.id}
                                onClick={() => {
                                  setSelectedMod(mod);
                                  setModConfigInputs({ ...mod.defaultConfigs });
                                  setSelectedImageIndex(0);
                                  setIsPlayingVideo(false);
                                }}
                                className="group bg-[#121216]/95 border border-neutral-850 hover:border-indigo-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-indigo-505/5 flex flex-col cursor-pointer"
                              >
                                {/* Thumbnail Frame */}
                                <div className="relative h-44 w-full bg-neutral-900 overflow-hidden border-b border-neutral-850/50">
                                  {mod.previewImages && mod.previewImages[0] ? (
                                    <img
                                      src={mod.previewImages[0]}
                                      alt={mod.name}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                  ) : (
                                    <div className={`w-full h-full bg-gradient-to-br ${mod.imageBg} opacity-80`} />
                                  )}

                                  {/* Badges on Top */}
                                  <div className="absolute top-3 left-3 flex gap-1.5">
                                    <span className="bg-black/85 backdrop-blur-md text-white font-mono text-[9px] border border-white/10 px-2 py-0.5 rounded">
                                      {mod.origin}
                                    </span>
                                  </div>

                                  {mod.trustedHub && (
                                    <div className="absolute top-3 right-3">
                                      <span className="bg-indigo-950/90 text-indigo-400 font-bold font-mono text-[8px] tracking-wider border border-indigo-900 px-2 py-0.5 rounded-full uppercase flex items-center gap-0.5 shadow-sm">
                                        <Sparkles className="w-2.5 h-2.5 text-indigo-400" /> Verified
                                      </span>
                                    </div>
                                  )}

                                  {/* Stats Drawer bar */}
                                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center bg-black/75 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/5 text-[9px] font-mono text-neutral-300">
                                    <span className="flex items-center gap-0.5 font-bold">
                                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {mod.rating.toFixed(1)}
                                    </span>
                                    <span>{mod.downloads} Downloads</span>
                                  </div>
                                </div>

                                {/* Body Content */}
                                <div className="p-4.5 flex-1 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between gap-1">
                                      <h4 className="font-bold text-white text-xs tracking-wide group-hover:text-indigo-400 transition-colors line-clamp-1">{mod.name}</h4>
                                      <span className="text-[10px] font-mono text-neutral-500 font-semibold">{mod.fileSize}</span>
                                    </div>
                                    <p className="text-neutral-400 text-xxs leading-relaxed line-clamp-2 mt-2 h-8">
                                      {mod.description}
                                    </p>
                                  </div>

                                  {/* Card Footer actions indicator */}
                                  <div className="mt-4 pt-3 border-t border-neutral-850 flex justify-between items-center text-[9px] font-mono text-neutral-500">
                                    <span>Version <strong className="text-neutral-300">v{mod.version}</strong></span>
                                    
                                    {mod.installed ? (
                                      <span className="text-emerald-400 font-semibold bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded">Installiert</span>
                                    ) : (
                                      <span className="text-indigo-400 group-hover:underline cursor-pointer">METADATEN SEHEN →</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Immersive Premium detail screen taking full viewport */
                      <div className="flex-1 flex flex-col bg-[#0b0b0d] overflow-y-auto scroller">
                        <div className="px-6 py-4.5 border-b border-neutral-850/80 bg-neutral-900/40 flex justify-between items-center flex-shrink-0">
                          <button
                            onClick={() => setSelectedMod(null)}
                            className="flex items-center gap-2 text-xxs font-bold text-neutral-400 hover:text-white px-3.5 py-1.8 bg-neutral-950 border border-neutral-850 rounded-xl cursor-pointer hover:bg-neutral-900 transition-colors"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" /> Zurück zu allen Mods
                          </button>
                          <span className="text-[10px] text-neutral-500 font-mono">ModId: {selectedMod.id}</span>
                        </div>
                        
                        <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
                          {renderDetailedWorkspace(selectedMod)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. SPLIT LAYOUT MODE (Original view updated with premium details) */}
                {viewMode === "list" && (
                  <>
                    {/* Left Column: Explorer list (width 40%) */}
                    <div className="w-5/12 border-r border-neutral-850/80 flex flex-col overflow-hidden p-5">
                      <span className="text-xxs font-bold uppercase tracking-wider text-neutral-500 mb-2.5 block">
                        Mod-Registry ({modsList.length})
                      </span>
                      
                      <div className="flex-1 overflow-y-auto pr-1 space-y-2 scroller">
                        {modsList.length === 0 ? (
                          <div className="text-center py-16">
                            <Puzzle className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                            <p className="text-xs text-neutral-550">Keine Minecraft- oder Community-Pakete filtriert.</p>
                          </div>
                        ) : (
                          modsList.map((mod) => {
                            const isSelected = selectedMod?.id === mod.id;
                            return (
                              <div
                                key={mod.id}
                                onClick={() => handleSelectMod(mod)}
                                className={`p-3 rounded-lg border text-left cursor-pointer transition-all duration-200 ${
                                  isSelected
                                    ? "bg-indigo-950/15 border-indigo-500/60 shadow-md"
                                    : "bg-[#121216]/60 border-neutral-850/80 hover:bg-[#121216] hover:border-neutral-700"
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <span className="bg-zinc-900 text-neutral-400 font-mono text-[9px] border border-neutral-800 px-1.5 py-0.5 rounded leading-none">
                                    {mod.origin}
                                  </span>
                                  <span className="text-[10px] font-mono text-neutral-500">{mod.fileSize}</span>
                                </div>

                                <h4 className="font-bold text-white text-xs mt-2 tracking-wide leading-snug">{mod.name}</h4>
                                <p className="text-neutral-450 text-[10px] leading-relaxed line-clamp-1 mt-1">{mod.description}</p>

                                <div className="flex justify-between items-center mt-3 pt-2 border-t border-neutral-850/50 text-[9px] font-mono text-neutral-550">
                                  <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {mod.rating.toFixed(1)}
                                  </span>
                                  <span>{mod.downloads} dls</span>
                                  {mod.installed ? (
                                    <span className="text-emerald-400 font-bold border border-emerald-950/10 px-1.5 py-0.5 rounded bg-emerald-950/20 text-[8px]">INSTALLIERT</span>
                                  ) : (
                                    <span className="text-neutral-500 uppercase text-[8px]">Möglich</span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Right Column: Original splitscreen detail view updated with visual assets */}
                    <div className="w-7/12 flex flex-col bg-neutral-950/15 overflow-y-auto scroller">
                      {selectedMod ? (
                        <div className="p-6 space-y-6">
                          {renderDetailedWorkspace(selectedMod)}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                          <Puzzle className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                          <p className="text-xs text-neutral-500">Wählen Sie links ein Plugin aus um den Konfigurator zu laden.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

              </div>
            </div>
          )}


          {/* TAB 2: MANUAL FILES MANAGER */}
          {activeSubTab === "files" && (
            <div className="flex-1 flex overflow-hidden">

              {/* Left pane: File listing list */}
              <div className="w-68 border-r border-neutral-850/80 flex flex-col justify-between bg-black/15">
                <div className="p-4 flex-1 flex flex-col overflow-hidden">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xxs font-bold uppercase tracking-wider text-neutral-500">Dateihierarchie</span>

                    <button
                      onClick={() => setShowNewFileDialog(true)}
                      className="text-indigo-400 hover:text-indigo-300 p-1 bg-indigo-950/20 border border-indigo-900/30 rounded flex items-center gap-0.5 text-xxs font-bold cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Neu
                    </button>
                  </div>

                  {/* New File Trigger Panel */}
                  {showNewFileDialog && (
                    <form onSubmit={handleCreateFile} className="bg-neutral-900 border border-[#24242a] p-3 rounded-lg mb-3 space-y-2 animate-fade-in">
                      <input
                        type="text"
                        required
                        placeholder="z.B. config/admins.json"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        className="w-full bg-[#121216] border border-[#24242a] rounded p-1.5 text-xxs text-white focus:outline-none focus:border-indigo-505"
                      />
                      <div className="flex gap-1.5">
                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold px-2 py-1 rounded flex-1 cursor-pointer"
                        >
                          Anlegen
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowNewFileDialog(false)}
                          className="bg-neutral-800 text-neutral-400 text-[10px] px-2 py-1 rounded flex-1"
                        >
                          X
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Files scroller loop: Collapsible Subfolder Tree Hierachie */}
                  <div className="flex-1 overflow-y-auto space-y-2 scroller pr-1">
                    {filesList.length === 0 ? (
                      <p className="text-xxs text-neutral-500 font-mono p-3 text-center">Keine Dateien vorhanden.</p>
                    ) : (
                      <FileExplorerTree
                        nodes={buildFolderTree(filesList)}
                        selectedFile={selectedFile}
                        expandedFolders={expandedFolders}
                        onToggleFolder={toggleFolder}
                        onSelectFile={handleSelectFile}
                        onDeletePath={handleDeletePath}
                        accentColor="indigo"
                      />
                    )}
                  </div>
                </div>

                {/* Left pane Footer: Drag Drop uploading Area */}
                <div
                  className={`p-4 border-t border-neutral-850 m-2 rounded-xl text-center border-2 border-dashed transition-all ${
                    dragActive
                      ? "bg-indigo-950/15 border-indigo-500 text-indigo-400"
                      : "bg-[#121216]/40 border-neutral-850 text-neutral-550"
                  }`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <label className="cursor-pointer block">
                    <Upload className="w-5 h-5 text-indigo-455 mx-auto mb-1 animate-bounce" />
                    <span className="text-[10px] block font-semibold text-neutral-300">Third-Party Configs</span>
                    <span className="text-[9px] block text-neutral-550 mt-0.5">Drag & Drop oder Auswählen</span>

                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileInputChange}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>

              {/* Right pane: Config Code Editor */}
              <div className="flex-1 flex flex-col justify-between overflow-hidden text-left bg-[#121216]">
                {selectedFile ? (
                  <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Editor top meta */}
                    <div className="px-5 py-3 border-b border-neutral-850/80 bg-neutral-950/45 flex justify-between items-center flex-shrink-0">
                      <div>
                        <span className="text-xxs font-mono text-indigo-400">PATH: /volumes/{server.id}/{selectedFile.path}</span>
                        <h4 className="font-bold text-white text-xs mt-0.5 tracking-wide font-mono">{selectedFile.name}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-500 font-mono font-bold uppercase select-none mr-2">Größe: {selectedFile.size}</span>

                        <button
                          onClick={handleSaveFileContent}
                          disabled={isEditingFile}
                          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xxs py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow animate-pulse-slow"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Speichern
                        </button>
                      </div>
                    </div>

                    {/* Mode selector tab for Datatypes & Form views */}
                    {selectedFile && getFileDataTypeInfo(selectedFile.name).isConfigurable && (
                      <div className="px-5 py-2 border-b border-neutral-900 bg-neutral-950/20 flex justify-between items-center text-zinc-400 flex-shrink-0 select-none">
                        <div className="flex bg-[#121216] p-1 rounded-lg border border-neutral-850">
                          <button
                            type="button"
                            onClick={() => setEditorMode("code")}
                            className={`px-3 py-1 rounded text-[10px] font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer ${
                              editorMode === "code"
                                ? "bg-indigo-950/30 text-indigo-400 border border-indigo-900/30"
                                : "hover:text-white"
                            }`}
                          >
                            <FileCode className="w-3.5 h-3.5 animate-pulse-slow" /> Code-Editor (Raw)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleParseVisualConfig(editorContent, selectedFile.name);
                              setEditorMode("visual");
                            }}
                            className={`px-3 py-1 rounded text-[10px] font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer ${
                              editorMode === "visual"
                                ? "bg-indigo-950/30 text-indigo-400 border border-indigo-900/30"
                                : "hover:text-white"
                            }`}
                          >
                            <Sliders className="w-3.5 h-3.5" /> Parameter-Formular (Visual)
                          </button>
                        </div>
                        
                        <div className="text-[10px] font-mono text-neutral-500 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-indigo-400/80" /> Datentyp validiert
                        </div>
                      </div>
                    )}

                    {/* Editor Body */}
                    {editorMode === "visual" && getFileDataTypeInfo(selectedFile.name).isConfigurable ? (
                      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-black/55 scroller select-text">
                        <div className="bg-[#121216]/60 border border-neutral-850 p-4 rounded-xl space-y-2 text-left">
                          <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2 select-none">
                            <Sparkles className="w-4 h-4 text-indigo-400 animate-bounce" />
                            Visual Configurator — Datentyp: {getFileDataTypeInfo(selectedFile.name).label}
                          </h4>
                          <p className="text-[11px] text-neutral-500 leading-normal">
                            Dieser Konfigurator parst den Datei-Payload von <strong>{selectedFile.name}</strong> automatisch als strukturiertes Schema. 
                            Verändern Sie Parameterwerte direkt über interaktive Formularfelder. Änderungen werden automatisch in das Codebuilding-Format zurückgeschrieben.
                          </p>
                        </div>

                        {visualConfigData.length === 0 ? (
                          <div className="p-8 border border-neutral-850 rounded-xl text-center text-neutral-600 bg-neutral-900/10">
                            <Sliders className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
                            <span className="text-xs">Keine konfigurierbaren Parameter im parsbaren Codebereich identifiziert.</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {visualConfigData.map((item, index) => {
                              const isBool = item.type === "boolean";
                              const isNum = item.type === "number";

                              return (
                                <div key={`${item.key}-${index}`} className="p-3 bg-neutral-900/40 border border-neutral-850 rounded-lg flex flex-col justify-between hover:border-neutral-800 transition-colors">
                                  <div className="flex items-center justify-between mb-1.5 min-w-0 select-none">
                                    <span className="font-mono text-[10.5px] font-extrabold text-[#9da5b4] truncate uppercase tracking-wide mr-1.5 select-all" title={item.key}>
                                      {item.key}
                                    </span>
                                    <span className="text-[7.5px] px-1 font-mono uppercase bg-neutral-950 text-neutral-600 rounded border border-neutral-850">
                                      {item.type}
                                    </span>
                                  </div>

                                  <div className="mt-1 flex items-center">
                                    {isBool ? (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateVisualValue(index, item.value === true || item.value === "true" ? "false" : "true")}
                                        className={`px-3 py-1 rounded text-xxs font-mono font-bold transition-all cursor-pointer ${
                                          item.value === true || item.value === "true"
                                            ? "bg-emerald-990/40 text-emerald-405 border border-emerald-900/40"
                                            : "bg-red-990/45 text-red-405 border border-red-950/40"
                                        }`}
                                      >
                                        {(item.value === true || item.value === "true") ? "TRUE (Aktiv)" : "FALSE (Inaktiv)"}
                                      </button>
                                    ) : (
                                      <input
                                        type={isNum ? "number" : "text"}
                                        value={item.value}
                                        onChange={(e) => handleUpdateVisualValue(index, e.target.value)}
                                        className="w-full bg-[#121216] border border-neutral-800 focus:border-indigo-505 rounded px-2 py-1 text-xxs font-mono text-white focus:outline-none"
                                      />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Add Parameter form */}
                        <div className="bg-[#121216]/50 border border-neutral-850/70 rounded-xl p-4 mt-4 select-none text-left">
                          <h5 className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#9da5b4] mb-3 flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5 text-indigo-400" /> Neuen Parameter injizieren
                          </h5>
                          <form onSubmit={handleAddVisualParam} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
                            <div>
                              <label className="block text-[8.5px] uppercase text-neutral-550 font-mono mb-1">Schlüssel (Key)</label>
                              <input
                                type="text"
                                required
                                placeholder="z.B. max_tick_rate"
                                value={newParamKey}
                                onChange={(e) => setNewParamKey(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-xxs font-mono text-white focus:outline-none focus:border-indigo-505"
                              />
                            </div>
                            <div>
                              <label className="block text-[8.5px] uppercase text-neutral-550 font-mono mb-1">Standardwert (Value)</label>
                              <input
                                type="text"
                                required
                                placeholder="z.B. 64"
                                value={newParamVal}
                                onChange={(e) => setNewParamVal(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-xxs font-mono text-white focus:outline-none focus:border-indigo-505"
                              />
                            </div>
                            <div>
                              <label className="block text-[8.5px] uppercase text-neutral-550 font-mono mb-1">Datentyp</label>
                              <select
                                value={newParamType}
                                onChange={(e) => setNewParamType(e.target.value as any)}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-xxs font-mono text-white focus:outline-none focus:border-indigo-505 cursor-pointer"
                              >
                                <option value="text">String (Text)</option>
                                <option value="boolean">Boolean (Toggle)</option>
                                <option value="number">Numeric (Zahl)</option>
                              </select>
                            </div>
                            <button
                              type="submit"
                              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xxs py-1.8 px-3 rounded-lg flex items-center justify-center gap-1 transition-all h-8.5 cursor-pointer shadow"
                            >
                              <Plus className="w-3.5 h-3.5" /> Injizieren
                            </button>
                          </form>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex relative overflow-hidden bg-black/95">
                        <div className="w-10 bg-neutral-950 border-r border-neutral-900 font-mono text-center text-neutral-600 text-[10px] select-none pt-4 space-y-1">
                          {Array.from({ length: Math.max(12, editorContent.split("\n").length) }).map((_, i) => (
                            <div key={i}>{i + 1}</div>
                          ))}
                        </div>

                        <textarea
                          value={editorContent}
                          onChange={(e) => setEditorContent(e.target.value)}
                          className="flex-1 bg-transparent border-0 focus:ring-0 text-white font-mono text-xs p-4 leading-relaxed focus:outline-none resize-none scroller h-full select-text selection:bg-indigo-500/40"
                          placeholder="# Schreiben Sie Ihre Konfiguration hier rein..."
                          spellCheck={false}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <FileText className="w-10 h-10 text-neutral-700 mx-auto mb-2" />
                    <p className="text-xs text-neutral-500">Wählen Sie links eine Konfigurationsdatei aus, um den Editor zu laden.</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom footer strip */}
        <div className="h-12 bg-[#121216]/80 border-t border-neutral-850 px-6 flex items-center justify-between flex-shrink-0 text-neutral-500 text-[10px] font-mono select-none animate-pulse-slow">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-indigo-400" /> Host Volume: Mounted</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5 text-indigo-400" /> Docker-GZIP Compress: OK</span>
            <span>•</span>
            <span className="flex items-center gap-1.5 border border-indigo-900/50 px-2 py-0.5 rounded bg-indigo-950/25"><Cpu className="w-3 h-3 text-indigo-400" /> API: Live sync</span>
          </div>
          <span className="text-indigo-450 uppercase">Gameserver Labor Workshop Core 2.0-STABLE</span>
        </div>

    </FloatingWindow>
  );
}
