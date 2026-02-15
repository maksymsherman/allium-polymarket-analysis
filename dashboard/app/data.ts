// Static data from the Polymarket calibration analysis (v2)
// Source: queries/01_accuracy_and_calibration.sql, queries/02_by_category_and_quarter.sql

export interface CalibrationRow {
  bucket: string;
  midpoint: number;
  winRate: number;
  bias: number;
  n: number;
  ciLo?: number;
  ciHi?: number;
}

export const binaryCalibration: CalibrationRow[] = [
  { bucket: "0–5%", midpoint: 2.5, winRate: 0.8, bias: 0.1, n: 4945, ciLo: 0.6, ciHi: 1.1 },
  { bucket: "5–10%", midpoint: 7.5, winRate: 7.0, bias: 0.3, n: 517, ciLo: 4.8, ciHi: 9.2 },
  { bucket: "10–20%", midpoint: 15, winRate: 15.7, bias: 1.7, n: 649, ciLo: 12.9, ciHi: 18.5 },
  { bucket: "20–30%", midpoint: 25, winRate: 25.7, bias: 1.5, n: 498, ciLo: 21.9, ciHi: 29.5 },
  { bucket: "30–40%", midpoint: 35, winRate: 35.5, bias: 1.2, n: 504, ciLo: 31.3, ciHi: 39.7 },
  { bucket: "40–50%", midpoint: 45, winRate: 47.8, bias: 3.2, n: 500, ciLo: 43.4, ciHi: 52.2 },
  { bucket: "50–60%", midpoint: 55, winRate: 56.7, bias: 2.2, n: 402, ciLo: 51.9, ciHi: 61.6 },
  { bucket: "60–70%", midpoint: 65, winRate: 67.9, bias: 3.4, n: 405, ciLo: 63.4, ciHi: 72.4 },
  { bucket: "70–80%", midpoint: 75, winRate: 82.5, bias: 8.0, n: 428, ciLo: 78.9, ciHi: 86.1 },
  { bucket: "80–90%", midpoint: 85, winRate: 84.8, bias: 0.4, n: 481, ciLo: 81.6, ciHi: 88.0 },
  { bucket: "90–95%", midpoint: 92.5, winRate: 92.7, bias: 0.8, n: 330, ciLo: 89.9, ciHi: 95.5 },
  { bucket: "95–100%", midpoint: 97.5, winRate: 98.8, bias: -0.1, n: 1525, ciLo: 98.2, ciHi: 99.3 },
];

export const multiCalibration: CalibrationRow[] = [
  { bucket: "0–5%", midpoint: 2.5, winRate: 0.5, bias: -0.1, n: 40605 },
  { bucket: "5–10%", midpoint: 7.5, winRate: 6.5, bias: -0.3, n: 3047 },
  { bucket: "10–20%", midpoint: 15, winRate: 12.2, bias: -2.2, n: 3958 },
  { bucket: "20–30%", midpoint: 25, winRate: 24.6, bias: 0.0, n: 4874 },
  { bucket: "30–40%", midpoint: 35, winRate: 31.5, bias: -2.5, n: 2612 },
  { bucket: "40–50%", midpoint: 45, winRate: 38.8, bias: -5.4, n: 1846 },
  { bucket: "50–60%", midpoint: 55, winRate: 52.4, bias: -2.4, n: 1096 },
  { bucket: "60–70%", midpoint: 65, winRate: 62.7, bias: -2.0, n: 755 },
  { bucket: "70–80%", midpoint: 75, winRate: 72.4, bias: -1.8, n: 626 },
  { bucket: "80–90%", midpoint: 85, winRate: 83.1, bias: -1.5, n: 740 },
  { bucket: "90–95%", midpoint: 92.5, winRate: 92.5, bias: -0.2, n: 712 },
  { bucket: "95–100%", midpoint: 97.5, winRate: 98.4, bias: -1.0, n: 4550 },
];

export interface CategoryRow {
  category: string;
  binaryAcc: number;
  multiAcc: number;
  binaryN: number;
  multiN: number;
}

export const categoryData: CategoryRow[] = [
  { category: "Sports", binaryAcc: 67.9, multiAcc: 72.0, binaryN: 778, multiN: 10448 },
  { category: "Politics", binaryAcc: 72.1, multiAcc: 78.4, binaryN: 2012, multiN: 577 },
  { category: "Crypto", binaryAcc: 78.7, multiAcc: 70.5, binaryN: 480, multiN: 1987 },
  { category: "Culture", binaryAcc: 76.3, multiAcc: 75.2, binaryN: 135, multiN: 1007 },
  { category: "Weather", binaryAcc: 75.0, multiAcc: 87.8, binaryN: 9, multiN: 1205 },
  { category: "Business", binaryAcc: 70.3, multiAcc: 74.2, binaryN: 238, multiN: 298 },
  { category: "Technology", binaryAcc: 81.7, multiAcc: 71.2, binaryN: 62, multiN: 114 },
];

export const marketStructure = {
  binary: { tokens: 13108, questions: 13108, tokensPerQ: 1.0 },
  multi: { tokens: 93876, questions: 13160, tokensPerQ: 7.1 },
  unknown: { tokens: 1877, questions: 1877 },
  total: { tokens: 108861, questions: 28145 },
  analysisTokens: { binary: 11296, multi: 65145, total: 76441 },
  tailPct: { binary: 54, multi: 75 },
};
