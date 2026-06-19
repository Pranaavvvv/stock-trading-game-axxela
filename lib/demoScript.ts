/**
 * Hardcoded scripted replay data for the Demo page.
 *
 * Scenario: digits [4, 8, 3, 1, 0, 9], sum = 25
 * 6 demo bots: Demo_Alpha, Demo_Vega, Demo_Theta, Demo_Gamma, Demo_Delta, Demo_Zeta
 */

export interface DemoOrder {
  username: string;
  side: "BUY" | "SELL";
  price: number;
}

export interface DemoTradeRow {
  partner: string;
  price: number;
  action: "Buy" | "Sell";
}

export interface DemoWorkingOrder {
  side: "BUY" | "SELL";
  price: number;
}

export interface DemoFrame {
  round: number; // 1-6, 0 = settlement
  digitMask: (string | null)[];
  timeRemainingLabel?: string;
  orderBook: { bids: DemoOrder[]; asks: DemoOrder[] };
  highlightedEvent?: {
    type: "ORDER_PLACED" | "ORDER_FILLED" | "POSITION_CAPPED" | "DIGIT_REVEALED" | "SETTLEMENT";
    detail: string;
  };
  caption: string;
  tradesPanelSnapshot: DemoTradeRow[];
  workingOrdersSnapshot: DemoWorkingOrder[];
}

export const DEMO_PLAYERS = [
  { username: "Demo_Alpha", absoluteSeatIndex: 0, connected: true, isAdmin: false, isBot: true },
  { username: "Demo_Vega",  absoluteSeatIndex: 1, connected: true, isAdmin: false, isBot: true },
  { username: "Demo_Theta", absoluteSeatIndex: 2, connected: true, isAdmin: false, isBot: true },
  { username: "Demo_Gamma", absoluteSeatIndex: 3, connected: true, isAdmin: false, isBot: true },
  { username: "Demo_Delta", absoluteSeatIndex: 4, connected: true, isAdmin: false, isBot: true },
  { username: "Demo_Zeta",  absoluteSeatIndex: 5, connected: true, isAdmin: false, isBot: true },
];

export const DEMO_DIGITS = [4, 8, 3, 1, 0, 9];
export const DEMO_SETTLEMENT_PRICE = 25;

