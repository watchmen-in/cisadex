import { useEffect, useState } from "react";

// Enhanced Intelligence Panel for EnhancedDashboard
function IntelligencePanel({ advancedFilters = {} }) {
  const [activeIntelTab, setActiveIntelTab] = useState('overview');
  const [ctiServices, setCtiServices] = useState({});
  const [threatActors, setThreatActors] = useState([]);
  const [dailyBriefing, setDailyBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadIntelligenceData();
  }, []);

  const loadIntelligenceData = async () => {
    setLoading(true);
    try {
      // Simulate CTI service status
      setCtiServices({
        crowdstrike: { service: 'CrowdStrike', successRate: 95, requestsToday: 45, requestsThisHour: 12, rateLimitRpm: 100, errors: 2, compliance: ['FedRAMP'] },
        mandiant: { service: 'Mandiant', successRate: 87, requestsToday: 23, requestsThisHour: 8, rateLimitRpm: 150, errors: 3, compliance: ['FedRAMP', 'FISMA'] },
        virustotal: { service: 'VirusTotal', successRate: 98, requestsToday: 67, requestsThisHour: 18, rateLimitRpm: 300, errors: 1, compliance: ['SOC2'] }
      });

      // Simulate threat actors
      setThreatActors([
        {
          actor_key: 'apt28',
          primary_designation: { name: 'APT28' },
          attribution: { country: 'Russia', sponsor: 'GRU Unit 26165', confidence: 'high', active: true },
          targeted_sectors: ['Government', 'Military', 'Defense'],
          ttp_summary: 'Spear phishing, zero-days, credential harvesting',
          confidence_score: 95,
          all_designations: [{ name: 'APT28' }, { name: 'Fancy Bear' }, { name: 'STRONTIUM' }]
        },
        {
          actor_key: 'apt29',
          primary_designation: { name: 'APT29' },
          attribution: { country: 'Russia', sponsor: 'SVR', confidence: 'high', active: true },
          targeted_sectors: ['Government', 'Healthcare', 'Technology'],
          ttp_summary: 'Supply chain attacks, legitimate tools, steganography',
          confidence_score: 92,
          all_designations: [{ name: 'APT29' }, { name: 'Cozy Bear' }, { name: 'NOBELIUM' }]
        }
      ]);

      // Simulate daily briefing
      setDailyBriefing({
        date: new Date().toISOString().split('T')[0],
        classification: 'UNCLASSIFIED//FOR OFFICIAL USE ONLY',
        generation_time: new Date().toISOString(),
        executive_summary: {
          overview: 'During the 24-hour reporting period, CISAdx identified 2 high-confidence threat actor attributions, 3 active campaigns, and targeting activity against 4 critical infrastructure sectors.',
          threat_level_assessment: 'MEDIUM',
          primary_concerns: ['Nation-state threat actor activity observed', 'Critical infrastructure targeting detected']
        },
        threat_actor_activity: { total_actors_observed: 2, high_confidence_attributions: 2 },
        campaign_activity: { active_campaigns: 3, new_campaigns: 1 },
        sector_analysis: { sectors_targeted: 4 },
        technical_indicators: { ttps_observed: 8 },
        key_findings: [{
          type: 'THREAT_ACTOR',
          priority: 'HIGH',
          summary: 'APT28 activity detected with 95% confidence',
          details: 'Spear phishing campaign targeting government entities'
        }]
      });

    } catch (error) {
      console.error('Error loading intelligence data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 h-full">
      {/* Intelligence Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-t1">🧠 Intelligence Integration Platform</h2>
            <p className="text-sm text-t2">Unified threat intelligence, actor attribution, and AI-powered analysis</p>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Search threat actors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-b1 rounded bg-bg2 text-t1 text-sm"
            />
            <button className="px-3 py-2 bg-brand hover:bg-brand/80 text-bg1 rounded text-sm font-medium">
              Search
            </button>
          </div>
        </div>

        {/* Intelligence Navigation */}
        <div className="flex space-x-1 bg-bg2 rounded-lg p-1">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'briefing', label: '📋 Daily SIGACT' },
            { id: 'actors', label: '🎭 Threat Actors' },
            { id: 'feeds', label: '🔍 Legacy Feeds' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveIntelTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeIntelTab === tab.id
                  ? 'bg-brand text-bg1'
                  : 'text-t2 hover:text-t1 hover:bg-bg1'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Intelligence Content */}
      <div className="h-full overflow-y-auto">
        {activeIntelTab === 'overview' && (
          <IntelligenceOverviewPanel 
            ctiServices={ctiServices}
            threatActors={threatActors}
            dailyBriefing={dailyBriefing}
          />
        )}

        {activeIntelTab === 'briefing' && (
          <IntelligenceBriefingPanel 
            briefing={dailyBriefing}
            loading={loading}
          />
        )}

        {activeIntelTab === 'actors' && (
          <IntelligenceThreatActorPanel actors={threatActors} />
        )}

        {activeIntelTab === 'feeds' && (
          <LegacyFeedsPanel advancedFilters={advancedFilters} />
        )}
      </div>
    </div>
  );
}

