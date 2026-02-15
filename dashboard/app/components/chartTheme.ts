// Shared constants for Tufte-styled Recharts charts.
// Colorblind-safe palette (Paul Tol), serif typography, minimal chrome.

export const FONT = "Georgia, serif";
export const BLACK = "#333333";
export const GRAY = "#888888";
export const LIGHT = "#cccccc";
export const RULE = "#e5e5e5";

// Two-series palette — Paul Tol colorblind-safe
export const BINARY_COLOR = "#332288";   // indigo
export const MULTI_COLOR = "#CC6677";    // rose

export const TICK = {
  fontFamily: FONT,
  fontSize: 13,
  fill: BLACK,
};

export const AXIS_LINE = { stroke: BLACK, strokeWidth: 0.5 };

export const TOOLTIP_STYLE: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 14,
  color: BLACK,
  background: "white",
  padding: "8px 12px",
  border: `1px solid ${RULE}`,
  lineHeight: 1.5,
};
