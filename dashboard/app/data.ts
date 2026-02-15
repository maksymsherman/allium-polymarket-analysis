// Live data imported from generated JSON (run `npm run refresh` to update)
// Source: queries/01_accuracy_and_calibration.sql, queries/02_by_category_and_quarter.sql, queries/03_sub_daily_accuracy.sql

import calibrationData from "./generated/calibration.json";
import categoriesData from "./generated/categories.json";
import quartersData from "./generated/quarters.json";
import subDailyData_ from "./generated/sub_daily.json";
import marketStructureData from "./generated/market_structure.json";
import metadataData from "./generated/_metadata.json";

export interface CalibrationRow {
  bucket: string;
  midpoint: number;
  winRate: number;
  bias: number;
  n: number;
  nQuestions?: number;
  ciLo?: number;
  ciHi?: number;
  brierScore?: number;
}

export interface CategoryRow {
  category: string;
  binaryAcc: number | null;
  multiAcc: number | null;
  binaryN: number;
  multiN: number;
}

export interface QuarterRow {
  quarter: string;
  binaryAcc: number | null;
  multiAcc: number | null;
  binaryN: number;
  multiN: number;
  maxResolutionDate: string | null;
}

export interface SubDailyRow {
  horizon: string;
  marketType: string;
  nTokens: number;
  accuracyPct: number;
  brierScore: number;
}

export const binaryCalibration: CalibrationRow[] = calibrationData.binary as CalibrationRow[];
export const multiCalibration: CalibrationRow[] = calibrationData.multi as CalibrationRow[];
export const categoryData: CategoryRow[] = categoriesData as CategoryRow[];
export const quarterData: QuarterRow[] = quartersData as QuarterRow[];
export const subDailyData: SubDailyRow[] = subDailyData_ as SubDailyRow[];
export const marketStructure = marketStructureData;
export const metadata = metadataData;
