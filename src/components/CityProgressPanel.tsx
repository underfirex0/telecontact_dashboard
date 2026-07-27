"use client";

import { useEffect, useState } from "react";
import { supabase, CrawlProgressCity } from "@/lib/supabase";

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
      <div className="mt-1 font-mono text-2xl font-medium" style={{ color: accent ?? "var(--text)" }}>
        {animated.toLocaleString()}
      </div>
    </div>
  );
}

export default function CityProgressPanel() {
  const [progress, setProgress] = useState<CrawlProgressCity | null>(null);
  const [tasksTotal, setTasksTotal] = useState(0);

  useEffect(() => {
    supabase
      .from("crawl_progress_city")
      .select("*")
      .eq("id", 1)
      .single()
      .then(({ data }) => data && setProgress(data as CrawlProgressCity));

    supabase
      .from("crawl_tasks")
      .select("*", { count: "exact", head: true })
      .then(({ count }) => setTasksTotal(count ?? 0));

    const channel = supabase
      .channel("crawl_progress_city_live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "crawl_progress_city", filter: "id=eq.1" },
        (payload) => setProgress(payload.new as CrawlProgressCity)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const pct = tasksTotal > 0 && progress
    ? Math.min(100, Math.round((progress.tasks_done / tasksTotal) * 100))
    : 0;

  const isDone = progress?.status?.startsWith("done");

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-lg text-text">City-split crawl</h2>
        <div className="flex items-center gap-2 text-sm text-text-dim">
          <span className={`inline-block h-2 w-2 rounded-full ${isDone ? "bg-gold" : "bg-teal animate-pulse"}`} />
          {progress?.status ?? "connecting..."}
          {progress?.current_task && !isDone && (
            <span className="font-mono text-xs text-text-dim">· {progress.current_task}</span>
          )}
        </div>
      </div>

      <div className="mb-6 h-3 w-full overflow-hidden rounded-full bg-surface-2 ring-1 ring-border">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal to-gold transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Tasks done" value={progress?.tasks_done ?? 0} accent="var(--teal)" />
        <Stat label="Tasks total" value={tasksTotal} />
        <Stat label="New companies" value={progress?.companies_fetched ?? 0} accent="var(--gold)" />
        <Stat label="Keyword/city merges" value={progress?.keyword_merges ?? 0} />
        <Stat
          label="Errors"
          value={progress?.errors_count ?? 0}
          accent={progress && progress.errors_count > 0 ? "var(--red)" : undefined}
        />
      </div>
    </section>
  );
}
