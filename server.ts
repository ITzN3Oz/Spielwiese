import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GameServer, Backup, DashboardUser, ServerLog, SystemStats } from "./src/types";

// Database File Path
const DB_FILE = path.join(process.cwd(), "gamehost_db.json");

// Helper to load database
function loadDatabase() {
  const defaultData = {
    servers: [
      {
        id: "mc-survival",
        name: "Minecraft Survival",
        game: "minecraft",
        status: "running" as const,
        dockerImage: "itzg/minecraft-server:latest",
        portMapping: "25565:25565",
        cpuUsage: 12,
        memoryUsage: 3120,
        maxMemory: 4096,
        diskUsage: 4.8,
        activePlayers: 3,
        maxPlayers: 10,
        version: "1.20.4",
        autoUpdate: true,
        autoBackup: true,
        variables: {
          EULA: "TRUE",
          MOTD: "Welcome to our Crafting World!",
          OPS: "ServerAdmin",
          DIFFICULTY: "normal"
        },
        created: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: "cs2-match",
        name: "CS2 Community Compet",
        game: "cs2",
        status: "stopped" as const,
        dockerImage: "joedev/cs2-dedicated:latest",
        portMapping: "27015:27015",
        cpuUsage: 0,
        memoryUsage: 0,
        maxMemory: 8192,
        diskUsage: 32.4,
        activePlayers: 0,
        maxPlayers: 12,
        version: "Build 1294821",
        autoUpdate: false,
        autoBackup: true,
        variables: {
          GAME_ALIAS: "cs2",
          MAP: "de_dust2",
          TICKRATE: "128",
          RCON_PASSWORD: "SuperSecurePassword123"
        },
        created: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: "val-coop",
        name: "Valheim Odins Land",
        game: "valheim",
        status: "running" as const,
        dockerImage: "lloesche/valheim-server:latest",
        portMapping: "2456:2456",
        cpuUsage: 22,
        memoryUsage: 2540,
        maxMemory: 6144,
        diskUsage: 2.1,
        activePlayers: 1,
        maxPlayers: 10,
        version: "0.217.46",
        autoUpdate: true,
        autoBackup: false,
        variables: {
          SERVER_NAME: "Odins Wilds",
          WORLD_NAME: "Midgard",
          SERVER_PASS: "valheimsecret"
        },
        created: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
      }
    ],
    backups: [
      {
        id: "bak-mc-1",
        serverId: "mc-survival",
        name: "Post-Nether Expedition Backup",
        size: "184.2 MB",
        date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        status: "completed" as const
      },
      {
        id: "bak-val-1",
        serverId: "val-coop",
        name: "Daily Auto-Backup",
        size: "45.8 MB",
        date: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        status: "completed" as const
      }
    ],
    users: [
      {
        id: "usr-admin",
        username: "admin",
        password: "admin",
        role: "admin" as const,
        lastLogin: new Date().toISOString(),
        permissions: ["read", "start_stop", "install", "backups", "users", "update"]
      },
      {
        id: "usr-mod",
        username: "moderator",
        password: "moderator",
        role: "operator" as const,
        lastLogin: new Date(Date.now() - 3600 * 1000).toISOString(),
        permissions: ["read", "start_stop", "backups"]
      },
      {
        id: "usr-viewer",
        username: "viewer",
        password: "viewer",
        role: "viewer" as const,
        lastLogin: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        permissions: ["read"]
      }
    ],
    logs: [
      {
        id: "log-1",
        serverId: "mc-survival",
        timestamp: new Date(Date.now() - 120 * 1000).toISOString(),
        type: "info" as const,
        message: "Starting minecraft server version 1.20.4"
      },
      {
        id: "log-2",
        serverId: "mc-survival",
        timestamp: new Date(Date.now() - 110 * 1000).toISOString(),
        type: "info" as const,
        message: "Loading properties"
      },
      {
        id: "log-3",
        serverId: "mc-survival",
        timestamp: new Date(Date.now() - 100 * 1000).toISOString(),
        type: "info" as const,
        message: "Preparing level 'world'"
      },
      {
        id: "log-4",
        serverId: "mc-survival",
        timestamp: new Date(Date.now() - 80 * 1000).toISOString(),
        type: "info" as const,
        message: "Done (12.4s)! For help, type 'help'"
      },
      {
        id: "log-5",
        serverId: "mc-survival",
        timestamp: new Date(Date.now() - 40 * 1000).toISOString(),
        type: "info" as const,
        message: "[Player Connected] Steve joined the game from 192.168.1.18"
      },
      {
        id: "log-6",
        serverId: "mc-survival",
        timestamp: new Date(Date.now() - 30 * 1000).toISOString(),
        type: "info" as const,
        message: "[Player Connected] Alex joined the game from 192.168.1.24"
      },
      {
        id: "log-7",
        serverId: "val-coop",
        timestamp: new Date(Date.now() - 150 * 1000).toISOString(),
        type: "info" as const,
        message: "Game server initialized on port 2456"
      },
      {
        id: "log-8",
        serverId: "val-coop",
        timestamp: new Date(Date.now() - 140 * 1000).toISOString(),
        type: "info" as const,
        message: "World 'Midgard' loaded successfully"
      },
      {
        id: "log-9",
        serverId: "val-coop",
        timestamp: new Date(Date.now() - 50 * 1000).toISOString(),
        type: "info" as const,
        message: "Steam network connection established successfully"
      }
    ]
  };

  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    } else {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), "utf-8");
      return defaultData;
    }
  } catch (error) {
    console.error("Failed to load / initialize database, using memory-only store.", error);
    return defaultData;
  }
}

