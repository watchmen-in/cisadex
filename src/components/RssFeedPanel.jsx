import { useEffect, useState } from 'react';
import { fetchFeeds } from '../utils/rssFetcher';

export default function RssFeedPanel() {
  const [feeds, setFeeds] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await fetchFeeds();
    setFeeds(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`fixed top-16 right-0 h-[calc(100%-4rem)] w-64 bg-gray-800 text-white transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
      <button
        className="absolute left-[-2.5rem] top-4 bg-gray-800 text-white px-2 py-1 rounded-l"
        onClick={() => setOpen(!open)}
      >
        {open ? '>' : '<'}
      </button>
      <div className="p-4 overflow-y-auto h-full">
        <h2 className="text-lg font-bold mb-4">RSS Feeds</h2>
        {loading && <div>Loading...</div>}
        {!loading && feeds.map((feed) => (
          <div key={feed.title} className="mb-4">
            <h3 className="font-semibold">{feed.title}</h3>
            <ul className="list-disc ml-4">
              {feed.items.map((item) => (
                <li key={item.link} className="mb-1">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {item.title}
                  </a>
                  <div className="text-xs text-gray-300">{item.pubDate}</div>
                  <div className="text-xs">{item.contentSnippet}</div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
