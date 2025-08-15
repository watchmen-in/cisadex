import React from 'react';

export default function AboutData() {
  return (
    <div className="min-h-screen bg-bg0 text-t1">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              About CISAdx
            </h1>
            <p className="text-xl text-t2 max-w-2xl mx-auto">
              Federal Cybersecurity Infrastructure Directory & Threat Intelligence Platform
            </p>
          </div>

          {/* Mission Statement */}
          <div className="bg-bg1 rounded-xl border border-b1 p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <span>🎯</span>
              Our Mission
            </h2>
            <p className="text-t2 leading-relaxed">
              CISAdx serves as the comprehensive directory and intelligence platform for federal cybersecurity infrastructure. 
              We provide real-time threat intelligence, vulnerability assessments, and an interactive mapping system to help 
              cybersecurity professionals, government agencies, and critical infrastructure operators stay informed and respond 
              effectively to emerging threats.
            </p>
          </div>

          {/* Data Sources */}
          <div className="bg-bg1 rounded-xl border border-b1 p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <span>📊</span>
              Data Sources & Methodology
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-brand">Government Sources</h3>
                <ul className="space-y-1 text-t2">
                  <li>• CISA Known Exploited Vulnerabilities (KEV)</li>
                  <li>• US-CERT Cybersecurity Advisories</li>
                  <li>• NIST National Vulnerability Database</li>
                  <li>• FBI Cyber Division Intelligence</li>
                  <li>• Department of Homeland Security Alerts</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-brand">Industry Sources</h3>
                <ul className="space-y-1 text-t2">
                  <li>• Microsoft Security Response Center</li>
                  <li>• Cisco Product Security</li>
                  <li>• MITRE ATT&CK Framework</li>
                  <li>• Threat Intelligence Research</li>
                  <li>• Open Source Security Feeds</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-bg1 rounded-xl border border-b1 p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <span>⚡</span>
              Platform Features
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-bg2 rounded-lg">
                <div className="text-3xl mb-2">🗺️</div>
                <h3 className="font-semibold mb-2">Interactive Mapping</h3>
                <p className="text-sm text-t2">Visual representation of federal cybersecurity offices and infrastructure</p>
              </div>
              <div className="text-center p-4 bg-bg2 rounded-lg">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="font-semibold mb-2">Real-time Intelligence</h3>
                <p className="text-sm text-t2">Live threat feeds and vulnerability assessments updated every 5 minutes</p>
              </div>
              <div className="text-center p-4 bg-bg2 rounded-lg">
                <div className="text-3xl mb-2">🔍</div>
                <h3 className="font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-sm text-t2">Comprehensive filtering and search capabilities for targeted intelligence</p>
              </div>
            </div>
          </div>

          {/* Update Information */}
          <div className="bg-bg1 rounded-xl border border-b1 p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <span>🔄</span>
              Update Frequency & Data Quality
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-bg2 rounded-lg">
                <span className="font-medium">Threat Intelligence Feeds</span>
                <span className="text-brand">Every 5 minutes</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-bg2 rounded-lg">
                <span className="font-medium">Vulnerability Data</span>
                <span className="text-brand">Every 15 minutes</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-bg2 rounded-lg">
                <span className="font-medium">Infrastructure Mapping</span>
                <span className="text-brand">Daily</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-bg2 rounded-lg">
                <span className="font-medium">Government Advisories</span>
                <span className="text-brand">Real-time</span>
              </div>
            </div>
          </div>

          {/* Compliance & Standards */}
          <div className="bg-bg1 rounded-xl border border-b1 p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <span>🛡️</span>
              Security & Compliance
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-brand">Security Standards</h3>
                <ul className="space-y-1 text-t2">
                  <li>• NIST Cybersecurity Framework</li>
                  <li>• Federal Risk Management Standards</li>
                  <li>• CISA Cybersecurity Guidelines</li>
                  <li>• SOC 2 Type II Compliance</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-brand">Data Formats</h3>
                <ul className="space-y-1 text-t2">
                  <li>• STIX/TAXII 2.1 Standards</li>
                  <li>• JSON-LD Structured Data</li>
                  <li>• RSS/Atom Feed Compatibility</li>
                  <li>• RESTful API Architecture</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact & Support */}
          <div className="bg-bg1 rounded-xl border border-b1 p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <span>📞</span>
              Contact & Support
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-brand">Platform Support</h3>
                <p className="text-t2 mb-2">
                  For technical issues, feature requests, or data quality concerns:
                </p>
                <a 
                  href="https://github.com/watchmen-in/cisadx/issues" 
                  className="text-brand hover:text-brand/80 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub Issues →
                </a>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-brand">Security Incidents</h3>
                <p className="text-t2 mb-2">
                  To report cybersecurity incidents or vulnerabilities:
                </p>
                <a 
                  href="/report-incident" 
                  className="text-brand hover:text-brand/80 transition-colors"
                >
                  Report Incident →
                </a>
              </div>
            </div>
          </div>

          {/* Attribution */}
          <div className="text-center text-t2 text-sm">
            <p>
              Built with modern web technologies and federal cybersecurity standards in mind. 
              Data aggregated from official government sources and industry-leading threat intelligence providers.
            </p>
            <p className="mt-2">
              Last updated: {new Date().toLocaleDateString()} • Version 2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}