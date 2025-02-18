'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import TeamHeader from '@/components/team/TeamHeader';
import TeamInfo from '@/components/team/TeamInfo';
import TeamStats from '@/components/team/TeamStats';
import TeamPlayerList from '@/components/team/TeamPlayerList';
import TeamMatchList from '@/components/team/TeamMatchList';

export default function TeamProfile({ params }) {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function getTeamData() {
      try {
        const { data: teamData, error } = await supabase
          .from('teams')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setTeam(teamData);
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setLoading(false);
      }
    }

    getTeamData();
  }, [params.id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <TeamHeader team={team} />
          <TeamInfo team={team} />
          
          {/* 탭 네비게이션 */}
          <div className="border-t mt-6">
            <div className="flex border-b">
              {['stats', 'players', 'matches'].map((tab) => (
                <button
                  key={tab}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === tab
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'stats' && '팀 스탯'}
                  {tab === 'players' && '선수 목록'}
                  {tab === 'matches' && '경기 목록'}
                </button>
              ))}
            </div>

            {/* 탭 컨텐츠 */}
            <div className="p-6">
              {activeTab === 'stats' && <TeamStats teamId={params.id} />}
              {activeTab === 'players' && <TeamPlayerList teamId={params.id} />}
              {activeTab === 'matches' && <TeamMatchList teamId={params.id} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 