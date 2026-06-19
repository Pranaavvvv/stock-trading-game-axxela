import type { PlayerInfo } from "./types";

export interface DisplaySeat {
  username: string;
  displayLetter: string;
  displaySeatIndex: number;
  /** Angle in degrees for positioning around the oval perimeter */
  angle: number;
  connected: boolean;
  isAdmin: boolean;
}

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

/**
 * Compute egocentric seat rotation for dynamic number of players.
 *
 * Every viewer sees themselves at display seat 0 (bottom-center, letter "A").
 * The relative ordering of all players is preserved —
 * only the starting rotation point changes per viewer.
 *
 * @param allPlayers - Full player list from the server (with absoluteSeatIndex)
 * @param selfAbsoluteSeatIndex - The viewing player's own absolute seat index
 * @returns Array of DisplaySeat objects, one per seat position
 */
export function getDisplaySeating(
  allPlayers: PlayerInfo[],
  selfAbsoluteSeatIndex: number
): DisplaySeat[] {
  const playerCount = allPlayers.length;
  if (playerCount === 0) return [];

  const angleStep = 360 / playerCount;

  return allPlayers
    .map((player) => {
      const displaySeatIndex =
        (player.absoluteSeatIndex - selfAbsoluteSeatIndex + playerCount) % playerCount;

      // 270 is bottom-center. We subtract to go clockwise.
      const angle = (270 - displaySeatIndex * angleStep + 360) % 360;

      return {
        username: player.username,
        displayLetter: LETTERS[displaySeatIndex] || "?",
        displaySeatIndex,
        angle,
        connected: player.connected,
        isAdmin: player.isAdmin,
      };
    })
    .sort((a, b) => a.displaySeatIndex - b.displaySeatIndex);
}

/**
 * Get the display letter for a given username from the viewer's perspective.
 */
export function getDisplayLetter(
  allPlayers: PlayerInfo[],
  selfAbsoluteSeatIndex: number,
  targetUsername: string
): string {
  const seats = getDisplaySeating(allPlayers, selfAbsoluteSeatIndex);
  const seat = seats.find((s) => s.username === targetUsername);
  return seat?.displayLetter ?? "?";
}
