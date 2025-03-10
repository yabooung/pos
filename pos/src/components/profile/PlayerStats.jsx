import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function PlayerStats({ userId }) {
  const [stats, setStats] = useState({
    matches: 0,
    goals: 0,
    assists: 0
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPlayerStats(userId);
  }, [userId]);

  const fetchPlayerStats = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('player_stats')
        .select(`
          match_players (
            schedule_id
          ),
          goals,
          assists
        `)
        .eq('match_players.user_id', userId);

      if (error) throw error;
      
      // 통계 데이터 처리
      const processedStats = {
        matches: new Set(data.map(stat => stat.match_players.schedule_id)).size,
        goals: data.reduce((sum, stat) => sum + (stat.goals || 0), 0),
        assists: data.reduce((sum, stat) => sum + (stat.assists || 0), 0)
      };
      
      setStats(processedStats);
    } catch (error) {
      console.error('통계 조회 에러:', error);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-medium text-gray-900 mb-2">경기 수</h4>
        <p className="text-3xl font-bold text-indigo-600">{stats.matches}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-medium text-gray-900 mb-2">득점</h4>
        <p className="text-3xl font-bold text-indigo-600">{stats.goals}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-medium text-gray-900 mb-2">어시스트</h4>
        <p className="text-3xl font-bold text-indigo-600">{stats.assists}</p>
      </div>
    </div>
  );
} 