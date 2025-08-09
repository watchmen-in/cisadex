export default function Links() {
  return (
    <div className="h-full">
      <iframe
        src={`${import.meta.env.BASE_URL}links/index.html`}
        title="CISAdex Links"
        className="w-full h-full border-0"
      ></iframe>
    </div>
  );
}
