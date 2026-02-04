export interface Player {
  userId: string;
  name: string;
  joinRequested: number;
  joined: number;
  joinTime?: number;
}

export interface ServerState {
  version: string;
  online: boolean;
  unreachable: boolean;
}

export interface Database {
  server: ServerState;
  players: Readonly<Record<string, Player>>;
}
