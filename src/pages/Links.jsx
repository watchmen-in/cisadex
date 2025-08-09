export default function Links() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-[var(--step-1)] font-semibold">Resource Hub</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href={`${import.meta.env.BASE_URL}links/index.html`}
          className="focus-ring block p-4 rounded-lg bg-bg2 border border-b1 hover:translate-y-[1px] hover:shadow-e2 transition"
        >
          Browse Links
        </a>
      </div>
    </div>
  );
}
