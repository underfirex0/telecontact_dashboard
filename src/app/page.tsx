import ProgressPanel from "@/components/ProgressPanel";
import CityProgressPanel from "@/components/CityProgressPanel";
import CompaniesTable from "@/components/CompaniesTable";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10">
        <div className="text-xs uppercase tracking-widest text-text-dim">Kompass / Telecontact</div>
        <h1 className="font-display text-3xl text-text">Moroccan Company Directory</h1>
        <p className="mt-1 text-sm text-text-dim">
          Live crawl of telecontact.ma, keyword by keyword, then city by city.
        </p>
      </header>

      <ProgressPanel />
      <CityProgressPanel />
      <CompaniesTable />
    </main>
  );
}
