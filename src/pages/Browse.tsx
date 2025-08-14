import offices from "@/data/offices.json";
import MapView from "@/components/MapView";

export default function Browse() {
  return (
    <main className="h-[100vh]">
      <MapView data={offices} />
    </main>
  );
}
