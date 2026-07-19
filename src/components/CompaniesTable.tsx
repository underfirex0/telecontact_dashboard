"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, Company } from "@/lib/supabase";

const PAGE_SIZE = 20;

export default function CompaniesTable() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("companies")
      .select("*", { count: "exact" })
      .order("scraped_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (search.trim()) query = query.ilike("name", `%${search.trim()}%`);
    if (city) query = query.eq("city", city);

    const { data, count } = await query;
    setCompanies((data as Company[]) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [search, city, page]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce search
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    supabase
      .from("companies")
      .select("city")
      .not("city", "is", null)
      .then(({ data }) => {
        const unique = Array.from(new Set((data ?? []).map((r) => r.city))).sort();
        setCities(unique as string[]);
      });
  }, []);

  const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-lg text-text">Companies</h2>
        <span className="font-mono text-sm text-text-dim">{total.toLocaleString()} total</span>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Search by name..."
          className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-teal"
        />
        <select
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setPage(0);
          }}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-teal"
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-xs uppercase tracking-wider text-text-dim">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Activity</th>
              <th className="px-4 py-3">ICE</th>
              <th className="px-4 py-3">Keywords</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-dim">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && companies.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-dim">
                  No companies match yet.
                </td>
              </tr>
            )}
            {!loading &&
              companies.map((c) => (
                <>
                  <tr
                    key={c.id}
                    onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                    className="cursor-pointer border-b border-border bg-surface transition-colors hover:bg-surface-2"
                  >
                    <td className="px-4 py-3 font-medium text-text">{c.name ?? "—"}</td>
                    <td className="px-4 py-3 text-text-dim">{c.city ?? "—"}</td>
                    <td className="px-4 py-3 text-text-dim">{c.main_activity ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-text-dim">{c.ice ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(c.keywords ?? []).slice(0, 3).map((k) => (
                          <span
                            key={k}
                            className="rounded-full bg-teal-soft px-2 py-0.5 text-xs text-teal"
                          >
                            {k}
                          </span>
                        ))}
                        {(c.keywords ?? []).length > 3 && (
                          <span className="text-xs text-text-dim">
                            +{c.keywords.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expanded === c.id && (
                    <tr className="border-b border-border bg-bg">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm md:grid-cols-4">
                          <Detail label="Legal form" value={c.legal_form} />
                          <Detail label="Capital" value={c.capital} />
                          <Detail label="Workforce" value={c.workforce} />
                          <Detail label="Year founded" value={c.year_founded} />
                          <Detail label="RC" value={c.rc_number ? `${c.rc_number} ${c.rc_city ?? ""}` : null} />
                          <Detail label="Director" value={c.director} />
                          <Detail label="Phones" value={(c.phones ?? []).join(", ") || null} />
                          <Detail
                            label="Website"
                            value={
                              c.website ? (
                                <a href={c.website} target="_blank" className="text-teal underline">
                                  {c.website}
                                </a>
                              ) : null
                            }
                          />
                          <Detail label="Address" value={c.address} />
                          <Detail
                            label="Rating"
                            value={c.rating_avg ? `${c.rating_avg} (${c.rating_count} avis)` : null}
                          />
                          <Detail
                            label="Source"
                            value={
                              c.source_url ? (
                                <a href={c.source_url} target="_blank" className="text-teal underline">
                                  telecontact fiche
                                </a>
                              ) : null
                            }
                          />
                        </div>
                        {(c.keywords ?? []).length > 0 && (
                          <div className="mt-3">
                            <div className="mb-1 text-xs uppercase tracking-wider text-text-dim">
                              All keywords ({c.keywords.length})
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {c.keywords.map((k) => (
                                <span key={k} className="rounded-full bg-teal-soft px-2 py-0.5 text-xs text-teal">
                                  {k}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-text-dim">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="rounded-md border border-border px-3 py-1.5 disabled:opacity-40"
        >
          Previous
        </button>
        <span className="font-mono">
          Page {page + 1} / {maxPage + 1}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
          disabled={page >= maxPage}
          className="rounded-md border border-border px-3 py-1.5 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-text-dim">{label}</div>
      <div className="text-text">{value}</div>
    </div>
  );
}
