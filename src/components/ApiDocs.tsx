import { useState } from "react";
import { Copy, Check, Terminal, Play, Zap, Globe, Sparkles } from "lucide-react";

interface EndpointDoc {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  requestBody?: string;
  responseBody: string;
  curl: string;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    method: "GET",
    path: "/api/stats",
    description: "Liefert die aktuelle Live-Ressourcenauslastung des Linux-Hosts (CPU, RAM, Festplatten, Docker-Dämon, Netzwerkgeschwindigkeit).",
    responseBody: `{
  "cpuLoad": 28,
  "cpuCores": 8,
  "ramUsed": 12.4,
  "ramTotal": 32.0,
  "diskUsed": 38.6,
  "diskTotal": 500.0,
  "dockerVersion": "Docker Engine v25.0.3-ce",
  "containersRunning": 2,
  "networkIn": 0.84,
  "networkOut": 2.15
}`,
    curl: "curl -X GET https://g-core-host.local/api/stats \\\n  -H 'Authorization: Bearer my-api-token-xyz'"
  },
  {
    method: "GET",
    path: "/api/servers",
    description: "Macht einen Scan aller eingerichteten Spieleserver-Instanzen samt Port-Zuweisung, Spieleranzahl und momentanem Container-Status.",
    responseBody: `[
  {
    "id": "mc-survival",
    "name": "Minecraft Survival",
    "game": "minecraft",
    "status": "running",
    "dockerImage": "itzg/minecraft-server:latest",
    "portMapping": "25565:25565",
    "cpuUsage": 12,
    "memoryUsage": 3120,
    "maxMemory": 4096,
    "activePlayers": 3,
    "maxPlayers": 10,
    "version": "1.20.4"
  }
]`,
    curl: "curl -X GET https://g-core-host.local/api/servers \\\n  -H 'Authorization: Bearer my-api-token-xyz'"
  },
  {
    method: "POST",
    path: "/api/servers",
    description: "Installiert eine neue Spieleserver-Instanz auf dem Host durch automatisches Pulling des Docker Registry Images und Konfiguration der Ports.",
    requestBody: `{
  "name": "Factorio Server",
  "game": "factorio",
  "dockerImage": "factoriotools/factorio-server:latest",
  "portMapping": "34197:34197",
  "recommendedRam": 4096,
  "variables": {
    "AUTOSAVE_INTERVAL": "15"
  }
}`,
    responseBody: `{
  "id": "factorio-a4fd1",
  "name": "Factorio Server",
  "game": "factorio",
  "status": "installing",
  "dockerImage": "factoriotools/factorio-server:latest",
  "portMapping": "34197:34197",
  "maxMemory": 4096,
  "created": "2026-06-02T07:44:00Z",
  "variables": { "AUTOSAVE_INTERVAL": "15" }
}`,
    curl: "curl -X POST https://g-core-host.local/api/servers \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"name\":\"Factorio Server\",\"game\":\"factorio\",\"dockerImage\":\"factoriotools/factorio-server:latest\",\"portMapping\":\"34197:34197\"}'"
  },
  {
    method: "POST",
    path: "/api/servers/:id/toggle",
    description: "Schaltet den Power-State des Containers um. Sendet im laufenden Betrieb SIGTERM für geordneten Server-Shutdown, startet ansonsten den Docker Boot-Vorgang.",
    responseBody: `{
  "id": "mc-survival",
  "status": "stopped",
  "cpuUsage": 0,
  "memoryUsage": 0,
  "activePlayers": 0
}`,
    curl: "curl -X POST https://g-core-host.local/api/servers/mc-survival/toggle"
  },
  {
    method: "POST",
    path: "/api/servers/:id/command",
    description: "Übermittelt Konsolenbefehle direkt an die RCON-Schnittstelle des Spieleserversektors und liefert den Standard-Output zurück.",
    requestBody: `{
  "command": "list"
}`,
    responseBody: `{
  "output": "[Console Output] Active players connected: Steve, Alex, PlayerOne"
}`,
    curl: "curl -X POST https://g-core-host.local/api/servers/mc-survival/command \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"command\":\"list\"}'"
  },
  {
    method: "POST",
    path: "/api/backups/:serverId",
    description: "Initiiert ein sofortiges Backup-Snapshot-Verpackungsverfahren. Friert Schreibvorgänge ein, packt das Verzeichnis als GZIP-Payload.",
    requestBody: `{
  "name": "Vor-Upgrade-Sicherung"
}`,
    responseBody: `{
  "id": "bak-92b1",
  "serverId": "mc-survival",
  "name": "Vor-Upgrade-Sicherung",
  "size": "142.4 MB",
  "date": "2026-06-02T07:45:00Z",
  "status": "completed"
}`,
    curl: "curl -X POST https://g-core-host.local/api/backups/mc-survival \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"name\":\"Backup-Pre-Patch\"}'"
  }
];

