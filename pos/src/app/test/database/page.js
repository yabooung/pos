'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function DatabaseTest() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    testDatabaseConnections();
  }, []);

  const testDatabaseConnections = async () => {
    const results = {};
    try {
      // 1. Seasons 테이블 테스트
      const { data: seasons, error: seasonsError } = await supabase
        .from('seasons')
        .select('*')
        .limit(1);
      results.seasons = {
        success: !seasonsError,
        error: seasonsError?.message,
        data: seasons
      };

      // 2. Schedules 테이블 테스트
      const { data: schedules, error: schedulesError } = await supabase
        .from('schedules')
        .select('*')
        .limit(1);
      results.schedules = {
        success: !schedulesError,
        error: schedulesError?.message,
        data: schedules
      };

      // 3. Match Players 테이블 테스트
      const { data: matchPlayers, error: matchPlayersError } = await supabase
        .from('match_players')
        .select('*')
        .limit(1);
      results.matchPlayers = {
        success: !matchPlayersError,
        error: matchPlayersError?.message,
        data: matchPlayers
      };

      // 4. Player Stats 테이블 테스트
      const { data: playerStats, error: playerStatsError } = await supabase
        .from('player_stats')
        .select('*')
        .limit(1);
      results.playerStats = {
        success: !playerStatsError,
        error: playerStatsError?.message,
        data: playerStats
      };

      // 5. Profiles 테이블 테스트
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      results.profiles = {
        success: !profilesError,
        error: profilesError?.message,
        data: profiles
      };

      setTestResults(results);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">데이터베이스 연결 테스트</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {Object.entries(testResults).map(([table, result]) => (
            <div key={table} className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-2">
                {table} 테이블
                <span className={`ml-2 px-2 py-1 text-sm rounded-full ${
                  result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result.success ? '성공' : '실패'}
                </span>
              </h2>
              
              {result.error && (
                <div className="text-red-600 text-sm mb-2">
                  에러: {result.error}
                </div>
              )}

              {result.data && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">데이터 샘플:</p>
                  <pre className="mt-1 bg-gray-50 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={testDatabaseConnections}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            테스트 다시 실행
          </button>
        </div>
      </div>
    </div>
  );
} 