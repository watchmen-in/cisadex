import { useState } from "react";

export default function ResourcePanel() {
  const [category, setCategory] = useState("all");

  // Predefined cybersecurity resources
  const cybersecurityResources = {
    government: [
      {
        title: "CISA Cybersecurity & Infrastructure Security Agency",
        url: "https://www.cisa.gov",
        meta: "The nation's cybersecurity and infrastructure protection agency",
        icon: "🏛️"
      },
      {
        title: "NIST Cybersecurity Framework",
        url: "https://www.nist.gov/cyberframework",
        meta: "Framework for improving critical infrastructure cybersecurity",
        icon: "📋"
      },
      {
        title: "US-CERT National Cyber Alert System",
        url: "https://us-cert.cisa.gov/ncas",
        meta: "Alerts and tips for computer security incidents",
        icon: "⚠️"
      },
      {
        title: "FBI Cyber Division",
        url: "https://www.fbi.gov/investigate/cyber",
        meta: "Federal Bureau of Investigation cyber threat response",
        icon: "🔍"
      }
    ],
    tools: [
      {
        title: "MITRE ATT&CK Framework",
        url: "https://attack.mitre.org",
        meta: "Globally-accessible knowledge base of adversary tactics",
        icon: "🎯"
      },
      {
        title: "NIST CVE Database",
        url: "https://nvd.nist.gov/vuln",
        meta: "National Vulnerability Database for security vulnerabilities",
        icon: "🔐"
      },
      {
        title: "CISA Known Exploited Vulnerabilities",
        url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
        meta: "Catalog of vulnerabilities actively exploited in the wild",
        icon: "🚨"
      },
      {
        title: "Cybersecurity Maturity Model Certification",
        url: "https://www.acq.osd.mil/cmmc/",
        meta: "CMMC compliance framework for defense contractors",
        icon: "🛡️"
      }
    ],
    training: [
      {
        title: "SANS Training Institute",
        url: "https://www.sans.org",
        meta: "Premier cybersecurity training and certification",
        icon: "🎓"
      },
      {
        title: "NIST NICE Cybersecurity Workforce Framework",
        url: "https://www.nist.gov/itl/applied-cybersecurity/nice",
        meta: "National cybersecurity workforce development framework",
        icon: "👥"
      },
      {
        title: "DHS Cybersecurity Education & Training",
        url: "https://www.dhs.gov/cybersecurity-education-training-assistance",
        meta: "Department of Homeland Security training programs",
        icon: "📚"
      },
      {
        title: "Federal Virtual Training Environment",
        url: "https://niccs.cisa.gov/training",
        meta: "Free cybersecurity training courses and resources",
        icon: "💻"
      }
    ],
    intelligence: [
      {
        title: "CISA Threat Intelligence",
        url: "https://www.cisa.gov/topics/cyber-threats-and-advisories",
        meta: "Government threat intelligence and advisories",
        icon: "🔍"
      },
      {
        title: "FBI Cyber Crime Complaints",
        url: "https://www.ic3.gov",
        meta: "Internet Crime Complaint Center for reporting cyber crimes",
        icon: "📢"
      },
      {
        title: "STIX/TAXII Standards",
        url: "https://oasis-open.github.io/cti-documentation/",
        meta: "Structured threat information sharing standards",
        icon: "🔄"
      },
      {
        title: "Open Source Intelligence Tools",
        url: "https://github.com/jivoi/awesome-osint",
        meta: "Curated list of open source intelligence tools",
        icon: "🛠️"
      }
    ]
  };

  const getAllResources = () => {
    return [
      ...cybersecurityResources.government,
      ...cybersecurityResources.tools,
      ...cybersecurityResources.training,
      ...cybersecurityResources.intelligence
    ];
  };

  const getFilteredResources = () => {
    if (category === "all") {
      return getAllResources();
    }
    return cybersecurityResources[category] || [];
  };

  const categories = [
    { id: "all", label: "All Resources", icon: "📋" },
    { id: "government", label: "Government", icon: "🏛️" },
    { id: "tools", label: "Tools & Frameworks", icon: "🛠️" },
    { id: "training", label: "Training", icon: "🎓" },
    { id: "intelligence", label: "Threat Intelligence", icon: "🔍" }
  ];

  return (
    <div className="h-full overflow-auto">
      {/* Header with category filters */}
      <div className="sticky top-0 bg-bg1 border-b border-b1 p-4 z-10">
        <h2 className="text-lg font-semibold mb-3">Cybersecurity Resources</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors flex items-center gap-2 ${
                category === cat.id
                  ? "bg-brand text-black border-brand"
                  : "bg-bg2 border-b1 hover:border-brand/50 text-t1"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Resources grid */}
      <div className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {getFilteredResources().map((resource, i) => (
          <a
            key={resource.url || i}
            href={resource.url}
            target="_blank"
            rel="noreferrer"
            className="focus-ring block bg-bg2 border border-b1 rounded-lg p-4 shadow-e1 hover:shadow-e2 hover:translate-y-[1px] transition group"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{resource.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-t1 group-hover:text-brand transition-colors">
                  {resource.title}
                </h3>
                <p className="mt-1 text-sm text-t2 line-clamp-2">
                  {resource.meta}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Stats footer */}
      <div className="p-4 border-t border-b1 bg-bg2/30 text-center text-sm text-t2">
        Showing {getFilteredResources().length} resources • 
        Total {getAllResources().length} cybersecurity resources available
      </div>
    </div>
  );
}