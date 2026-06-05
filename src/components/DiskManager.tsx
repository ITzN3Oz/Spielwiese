import React, { useState, useEffect } from "react";
import { StorageDisk } from "../types";
import {
  HardDrive,
  Plus,
  Trash2,
  AlertTriangle,
  RotateCw,
  Settings,
  Database,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FolderOpen
} from "lucide-react";
import { useLanguage } from "../LanguageContext";

interface DiskManagerProps {
  onClose?: () => void;
  accentColor?: "indigo" | "emerald" | "orange" | "pink";
}

export default function DiskManager({ onClose, accentColor = "indigo" }: DiskManagerProps) {
  const { t } = useLanguage();
  const [disks, setDisks] = useState<StorageDisk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Live Terminal Log traces
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[gcore-node10] init: initialisiere gcore Speichermanager v2.4...",
    "[gcore-node10] info: block-devices scannen...",
    "[gcore-node10] devicemap: /dev/sda1 -> mounted on / [System Root]",
    "[gcore-node10] devicemap: /dev/nvme0n1 -> mounted on /volumes [Docker Engine Data]",
    "[gcore-node10] devicemap: /dev/sdb1 -> mounted on /mnt/backups [Backup Pool Archive]",
    "[gcore-node10] ready: Speichermanager betriebsbereit. Status: OK"
  ]);

  const addTerminalLog = (logText: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [...prev, `[${timestamp}] ${logText}`]);
  };

  // Form states for adding a new disk
  const [newDevice, setNewDevice] = useState("/dev/sdd");
  const [newLabel, setNewLabel] = useState("");
  const [newCapacity, setNewCapacity] = useState("1024");
  const [newFsType, setNewFsType] = useState("RAW");
  const [newType, setNewType] = useState("SATA SSD");
  const [showAddForm, setShowAddForm] = useState(false);

  // Formatting state
  const [formatDiskId, setFormatDiskId] = useState<string | null>(null);
  const [selectedFsType, setSelectedFsType] = useState<string>("ext4");
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [isFormattingAction, setIsFormattingAction] = useState(false);

  const accentColorText = {
    indigo: "text-indigo-400",
    emerald: "text-emerald-400",
    orange: "text-orange-400",
    pink: "text-pink-400"
  }[accentColor];

  const accentColorBg = {
    indigo: "bg-indigo-600 hover:bg-indigo-505",
    emerald: "bg-emerald-600 hover:bg-emerald-505",
    orange: "bg-orange-600 hover:bg-orange-505",
    pink: "bg-pink-600 hover:bg-pink-505"
  }[accentColor];

  const accentColorBorderFocus = {
    indigo: "focus:border-indigo-500",
    emerald: "focus:border-emerald-500",
    orange: "focus:border-orange-500",
    pink: "focus:border-pink-500"
  }[accentColor];

  const fetchDisks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/storage-disks");
      if (res.ok) {
        const data = await res.json();
        setDisks(data);
      } else {
        showStatus("Fehler beim Laden der Festplattendaten.", "error");
      }
    } catch (err) {
      showStatus("Netzwerkfehler beim Abfragen des Speichermanagers.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDisksWithLog = async () => {
    addTerminalLog("root@gcore-server:~# df -hT --exclude-type=tmpfs --exclude-type=devtmpfs");
    setIsLoading(true);
    try {
      const res = await fetch("/api/storage-disks");
      if (res.ok) {
        const data = await res.json();
        setDisks(data);
        addTerminalLog(`gcore-backend: ${data.length} Partitionen/Devices erfolgreich abgefragt.`);
        data.forEach((d: any) => {
          addTerminalLog(` - ${d.device} [${d.type}] (${d.capacity} GB) -> Status: ${d.status}, Mount: ${d.mountPoint}`);
        });
      } else {
        showStatus("Fehler beim Laden der Festplattendaten.", "error");
        addTerminalLog("gcore-backend: [ERROR] Fehlercode 500 beim Laden der block-devices.");
      }
    } catch (err) {
      showStatus("Netzwerkfehler beim Abfragen des Speichermanagers.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisks();
  }, []);

  const showStatus = (text: string, type: "success" | "error" | "info" = "info") => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const handleAddDisk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevice || !newLabel || !newCapacity) {
      showStatus("Bitte füllen Sie alle Pflichtfelder aus.", "error");
      return;
    }

    addTerminalLog(`root@gcore-server:~# udevadm info --query=property --name=${newDevice}`);
    const finalMount = newFsType !== "RAW" ? `/mnt/data-${newDevice.replace("/dev/", "")}` : "none";
    addTerminalLog(`root@gcore-server:~# mkdir -p ${finalMount}`);
    addTerminalLog(`root@gcore-server:~# mount -o rw,defaults ${newDevice} ${finalMount}`);

    try {
      const res = await fetch("/api/storage-disks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device: newDevice,
          label: newLabel,
          capacity: parseInt(newCapacity, 10),
          fsType: newFsType,
          type: newType,
          mountPoint: finalMount
        })
      });

      if (res.ok) {
        showStatus(`Zusatzfestplatte '${newDevice}' erfolgreich im Host registriert.`, "success");
        addTerminalLog(`[SUCCESS] Block-device ${newDevice} registriert als '${newLabel}' im permanenten fstab-Protokoll.`);
        setNewLabel("");
        setNewDevice("/dev/sd" + String.fromCharCode(newDevice.charCodeAt(newDevice.length - 1) + 1));
        setShowAddForm(false);
        fetchDisks();
      } else {
        const err = await res.json();
        showStatus(err.error || "Fehler beim Hinzufügen der Festplatte.", "error");
        addTerminalLog(`[ERROR] Registrieren fehlgeschlagen: ${err.error || "Unbekannt"}`);
      }
    } catch (err) {
      showStatus("Verbindungsabbruch zum Speichermanager backend.", "error");
    }
  };

  const handleFormatClick = (disk: StorageDisk) => {
    if (disk.mountPoint === "/" || disk.id === "disk-1") {
      showStatus("System-Root Partitionen können nicht formatiert werden!", "error");
      return;
    }
    if (disk.mountPoint === "/volumes" || disk.id === "disk-2") {
      showStatus("Aktive Gameserver-Laufwerke können während der Laufzeit nicht formatiert werden.", "error");
      return;
    }
    setFormatDiskId(disk.id);
    setSelectedFsType(disk.fsType === "RAW" ? "ext4" : disk.fsType);
    setShowFormatModal(true);
  };

  const handleFormatConfirm = async () => {
    if (!formatDiskId) return;
    setIsFormattingAction(true);
    showStatus("Formatierungsvorgang eingeleitet. Bitte warten...", "info");

    const diskToFormat = disks.find(d => d.id === formatDiskId);
    const targetPath = diskToFormat ? diskToFormat.device : "/dev/sdX";

    addTerminalLog(`root@gcore-server:~# umount -l ${targetPath} || dmesg -w`);
    addTerminalLog(`root@gcore-server:~# mkfs.${selectedFsType} -F -v -L "${diskToFormat?.label || "Data-Disk"}" ${targetPath}`);

    try {
      const res = await fetch(`/api/storage-disks/${formatDiskId}/format`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fsType: selectedFsType })
      });

      if (res.ok) {
        showStatus("Festplatte wird im Hintergrund formatiert...", "success");
        setShowFormatModal(false);
        setFormatDiskId(null);
        // Refresh immediately to show formatting status
        fetchDisks();

        // Wait brief delay then refresh to show mounted final state
        setTimeout(() => {
          addTerminalLog(`mkfs.${selectedFsType}: Dateisystem erfolgreich zugewiesen an blockdevice Node.`);
          addTerminalLog(`root@gcore-server:~# mkdir -p /mnt/data-${formatDiskId}`);
          addTerminalLog(`root@gcore-server:~# mount -t ${selectedFsType} ${targetPath} /mnt/data-${formatDiskId}`);
          addTerminalLog(`[SUCCESS] Partition ${targetPath} erfolgreich als ${selectedFsType} formatiert und unter /mnt/data-${formatDiskId} gemountet.`);
          fetchDisks();
        }, 1800);
      } else {
        const err = await res.json();
        showStatus(err.error || "Formatierungsbefehl zurückgewiesen.", "error");
        addTerminalLog(`[ERROR] Formatierung von ${targetPath} abgelehnt: ${err.error}`);
      }
    } catch (err) {
      showStatus("Netzwerkfehler beim Formatierungsaufruf.", "error");
    } finally {
      setIsFormattingAction(false);
    }
  };

  const handleRemoveDisk = async (id: string, device: string) => {
    if (window.confirm(`Möchten Sie das Laufwerk '${device}' wirklich aus der Host-Konfiguration aushängen und entfernen?`)) {
      addTerminalLog(`root@gcore-server:~# umount -f ${device}`);
      addTerminalLog(`root@gcore-server:~# sed -i '\\|${device}|d' /etc/fstab`);
      addTerminalLog(`root@gcore-server:~# systemctl daemon-reload`);

      try {
        const res = await fetch(`/api/storage-disks/${id}`, {
          method: "DELETE"
        });

        if (res.ok) {
          showStatus(`Laufwerk ${device} erfolgreich entfernt.`, "success");
          addTerminalLog(`[SUCCESS] Blockdevice ${device} ausgehängt und fstab-Mapping gereinigt.`);
          fetchDisks();
        } else {
          const err = await res.json();
          showStatus(err.error || "Entfernen fehlgeschlagen.", "error");
          addTerminalLog(`[ERROR] Aushängen von ${device} fehlgeschlagen: ${err.error}`);
        }
      } catch (err) {
        showStatus("Verbindungsfehler im Speichermanager.", "error");
      }
    }
  };

  return (
    <div className="bg-[#121216]/95 border border-neutral-850 rounded-xl p-6 shadow-xl relative overflow-hidden transition-all">
      {/* Top Banner Accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentColor === "emerald" ? "from-emerald-500 to-teal-500" : accentColor === "orange" ? "from-orange-500 to-yellow-500" : accentColor === "pink" ? "from-pink-500 to-rose-500" : "from-indigo-500 to-purple-500"}`} />

      <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-850">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <HardDrive className={`w-5 h-5 ${accentColorText}`} />
            {t("storage.title", "Festplatten & Massenspeicher-Verwaltung")}
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {t("storage.subtitle", "Verwalten Sie verfügbare Host-Speicherplatten, formatieren Sie Dateisysteme oder hängen Sie zusätzliche Partitionen ein.")}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 text-xs font-semibold text-white rounded-lg border border-neutral-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Zusatzplatte anmelden
          </button>
          <button
            onClick={fetchDisks}
            disabled={isLoading}
            className="p-1.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded-lg border border-neutral-700 transition disabled:opacity-50"
            title="Aktualisieren"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-neutral-400 hover:text-white rounded-lg text-xs"
            >
              Schließen
            </button>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`mb-5 p-3.5 rounded-lg flex items-center gap-2.5 text-xs border ${
            message.type === "success"
              ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/30"
              : message.type === "error"
              ? "bg-red-950/40 text-red-400 border-red-950/30"
              : "bg-neutral-900 text-neutral-300 border-neutral-850"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : message.type === "error" ? (
            <XCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-pulse text-indigo-400" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Slide-out Form to Register New Storage Disk */}
      {showAddForm && (
        <form onSubmit={handleAddDisk} className="bg-neutral-950/45 border border-neutral-850 p-4 rounded-xl mb-6">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <Plus className={`w-4 h-4 ${accentColorText}`} />
            Zusätzliche Speicherplatte anmelden
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">Pfad im Host (Knoten)</label>
              <input
                type="text"
                value={newDevice}
                onChange={(e) => setNewDevice(e.target.value)}
                placeholder="/dev/sdd"
                className={`w-full bg-[#121216] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none ${accentColorBorderFocus}`}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">Bezeichnung / Alias</label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Mod Hosting SSD-4"
                className={`w-full bg-[#121216] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none ${accentColorBorderFocus}`}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">Kapazität (GB)</label>
              <input
                type="number"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                placeholder="1024"
                className={`w-full bg-[#121216] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none ${accentColorBorderFocus}`}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">Dateisystemtyp</label>
              <select
                value={newFsType}
                onChange={(e) => setNewFsType(e.target.value)}
                className="w-full bg-[#121216] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="RAW">RAW / Unformatiert</option>
                <option value="ext4">Linux native (ext4)</option>
                <option value="xfs">Enterprise Storage (xfs)</option>
                <option value="BTRFS">BTRFS Pool (btrfs)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">Laufwerk-Modell</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full bg-[#121216] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="SATA HDD">SATA 3.5" HDD</option>
                <option value="SATA SSD">SATA Enterprise SSD</option>
                <option value="NVMe SSD">M.2 NVMe SSD</option>
                <option value="Virtual Pool">Virtueller SAN Pool</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-neutral-900">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 text-xs rounded-lg"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className={`px-4 py-1.5 text-white text-xs font-bold rounded-lg transition ${accentColorBg}`}
            >
              Registrieren & Einhängen
            </button>
          </div>
        </form>
      )}

      {/* Disks Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {disks.map((d) => {
          const isSystem = d.mountPoint === "/" || d.id === "disk-1";
          const isDocker = d.mountPoint === "/volumes" || d.id === "disk-2";
          const percentUsed = d.capacity > 0 ? Math.round((d.used / d.capacity) * 100) : 0;

          return (
            <div
              key={d.id}
              className={`border rounded-xl p-4.5 bg-[#121216]/50 transition duration-300 relative flex flex-col justify-between ${
                d.status === "formatting"
                  ? "border-amber-500/45 bg-amber-950/5 animate-pulse"
                  : d.status === "raw"
                  ? "border-neutral-800 bg-neutral-950/20"
                  : "border-neutral-850 hover:border-neutral-700 hover:bg-neutral-900/40"
              }`}
            >
              {/* Card Header Info */}
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${d.status === "formatting" ? "bg-amber-950/50 text-amber-400" : d.status === "raw" ? "bg-neutral-900 text-neutral-500" : "bg-neutral-900/80 text-neutral-300"}`}>
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                        {d.label}
                        {(isSystem || isDocker) && (
                          <span className="text-[9px] bg-indigo-950/60 border border-indigo-900/40 text-indigo-400 font-mono tracking-wide px-1.5 py-0.5 rounded uppercase">
                            Core Disk
                          </span>
                        )}
                        {d.status === "raw" && (
                          <span className="text-[9px] bg-neutral-800 border border-neutral-700 text-neutral-400 font-mono px-1.5 py-0.5 rounded uppercase">
                            RAW
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-neutral-500 font-mono">{d.device}</span>
                        <span className="text-neutral-750 font-sans">•</span>
                        <span className="text-[10px] text-neutral-400 font-mono uppercase bg-neutral-900/80 px-1 rounded">{d.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Disk Actions */}
                    {!isSystem && !isDocker && d.status !== "formatting" && (
                      <button
                        onClick={() => handleRemoveDisk(d.id, d.device)}
                        className="p-1.5 hover:bg-red-950/40 text-neutral-500 hover:text-red-400 rounded-lg transition"
                        title="Vom Host aushängen und entfernen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {d.status !== "formatting" && (
                      <button
                        onClick={() => handleFormatClick(d)}
                        className={`p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition ${
                          isSystem || isDocker ? "opacity-30 cursor-not-allowed" : ""
                        }`}
                        title={isSystem || isDocker ? "Systemlaufwerke können nicht formatiert werden" : "Partition formatieren (Dateisystem erstellen)"}
                        disabled={isSystem || isDocker}
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Disk capacity slider/specs */}
                <div className="mt-4">
                  {d.status === "formatting" ? (
                    <div className="py-2.5">
                      <div className="flex justify-between text-xs text-amber-400 font-bold mb-1 font-mono">
                        <span className="flex items-center gap-1.5 animate-pulse">
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          Dateisystem wird zugewiesen...
                        </span>
                        <span>mkfs.{selectedFsType}</span>
                      </div>
                      <div className="w-full bg-neutral-850 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-505 h-full rounded-full animate-pulse shadow-[0_0_8px_#f97316]" style={{ width: "65%" }} />
                      </div>
                    </div>
                  ) : d.status === "raw" ? (
                    <div className="bg-neutral-950/30 border border-neutral-900 rounded-lg p-2.5 flex items-center gap-2 text-xxs text-neutral-400">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span>
                        Dieses Laufwerk enthält kein registriertes Dateisystem. Klicken Sie rechts oben auf das Zahnrad-Symbol, um es als <strong>ext4</strong> oder <strong>xfs</strong> zu partitionieren.
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div className="w-full bg-neutral-850 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percentUsed > 85
                              ? "bg-red-650"
                              : percentUsed > 65
                              ? "bg-orange-505"
                              : accentColor === "emerald"
                              ? "bg-emerald-505"
                              : accentColor === "orange"
                              ? "bg-orange-505"
                              : accentColor === "pink"
                              ? "bg-pink-505"
                              : "bg-indigo-505"
                          }`}
                          style={{ width: `${percentUsed}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-xxs font-mono text-neutral-500 mt-2">
                        <span>{percentUsed}% belegt ({d.used} GB)</span>
                        <span>{d.capacity} GB Kapazität</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mounted path metadata */}
              {d.status !== "formatting" && d.status !== "raw" && (
                <div className="mt-4 pt-3 border-t border-neutral-900/60 flex items-center justify-between text-xxs">
                  <span className="text-neutral-500 flex items-center gap-1">
                    <FolderOpen className="w-3 h-3 text-neutral-600" />
                    Mount-Punkt:
                  </span>
                  <span className="text-white bg-neutral-950/60 border border-neutral-900 rounded px-1.5 py-0.5 font-mono">
                    {d.mountPoint}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Live Host-Terminal Console Widget */}
      <div className="mt-8 border border-neutral-850 bg-neutral-950/80 rounded-xl overflow-hidden shadow-lg">
        <div className="bg-neutral-900 px-4 py-2.5 flex items-center justify-between border-b border-neutral-850">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            <span className="text-[10px] font-mono font-semibold uppercase text-neutral-400 ml-1.5 tracking-wider">
              Host Storage-Kernel logs (stdout/stderr)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDisksWithLog}
              className="text-[9px] font-mono hover:text-indigo-300 text-indigo-400 uppercase font-bold tracking-wider hover:bg-neutral-800 px-2 py-0.5 rounded transition cursor-pointer"
            >
              df -hT
            </button>
            <button
              onClick={() => setTerminalLogs([])}
              className="text-[9px] font-mono hover:text-white text-neutral-500 uppercase font-bold tracking-wider hover:bg-neutral-800 px-2 py-0.5 rounded transition cursor-pointer"
            >
              Clear Console
            </button>
          </div>
        </div>
        <div className="p-4 h-[160px] overflow-y-auto font-mono text-xs text-neutral-350 bg-[#09090b] space-y-1 scroll-smooth">
          {terminalLogs.length === 0 ? (
            <div className="text-neutral-650 text-[10px] italic">Keine aktiven Logmeldungen vorhanden. Lösen Sie Formatierungen, Einhänge- oder Entfernungsaktionen aus, um den Befehlspfad zu überwachen...</div>
          ) : (
            terminalLogs.map((log, index) => {
              const isCommand = log.includes("root@gcore-server:~#");
              const isSuccess = log.includes("[SUCCESS]");
              const isError = log.includes("[ERROR]");
              let textColor = "text-neutral-400";
              if (isCommand) textColor = "text-indigo-400 font-bold";
              else if (isSuccess) textColor = "text-emerald-400 font-bold";
              else if (isError) textColor = "text-red-400 font-bold animate-pulse";

              return (
                <div key={index} className={`leading-relaxed text-[10.5px] ${textColor}`}>
                  {log}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Format Confirmation Modal */}
      {showFormatModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121216] border border-neutral-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce" />
              Sicherheitsabfrage: Datenträger formatieren?
            </h3>
            <p className="text-xs text-neutral-350 leading-relaxed mb-4">
              Achtung! Das Formatieren der Festplatte löscht alle darauf befindlichen Partitionen und Daten unwiederbringlich. Wählen Sie das gewünschte Dateisystem:
            </p>

            <div className="bg-neutral-950/45 p-3 rounded-xl border border-neutral-850 mb-4 flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Dateisystem-Anweisung
              </label>
              <select
                value={selectedFsType}
                onChange={(e) => setSelectedFsType(e.target.value)}
                className="bg-[#121216] border border-neutral-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none"
              >
                <option value="ext4">Virtualization Optimized (ext4)</option>
                <option value="xfs">High Performance Node (xfs)</option>
                <option value="BTRFS">BTRFS Mirror Pool (btrfs)</option>
                <option value="FAT32">FAT32 Universal Access</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowFormatModal(false);
                  setFormatDiskId(null);
                }}
                disabled={isFormattingAction}
                className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 border border-neutral-800 rounded-lg text-xs"
              >
                Abbrechen
              </button>
              <button
                onClick={handleFormatConfirm}
                disabled={isFormattingAction}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-505 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
              >
                {isFormattingAction && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                Unwiderruflich formatieren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