export const DEMO_FRAMES: DemoFrame[] = [
  // ── Round 1: Fully blind trading ──
  {
    round: 1,
    digitMask: [null, null, null, null, null, null],
    timeRemainingLabel: "1:28",
    orderBook: { bids: [], asks: [] },
    highlightedEvent: { type: "DIGIT_REVEALED", detail: "Round 1 begins — no digits revealed yet" },
    caption: "Welcome to AXXEL! Round 1 starts with no information — all 6 digits are hidden. The sum could be anywhere from 0 to 54. Traders must speculate purely on intuition.",
    tradesPanelSnapshot: [],
    workingOrdersSnapshot: [],
  },
  {
    round: 1,
    digitMask: [null, null, null, null, null, null],
    timeRemainingLabel: "1:15",
    orderBook: {
      bids: [{ username: "Demo_Gamma", side: "BUY", price: 20 }],
      asks: [{ username: "Demo_Vega", side: "SELL", price: 32 }],
    },
    highlightedEvent: { type: "ORDER_PLACED", detail: "Demo_Gamma places a Buy at 20, Demo_Vega places a Sell at 32" },
    caption: "Players start placing orders. Demo_Gamma bids 20 (bullish on a lower sum) while Demo_Vega offers to sell at 32. With no information, prices are spread wide — a 12-point gap between the best bid and best ask.",
    tradesPanelSnapshot: [],
    workingOrdersSnapshot: [],
  },
  {
    round: 1,
    digitMask: [null, null, null, null, null, null],
    timeRemainingLabel: "0:52",
    orderBook: {
      bids: [
        { username: "Demo_Alpha", side: "BUY", price: 26 },
        { username: "Demo_Gamma", side: "BUY", price: 20 },
      ],
      asks: [
        { username: "Demo_Theta", side: "SELL", price: 30 },
      ],
    },
    highlightedEvent: { type: "ORDER_FILLED", detail: "Demo_Alpha buys from Demo_Vega at 32!" },
    caption: "First trade! Demo_Alpha crosses the spread — placing a Buy at 32, which matches Demo_Vega's resting Sell at 32. The execution price is always the resting (maker) order's price. Demo_Alpha now holds +1 position.",
    tradesPanelSnapshot: [
      { partner: "Demo_Vega", price: 32, action: "Buy" },
    ],
    workingOrdersSnapshot: [],
  },

  // ── Round 2: D1=4 revealed ──
  {
    round: 2,
    digitMask: ["4", null, null, null, null, null],
    timeRemainingLabel: "1:30",
    orderBook: { bids: [], asks: [] },
    highlightedEvent: { type: "DIGIT_REVEALED", detail: "First digit revealed: 4" },
    caption: "Round 2 — the first digit is revealed: 4. Now traders know at least 4 is locked in. Expected value shifts: 4 + (5 × 4.5) = 26.5. Watch how the order book tightens around this estimate.",
    tradesPanelSnapshot: [
      { partner: "Demo_Vega", price: 32, action: "Buy" },
    ],
    workingOrdersSnapshot: [],
  },
  {
    round: 2,
    digitMask: ["4", null, null, null, null, null],
    timeRemainingLabel: "1:05",
    orderBook: {
      bids: [
        { username: "Demo_Delta", side: "BUY", price: 25 },
        { username: "Demo_Zeta", side: "BUY", price: 24 },
      ],
      asks: [
        { username: "Demo_Vega", side: "SELL", price: 28 },
        { username: "Demo_Theta", side: "SELL", price: 29 },
      ],
    },
    highlightedEvent: { type: "ORDER_PLACED", detail: "Spread tightens: bids around 24-25, asks around 28-29" },
    caption: "The spread narrows significantly! With one digit known, traders cluster around the expected value of ~26.5. The bid-ask spread has shrunk from 12 points to just 3. Information reduces uncertainty.",
    tradesPanelSnapshot: [
      { partner: "Demo_Vega", price: 32, action: "Buy" },
    ],
    workingOrdersSnapshot: [
      { side: "BUY", price: 25 },
    ],
  },

  // ── Round 3: D1=4, D2=8 revealed ──
  {
    round: 3,
    digitMask: ["4", "8", null, null, null, null],
    timeRemainingLabel: "1:30",
    orderBook: { bids: [], asks: [] },
    highlightedEvent: { type: "DIGIT_REVEALED", detail: "Second digit revealed: 8" },
    caption: "Round 3 — second digit is 8! That's a high digit. New expected value: 4 + 8 + (4 × 4.5) = 30. The market should adjust upward. Demo_Alpha's earlier buy at 32 is looking less aggressive now.",
    tradesPanelSnapshot: [
      { partner: "Demo_Vega", price: 32, action: "Buy" },
    ],
    workingOrdersSnapshot: [],
  },
  {
    round: 3,
    digitMask: ["4", "8", null, null, null, null],
    timeRemainingLabel: "0:45",
    orderBook: {
      bids: [
        { username: "Demo_Gamma", side: "BUY", price: 28 },
      ],
      asks: [
        { username: "Demo_Alpha", side: "SELL", price: 31 },
      ],
    },
    highlightedEvent: { type: "ORDER_FILLED", detail: "Demo_Theta sells to Demo_Gamma at 28" },
    caption: "Demo_Gamma gets more aggressive, buying at 28. The 8 shifted expected value up — everyone recalculates. Trades are happening closer to the evolving fair value estimate of ~30.",
    tradesPanelSnapshot: [
      { partner: "Demo_Gamma", price: 28, action: "Sell" },
      { partner: "Demo_Vega", price: 32, action: "Buy" },
    ],
    workingOrdersSnapshot: [],
  },

  // ── Round 4: D1=4, D2=8, D3=3 revealed ──
  {
    round: 4,
    digitMask: ["4", "8", "3", null, null, null],
    timeRemainingLabel: "1:30",
    orderBook: { bids: [], asks: [] },
    highlightedEvent: { type: "DIGIT_REVEALED", detail: "Third digit revealed: 3" },
    caption: "Round 4 — third digit is 3. Expected value: 4 + 8 + 3 + (3 × 4.5) = 28.5. The estimate dipped slightly. Three digits known, three to go — uncertainty is shrinking with each reveal.",
    tradesPanelSnapshot: [
      { partner: "Demo_Gamma", price: 28, action: "Sell" },
      { partner: "Demo_Vega", price: 32, action: "Buy" },
    ],
    workingOrdersSnapshot: [],
  },
  {
    round: 4,
    digitMask: ["4", "8", "3", null, null, null],
    timeRemainingLabel: "0:38",
    orderBook: {
      bids: [
        { username: "Demo_Alpha", side: "BUY", price: 27 },
      ],
      asks: [
        { username: "Demo_Zeta", side: "SELL", price: 29 },
      ],
    },
    highlightedEvent: { type: "POSITION_CAPPED", detail: "Demo_Alpha hits +2 position limit!" },
    caption: "⚠️ Demo_Alpha tries to buy again but hits the +2 position cap! With 2 contracts already long, the Buy button is disabled. This is the maximum you can hold in one direction. Demo_Alpha must wait or sell to free up capacity.",
    tradesPanelSnapshot: [
      { partner: "Demo_Gamma", price: 28, action: "Sell" },
      { partner: "Demo_Vega", price: 32, action: "Buy" },
    ],
    workingOrdersSnapshot: [
      { side: "BUY", price: 27 },
    ],
  },

  // ── Round 5: D1=4, D2=8, D3=3, D4=1 revealed ──
  {
    round: 5,
    digitMask: ["4", "8", "3", "1", null, null],
    timeRemainingLabel: "1:30",
    orderBook: { bids: [], asks: [] },
    highlightedEvent: { type: "DIGIT_REVEALED", detail: "Fourth digit revealed: 1" },
    caption: "Round 5 — fourth digit is 1. Expected value: 4 + 8 + 3 + 1 + (2 × 4.5) = 25. Only 2 unknown digits remain. The price range is narrowing dramatically — the sum must be between 16 (if both unknowns are 0) and 34 (if both are 9).",
    tradesPanelSnapshot: [
      { partner: "Demo_Gamma", price: 28, action: "Sell" },
      { partner: "Demo_Vega", price: 32, action: "Buy" },
    ],
    workingOrdersSnapshot: [],
  },
  {
    round: 5,
    digitMask: ["4", "8", "3", "1", null, null],
    timeRemainingLabel: "0:55",
    orderBook: {
      bids: [
        { username: "Demo_Gamma", side: "BUY", price: 24 },
        { username: "Demo_Delta", side: "BUY", price: 23 },
      ],
      asks: [
        { username: "Demo_Vega", side: "SELL", price: 26 },
        { username: "Demo_Alpha", side: "SELL", price: 27 },
      ],
    },
    highlightedEvent: { type: "ORDER_FILLED", detail: "Tight market — only 2 points between best bid and ask" },
    caption: "The market is very tight now! Best bid at 24, best ask at 26 — just a 2-point spread. With 4 digits known, experienced traders are converging on similar estimates. Every tick of information sharpens the market.",
    tradesPanelSnapshot: [
      { partner: "Demo_Gamma", price: 28, action: "Sell" },
      { partner: "Demo_Vega", price: 32, action: "Buy" },
    ],
    workingOrdersSnapshot: [
      { side: "SELL", price: 27 },
    ],
  },

  // ── Round 6: D1=4, D2=8, D3=3, D4=1, D5=0 revealed ──
  {
    round: 6,
    digitMask: ["4", "8", "3", "1", "0", null],
    timeRemainingLabel: "1:30",
    orderBook: { bids: [], asks: [] },
    highlightedEvent: { type: "DIGIT_REVEALED", detail: "Fifth digit revealed: 0" },
    caption: "Round 6 — fifth digit is 0! Only one digit unknown. Sum so far: 4+8+3+1+0 = 16. The final sum will be between 16 and 25 (since the last digit is 0-9). Expected value: 16 + 4.5 = 20.5.",
    tradesPanelSnapshot: [
      { partner: "Demo_Gamma", price: 28, action: "Sell" },
      { partner: "Demo_Vega", price: 32, action: "Buy" },
    ],
    workingOrdersSnapshot: [],
  },
  {
    round: 6,
    digitMask: ["4", "8", "3", "1", "0", null],
    timeRemainingLabel: "0:20",
    orderBook: {
      bids: [
        { username: "Demo_Theta", side: "BUY", price: 20 },
      ],
      asks: [
        { username: "Demo_Alpha", side: "SELL", price: 21 },
      ],
    },
    highlightedEvent: { type: "ORDER_FILLED", detail: "Final round trading — razor-thin spread" },
    caption: "The spread is just 1 point! With only a single unknown digit, everyone knows the range is 16-25. The market is incredibly efficient now — compare this to Round 1's 12-point spread. This price convergence is the key insight of AXXEL.",
    tradesPanelSnapshot: [
      { partner: "Demo_Alpha", price: 21, action: "Buy" },
      { partner: "Demo_Gamma", price: 28, action: "Sell" },
      { partner: "Demo_Vega", price: 32, action: "Buy" },
    ],
    workingOrdersSnapshot: [],
  },

  // ── Settlement ──
  {
    round: 0,
    digitMask: ["4", "8", "3", "1", "0", "9"],
    timeRemainingLabel: "—",
    orderBook: { bids: [], asks: [] },
    highlightedEvent: { type: "SETTLEMENT", detail: "Final digit revealed: 9! Sum = 25" },
    caption: "🎯 Settlement! The last digit is 9 — the final sum is 4+8+3+1+0+9 = 25. All open positions are automatically closed at 25. Players who bought below 25 profit; those who sold below 25 take losses. The leaderboard reveals who read the market best!",
    tradesPanelSnapshot: [
      { partner: "Demo_Alpha", price: 21, action: "Buy" },
      { partner: "Demo_Gamma", price: 28, action: "Sell" },
      { partner: "Demo_Vega", price: 32, action: "Buy" },
    ],
    workingOrdersSnapshot: [],
  },

  // ── Leaderboard ──
  {
    round: -1,
    digitMask: ["4", "8", "3", "1", "0", "9"],
    timeRemainingLabel: "—",
    orderBook: { bids: [], asks: [] },
    highlightedEvent: { type: "SETTLEMENT", detail: "Final leaderboard" },
    caption: "Game over! The leaderboard shows final PnL for all players. Ready to try it yourself? Head to the lobby and play a real game — your experience watching this demo will give you a head start!",
    tradesPanelSnapshot: [],
    workingOrdersSnapshot: [],
  },
];
