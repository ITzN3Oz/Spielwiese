import React from "react";
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  FileCode, 
  Terminal, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  Sparkles,
  Sliders,
  Settings,
  ShieldCheck,
  FileBadge
} from "lucide-react";
import { ServerFile } from "./ServerModsManager";

interface FileExplorerTreeProps {
  nodes: Record<string, any>;
  depth?: number;
  selectedFile: ServerFile | null;
  expandedFolders: Record<string, boolean>;
  onToggleFolder: (path: string) => void;
  onSelectFile: (file: ServerFile) => void;
  onDeletePath: (path: string, isDirectory: boolean) => void;
  accentColor: "indigo" | "emerald" | "orange" | "pink";
}

// Helper to detect datatype based on extension
export function getFileDataTypeInfo(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "json":
      return {
        label: "JSON",
        badgeBg: "bg-purple-950/40 text-purple-400 border-purple-905/30",
        desc: "JavaScript Object Notation",
        isConfigurable: true,
        iconColor: "text-purple-400",
      };
    case "properties":
      return {
        label: "PROP",
        badgeBg: "bg-blue-950/40 text-blue-400 border-blue-905/30",
        desc: "Java Properties Konfiguration",
        isConfigurable: true,
        iconColor: "text-blue-400",
      };
    case "cfg":
    case "conf":
    case "config":
    case "ini":
      return {
        label: "CFG",
        badgeBg: "bg-indigo-950/40 text-indigo-400 border-indigo-905/30",
        desc: "Server-Konfiguration",
        isConfigurable: true,
        iconColor: "text-indigo-400",
      };
    case "yml":
    case "yaml":
      return {
        label: "YAML",
        badgeBg: "bg-amber-950/40 text-amber-500 border-amber-905/30",
        desc: "YAML Hierarchical Config",
        isConfigurable: true,
        iconColor: "text-amber-500",
      };
    case "xml":
      return {
        label: "XML",
        badgeBg: "bg-cyan-950/40 text-cyan-400 border-cyan-905/30",
        desc: "XML Markup Configuration",
        isConfigurable: true,
        iconColor: "text-cyan-400",
      };
    case "sh":
    case "bat":
    case "cmd":
      return {
        label: "SCRIPT",
        badgeBg: "bg-emerald-950/40 text-emerald-400 border-emerald-905/30",
        desc: "Automatisierungs-Skript",
        isConfigurable: false,
        iconColor: "text-emerald-400",
      };
    case "log":
      return {
        label: "LOG",
        badgeBg: "bg-neutral-900 text-neutral-400 border-neutral-800",
        desc: "Server System-Protokoll",
        isConfigurable: false,
        iconColor: "text-zinc-500",
      };
    default:
      return {
        label: ext.toUpperCase() || "TEXT",
        badgeBg: "bg-zinc-950/40 text-zinc-400 border-zinc-905/20",
        desc: "Textdatei / Server-Skript",
        isConfigurable: false,
        iconColor: "text-zinc-400",
      };
  }
}

