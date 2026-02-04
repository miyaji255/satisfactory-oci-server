declare module '@djwoodz/satisfactory-dedicated-server-lightweight-query-probe' {
  export interface ServerData {
    serverName: string;
    serverVersion: string;
    serverState: 'Game ongoing' | 'Waiting for players';
    playerCount: number;
    maxPlayers: number;
  }

  export function probe(
    ip: string,
    port: number,
    timeout: number,
  ): Promise<ServerData>;
}