function saveDatabase(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to database", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Database Initialization
  let db = loadDatabase();

  // Periodic Log Generator / Metric updater
  setInterval(() => {
    db = loadDatabase();
    let changed = false;

    db.servers = db.servers.map((srv: GameServer) => {
      if (srv.status === "running") {
        changed = true;
        // Introduce small human-like metric fluctuations
        const cpuDelta = (Math.random() - 0.5) * 4;
        const ramDelta = (Math.random() - 0.5) * 40;
        
        const newCpu = Math.max(2, Math.min(95, Math.round(srv.cpuUsage + cpuDelta)));
        const newMemory = Math.max(300, Math.min(srv.maxMemory - 100, Math.round(srv.memoryUsage + ramDelta)));
        
        // Occasional simulated connection/command log
        if (Math.random() > 0.95) {
          const events = [
            `Saving level state to host disk...`,
            `Autosave completed. Done writing chunk arrays.`,
            `Connection RCON poll response: active.`,
            `Periodic keep-alive ping received from Master Broker.`,
            `Garbage collection swept successfully. Freed 125MB.`,
            `Network link stabilized on default port.`
          ];
          const chosenMsg = events[Math.floor(Math.random() * events.length)];
          db.logs.push({
            id: "log-" + Date.now() + Math.random().toString(36).substring(2, 5),
            serverId: srv.id,
            timestamp: new Date().toISOString(),
            type: "info",
            message: chosenMsg
          });

          // Limit max logs to 200 items per server to save RAM/Disk
          const srvLogsCount = db.logs.filter((l: ServerLog) => l.serverId === srv.id).length;
          if (srvLogsCount > 150) {
            const index = db.logs.findIndex((l: ServerLog) => l.serverId === srv.id);
            if (index !== -1) db.logs.splice(index, 1);
          }
        }

        return {
          ...srv,
          cpuUsage: newCpu,
          memoryUsage: newMemory
        };
      }
      return srv;
    });

    if (changed) {
      saveDatabase(db);
    }
  }, 4000);

  // API Endpoints
  
  // 1. Host Resources Monitoring API
  app.get("/api/stats", (req, res) => {
    // Dynamically calculate total running stats and mock host metrics
    db = loadDatabase();
    const runningServers = db.servers.filter((s: GameServer) => s.status === "running");
    const runningCount = runningServers.length;

    const baseRamUsed = 3.2; // OS operating overhead
    const gameRamUsed = runningServers.reduce((acc: number, s: GameServer) => acc + (s.memoryUsage / 1024), 0);
    const combinedRamUsed = Math.round((baseRamUsed + gameRamUsed) * 10) / 10;

    const baseCpuUsed = 5; 
    const gameCpuUsed = runningServers.reduce((acc: number, s: GameServer) => acc + (s.cpuUsage / 4), 0); // Normalized over multiple cores
    const combinedCpu = Math.round(Math.min(98, baseCpuUsed + gameCpuUsed));

    const totalDiskUsed = Math.round((28.5 + db.servers.reduce((acc: number, s: GameServer) => acc + s.diskUsage, 0)) * 10) / 10;

    const stats: SystemStats = {
      cpuLoad: combinedCpu,
      cpuCores: 8,
      ramUsed: combinedRamUsed,
      ramTotal: 32.0,
      diskUsed: totalDiskUsed,
      diskTotal: 500.0,
      dockerVersion: "Docker Engine v25.0.3-ce",
      containersRunning: runningCount,
      networkIn: runningCount > 0 ? Math.round((0.5 + Math.random() * runningCount) * 100) / 100 : 0.02,
      networkOut: runningCount > 0 ? Math.round((1.2 + Math.random() * 2 * runningCount) * 100) / 100 : 0.04
    };

    res.json(stats);
  });

  // 2. GET all Game Servers
  app.get("/api/servers", (req, res) => {
    db = loadDatabase();
    res.json(db.servers);
  });

  // 3. POST Install New Server
  app.post("/api/servers", (req, res) => {
    const { name, game, dockerImage, portMapping, recommendedRam, variables } = req.body;
    if (!name || !game || !dockerImage || !portMapping) {
      return res.status(400).json({ error: "Fehlende Pflichtfelder (Name, Game, DockerImage, PortMapping)" });
    }

    db = loadDatabase();
    const id = game + "-" + Math.random().toString(36).substring(2, 7);

    const newServer: GameServer = {
      id,
      name,
      game,
      status: "installing",
      dockerImage,
      portMapping,
      cpuUsage: 0,
      memoryUsage: 0,
      maxMemory: recommendedRam || 4096,
      diskUsage: 0.1, // Initial workspace allocation
      activePlayers: 0,
      maxPlayers: 10,
      version: "Downloading manifest...",
      autoUpdate: true,
      autoBackup: true,
      variables: variables || {},
      created: new Date().toISOString()
    };

    db.servers.push(newServer);

    // Bootstrap initial install logs
    db.logs.push({
      id: "log-" + Date.now() + "1",
      serverId: id,
      timestamp: new Date().toISOString(),
      type: "info",
      message: `[Docker Engine] Pulling image ${dockerImage} from registry...`
    });

    saveDatabase(db);

    // Simulate standard async Docker install steps
    setTimeout(() => {
      db = loadDatabase();
      const serverIdx = db.servers.findIndex((s: GameServer) => s.id === id);
      if (serverIdx !== -1) {
        db.servers[serverIdx].version = game === "minecraft" ? "1.20.4" : "1.0.0-Docker";
        db.servers[serverIdx].diskUsage = game === "cs2" ? 31.2 : 3.4;
        db.logs.push({
          id: "log-" + Date.now() + "2",
          serverId: id,
          timestamp: new Date().toISOString(),
          type: "info",
          message: `[Docker Engine] Downloaded newer image layers successfully.`
        });
        db.logs.push({
          id: "log-" + Date.now() + "3",
          serverId: id,
          timestamp: new Date().toISOString(),
          type: "info",
          message: `[Docker Engine] Creating container volume mount points and configuring bridge routing.`
        });
        saveDatabase(db);
      }
    }, 2000);

    setTimeout(() => {
      db = loadDatabase();
      const serverIdx = db.servers.findIndex((s: GameServer) => s.id === id);
      if (serverIdx !== -1) {
        db.servers[serverIdx].status = "stopped";
        db.logs.push({
          id: "log-" + Date.now() + "4",
          serverId: id,
          timestamp: new Date().toISOString(),
          type: "info",
          message: `[System Manager] Installation completed. Server '${name}' is ready to boot.`
        });
        saveDatabase(db);
      }
    }, 4500);

    res.status(201).json(newServer);
  });

  // 4. POST Start/Stop Toggle Server
  app.post("/api/servers/:id/toggle", (req, res) => {
    const { id } = req.params;
    db = loadDatabase();
    const serverIdx = db.servers.findIndex((s: GameServer) => s.id === id);

    if (serverIdx === -1) {
      return res.status(404).json({ error: "Spieleserver nicht gefunden" });
    }

    const srv = db.servers[serverIdx];
    if (srv.status === "running") {
      // STOP Server
      srv.status = "stopped";
      srv.cpuUsage = 0;
      srv.memoryUsage = 0;
      srv.activePlayers = 0;

      db.logs.push({
        id: "log-" + Date.now(),
        serverId: id,
        timestamp: new Date().toISOString(),
        type: "info",
        message: `[Server Manager] Sending SIGTERM to docker daemon. Graceful shutdown initialized.`
      });
      db.logs.push({
        id: "log-" + (Date.now() + 1),
        serverId: id,
        timestamp: new Date().toISOString(),
        type: "info",
        message: `[Docker container] Service closed down. Process exit code 0.`
      });
    } else if (srv.status === "stopped") {
      // START Server
      srv.status = "running";
      srv.cpuUsage = 8;
      srv.memoryUsage = Math.round(srv.maxMemory * 0.4); // Initial RAM allocation hook

      db.logs.push({
        id: "log-" + Date.now(),
        serverId: id,
        timestamp: new Date().toISOString(),
        type: "info",
        message: `[Docker Engine] Starting Container id system-${id} with variables: ${JSON.stringify(srv.variables)}`
      });
      db.logs.push({
        id: "log-" + (Date.now() + 1),
        serverId: id,
        timestamp: new Date().toISOString(),
        type: "info",
        message: `[Docker Route] Bridge routing enabled. Local port ${srv.portMapping.split(':')[0]} bound to internal Docker interface.`
      });
      db.logs.push({
        id: "log-" + (Date.now() + 2),
        serverId: id,
        timestamp: new Date().toISOString(),
        type: "info",
        message: `[Container Shell] Loading core library modules... Server boot initialized.`
      });
    }

    saveDatabase(db);
    res.json(srv);
  });

  // 5. POST Force Game Updates
  app.post("/api/servers/:id/update", (req, res) => {
    const { id } = req.params;
    db = loadDatabase();
    const serverIdx = db.servers.findIndex((s: GameServer) => s.id === id);

    if (serverIdx === -1) {
      return res.status(404).json({ error: "Spieleserver nicht gefunden" });
    }

    const srv = db.servers[serverIdx];
    const prevStatus = srv.status;
    srv.status = "updating";
    srv.cpuUsage = 35;
    srv.memoryUsage = 500;

    db.logs.push({
      id: "log-" + Date.now(),
      serverId: id,
      timestamp: new Date().toISOString(),
      type: "info",
      message: `[Auto-Update] Contacting SteamCMD / Game Repository API to search for latest binaries...`
    });

    saveDatabase(db);

    setTimeout(() => {
      db = loadDatabase();
      const idx = db.servers.findIndex((s: GameServer) => s.id === id);
      if (idx !== -1) {
        db.servers[idx].status = prevStatus;
        db.servers[idx].version = "Updated (vNext)";
        db.logs.push({
          id: "log-" + Date.now(),
          serverId: id,
          timestamp: new Date().toISOString(),
          type: "info",
          message: `[Auto-Update] Download and unpacking completed. Game binaries applied safely.`
        });
        saveDatabase(db);
      }
    }, 3500);

    res.json(srv);
  });

  // 6. PUT/Edit Server Configurations
  app.put("/api/servers/:id", (req, res) => {
    const { id } = req.params;
    const { name, dockerImage, portMapping, maxMemory, autoUpdate, autoBackup, variables, maxPlayers } = req.body;

    db = loadDatabase();
    const idx = db.servers.findIndex((s: GameServer) => s.id === id);

    if (idx === -1) {
      return res.status(404).json({ error: "Spieleserver nicht gefunden" });
    }

    const srv = db.servers[idx];
    if (name !== undefined) srv.name = name;
    if (dockerImage !== undefined) srv.dockerImage = dockerImage;
    if (portMapping !== undefined) srv.portMapping = portMapping;
    if (maxMemory !== undefined) srv.maxMemory = maxMemory;
    if (autoUpdate !== undefined) srv.autoUpdate = autoUpdate;
    if (autoBackup !== undefined) srv.autoBackup = autoBackup;
    if (variables !== undefined) srv.variables = variables;
    if (maxPlayers !== undefined) srv.maxPlayers = maxPlayers;

    db.logs.push({
      id: "log-" + Date.now(),
      serverId: id,
      timestamp: new Date().toISOString(),
      type: "info",
      message: `[Config Manager] Configuration fields updated by admin user session.`
    });

    saveDatabase(db);
    res.json(srv);
  });

  // 7. DELETE Uninstall Server
  app.delete("/api/servers/:id", (req, res) => {
    const { id } = req.params;
    db = loadDatabase();
    
    const initialLen = db.servers.length;
    db.servers = db.servers.filter((s: GameServer) => s.id !== id);
    
    if (db.servers.length === initialLen) {
      return res.status(404).json({ error: "Spieleserver nicht gefunden" });
    }

    // Clean up backups and logs for this server
    db.backups = db.backups.filter((b: Backup) => b.serverId !== id);
    db.logs = db.logs.filter((l: ServerLog) => l.serverId !== id);

    // Deep clean specific volume files and mod lists
    if (db.serverFiles && db.serverFiles[id]) {
      delete db.serverFiles[id];
    }
    if (db.serverMods && db.serverMods[id]) {
      delete db.serverMods[id];
    }

    saveDatabase(db);
    res.json({ success: true, message: "Server und alle zugehörigen Daten wurden deinstalliert" });
  });

  // 7.5 Server Files & Mods Custom Management endpoints
  app.get("/api/servers/:id/files", (req, res) => {
    const { id } = req.params;
    db = loadDatabase();
    
    // Ensure the server exists
    const server = db.servers.find((s: GameServer) => s.id === id);
    if (!server) {
      return res.status(404).json({ error: "Server nicht gefunden" });
    }

    db.serverFiles = db.serverFiles || {};
    if (!db.serverFiles[id]) {
      // Bootstrap template files based on server.game
      const gameType = server.game;
      let files = [];
      if (gameType === "minecraft") {
        files = [
          {
            name: "server.properties",
            path: "server.properties",
            content: `# Minecraft server properties\n# Generated by Kilians Spielwiese\n\ndifficulty=normal\npvp=true\nmax-players=10\nallow-flight=false\nwhite-list=false\nlevel-name=world\nview-distance=10\nmotd=Willkommen auf Kilians Spielwiese Minecraft-Server!\nonline-mode=true\n`,
            size: "185 B"
          },
          {
            name: "ops.json",
            path: "ops.json",
            content: `[\n  {\n    "uuid": "d82bd52f-1049-411c-a0e2-e7b36f1c7132",\n    "name": "Kilian",\n    "level": 4,\n    "bypassesPlayerLimit": true\n  }\n]`,
            size: "140 B"
          },
          {
            name: "whitelist.json",
            path: "whitelist.json",
            content: `[\n  {\n    "uuid": "d82bd52f-1049-411c-a0e2-e7b36f1c7132",\n    "name": "Kilian"\n  }\n]`,
            size: "80 B"
          }
        ];
      } else if (gameType === "dayz") {
        files = [
          {
            name: "serverDZ.cfg",
            path: "serverDZ.cfg",
            content: `// serverDZ.cfg - DayZ server configurations\nhostname = "Kilians Spielwiese DayZ Server";\npassword = "";\npasswordAdmin = "DayZAdminPass123";\nmaxPlayers = 40;\nforceSameBuild = 1;\n\nclass Missions {\n  class DayZ {\n    template="dayzOffline.chernarusplus";\n  };\n};`,
            size: "245 B"
          },
          {
            name: "admins.txt",
            path: "admins.txt",
            content: `// Put your steam64id here, one per line\n76561198000000001 // Kilian\n`,
            size: "65 B"
          }
        ];
      } else if (gameType === "cs2") {
        files = [
          {
            name: "server.cfg",
            path: "game/csgo/cfg/server.cfg",
            content: `// CS2 Dedicated Server Config\nhostname "Kilians Community Match Server"\nrcon_password "SuperSecurePassword123"\nsv_cheats 0\nsv_lan 0\nmp_roundtime 1.92\nmp_maxrounds 24\nmp_startmoney 800\n`,
            size: "175 B"
          },
          {
            name: "admins.txt",
            path: "game/csgo/addons/admins.txt",
            content: `"Admins"\n{\n  "Kilian"\n  {\n    "auth" "steam"\n    "identity" "76561198055104212"\n    "flags" "z"\n  }\n}`,
            size: "110 B"
          }
        ];
      } else if (gameType === "rust") {
        files = [
          {
            name: "server.cfg",
            path: "server/mount/cfg/server.cfg",
            content: `// Rust Config\nserver.hostname "Kilians Custom Rust Land"\nserver.description "Welcome to our Survival Realm. Configured with Oxide Mods."\nserver.seed 123456\nserver.worldsize 3000\nserver.maxplayers 50\n`,
            size: "190 B"
          }
        ];
      } else {
        files = [
          {
            name: "server_config.json",
            path: "server_config.json",
            content: `{\n  "serverName": "${server.name}",\n  "maxPlayers": 16,\n  "public": true,\n  "allowCheats": false\n}`,
            size: "95 B"
          },
          {
            name: "admins.txt",
            path: "admins.txt",
            content: `// Admin List\nadmin_Kilian\n`,
            size: "25 B"
          }
        ];
      }
      db.serverFiles[id] = files;
      saveDatabase(db);
    }
    
    res.json(db.serverFiles[id]);
  });

  app.post("/api/servers/:id/files", (req, res) => {
    const { id } = req.params;
    const { filename, content } = req.body;
    if (!filename) {
      return res.status(400).json({ error: "Filename is required" });
    }

    db = loadDatabase();
    db.serverFiles = db.serverFiles || {};
    db.serverFiles[id] = db.serverFiles[id] || [];

    const existingFileIdx = db.serverFiles[id].findIndex((f: any) => f.name === filename);
    const size = `${Math.round(content.length / 10.24) / 100} KB`;

    if (existingFileIdx !== -1) {
      // Update
      db.serverFiles[id][existingFileIdx].content = content;
      db.serverFiles[id][existingFileIdx].size = size;
    } else {
      // Create new
      db.serverFiles[id].push({
        name: filename,
        path: filename,
        content: content,
        size: size
      });
    }

    saveDatabase(db);
    res.json({ success: true });
  });

  app.get("/api/servers/:id/mods", (req, res) => {
    const { id } = req.params;
    db = loadDatabase();
    db.serverMods = db.serverMods || {};
    res.json(db.serverMods[id] || []);
  });

  app.post("/api/servers/:id/mods", (req, res) => {
    const { id } = req.params;
    const { modId } = req.body;
    if (!modId) {
      return res.status(400).json({ error: "modId is required" });
    }

    db = loadDatabase();
    db.serverMods = db.serverMods || {};
    db.serverMods[id] = db.serverMods[id] || [];

    if (!db.serverMods[id].includes(modId)) {
      db.serverMods[id].push(modId);
    }

    saveDatabase(db);
    res.json({ success: true });
  });

  app.delete("/api/servers/:id/mods/:modId", (req, res) => {
    const { id, modId } = req.params;
    db = loadDatabase();
    db.serverMods = db.serverMods || {};
    db.serverMods[id] = db.serverMods[id] || [];

    db.serverMods[id] = db.serverMods[id].filter((m: string) => m !== modId);

    saveDatabase(db);
    res.json({ success: true });
  });

  // 8. GET server logs
  app.get("/api/servers/:id/logs", (req, res) => {
    const { id } = req.params;
    db = loadDatabase();
    const srvLogs = db.logs.filter((l: ServerLog) => l.serverId === id);
    res.json(srvLogs);
  });

  // 9. POST Command Exec (RCON console command)
  app.post("/api/servers/:id/command", (req, res) => {
    const { id } = req.params;
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ error: "Befehl darf nicht leer sein" });
    }

    db = loadDatabase();
    const serverExists = db.servers.some((s: GameServer) => s.id === id);
    if (!serverExists) {
      return res.status(404).json({ error: "Spieleserver nicht gefunden" });
    }

    // Add command print to logs
    db.logs.push({
      id: "log-cmd-in-" + Date.now(),
      serverId: id,
      timestamp: new Date().toISOString(),
      type: "output",
      message: `> ${command}`
    });

    // Simulated RCON response
    let responseText = `Command '${command}' executed, but response was unhandled by service.`;
    const cmdClean = command.toLowerCase().trim();
    if (cmdClean === "help") {
      responseText = "Available console actions: help, op [username], stop, deop [username], list, status";
    } else if (cmdClean.startsWith("op ")) {
      const user = command.substring(3);
      responseText = `Permissions updated: ${user} is now a Server Operator (bypass limits).`;
    } else if (cmdClean === "list") {
      responseText = "Active players connected: Steve, Alex, PlayerOne";
    } else if (cmdClean === "status") {
      responseText = "Performance Profile: TPS 20.0, Chunk Cache 181, Thread Pool 4 active.";
    }

    db.logs.push({
      id: "log-cmd-out-" + Date.now(),
      serverId: id,
      timestamp: new Date().toISOString(),
      type: "info",
      message: `[Console Output] ${responseText}`
    });

    saveDatabase(db);
    res.json({ output: responseText });
  });

  // 10. GET Backups List
  app.get("/api/backups", (req, res) => {
    db = loadDatabase();
    res.json(db.backups);
  });

  // 11. POST Create Backup
  app.post("/api/backups/:serverId", (req, res) => {
    const { serverId } = req.params;
    const { name } = req.body;

    db = loadDatabase();
    const srv = db.servers.find((s: GameServer) => s.id === serverId);
    if (!srv) {
      return res.status(404).json({ error: "Zugehöriger Server nicht gefunden für Backup" });
    }

    const backupId = "bak-" + Math.random().toString(36).substring(2, 7);
    const newBackup: Backup = {
      id: backupId,
      serverId,
      name: name || `Backup-${srv.name}-${new Date().toLocaleDateString("de-DE")}`,
      size: srv.status === "running" ? `${Math.round(150 + Math.random() * 80)} MB` : `${Math.round(80 + Math.random() * 20)} MB`,
      date: new Date().toISOString(),
      status: "completed"
    };

    db.backups.unshift(newBackup); // Add to beginning

    db.logs.push({
      id: "log-bak-" + Date.now(),
      serverId,
      timestamp: new Date().toISOString(),
      type: "info",
      message: `[Backup Service] Starting snapshots creation for directory /volumes/${serverId}...`
    });

    db.logs.push({
      id: "log-bak-2-" + Date.now(),
      serverId,
      timestamp: new Date().toISOString(),
      type: "info",
      message: `[Backup Service] GZipped level archives into storage payload. File saved inside system pool.`
    });

    saveDatabase(db);
    res.status(201).json(newBackup);
  });

  // 12. POST Restore Backup
  app.post("/api/backups/restore/:backupId", (req, res) => {
    const { backupId } = req.params;
    db = loadDatabase();
    
    const backup = db.backups.find((b: Backup) => b.id === backupId);
    if (!backup) {
      return res.status(404).json({ error: "Backup nicht gefunden" });
    }

    db.logs.push({
      id: "log-" + Date.now(),
      serverId: backup.serverId,
      timestamp: new Date().toISOString(),
      type: "warn",
      message: `[Backup Service] RESTORE triggered using backup payload: ${backup.name} (${backup.date})`
    });

    db.logs.push({
      id: "log-r-2" + Date.now(),
      serverId: backup.serverId,
      timestamp: new Date().toISOString(),
      type: "info",
      message: `[Backup Service] Restoring game assets. Please wait...`
    });

    saveDatabase(db);
    res.json({ success: true, message: `Backup '${backup.name}' erfolgreich wiederhergestellt.` });
  });

  // 13. DELETE Backup
  app.delete("/api/backups/:backupId", (req, res) => {
    const { backupId } = req.params;
    db = loadDatabase();
    
    const initialLen = db.backups.length;
    db.backups = db.backups.filter((b: Backup) => b.id !== backupId);

    if (db.backups.length === initialLen) {
      return res.status(404).json({ error: "Sicherheitskopie nicht gefunden" });
    }

    saveDatabase(db);
    res.json({ success: true, message: "Backup-Payload wurde endgültig aus dem Pool gelöscht" });
  });

  // 13.5 POST Login Authentication
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Benutzername und Passwort erforderlich" });
    }

    db = loadDatabase();
    const user = db.users.find(
      (u: DashboardUser) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!user) {
      return res.status(401).json({ error: "Benutzer nicht gefunden" });
    }

    const defaultPass = user.id === "usr-admin" ? "admin" : user.id === "usr-mod" ? "moderator" : "viewer";
    const actualPass = user.password || defaultPass;

    if (password !== actualPass) {
      return res.status(401).json({ error: "Ungültiges Kennwort" });
    }

    // Update last login timestamp
    user.lastLogin = new Date().toLocaleString("de-DE") + " (Session)";
    saveDatabase(db);

    res.json({ success: true, user });
  });

  // 14. GET Users
  app.get("/api/users", (req, res) => {
    db = loadDatabase();
    res.json(db.users);
  });

  // 15. POST user create
  app.post("/api/users", (req, res) => {
    const { username, role, permissions, password } = req.body;
    if (!username || !role) {
      return res.status(400).json({ error: "Name und Rolle erforderlich" });
    }

    db = loadDatabase();
    const id = "usr-" + Math.random().toString(36).substring(2, 7);

    const newUser: DashboardUser = {
      id,
      username,
      role,
      lastLogin: "Noch nie angemeldet",
      permissions: permissions || ["read"],
      password: password || "123456"
    };

    db.users.push(newUser);
    saveDatabase(db);

    res.status(201).json(newUser);
  });

  // 16. PUT Edit user access/rights
  app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const { username, role, permissions, password } = req.body;

    db = loadDatabase();
    const idx = db.users.findIndex((u: DashboardUser) => u.id === id);

    if (idx === -1) {
      return res.status(404).json({ error: "Benutzer nicht gefunden" });
    }

    const u = db.users[idx];
    if (username !== undefined) u.username = username;
    if (role !== undefined) u.role = role;
    if (permissions !== undefined) u.permissions = permissions;
    if (password !== undefined) u.password = password;

    saveDatabase(db);
    res.json(u);
  });

  // 17. DELETE user
  app.delete("/api/users/:id", (req, res) => {
    const { id } = req.params;
    db = loadDatabase();
    db.users = db.users.filter((u: DashboardUser) => u.id !== id);
    saveDatabase(db);
    res.json({ success: true, message: "Benutzerkonto wurde aus dem System entfernt" });
  });

  // Serve static assets in production or mount Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Webserver ready under http://0.0.0.0:${PORT}`);
  });
}

startServer();
