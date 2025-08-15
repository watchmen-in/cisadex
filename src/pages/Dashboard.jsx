import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import FilterPanel from "../components/FilterPanel";
import MapView from "../components/MapView";
import RssPanel from "../components/RssPanel";
import ResourcePanel from "../components/ResourcePanel";
import FeedList from "../components/Feeds/FeedList";
import ThreatVisualization from "../components/ThreatIntelligence/ThreatVisualization";
import IncidentDashboard from "../components/IncidentResponse/IncidentDashboard";
import AdvancedSearch from "../components/Search/AdvancedSearch";
import UserExperienceEnhancements from "../components/UI/UserExperienceEnhancements";
import { loadOffices } from "../utils/dataLoader";

function TabBar({ tab, onChange }) {
  const tabs = [
    { id: "map", label: "Map" },
    { id: "threats", label: "Threat Intel" },
    { id: "incidents", label: "Incidents" },
    { id: "search", label: "Search" },
    { id: "rss", label: "RSS" },
    { id: "feeds", label: "Feeds" },
    { id: "resources", label: "Resources" },
  ];
  return (
    <div className="sticky top-14 z-10 bg-bg1 border-b border-b1">
      <div className="flex">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex-1 px-4 py-2 text-sm focus-ring tab-transition ${
              tab === t.id
                ? "text-brand border-b-2 border-brand"
                : "text-t2 hover:text-t1"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const hashTab = location.hash.replace("#", "");
  const [tab, setTab] = useState(hashTab || "map");
  useEffect(() => {
    if (hashTab && hashTab !== tab) setTab(hashTab);
  }, [hashTab]);
  const changeTab = (t) => {
    setTab(t);
    navigate({ pathname: "/dashboard", hash: t });
  };

  const [offices, setOffices] = useState([]);
  const [filters, setFilters] = useState({ agency: [], role_type: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    loadOffices().then((data) => {
      setOffices(data);
      setLoading(false);
    });
  }, []);

  const agencies = useMemo(
    () => [...new Set(offices.map((o) => o.agency))],
    [offices]
  );
  const roles = useMemo(
    () => [...new Set(offices.map((o) => o.role_type))],
    [offices]
  );

  const filteredData = useMemo(() => {
    const agencyActive = filters.agency.length > 0;
    const roleActive = filters.role_type.length > 0;
    return offices.filter((o) => {
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
          <div className="col-span-12 md:col-span-3 lg:col-span-3 xl:col-span-2">
            <Sidebar open={open} onClose={() => setOpen(false)}>
              <FilterPanel
                agencies={agencies}
                roles={roles}
                filters={filters}
                onChange={setFilters}
              />
            </Sidebar>
          </div>
          <div className="col-span-12 md:col-span-9 lg:col-span-9 xl:col-span-10">
            <div className="relative rounded-xl border border-b1 bg-bg1 shadow-e1 overflow-hidden">
              <TabBar tab={tab} onChange={changeTab} />
              <div className="h-full">
                {tab === "map" && (
                  <div className="relative fade-enter">
                    <MapView data={filteredData} loading={loading} />
                    <div className="absolute bottom-4 left-4 bg-bg2 border border-b1 text-xs px-2 py-1 rounded transition-smooth">
                      CISA offices
                    </div>
                  </div>
                )}
                {tab === "threats" && <div className="fade-enter"><ThreatVisualization /></div>}
                {tab === "incidents" && <div className="fade-enter"><IncidentDashboard /></div>}
                {tab === "search" && <div className="fade-enter"><AdvancedSearch /></div>}
                {tab === "rss" && <div className="fade-enter"><RssPanel /></div>}
                {tab === "feeds" && <div className="fade-enter"><FeedList filters={{}} /></div>}
                {tab === "resources" && <div className="fade-enter"><ResourcePanel /></div>}
              </div>
            </div>
          </div>
        </div>
      </main>
      <button
        onClick={() => setOpen(true)}
        className="focus-ring md:hidden fixed bottom-4 right-4 rounded-full px-4 py-2 bg-brand text-black font-medium shadow-e2"
      >
        Filters
      </button>
      <UserExperienceEnhancements />
    </div>
  );
}
