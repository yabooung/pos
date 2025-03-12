'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import QuarterManager from '@/components/matches/detail/QuarterManager';
import PlayerManager from '@/components/matches/detail/PlayerManager';
import PlayerRecordManager from '@/components/matches/detail/PlayerRecordManager';

export default function MatchDetail({ params }) {
  const [match, setMatch] = useState(null);
  const [currentQuarter, setCurrentQuarter] = useState(null);
  const [activeStep, setActiveStep] = useState('quarter'); // 'quarter', 'players', 'records'
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchMatchDetails();
  }, [params.id]);

  const fetchMatchDetails = async () => {
    try {
      // 경기 기본 정보 조회
      const { data: matchData, error: matchError } = await supabase
        .from('schedules')
        .select(`
          *,
          match_players (
            *,
            profiles (
              nickname
            )
          )
        `)
        .eq('id', params.id)
        .single();

      if (matchError) throw matchError;
      setMatch(matchData);

      // 현재 진행 중인 쿼터 확인
      const { data: quarterData, error: quarterError } = await supabase
        .from('game_records')
        .select('*')
        .eq('schedule_id', params.id)
        .in('event_type', ['QUARTER_START', 'QUARTER_END'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (!quarterError && quarterData.length > 0) {
        if (quarterData[0].event_type === 'QUARTER_START') {
          setCurrentQuarter(quarterData[0].quarter_no);
        }
      }

    } catch (error) {
      console.error('경기 정보 조회 에러:', error);
      alert('경기 정보를 불러오는데 실패했습니다.');
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 경기 기본 정보 헤더 */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                {match.home_team_name || '홈팀'} vs {match.away_team_name || '원정팀'}
              </h1>
              <p className="text-gray-500">
                {new Date(match.schedule_date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="text-gray-500">{match.location}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">현재 쿼터</p>
              <p className="text-2xl font-bold text-indigo-600">
                {currentQuarter ? `${currentQuarter}쿼터` : '시작 전'}
              </p>
            </div>
          </div>
        </div>

        {/* 단계별 네비게이션 */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <nav className="flex space-x-4">
            {[
              { id: 'quarter', label: '쿼터 관리' },
              { id: 'players', label: '선수 관리' },
              { id: 'records', label: '기록 관리' }
            ].map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`px-4 py-2 rounded-md ${
                  activeStep === step.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {step.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 단계별 컴포넌트 */}
        <div className="space-y-6">
          {activeStep === 'quarter' && (
            <QuarterManager 
              matchId={params.id} 
              onQuarterChange={(quarterNo) => setCurrentQuarter(quarterNo)}
            />
          )}
          
          {activeStep === 'players' && (
            <PlayerManager 
              matchId={params.id}
              onPlayersUpdate={fetchMatchDetails}
            />
          )}
          
          {activeStep === 'records' && (
            <PlayerRecordManager 
              matchId={params.id}
              currentQuarter={currentQuarter}
            />
          )}
        </div>
      </div>
    </div>
  );
} 