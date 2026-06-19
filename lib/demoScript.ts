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
    caption: "Welcome to AXXEL, the digit sum trading game! On the left side of your screen is the game board where six hidden digits are seated. On the right side, you'll see the Market Order Book, your Working Orders, and the Trades panel. The goal of the game is simple: predict the sum of all six digits. Each digit can be anything from 0 to 9, meaning the final sum will be anywhere between 0 and 54. Round 1 starts with no information—all six digits are hidden. Traders must speculate purely on intuition.",
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
    caption: "Players start placing orders in the Order Book. Demo Gamma bids 20, which is a bullish move on a lower total sum, while Demo Vega offers to sell at 32. Because there is no information yet, the prices are spread wide. There is a 12-point gap between the highest bid and the lowest ask.",
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
    caption: "We have our first trade! Demo Alpha crosses the spread, placing a Buy at 32, which automatically matches Demo Vega's resting Sell at 32. The execution price is always the resting order's price. Demo Alpha now holds a position of plus one.",
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
    caption: "Round 2 begins, and the first digit is revealed on the board: it's a 4. Now, all traders know that at least 4 points are locked in. Let's do some math: The average value of a random digit from 0 to 9 is 4.5. Since there are 5 unknown digits left, we multiply 5 by 4.5 to get 22.5. Adding the known 4 gives us a new Expected Value of 26.5. Watch how the order book tightens around this new mathematical estimate.",
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
    caption: "Look at the Order Book now. The spread narrows significantly! With one digit known, traders are clustering their bids and asks around the expected value of 26.5. The bid-ask spread has shrunk from 12 points down to just 3 points. Information instantly reduces market uncertainty.",
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
    caption: "Round 3. The second digit is revealed, and it's an 8! That is a very high digit. Our new expected value calculation is: 4 plus 8, which is 12, plus 4 unknown digits times 4.5, giving us exactly 30. The market should adjust upward immediately. Demo Alpha's earlier buy at 32 is looking much less aggressive now.",
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
    caption: "Demo Gamma gets more aggressive, buying at 28. The high digit 8 shifted the expected value up, and everyone is rapidly recalculating. Trades are now happening closer to the evolving fair value estimate of 30.",
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
    caption: "Round 4. The third digit is a 3. The new expected value is 4 plus 8 plus 3, plus 3 unknowns times 4.5, which equals 28.5. The estimate dipped slightly. Three digits are known, and three are left. The uncertainty is shrinking with each round.",
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
    caption: "Attention! Demo Alpha tries to buy again but hits the plus 2 position cap. In AXXEL, you can only hold a maximum position of plus 2 or minus 2 at any time. Because they already hold 2 long contracts, their Buy button is disabled. Demo Alpha must wait, or sell a contract, to free up their trading capacity.",
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
    caption: "Round 5. The fourth digit is a 1. The expected value is now 25. Only 2 unknown digits remain. The absolute bounds of the price range are narrowing dramatically. The sum must be at least 16 if both unknowns are 0, and at most 34 if both are 9.",
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
    caption: "The market is extremely tight now! The best bid is at 24, and the best ask is at 26. Just a 2-point spread. With 4 digits known, experienced traders are converging on very similar estimates. Every tick of information sharpens the market.",
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
    caption: "Round 6. The fifth digit is a 0! Only a single digit remains unknown. The sum of the visible digits is 16. The final sum is guaranteed to be between 16 and 25. The mathematical expected value is exactly 20.5.",
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
    caption: "The spread is just 1 point! Everyone knows the exact range is 16 to 25. The market is incredibly efficient now. Compare this to the 12-point spread back in Round 1. This rapid price convergence is the core mechanic of AXXEL.",
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
    caption: "Game over! Settlement time! The last digit is 9, making the final sum exactly 25. All open positions are automatically closed at a price of 25. Players who bought below 25 profit, while those who sold below 25 take losses. The leaderboard is about to reveal who read the market best!",
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
    caption: "The leaderboard is up, showing the final realized profit and loss for all players. Are you ready to try it yourself? Head back to the lobby, create a room, and invite some friends to play a real game! Your experience watching this tutorial gives you a huge head start.",
    tradesPanelSnapshot: [],
    workingOrdersSnapshot: [],
  },
];
