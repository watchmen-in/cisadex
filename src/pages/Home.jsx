import { useOutletContext } from 'react-router-dom';
import MapView from '../components/MapView';

export default function Home() {
  const { data, loading } = useOutletContext();
  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading map...</div>;
  }
  return <MapView data={data} />;
}
