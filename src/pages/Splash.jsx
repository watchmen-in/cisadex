import Header from "../components/Header";

export default function Splash() {
  return (
    <div className="min-h-screen bg-bg0 text-t1 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-4xl font-bold mb-4">CISAdex</h1>
        <p className="max-w-xl text-lg text-t2 mb-8">
          Cybersecurity resources, alerts, and regional contacts in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/dashboard"
            className="focus-ring px-6 py-3 bg-brand text-black font-medium rounded shadow-e1 hover:shadow-e2"
          >
            Open Dashboard
          </a>
          <a
            href="/dashboard#resources"
            className="focus-ring px-6 py-3 border border-b1 rounded text-t1 hover:bg-bg2"
          >
            Resource Hub
          </a>
        </div>
      </main>
    </div>
  );
}
