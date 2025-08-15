import Header from "../components/Header";

export default function Splash() {
  return (
    <div className="relative min-h-screen bg-bg0 text-t1 flex flex-col overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-bg0 via-bg1 to-bg0" />
        <div className="absolute inset-0 pointer-events-none [background:radial-gradient(circle_at_20%_20%,rgba(0,208,255,0.15),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(122,92,255,0.15),transparent_60%)]" />
      </div>
      <Header />
      <main className="relative flex-1 flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-4xl font-bold mb-4 slide-enter">CISAdex</h1>
        <p className="max-w-xl text-lg text-t2 mb-8 fade-enter">
          Cybersecurity resources, alerts, and regional contacts in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 scale-enter">
          <a
            href="/dashboard"
            className="focus-ring px-6 py-3 bg-brand text-black font-medium rounded shadow-e1 hover:shadow-e2 transition-smooth card-hover"
          >
            Open Dashboard
          </a>
          <a
            href="/dashboard#resources"
            className="focus-ring px-6 py-3 border border-b1 rounded text-t1 hover:bg-bg2 transition-smooth"
          >
            Resource Hub
          </a>
        </div>
      </main>
    </div>
  );
}
