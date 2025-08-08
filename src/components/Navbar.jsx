import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-10">
      <Link to="/" className="font-bold">CISAdex</Link>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Map</Link>
        <Link to="/links" className="hover:underline">Resource Hub</Link>
      </div>
    </nav>
  );
}
