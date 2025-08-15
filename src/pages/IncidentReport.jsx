import { useState } from 'react';

export default function IncidentReport() {
  const [formData, setFormData] = useState({
    incidentType: '',
    severity: '',
    title: '',
    description: '',
    dateOccurred: '',
    timeOccurred: '',
    affectedSystems: '',
    potentialImpact: '',
    evidenceUrls: '',
    reporterName: '',
    reporterEmail: '',
    reporterOrganization: '',
    reporterPhone: '',
    additionalInfo: '',
    consent: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg0 text-t1">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-bg1 border border-b1 rounded-lg p-8 text-center fade-enter">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-4">Report Submitted Successfully</h1>
            <p className="text-t2 mb-6">
              Thank you for reporting this cybersecurity incident. Your report has been received and will be reviewed by our security team.
            </p>
            <p className="text-sm text-t2 mb-6">
              Reference ID: <span className="font-mono text-brand">INC-{Date.now().toString(36).toUpperCase()}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    incidentType: '',
                    severity: '',
                    title: '',
                    description: '',
                    dateOccurred: '',
                    timeOccurred: '',
                    affectedSystems: '',
                    potentialImpact: '',
                    evidenceUrls: '',
                    reporterName: '',
                    reporterEmail: '',
                    reporterOrganization: '',
                    reporterPhone: '',
                    additionalInfo: '',
                    consent: false,
                  });
                }}
                className="px-6 py-3 bg-brand text-black font-medium rounded hover:bg-opacity-90 transition-smooth"
              >
                Submit Another Report
              </button>
              <a
                href="/"
                className="px-6 py-3 border border-b1 rounded text-t1 hover:bg-bg2 transition-smooth text-center"
              >
                Return to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg0 text-t1">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 slide-enter">
          <h1 className="text-3xl font-bold mb-4">Cybersecurity Incident Report</h1>
          <p className="text-t2 mb-6">
            Report cybersecurity incidents, threats, or vulnerabilities to help improve our collective security posture.
            All reports are confidential and will be handled by qualified security professionals.
          </p>
          <div className="bg-warn bg-opacity-10 border border-warn border-opacity-30 rounded-lg p-4 text-sm">
            <strong>⚠️ Emergency Response:</strong> For immediate threats or ongoing attacks, contact your organization's 
            security team or law enforcement directly. This form is for non-emergency incident reporting.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 fade-enter">
          {/* Incident Details */}
          <div className="bg-bg1 border border-b1 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Incident Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Incident Type *</label>
                <select
                  name="incidentType"
                  value={formData.incidentType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-bg2 border border-b1 rounded text-t1 focus:outline-none focus:ring-2 focus:ring-focus transition-smooth"
                >
                  <option value="">Select incident type</option>
                  <option value="malware">Malware/Virus</option>
                  <option value="phishing">Phishing/Social Engineering</option>
                  <option value="ransomware">Ransomware</option>
                  <option value="data-breach">Data Breach</option>
                  <option value="unauthorized-access">Unauthorized Access</option>
                  <option value="ddos">DDoS Attack</option>
                  <option value="vulnerability">Security Vulnerability</option>
                  <option value="insider-threat">Insider Threat</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Severity Level *</label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-bg2 border border-b1 rounded text-t1 focus:outline-none focus:ring-2 focus:ring-focus transition-smooth"
                >
                  <option value="">Select severity</option>
                  <option value="critical">Critical - Immediate threat to operations</option>
                  <option value="high">High - Significant impact potential</option>
                  <option value="medium">Medium - Moderate impact</option>
                  <option value="low">Low - Minimal impact</option>
                  <option value="informational">Informational</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Incident Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Brief, descriptive title of the incident"
                className="w-full px-3 py-2 bg-bg2 border border-b1 rounded text-t1 placeholder-t2 focus:outline-none focus:ring-2 focus:ring-focus transition-smooth"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Detailed Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={6}
                placeholder="Provide a detailed description of the incident, including what happened, when it was discovered, and any immediate actions taken"
                className="w-full px-3 py-2 bg-bg2 border border-b1 rounded text-t1 placeholder-t2 focus:outline-none focus:ring-2 focus:ring-focus transition-smooth"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium mb-2">Date Occurred *</label>
                <input
                  type="date"
                  name="dateOccurred"
                  value={formData.dateOccurred}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-bg2 border border-b1 rounded text-t1 focus:outline-none focus:ring-2 focus:ring-focus transition-smooth"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Time Occurred (if known)</label>
                <input
                  type="time"
                  name="timeOccurred"
                  value={formData.timeOccurred}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-bg2 border border-b1 rounded text-t1 focus:outline-none focus:ring-2 focus:ring-focus transition-smooth"
                />
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-bg1 border border-b1 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Technical Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Affected Systems/Assets</label>
                <textarea
                  name="affectedSystems"
                  value={formData.affectedSystems}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="List affected systems, networks, applications, or data (avoid sensitive details)"
                  className="w-full px-3 py-2 bg-bg2 border border-b1 rounded text-t1 placeholder-t2 focus:outline-none focus:ring-2 focus:ring-focus transition-smooth"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Potential Impact</label>
                <textarea
                  name="potentialImpact"
                  value={formData.potentialImpact}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe the potential or actual impact of this incident"
                  className="w-full px-3 py-2 bg-bg2 border border-b1 rounded text-t1 placeholder-t2 focus:outline-none focus:ring-2 focus:ring-focus transition-smooth"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Evidence URLs/References</label>
                <textarea
                  name="evidenceUrls"
                  value={formData.evidenceUrls}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="URLs, CVE numbers, or other references related to this incident"
                  className="w-full px-3 py-2 bg-bg2 border border-b1 rounded text-t1 placeholder-t2 focus:outline-none focus:ring-2 focus:ring-focus transition-smooth"
                />
              </div>
            </div>
          </div>

          {/* Reporter Information */}
          <div className="bg-bg1 border border-b1 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Reporter Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  name="reporterName"
                  value={formData.reporterName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-bg2 border border-b1 rounded text-t1 focus:outline-none focus:ring-2 focus:ring-focus transition-smooth"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address *</label>
                <input
                  type="email"
                  name="reporterEmail"
                  value={formData.reporterEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-bg2 border border-b1 rounded text-t1 focus:outline-none focus:ring-2 focus:ring-focus transition-smooth"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Organization</label>
                <input
                  type="text"
                  name="reporterOrganization"
                  value={formData.reporterOrganization}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-bg2 border border-b1 rounded text-t1 focus:outline-none focus:ring-2 focus:ring-focus transition-smooth"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="reporterPhone"
                  value={formData.reporterPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-bg2 border border-b1 rounded text-t1 focus:outline-none focus:ring-2 focus:ring-focus transition-smooth"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Additional Information</label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional information that might be helpful"
                className="w-full px-3 py-2 bg-bg2 border border-b1 rounded text-t1 placeholder-t2 focus:outline-none focus:ring-2 focus:ring-focus transition-smooth"
              />
            </div>
          </div>

          {/* Consent and Submit */}
          <div className="bg-bg1 border border-b1 rounded-lg p-6">
            <div className="flex items-start space-x-3 mb-6">
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleInputChange}
                required
                className="mt-0.5 h-4 w-4 text-brand focus:ring-focus border-b1 rounded"
              />
              <label className="text-sm text-t2">
                I consent to the submission of this incident report and understand that the information provided will be used 
                for cybersecurity analysis and response purposes. I confirm that the information is accurate to the best of my knowledge.
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting || !formData.consent}
              className="w-full sm:w-auto px-8 py-3 bg-brand text-black font-medium rounded hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
            >
              {submitting ? 'Submitting Report...' : 'Submit Incident Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}