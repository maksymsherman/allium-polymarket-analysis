import CalibrationChart from "./components/CalibrationChart";
import BiasChart from "./components/BiasChart";
import CategoryChart from "./components/CategoryChart";
import CompositionChart from "./components/CompositionChart";
import QuarterlyTrendChart from "./components/QuarterlyTrendChart";
import { binaryCalibration, multiCalibration, marketStructure, metadata } from "./data";

// Compute weighted average bias from calibration data
function weightedAvgBias(rows: { bias: number; n: number }[]): number {
  const totalN = rows.reduce((s, r) => s + r.n, 0);
  if (totalN === 0) return 0;
  const weightedSum = rows.reduce((s, r) => s + r.bias * r.n, 0);
  return Math.round((weightedSum / totalN) * 10) / 10;
}

const binaryBias = weightedAvgBias(binaryCalibration);
const multiBias = weightedAvgBias(multiCalibration);

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
          How Accurate Is Polymarket, Really?
        </h1>
        <p className="text-base text-gray-500 mt-2 max-w-2xl">
          On-chain calibration analysis of {marketStructure.total.tokens.toLocaleString()} resolved
          tokens across ~{marketStructure.total.questions.toLocaleString()} questions. Binary and
          multi-outcome markets behave very differently — mixing them produces misleading results.
        </p>
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
          Replicating{" "}
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <StatCard
          value={marketStructure.total.tokens.toLocaleString()}
          label="Resolved tokens"
          sub="Yes tokens with known outcome"
        />
        <StatCard
          value={`~${marketStructure.total.questions.toLocaleString()}`}
          label="Actual questions"
          sub="After grouping multi-outcome"
        />
        <StatCard
          value={formatBias(binaryBias)}
          label="Binary bias (avg)"
          sub={binaryBias >= 0 ? "Underpriced \u2014 events happen more" : "Overpriced \u2014 events happen less"}
        />
        <StatCard
          value={formatBias(multiBias)}
          label="Multi-outcome bias (avg)"
          sub={multiBias >= 0 ? "Underpriced \u2014 events happen more" : "Overpriced \u2014 events happen less"}
        />
      </div>

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

      {/* Key findings */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Key Findings</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold mt-0.5 shrink-0">1.</span>
            <span>
              <strong>Binary markets are well-calibrated.</strong> Prices slightly underestimate
              event probability across nearly all ranges — positive bias throughout, no longshot bias.
              The 70&ndash;80% bucket is the most underpriced at +8.0pp.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold mt-0.5 shrink-0">2.</span>
            <span>
              <strong>Multi-outcome markets show moderate overpricing.</strong> The worst bucket
              (40&ndash;50%) is off by &minus;5.4pp. Observations are correlated within each question,
              so effective sample sizes are smaller than raw token counts suggest.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold mt-0.5 shrink-0">3.</span>
            <span>
              <strong>The &ldquo;92% accurate&rdquo; headline is inflated.</strong> Multi-outcome markets
              are structurally skewed toward near-certain outcomes — 75% of tokens fall in the tails
              (&lt;10% or &gt;90%). Like crediting a weather forecaster for predicting no snow in Phoenix in July.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold mt-0.5 shrink-0">4.</span>
            <span>
              <strong>Mixing market types obscures the picture.</strong> The v1 &ldquo;systematic
              overpricing&rdquo; was an artifact of conflating correlated multi-outcome tokens with
              independent binary observations.
            </span>
          </li>
        </ul>
      </section>

      {/* Methodology */}
      <footer className="text-xs text-gray-400 border-t border-gray-200 pt-6">
        <p className="font-medium text-gray-500 mb-1">Methodology</p>
        <p>
          Day-before price from <code className="text-gray-500">polygon.predictions.token_prices_daily</code>,
          filtered to <code className="text-gray-500">DATEDIFF(day) BETWEEN 1 AND 2</code> (strictly excludes
          resolution day). Binary/multi-outcome split via <code className="text-gray-500">NEG_RISK</code> flag.
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
