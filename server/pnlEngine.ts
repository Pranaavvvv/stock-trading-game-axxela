import type { PlayerState, OrderSide } from "../lib/types";

/**
 * Process a fill for a player — updates position, avgPrice, and realizedPnl.
 * Returns the updated PlayerState (mutates in place for efficiency).
 *
 * Rules:
 * - If the fill increases position magnitude: weighted average price
 * - If the fill reduces position magnitude: realize PnL
 * - Quantity is always 1
 */
export function processFill(
  state: PlayerState,
  fillPrice: number,
  fillSide: OrderSide
): PlayerState {
  const direction = fillSide === "BUY" ? 1 : -1;
  const oldPosition = state.position;
  const newPosition = oldPosition + direction;

  // Update cash balance
  state.balance += fillSide === "BUY" ? -fillPrice : fillPrice;

  // Determine if this fill increases or decreases position magnitude
  const oldMagnitude = Math.abs(oldPosition);
  const newMagnitude = Math.abs(newPosition);

  if (newMagnitude > oldMagnitude) {
    // Increasing position magnitude — weighted average price
    if (oldMagnitude === 0) {
      state.avgPrice = fillPrice;
    } else {
      state.avgPrice =
        (state.avgPrice * oldMagnitude + fillPrice) / newMagnitude;
    }
  } else {
    // Decreasing position magnitude — realize PnL
    if (oldPosition > 0) {
      // Was long, reducing by selling
      state.realizedPnl += fillPrice - state.avgPrice;
    } else if (oldPosition < 0) {
      // Was short, reducing by buying
      state.realizedPnl += state.avgPrice - fillPrice;
    }
    // If newMagnitude is 0, reset avgPrice
    if (newMagnitude === 0) {
      state.avgPrice = 0;
    }
  }

  state.position = newPosition;
  return state;
}

/**
 * Settle a player's position at the final price.
 * Forces position to zero by processing fills at settlement_price.
 */
export function settlePosition(
  state: PlayerState,
  settlementPrice: number
): PlayerState {
  while (state.position !== 0) {
    // If positive, sell to reduce. If negative, buy to reduce.
    const side: OrderSide = state.position > 0 ? "SELL" : "BUY";
    processFill(state, settlementPrice, side);
  }
  return state;
}
