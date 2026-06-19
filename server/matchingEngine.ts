import type { Order, OrderSide, PlayerState, TradeRecord } from "../lib/types";
import { processFill } from "./pnlEngine";

let orderIdCounter = 0;

function generateOrderId(): string {
  return `ORD-${Date.now()}-${++orderIdCounter}`;
}

export interface MatchResult {
  fills: TradeRecord[];
  rejectionReason?: "MAX_LONG_LIMIT" | "MAX_SHORT_LIMIT" | "INVALID_PRICE";
}

export class MatchingEngine {
  // Bids sorted descending by price, then by timestamp (ascending) for ties
  private bids: Order[] = [];
  // Asks sorted ascending by price, then by timestamp (ascending) for ties
  private asks: Order[] = [];

  getBids(): Order[] {
    return [...this.bids];
  }

  getAsks(): Order[] {
    return [...this.asks];
  }

  /**
   * Get all resting orders for a specific user
   */
  getRestingOrders(username: string): Order[] {
    return [
      ...this.bids.filter((o) => o.username === username),
      ...this.asks.filter((o) => o.username === username),
    ];
  }

  /**
   * Calculate potential position = current position + same-side resting orders
   */
  private getPotentialPosition(
    playerState: PlayerState,
    side: OrderSide
  ): number {
    const restingSameSide =
      side === "BUY"
        ? this.bids.filter((o) => o.username === playerState.username).length
        : this.asks.filter((o) => o.username === playerState.username).length;

    return side === "BUY"
      ? playerState.position + restingSameSide
      : playerState.position - restingSameSide;
  }

  /**
   * Submit an order: validate, attempt matching, rest remainder if unmatched.
   * Returns fills and optional rejection reason.
   */
  submitOrder(
    username: string,
    side: OrderSide,
    price: number,
    playerStates: Map<string, PlayerState>
  ): MatchResult {
    // Validate price range
    if (!Number.isInteger(price) || price < 0 || price > 54) {
      return { fills: [], rejectionReason: "INVALID_PRICE" };
    }

    const playerState = playerStates.get(username);
    if (!playerState) {
      return { fills: [], rejectionReason: "INVALID_PRICE" };
    }

    // Check potential position cap
    const potentialPos = this.getPotentialPosition(playerState, side);
    if (side === "BUY" && potentialPos >= 2) {
      return { fills: [], rejectionReason: "MAX_LONG_LIMIT" };
    }
    if (side === "SELL" && potentialPos <= -2) {
      return { fills: [], rejectionReason: "MAX_SHORT_LIMIT" };
    }

    const incomingOrder: Order = {
      id: generateOrderId(),
      username,
      side,
      price,
      timestamp: Date.now(),
    };

    const fills: TradeRecord[] = [];

    if (side === "BUY") {
      // Try to match against resting asks (lowest first)
      const fill = this.tryMatchBuy(incomingOrder, playerStates);
      if (fill) {
        fills.push(fill);
      } else {
        // Rest in bid book
        this.insertBid(incomingOrder);
      }
    } else {
      // Try to match against resting bids (highest first)
      const fill = this.tryMatchSell(incomingOrder, playerStates);
      if (fill) {
        fills.push(fill);
      } else {
        // Rest in ask book
        this.insertAsk(incomingOrder);
      }
    }

    return { fills };
  }

