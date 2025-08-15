import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import FilterPanel from "../components/FilterPanel";
import MapView from "../components/MapView";
import ResourcePanel from "../components/ResourcePanel";
import EnhancedFeedList from "../components/Feeds/EnhancedFeedList";
import { loadOffices } from "../utils/dataLoader";

function TabBar({ tab, onChange }) {
  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "map", label: "Map", icon: "🗺️" },
    { id: "intelligence", label: "Intelligence", icon: "🔍" },
    { id: "resources", label: "Resources", icon: "📚" },
  ];
  
  return (
    <div className="sticky top-14 z-10 bg-bg1 border-b border-b1">
      <div className="flex">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex-1 px-4 py-3 text-sm focus-ring tab-transition flex items-center justify-center gap-2 ${
              tab === t.id
                ? "text-brand border-b-2 border-brand bg-bg2/30"
                : "text-t2 hover:text-t1 hover:bg-bg2/20"
            }`}
          >
            <span className="text-base">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function OverviewPanel() {
  const [stats, setStats] = useState({
    alerts: 0,
    vulnerabilities: 0,
    incidents: 0,
    updates: 0
  });

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        alerts: 12,
        vulnerabilities: 47,
        incidents: 3,
        updates: 28
      });
    }, 500);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Cybersecurity Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-bg2 rounded-lg p-4 border border-b1">
          <div className="text-2xl font-bold text-err">{stats.alerts}</div>
          <div className="text-sm text-t2">Active Alerts</div>
        </div>
        <div className="bg-bg2 rounded-lg p-4 border border-b1">
          <div className="text-2xl font-bold text-warn">{stats.vulnerabilities}</div>
          <div className="text-sm text-t2">Known Vulnerabilities</div>
        </div>
        <div className="bg-bg2 rounded-lg p-4 border border-b1">
          <div className="text-2xl font-bold text-brand">{stats.incidents}</div>
          <div className="text-sm text-t2">Open Incidents</div>
        </div>
        <div className="bg-bg2 rounded-lg p-4 border border-b1">
          <div className="text-2xl font-bold text-success">{stats.updates}</div>
          <div className="text-sm text-t2">Recent Updates</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CISA Advisories */}
        <div className="border border-b1 rounded-lg overflow-hidden">
          <div className="bg-bg2 px-4 py-2 border-b border-b1">
            <h3 className="font-semibold flex items-center gap-2">
              <span>🏛️</span>
              CISA Advisories & Alerts
            </h3>
          </div>
          <EnhancedFeedList category="government" />
        </div>

        {/* News & Industry */}
        <div className="border border-b1 rounded-lg overflow-hidden">
          <div className="bg-bg2 px-4 py-2 border-b border-b1">
            <h3 className="font-semibold flex items-center gap-2">
              <span>📰</span>
              News & Industry
            </h3>
          </div>
          <EnhancedFeedList category="news" />
        </div>
      </div>
    </div>
  );
}

function IntelligencePanel() {
  const [feedCategory, setFeedCategory] = useState("all");
  const [filters, setFilters] = useState({});

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-4">Threat Intelligence Feeds</h2>
        
        {/* Category Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: "all", label: "All Feeds", icon: "📋" },
            { id: "government", label: "Government", icon: "🏛️" },
            { id: "threat_intel", label: "Threat Intel", icon: "🔍" },
            { id: "vendor", label: "Vendors", icon: "🏢" },
            { id: "news", label: "News", icon: "📰" }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setFeedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                feedCategory === cat.id
                  ? "bg-brand text-black border-brand"
                  : "bg-bg2 border-b1 hover:border-brand/50"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <label className="flex items-center gap-2 px-3 py-1 bg-bg2 rounded-lg border border-b1">
            <input
              type="checkbox"
              checked={filters.exploited || false}
              onChange={(e) => setFilters({...filters, exploited: e.target.checked})}
              className="rounded"
            />
            <span className="text-sm">Actively Exploited</span>
          </label>
          <label className="flex items-center gap-2 px-3 py-1 bg-bg2 rounded-lg border border-b1">
            <input
              type="checkbox"
              checked={filters.has_cve || false}
              onChange={(e) => setFilters({...filters, has_cve: e.target.checked})}
              className="rounded"
            />
            <span className="text-sm">Has CVE</span>
          </label>
          <select
            value={filters.severity || ""}
            onChange={(e) => setFilters({...filters, severity: e.target.value || undefined})}
            className="px-3 py-1 bg-bg2 rounded-lg border border-b1 text-sm"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      <div className="border border-b1 rounded-lg overflow-hidden">
        <EnhancedFeedList category={feedCategory} filters={filters} />
      </div>
    </div>
  );
}

export default function EnhancedDashboard() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const hashTab = location.hash.replace("#", "");
  const [tab, setTab] = useState(hashTab || "overview");
  
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
    }).catch(() => {
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
                {tab === "overview" && (
                  <div className="fade-enter">
                    <OverviewPanel />
                  </div>
                )}
                {tab === "map" && (
                  <div className="relative fade-enter">
                    <MapView data={filteredData} loading={loading} />
                    <div className="absolute bottom-4 left-4 bg-bg2 border border-b1 text-xs px-2 py-1 rounded transition-smooth">
                      Federal cybersecurity offices
                    </div>
                  </div>
                )}
                {tab === "intelligence" && (
                  <div className="fade-enter">
                    <IntelligencePanel />
                  </div>
                )}
                {tab === "resources" && (
                  <div className="fade-enter">
                    <ResourcePanel />
                  </div>
                )}
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
    </div>
  );
}