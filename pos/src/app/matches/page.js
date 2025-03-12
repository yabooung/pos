'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import MatchForm from '@/components/matches/MatchForm';
import MatchList from '@/components/matches/MatchList';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*, match_players(*)')
        .order('schedule_date', { ascending: false });

      if (error) throw error;
      setMatches(data);
    } catch (error) {
      console.error('경기 목록 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">경기 기록</h1>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            새 경기 등록
          </button>
        </div>

        {isFormOpen && (
          <MatchForm
            onClose={() => setIsFormOpen(false)}
            onSubmitSuccess={() => {
              setIsFormOpen(false);
              fetchMatches();
            }}
          />
        )}

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <MatchList matches={matches} onMatchUpdate={fetchMatches} />
        )}
      </div>
    </div>
  );
} 