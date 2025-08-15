/**
 * Simple Feeds Page - Testing the new streamlined feeds implementation
 */

import React from 'react';
import SimpleFeedList from '../components/SimpleFeedList';

const SimpleFeeds: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleFeedList />
    </div>
  );
};

export default SimpleFeeds;