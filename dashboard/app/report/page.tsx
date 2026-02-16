import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { reportMarkdown } from "./content";
import { metadata as siteMetadata } from "../data";
import Link from "next/link";

export default function ReportPage() {
  const refreshDate = siteMetadata.refreshedAt
    ? new Date(siteMetadata.refreshedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 font-[family-name:var(--font-geist-sans)]">
      <nav className="mb-8 text-sm text-gray-500">
        <Link href="/" className="underline hover:text-gray-700">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Report</span>
      </nav>

      <article className="prose prose-gray prose-sm sm:prose-base max-w-none
        prose-headings:font-semibold prose-headings:tracking-tight
        prose-h1:text-3xl prose-h1:mb-2
        prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
        prose-p:leading-relaxed
        prose-table:text-sm
        prose-th:text-left prose-th:px-3 prose-th:py-2 prose-th:bg-gray-50 prose-th:border-b prose-th:border-gray-200
        prose-td:px-3 prose-td:py-1.5 prose-td:border-b prose-td:border-gray-100
        prose-code:text-sm prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
        prose-strong:font-semibold
        prose-li:my-1
        prose-a:text-blue-700 prose-a:no-underline hover:prose-a:underline
      ">
        <Markdown remarkPlugins={[remarkGfm]}>{reportMarkdown}</Markdown>
      </article>

      <footer className="text-xs text-gray-400 border-t border-gray-200 pt-6 mt-12">
        <div className="flex items-center justify-between">
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