export default function ApiDocs() {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Playground / Tester sandbox states
  const [playgroundRoute, setPlaygroundRoute] = useState("/api/stats");
  const [playgroundOutput, setPlaygroundOutput] = useState<string>("");
  const [isPlayingLoading, setIsPlayingLoading] = useState(false);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const executePlaygroundTest = async () => {
    setIsPlayingLoading(true);
    setPlaygroundOutput("// Sende Request an lokalen Linux Host...");
    try {
      const res = await fetch(playgroundRoute);
      if (res.ok) {
        const json = await res.json();
        setPlaygroundOutput(JSON.stringify(json, null, 2));
      } else {
        setPlaygroundOutput(`// Fehler bei der Übertragung Code: ${res.status}\n// Konnten Route nicht erfolgreich kontaktieren.`);
      }
    } catch (err) {
      setPlaygroundOutput(`// Verbindung verweigert:\n${err}`);
    } finally {
      setIsPlayingLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="api-sandbox-documentation">
      {/* Left side: interactive endpoints list */}
      <div className="xl:col-span-7 space-y-4">
        <h3 className="text-base font-semibold text-white uppercase tracking-wider mb-2">
          API-Endpunkte Referenz & Spezifikation
        </h3>

        <div className="space-y-3">
          {ENDPOINTS.map((endpoint, idx) => {
            const isGet = endpoint.method === "GET";
            const isPost = endpoint.method === "POST";
            const isPut = endpoint.method === "PUT";
            const isDelete = endpoint.method === "DELETE";

            const isSelected = activeTab === idx;

            return (
              <div
                key={idx}
                className={`bg-[#121216] border rounded-xl overflow-hidden transition-all duration-300 ${
                  isSelected ? "border-indigo-500/50" : "border-[#24242a]"
                }`}
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => setActiveTab(idx)}
                  className="w-full text-left p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/40 hover:bg-neutral-900/60 transition-colors"
                >
                  <div className="flex items-center gap-3 font-mono text-sm max-w-full overflow-hidden">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold w-16 text-center shadow-sm ${
                        isGet
                          ? "bg-indigo-950/40 text-indigo-400 border border-indigo-500/30"
                          : isPost
                          ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-956/40 text-red-500 border border-red-500/30"
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <span className="text-white tracking-tight break-all">{endpoint.path}</span>
                  </div>
                  <span className="text-xxs text-neutral-500 font-sans sm:ml-auto max-w-xs truncate">
                    {endpoint.description}
                  </span>
                </button>

                {/* Sub Body (Expanded) */}
                {isSelected && (
                  <div className="p-5 border-t border-neutral-850 bg-black/40 space-y-4 text-xs font-sans">
                    <p className="text-neutral-400 leading-relaxed text-xs">
                      {endpoint.description}
                    </p>

                    {/* Request payload if applicable */}
                    {endpoint.requestBody && (
                      <div className="space-y-1.5">
                        <span className="block text-xxs font-bold uppercase tracking-wider text-neutral-500">
                          Raw Request Payload (JSON)
                        </span>
                        <pre className="p-3 bg-neutral-950 rounded-lg text-xxs font-mono text-emerald-400 overflow-x-auto border border-neutral-850">
                          {endpoint.requestBody}
                        </pre>
                      </div>
                    )}

                    {/* Response body */}
                    <div className="space-y-1.5">
                      <span className="block text-xxs font-bold uppercase tracking-wider text-neutral-500">
                        Response Payload (JSON Structure)
                      </span>
                      <pre className="p-3 bg-neutral-955 rounded-lg text-xxs font-mono text-indigo-300 overflow-x-auto border border-neutral-850 flex-1">
                        {endpoint.responseBody}
                      </pre>
                    </div>

                    {/* Curl Code */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xxs font-bold uppercase tracking-wider text-neutral-500">
                        <span>shell curl snippet</span>
                        <button
                          onClick={() => handleCopy(endpoint.curl, idx)}
                          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 normal-case tracking-normal cursor-pointer"
                        >
                          {copiedId === idx ? (
                            <>
                              <Check className="w-3 h-3" /> Kopiert!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Kopieren
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-3 bg-neutral-950 rounded-lg text-xxs font-mono text-zinc-350 overflow-x-auto border border-neutral-850 select-all">
                        {endpoint.curl}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right side: Interactive endpoint playground (Testing API) */}
      <div className="xl:col-span-5 bg-[#121216] border border-[#24242a] rounded-xl p-6 flex flex-col justify-between h-fit">
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-[#24242a] mb-4">
            <Sparkles className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              API Sandbox & Tester
            </h3>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed mb-4">
            Testen Sie die Endpunkte der Server-API direkt über diese Bedienoberfläche. Wählen Sie eine Route, lösen Sie die Anfrage aus und analysieren Sie den Live-Antwortcode.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xxs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Route auswählen
              </label>
              <div className="flex gap-2">
                <select
                  value={playgroundRoute}
                  onChange={(e) => {
                    setPlaygroundRoute(e.target.value);
                    setPlaygroundOutput("");
                  }}
                  className="flex-1 bg-[#1a1a20] border border-[#24242a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-505"
                >
                  <option value="/api/stats">GET /api/stats (Host Status)</option>
                  <option value="/api/servers">GET /api/servers (Servers Scan)</option>
                  <option value="/api/backups">GET /api/backups (Backups Scan)</option>
                  <option value="/api/users">GET /api/users (Benutzer Scan)</option>
                </select>

                <button
                  type="button"
                  onClick={executePlaygroundTest}
                  disabled={isPlayingLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Testen
                </button>
              </div>
            </div>

            {/* Playground logger viewport */}
            <div className="space-y-1.5">
              <span className="block text-xxs font-bold uppercase tracking-wider text-neutral-550">
                Live Output Response Sandbox
              </span>
              <div className="relative">
                <pre className="p-4 bg-black rounded-lg text-[11px] font-mono text-indigo-400 overflow-x-auto border border-neutral-850 h-[280px] leading-relaxed scroller select-text">
                  {playgroundOutput || `// Wählen Sie eine Route aus und klicken Sie "Testen" \n// Das Ergebnis wird hier in Echtzeit abgebildet.`}
                </pre>
                {isPlayingLoading && (
                  <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-850 text-xxs text-neutral-500 flex gap-1.5 bg-[#0c0c0d]/50 p-2.5 rounded-lg border border-[#24242a]/30">
          <Terminal className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>
            <strong>Curl testing:</strong> Auf Ihrem Linux-Server können Sie dieselben Befehle im Terminal eingeben, um Automatisierungs-Crons zu scripten.
          </span>
        </div>
      </div>
    </div>
  );
}
