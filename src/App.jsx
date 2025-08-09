import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import FilterPanel from "./components/FilterPanel";
import { Outlet, useLocation } from "react-router-dom";
import { loadOffices } from "./utils/dataLoader";

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const sidebarNeeded = pathname === "/" || pathname.startsWith("/map");

  const [offices, setOffices] = useState([]);
  const [filters, setFilters] = useState({ agency: [], role_type: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sidebarNeeded && offices.length === 0) {
      setLoading(true);
      loadOffices().then((data) => {
        setOffices(data);
        setLoading(false);
      });
    }
  }, [sidebarNeeded, offices.length]);

  const agencies = useMemo(() => [...new Set(offices.map(o => o.agency))], [offices]);
  const roles = useMemo(() => [...new Set(offices.map(o => o.role_type))], [offices]);

  const filteredData = useMemo(() => {
    const agencyActive = filters.agency.length > 0;
    const roleActive = filters.role_type.length > 0;
    return offices.filter(o => {
      const okAgency = !agencyActive || filters.agency.includes(o.agency);
      const okRole = !roleActive || filters.role_type.includes(o.role_type);
      return okAgency && okRole;
    });
  }, [offices, filters]);

  return (
    <div className="min-h-screen bg-bg0 text-t1">
      <Header />
      <main className="mx-auto max-w-[1600px] px-2 sm:px-4">
        <div className="grid grid-cols-12 gap-2 sm:gap-4">
          {sidebarNeeded && (
            <div className="col-span-12 md:col-span-3 lg:col-span-3 xl:col-span-2">
              <Sidebar open={open} onClose={() => setOpen(false)}>
                <FilterPanel agencies={agencies} roles={roles} filters={filters} onChange={setFilters} />
              </Sidebar>
            </div>
          )}
          <div className={`${sidebarNeeded ? 'col-span-12 md:col-span-9 lg:col-span-9 xl:col-span-10' : 'col-span-12'}`}>
            <div className="relative rounded-xl border border-b1 bg-bg1 shadow-e1 overflow-hidden">
              <Outlet context={{ data: filteredData, loading }} />
            </div>
          </div>
        </div>
      </main>
      {sidebarNeeded && (
        <button onClick={() => setOpen(true)} className="focus-ring md:hidden fixed bottom-4 right-4 rounded-full px-4 py-2 bg-brand text-black font-medium shadow-e2">Filters</button>
      )}
    </div>
  );
}
