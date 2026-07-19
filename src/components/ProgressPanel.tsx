"use client";

import { useEffect, useState } from "react";
import { supabase, CrawlProgress } from "@/lib/supabase";

function useCountUp(target: number, duration = 600) {
  const [value, setValue] = useState(target);
  useEffect(() => {
    const start = value;
    const startTime = performance.now();
    let raf: number;
    function tick(now: number) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(start + (target - start) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return value;
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  const animated = useCountUp(value);
  return (
    <div className="rounded-lg border border-border bg-surface px-5 py-4">
      <div className="text-xs uppercase tracking-wider text-text-dim">{label}</div>
      <div
        className="mt-1 font-mono text-2xl font-medium"
        style={{ color: accent ?? "var(--text)" }}
      >
        {animated.toLocaleString()}
      </div>
    </div>
  );
}

export default function ProgressPanel() {
  const [progress, setProgress] = useState<CrawlProgress | null>(null);

  useEffect(() => {
    supabase
      .from("crawl_progress")
      .select("*")
      .eq("id", 1)
      .single()
      .then(({ data }) => data && setProgress(data as CrawlProgress));

    const channel = supabase
      .channel("crawl_progress_live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "crawl_progress", filter: "id=eq.1" },
        (payload) => setProgress(payload.new as CrawlProgress)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const pct = progress && progress.keywords_total > 0
    ? Math.min(100, Math.round((progress.keywords_done / progress.keywords_total) * 100))
    : 0;

  const isDone = progress?.status?.startsWith("done");

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-lg text-text">Crawl progress</h2>
        <div className="flex items-center gap-2 text-sm text-text-dim">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              isDone ? "bg-gold" : "bg-teal animate-pulse"
            }`}
          />
          {progress?.status ?? "connecting..."}
          {progress?.current_keyword && !isDone && (
            <span className="font-mono text-xs text-text-dim">· {progress.current_keyword}</span>
          )}
        </div>
      </div>

      {/* Segmented keyword-progress bar - the one distinctive element on this page */}
      <div className="mb-6 h-3 w-full overflow-hidden rounded-full bg-surface-2 ring-1 ring-border">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal to-gold transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Keywords done" value={progress?.keywords_done ?? 0} accent="var(--teal)" />
        <Stat label="Keywords total" value={progress?.keywords_total ?? 0} />
        <Stat label="Companies found" value={progress?.companies_found ?? 0} accent="var(--gold)" />
        <Stat label="Fiches fetched" value={progress?.companies_fetched ?? 0} accent="var(--gold)" />
        <Stat label="Keyword merges" value={progress?.keyword_merges ?? 0} />
        <Stat
          label="Errors"
          value={progress?.errors_count ?? 0}
          accent={progress && progress.errors_count > 0 ? "var(--red)" : undefined}
        />
      </div>
    </section>
  );
}