// Intelligence Overview Panel
function IntelligenceOverviewPanel({ ctiServices, threatActors, dailyBriefing }) {
  const activeCTIServices = Object.values(ctiServices).filter(s => s && s.successRate > 90).length;
  const totalCTIServices = Object.keys(ctiServices).length;

  return (
    <div className="space-y-6">
      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg1 rounded-lg p-4 border border-b1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-brand">{activeCTIServices}/{totalCTIServices}</p>
              <p className="text-t2 text-sm">CTI Services Active</p>
            </div>
            <div className="text-2xl">🔍</div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-bg2 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full" 
                style={{ width: `${(activeCTIServices / totalCTIServices) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-bg1 rounded-lg p-4 border border-b1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-500">{threatActors.length}</p>
              <p className="text-t2 text-sm">Active Threat Actors</p>
            </div>
            <div className="text-2xl">🎭</div>
          </div>
          <div className="mt-3">
            <p className="text-xs text-t2">
              {threatActors.filter(a => a.attribution.country === 'Russia').length} Russian •{' '}
              {threatActors.filter(a => a.attribution.country === 'China').length} Chinese
            </p>
          </div>
        </div>

        <div className="bg-bg1 rounded-lg p-4 border border-b1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-500">
                {dailyBriefing?.executive_summary?.threat_level_assessment || 'UNKNOWN'}
              </p>
              <p className="text-t2 text-sm">Current Threat Level</p>
            </div>
            <div className="text-2xl">🚨</div>
          </div>
          <div className="mt-3">
            <p className="text-xs text-t2">
              Last updated: {dailyBriefing?.generation_time ? 
                new Date(dailyBriefing.generation_time).toLocaleTimeString() : 'Never'}
            </p>
          </div>
        </div>
      </div>

      {/* Intelligence Summary */}
      {dailyBriefing && (
        <div className="bg-bg1 rounded-lg p-4 border border-b1">
          <h3 className="text-lg font-semibold mb-3 text-brand">📋 Intelligence Summary</h3>
          <p className="text-t1 mb-3 text-sm">
            {dailyBriefing.executive_summary?.overview}
          </p>
          
          {dailyBriefing.key_findings?.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-t1 text-sm">Key Findings:</h4>
              {dailyBriefing.key_findings.slice(0, 2).map((finding, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                    finding.priority === 'CRITICAL' ? 'bg-red-600 text-white' :
                    finding.priority === 'HIGH' ? 'bg-orange-600 text-white' :
                    'bg-yellow-600 text-black'
                  }`}>
                    {finding.priority}
                  </span>
                  <p className="text-xs text-t2 flex-1">{finding.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Top Threat Actors */}
      <div className="bg-bg1 rounded-lg p-4 border border-b1">
        <h3 className="text-lg font-semibold mb-3 text-brand">🎭 Top Threat Actors</h3>
        <div className="space-y-2">
          {threatActors.slice(0, 3).map((actor, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-bg2 rounded">
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {actor.attribution.country === 'Russia' ? '🇷🇺' :
                   actor.attribution.country === 'China' ? '🇨🇳' : '🌍'}
                </span>
                <div>
                  <p className="font-medium text-t1 text-sm">{actor.primary_designation.name}</p>
                  <p className="text-xs text-t2">{actor.attribution.country}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-green-500">
                  {Math.round(actor.confidence_score)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Intelligence Briefing Panel
function IntelligenceBriefingPanel({ briefing, loading }) {
  if (!briefing) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold mb-2">No Daily Briefing Available</h3>
        <p className="text-t2 mb-6">Generate today's SIGACT intelligence briefing</p>
        <button className="px-6 py-3 bg-brand hover:bg-brand/80 text-bg1 rounded font-medium">
          Generate Daily Briefing
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Briefing Header */}
      <div className="bg-bg1 rounded-lg p-4 border border-b1">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-brand">Daily SIGACT Briefing - {briefing.date}</h2>
            <p className="text-t2 text-sm">{briefing.classification}</p>
          </div>
          <button className="px-3 py-1.5 bg-brand hover:bg-brand/80 text-bg1 rounded text-sm">
            🔄 Refresh
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-bg2 rounded p-3">
            <p className="text-lg font-bold text-yellow-500">
              {briefing.threat_actor_activity?.total_actors_observed || 0}
            </p>
            <p className="text-xs text-t2">Threat Actors</p>
          </div>
          <div className="bg-bg2 rounded p-3">
            <p className="text-lg font-bold text-red-500">
              {briefing.campaign_activity?.active_campaigns || 0}
            </p>
            <p className="text-xs text-t2">Active Campaigns</p>
          </div>
          <div className="bg-bg2 rounded p-3">
            <p className="text-lg font-bold text-purple-500">
              {briefing.sector_analysis?.sectors_targeted || 0}
            </p>
            <p className="text-xs text-t2">Sectors Targeted</p>
          </div>
          <div className="bg-bg2 rounded p-3">
            <p className="text-lg font-bold text-green-500">
              {briefing.technical_indicators?.ttps_observed || 0}
            </p>
            <p className="text-xs text-t2">TTPs Observed</p>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-bg1 rounded-lg p-4 border border-b1">
        <h3 className="text-lg font-semibold mb-3 text-brand">Executive Summary</h3>
        <p className="text-t1 mb-3 text-sm">{briefing.executive_summary?.overview}</p>
        
        {briefing.executive_summary?.primary_concerns?.length > 0 && (
          <div>
            <h4 className="font-medium text-t1 mb-2 text-sm">Primary Concerns:</h4>
            <ul className="list-disc list-inside text-t2 space-y-1 text-sm">
              {briefing.executive_summary.primary_concerns.map((concern, index) => (
                <li key={index}>{concern}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Intelligence Threat Actor Panel
function IntelligenceThreatActorPanel({ actors }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand">Threat Actor Database</h2>
        <p className="text-t2 text-sm">{actors.length} actors tracked</p>
      </div>

      <div className="space-y-3">
        {actors.map((actor, index) => (
          <div key={index} className="bg-bg1 rounded-lg p-4 border border-b1">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-xl">
                  {actor.attribution.country === 'Russia' ? '🇷🇺' :
                   actor.attribution.country === 'China' ? '🇨🇳' : '🌍'}
                </span>
                <div>
                  <h3 className="font-semibold text-t1">{actor.primary_designation.name}</h3>
                  <p className="text-t2 text-sm">{actor.attribution.country} • {actor.attribution.sponsor}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-500">{Math.round(actor.confidence_score)}%</p>
                <p className="text-xs text-t2">confidence</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <h4 className="font-medium text-t1 mb-1 text-sm">Aliases</h4>
                <div className="flex flex-wrap gap-1">
                  {actor.all_designations.slice(0, 3).map((designation, i) => (
                    <span key={i} className="px-2 py-0.5 bg-bg2 rounded text-xs text-t2">
                      {designation.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-t1 mb-1 text-sm">Targeted Sectors</h4>
                <div className="flex flex-wrap gap-1">
                  {actor.targeted_sectors.slice(0, 3).map((sector, i) => (
                    <span key={i} className="px-2 py-0.5 bg-brand/20 text-brand rounded text-xs">
                      {sector}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-t1 mb-1 text-sm">TTP Summary</h4>
              <p className="text-t2 text-xs">{actor.ttp_summary}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Legacy Feeds Panel (original implementation)
function LegacyFeedsPanel({ advancedFilters = {} }) {
  const [feedCategory, setFeedCategory] = useState("all");

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-3 text-brand">Legacy Threat Intelligence Feeds</h3>
        
        {/* Category Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: "all", label: "All Feeds", icon: "📋" },
            { id: "government", label: "Government", icon: "🏛️" },
            { id: "threat_intel", label: "Threat Intel", icon: "🔍" },
            { id: "vendor", label: "Vendors", icon: "🏢" },
            { id: "news", label: "News", icon: "📰" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFeedCategory(cat.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm ${
                feedCategory === cat.id
                  ? "bg-brand text-bg1 border-brand"
                  : "bg-bg2 border-b1 hover:border-brand/50 text-t1"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border border-b1 rounded-lg overflow-hidden">
        <div className="p-8 bg-bg2 text-center text-t2">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2 text-t1">Legacy Feed Integration</h3>
          <p className="text-sm mb-4">Enhanced threat intelligence feeds are now available in the main dashboard.</p>
          <div className="space-y-2 text-xs">
            <p>• 74+ comprehensive threat intelligence sources</p>
            <p>• Real-time CTI service integrations</p>
            <p>• Automated threat actor attribution</p>
            <p>• Daily SIGACT intelligence briefings</p>
          </div>
          <div className="mt-6">
            <button 
              onClick={() => window.location.hash = 'overview'}
              className="px-4 py-2 bg-brand text-bg1 rounded text-sm hover:bg-brand/80"
            >
              View Enhanced Intelligence
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IntelligencePanel;