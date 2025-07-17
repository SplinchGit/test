import type { Player } from '@/types/game';

declare global {
  var mockPlayers: Map<string, Player> | undefined;
  var mockUsernames: Set<string> | undefined;
}

export {};