export default function FileExplorerTree({
  nodes,
  depth = 0,
  selectedFile,
  expandedFolders,
  onToggleFolder,
  onSelectFile,
  onDeletePath,
  accentColor
}: FileExplorerTreeProps) {
  
  const sortedKeys = Object.keys(nodes).sort((a, b) => {
    const aIsDir = nodes[a].isDirectory;
    const bIsDir = nodes[b].isDirectory;
    if (aIsDir && !bIsDir) return -1;
    if (!aIsDir && bIsDir) return 1;
    return a.localeCompare(b);
  });

  const accentText = {
    indigo: "text-indigo-400",
    emerald: "text-emerald-400",
    orange: "text-orange-400",
    pink: "text-pink-400"
  }[accentColor];

  const accentBorderActive = {
    indigo: "border-indigo-500/40 bg-indigo-950/15 text-white",
    emerald: "border-emerald-500/40 bg-emerald-950/15 text-white",
    orange: "border-orange-500/40 bg-orange-950/15 text-white",
    pink: "border-pink-500/40 bg-pink-950/15 text-white",
  }[accentColor];

  return (
    <div className="space-y-0.5 w-full select-none" id={`tree-depth-${depth}`}>
      {sortedKeys.map((key) => {
        const node = nodes[key];
        const isDirectory = node.isDirectory;

        if (isDirectory) {
          const isExpanded = !!expandedFolders[node.path];
          return (
            <div key={node.path} className="w-full">
              {/* Folder Row */}
              <div 
                style={{ paddingLeft: `${depth * 12 + 6}px` }}
                className="group flex items-center justify-between py-1 pr-1.5 rounded hover:bg-neutral-900/45 transition-colors cursor-pointer text-zinc-400 hover:text-white"
                onClick={() => onToggleFolder(node.path)}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="text-neutral-500 shrink-0">
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </span>
                  
                  {isExpanded ? (
                    <FolderOpen className="w-4 h-4 text-amber-500/80 shrink-0" />
                  ) : (
                    <Folder className="w-4 h-4 text-amber-500/70 shrink-0" />
                  )}
                  
                  <span className="text-[11px] font-mono font-semibold tracking-wide truncate capitalize text-zinc-300 group-hover:text-white">
                    {node.name}
                  </span>
                </div>

                {/* Directory Hover Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-neutral-950/80 rounded px-1.5 py-0.5 duration-200">
                  <button
                    type="button"
                    title="Verzeichnis löschen"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePath(node.path, true);
                    }}
                    className="text-red-400 hover:text-red-300 p-0.5 rounded transition duration-150 cursor-pointer hover:bg-red-950/30"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Recursive Children (Toggleable Visibility) */}
              {isExpanded && node.children && (
                <div className="border-l border-neutral-850/60 ml-3.5 mt-0.5 space-y-0.5 w-full">
                  <FileExplorerTree
                    nodes={node.children}
                    depth={depth + 1}
                    selectedFile={selectedFile}
                    expandedFolders={expandedFolders}
                    onToggleFolder={onToggleFolder}
                    onSelectFile={onSelectFile}
                    onDeletePath={onDeletePath}
                    accentColor={accentColor}
                  />
                </div>
              )}
            </div>
          );
        } else {
          // File node
          const file = node.file;
          const isSelected = selectedFile?.path === file.path;
          const typeInfo = getFileDataTypeInfo(file.name);

          return (
            <div
              key={file.path}
              style={{ paddingLeft: `${depth * 12 + 18}px` }}
              className={`group flex items-center justify-between py-1 pr-1.5 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? `${accentBorderActive}`
                  : "bg-transparent border-transparent text-neutral-400 hover:bg-neutral-900/35 hover:text-white"
              }`}
              onClick={() => onSelectFile(file)}
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                {typeInfo.label === "JSON" || typeInfo.label === "PROP" || typeInfo.label === "CFG" || typeInfo.label === "YAML" || typeInfo.label === "XML" ? (
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${typeInfo.iconColor}`} />
                ) : typeInfo.label === "SCRIPT" ? (
                  <Terminal className={`w-3.5 h-3.5 shrink-0 ${typeInfo.iconColor}`} />
                ) : (
                  <FileText className={`w-3.5 h-3.5 shrink-0 ${typeInfo.iconColor}`} />
                )}

                <span className="text-[11px] font-mono truncate leading-none text-zinc-300">
                  {file.name}
                </span>

                {/* Inline type badge */}
                <span className={`text-[8px] font-mono px-1 rounded border scale-90 origin-left select-none ${typeInfo.badgeBg}`}>
                  {typeInfo.label}
                </span>

                {typeInfo.isConfigurable && (
                  <span className="text-[8px] text-zinc-550 font-mono hidden group-hover:inline-block scale-90">
                    (Editor + Form)
                  </span>
                )}
              </div>

              {/* File size & Hover Delete actions */}
              <div className="flex items-center gap-2">
                <span className="text-[8.5px] text-neutral-600 font-mono group-hover:hidden select-none">
                  {file.size}
                </span>

                <div className="hidden group-hover:flex items-center gap-1 bg-neutral-950/80 rounded px-1.5 py-0.5">
                  <button
                    type="button"
                    title="Datei permanent löschen"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePath(file.path, false);
                    }}
                    className="text-red-400 hover:text-red-300 p-0.5 rounded transition duration-150 cursor-pointer hover:bg-red-950/30"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        }
      })}
    </div>
  );
}