  /**
   * Try to match an incoming BUY against the ask book.
   * Incoming BUY at price P matches the lowest resting ASK ≤ P.
   * Execution price = maker (resting) order's price.
   */
  private tryMatchBuy(
    incoming: Order,
    playerStates: Map<string, PlayerState>
  ): TradeRecord | null {
    for (let i = 0; i < this.asks.length; i++) {
      const ask = this.asks[i];

      // Price check: incoming buy price must be >= resting ask price
      if (incoming.price < ask.price) break; // asks are sorted ascending, no more matches

      // Self-trade rejection
      if (ask.username === incoming.username) continue;

      // Match found — execute at maker (ask) price
      this.asks.splice(i, 1);

      const fillPrice = ask.price;
      const buyer = incoming.username;
      const seller = ask.username;

      // Update PnL for both parties
      const buyerState = playerStates.get(buyer)!;
      const sellerState = playerStates.get(seller)!;
      processFill(buyerState, fillPrice, "BUY");
      processFill(sellerState, fillPrice, "SELL");

      // Remove from resting orders tracking
      buyerState.restingOrders = buyerState.restingOrders.filter(
        (o) => o.id !== incoming.id
      );
      sellerState.restingOrders = sellerState.restingOrders.filter(
        (o) => o.id !== ask.id
      );

      return {
        buyer,
        seller,
        price: fillPrice,
        timestamp: Date.now(),
      };
    }
    return null;
  }

  /**
   * Try to match an incoming SELL against the bid book.
   * Incoming SELL at price P matches the highest resting BID ≥ P.
   * Execution price = maker (bid) order's price.
   */
  private tryMatchSell(
    incoming: Order,
    playerStates: Map<string, PlayerState>
  ): TradeRecord | null {
    for (let i = 0; i < this.bids.length; i++) {
      const bid = this.bids[i];

      // Price check: incoming sell price must be <= resting bid price
      if (incoming.price > bid.price) break; // bids sorted descending, no more matches

      // Self-trade rejection
      if (bid.username === incoming.username) continue;

      // Match found — execute at maker (bid) price
      this.bids.splice(i, 1);

      const fillPrice = bid.price;
      const buyer = bid.username;
      const seller = incoming.username;

      // Update PnL for both parties
      const buyerState = playerStates.get(buyer)!;
      const sellerState = playerStates.get(seller)!;
      processFill(buyerState, fillPrice, "BUY");
      processFill(sellerState, fillPrice, "SELL");

      // Remove from resting orders tracking
      buyerState.restingOrders = buyerState.restingOrders.filter(
        (o) => o.id !== bid.id
      );
      sellerState.restingOrders = sellerState.restingOrders.filter(
        (o) => o.id !== incoming.id
      );

      return {
        buyer,
        seller,
        price: fillPrice,
        timestamp: Date.now(),
      };
    }
    return null;
  }

  /**
   * Insert a bid maintaining descending price order, timestamp tiebreak
   */
  private insertBid(order: Order): void {
    let idx = 0;
    while (idx < this.bids.length) {
      if (
        order.price > this.bids[idx].price ||
        (order.price === this.bids[idx].price &&
          order.timestamp < this.bids[idx].timestamp)
      ) {
        break;
      }
      idx++;
    }
    this.bids.splice(idx, 0, order);
  }

  /**
   * Insert an ask maintaining ascending price order, timestamp tiebreak
   */
  private insertAsk(order: Order): void {
    let idx = 0;
    while (idx < this.asks.length) {
      if (
        order.price < this.asks[idx].price ||
        (order.price === this.asks[idx].price &&
          order.timestamp < this.asks[idx].timestamp)
      ) {
        break;
      }
      idx++;
    }
    this.asks.splice(idx, 0, order);
  }

  /**
   * Cancel a specific order by ID (used by Hard bots)
   */
  cancelOrder(orderId: string): boolean {
    let idx = this.bids.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      this.bids.splice(idx, 1);
      return true;
    }
    idx = this.asks.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      this.asks.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Clear all resting orders (called at round end)
   */
  clearAll(): void {
    this.bids = [];
    this.asks = [];
  }

  /**
   * Cancel all resting orders for a specific user
   */
  cancelAllForUser(username: string): Order[] {
    const cancelled: Order[] = [];
    this.bids = this.bids.filter((o) => {
      if (o.username === username) {
        cancelled.push(o);
        return false;
      }
      return true;
    });
    this.asks = this.asks.filter((o) => {
      if (o.username === username) {
        cancelled.push(o);
        return false;
      }
      return true;
    });
    return cancelled;
  }
}
