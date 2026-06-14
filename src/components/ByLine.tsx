import Link from "next/link";
import { AUTHOR } from "@/data/author";

// Visible author attribution — a core E-E-A-T trust signal. Links to the author bio.
export default function ByLine({ updated, className = "" }: { updated?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 text-sm text-gray-400 ${className}`}>
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-black text-sm shrink-0">
        {AUTHOR.shortName.charAt(0)}
      </span>
      <span>
        By{" "}
        <Link href="/about" className="font-semibold text-gray-200 hover:text-blue-400 transition-colors">
          {AUTHOR.name}
        </Link>
        <span className="text-gray-500">, {AUTHOR.role}</span>
        {updated && <span className="text-gray-500"> · Updated {updated}</span>}
      </span>
    </div>
  );
}
