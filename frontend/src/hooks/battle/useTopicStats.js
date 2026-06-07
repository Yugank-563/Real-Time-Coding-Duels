import { useState, useEffect } from 'react';
import { api } from '../../utils/index';
import { PROBLEM_TOPICS } from '../../utils/index';

export const useTopicStats = () => {
  const [topicList, setTopicList] = useState(PROBLEM_TOPICS);
  const [activeTopicStats, setActiveTopicStats] = useState({});

  useEffect(() => {
    const fetchTopicsAndStats = async () => {
      try {
        const res = await api.get('/api/battles/topics');
        if (res.data.topics && res.data.topics.length > 0) {
          setTopicList(res.data.topics);
        }
        setActiveTopicStats(res.data.stats || {});
      } catch {
        // Fallback to constants if API fails
        setTopicList(PROBLEM_TOPICS);
      }
    };
    fetchTopicsAndStats();
    const interval = setInterval(fetchTopicsAndStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return { topicList, activeTopicStats };
};
