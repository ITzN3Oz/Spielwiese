export type ServerStatus = "running" | "stopped" | "updating" | "installing" | "error";

export interface GameServer {
  id: string;
  name: string;
  game: string;
  status: ServerStatus;
  dockerImage: string;
  portMapping: string;
  cpuUsage: number;
  memoryUsage: number; // in MB
  maxMemory: number;  // in MB
  diskUsage: number;   // in GB
  activePlayers: number;
  maxPlayers: number;
  version: string;
  autoUpdate: boolean;
  autoBackup: boolean;
  variables: Record<string, string>;
  created: string;
  iconUrl?: string;
}

export interface Backup {
  id: string;
  serverId: string;
  name: string;
  size: string;
  date: string;
  status: "completed" | "failed";
}

export interface SystemStats {
  cpuLoad: number;
  cpuCores: number;
  ramUsed: number;   // GB
  ramTotal: number;  // GB
  diskUsed: number;  // GB
  diskTotal: number; // GB
  dockerVersion: string;
  containersRunning: number;
  networkIn: number;  // MB/s
  networkOut: number; // MB/s
}

export type UserRole = "admin" | "operator" | "viewer";

export interface DashboardUser {
  id: string;
  username: string;
  role: UserRole;
  lastLogin: string;
  permissions: string[];
  password?: string;
}

export interface ServerLog {
  id: string;
  serverId: string;
  timestamp: string;
  type: "info" | "warn" | "error" | "output";
  message: string;
}

export interface GameTemplate {
  gameKey: string;
  name: string;
  defaultImage: string;
  defaultPort: string;
  icon: string;
  description: string;
  recommendedRam: number; // MB
  defaultVariables: Record<string, string>;
  iconUrl?: string;
}
