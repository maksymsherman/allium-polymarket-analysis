import Link from "next/link";
import DataFreshness from "./components/DataFreshness";
import CalibrationChart from "./components/CalibrationChart";
import BiasChart from "./components/BiasChart";
import CategoryChart from "./components/CategoryChart";
import CompositionChart from "./components/CompositionChart";
import QuarterlyTrendChart from "./components/QuarterlyTrendChart";
import { binaryCalibration, multiCalibration, marketStructure, metadata } from "./data";

// Compute weighted average bias for competitive range (10-90%) buckets
function competitiveBias(rows: { midpoint: number; bias: number; n: number }[]): number {
  const competitive = rows.filter((r) => r.midpoint >= 15 && r.midpoint <= 85);
  const totalN = competitive.reduce((s, r) => s + r.n, 0);
  if (totalN === 0) return 0;
  const weightedSum = competitive.reduce((s, r) => s + r.bias * r.n, 0);
  return Math.round((weightedSum / totalN) * 10) / 10;
}

// Compute % of tokens in tail buckets (<10% or >90%)
function tailPct(rows: { midpoint: number; n: number }[]): number {
  const totalN = rows.reduce((s, r) => s + r.n, 0);
  if (totalN === 0) return 0;
  const tailN = rows
    .filter((r) => r.midpoint <= 7.5 || r.midpoint >= 92.5)
    .reduce((s, r) => s + r.n, 0);
  return Math.round((tailN / totalN) * 100);
}

// Find worst bias bucket in competitive range
function worstBucket(rows: { bucket: string; midpoint: number; bias: number }[]): {
  bucket: string;
  bias: number;
} {
  const competitive = rows.filter((r) => r.midpoint >= 15 && r.midpoint <= 85);
  return competitive.reduce((worst, r) =>
    Math.abs(r.bias) > Math.abs(worst.bias) ? r : worst
  );
}

const binaryCompBias = competitiveBias(binaryCalibration);
const multiTailPct = tailPct(multiCalibration);
const worstMulti = worstBucket(multiCalibration);

function StatCard({
  value,
  label,
  sub,
}: {
  value: string;
  label: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
      <p className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-geist-mono)]">
        {value}
      </p>
      <p className="text-sm font-medium text-gray-600 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function formatBias(bias: number): string {
  const sign = bias > 0 ? "+" : "";
  return `${sign}${bias.toFixed(1)} pp`;
}

export default function Home() {
  const refreshDate = metadata.refreshedAt
    ? new Date(metadata.refreshedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Polymarket&rsquo;s Binary Markets Are Well-Calibrated. Here&rsquo;s What &ldquo;92% Accuracy&rdquo; Misses.
        </h1>
        <p className="text-base text-gray-500 mt-2 max-w-2xl">
          Binary yes/no markets track reality. Multi-outcome markets complicate the headline stat. Here&rsquo;s the on-chain data.
        </p>
        <div className="flex items-center gap-4 mt-3">
          <Link href="/report" className="text-sm text-gray-500 underline hover:text-gray-700">
            Read the full report
          </Link>
          {metadata.refreshedAt && (
            <DataFreshness refreshedAt={metadata.refreshedAt} />
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Data: Polygon via{" "}
          <a
            href="https://allium.so"
            className="underline hover:text-gray-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            Allium
          </a>
          {" "}&middot; Jan 2022 &ndash; Feb 2026 &middot;{" "}
          Inspired by{" "}
          <a
            href="https://dune.com/alexmccullough/how-accurate-is-polymarket"
            className="underline hover:text-gray-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            McCullough&rsquo;s Dune dashboard
          </a>
        </p>
      </header>

      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard
          value={marketStructure.total.tokens.toLocaleString()}
          label="Resolved tokens"
          sub={`~${marketStructure.total.questions.toLocaleString()} actual questions`}
        />
        <StatCard
          value={formatBias(binaryCompBias)}
          label="Binary bias (10–90%)"
          sub="Events happen more than prices predict"
        />
        <StatCard
          value={formatBias(worstMulti.bias)}
          label="Worst multi-outcome bucket"
          sub={`${worstMulti.bucket} range`}
        />
        <StatCard
          value={`${multiTailPct}%`}
          label="Multi tokens in tails"
          sub="Padding the denominator"
        />
      </div>

      {/* Key findings — immediately after stat cards */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Key Findings</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold mt-0.5 shrink-0">1.</span>
            <span>
              <strong>Binary markets are well-calibrated.</strong> Prices track reality across
              probability ranges with no longshot bias — slightly conservative, if anything.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold mt-0.5 shrink-0">2.</span>
            <span>
              <strong>Multi-outcome markets overprice by 3&ndash;5pp in the competitive range.</strong> A
              token priced at 45 cents wins just 39% of the time.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold mt-0.5 shrink-0">3.</span>
            <span>
              <strong>The &ldquo;92% accuracy&rdquo; headline tells an incomplete story.</strong> Like
              crediting a forecaster for predicting no snow in Phoenix in July — near-certain outcomes
              dominate the count.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold mt-0.5 shrink-0">4.</span>
            <span>
              <strong>Binary and multi-outcome markets have opposite biases.</strong> Binary prices
              underestimate event probability; multi-outcome prices overestimate it. Mixing them creates
              an artifact.
            </span>
          </li>
        </ul>
      </section>

      {/* Main calibration chart */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <CalibrationChart />
      </section>

      {/* Bias + Category side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <BiasChart />
        </section>
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <CategoryChart />
        </section>
      </div>

      {/* Quarterly trend */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <QuarterlyTrendChart />
      </section>

      {/* Market composition */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <CompositionChart />
      </section>

      {/* Methodology */}
      <footer className="text-xs text-gray-400 border-t border-gray-200 pt-6">
        <p className="font-medium text-gray-500 mb-1">Methodology</p>
        <p>
          Day-before price from Allium&rsquo;s on-chain data,
          filtered to strictly exclude resolution-day prices. Binary/multi-outcome split via{" "}
          <code className="text-gray-500">NEG_RISK</code> flag.
          Tokens priced at exactly 50&cent; excluded from accuracy calculations. 95% CIs via normal approximation
          (overstates precision for multi-outcome due to within-question correlation).{" "}
          {marketStructure.analysisTokens.total.toLocaleString()} tokens with day-before prices out of{" "}
          {marketStructure.total.tokens.toLocaleString()} total.
        </p>
        <div className="flex items-center justify-between mt-4">
          {refreshDate && (
            <p className="text-gray-400">Last refreshed: {refreshDate}</p>
          )}
          <p>
            Powered by{" "}
            <a
              href="https://allium.so"
              className="underline hover:text-gray-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              Allium
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
