'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useParams } from 'next/navigation';

interface MatchPlayer {
  id: string;
  player_name: string;
  team_color: 'red' | 'blue';
  position: string;
  quarter_no: number;
}

interface GameRecord {
  schedule_id: string;
  quarter_no: number;
  event_type: string;
  team_color: string;
  player_id: string;
  player_name: string;
  minute: number;
  description?: string;
}

export default function RecordPage() {
  const params = useParams();
  const supabase = createClientComponentClient();
  const [schedule, setSchedule] = useState<any>(null);
  const [players, setPlayers] = useState<MatchPlayer[]>([]);
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [loading, setLoading] = useState(true);

  // 경기 일정 정보 로드
  useEffect(() => {
    async function loadSchedule() {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('id', params.id)
        .single();

      if (data) setSchedule(data);
      setLoading(false);
    }

    loadSchedule();
  }, [params.id]);

  // 선수 기록 저장
  const handlePlayerRecord = async (record: GameRecord) => {
    try {
      // 경기 기록 저장
      const { error: recordError } = await supabase
        .from('game_records')
        .insert([{
          ...record,
          schedule_id: params.id,
          created_at: new Date().toISOString(),
          started_at: new Date().toISOString()
        }]);

      if (recordError) throw recordError;

      // 선수 통계 업데이트
      const { error: statsError } = await supabase
        .from('player_stats')
        .upsert([{
          match_player_id: record.player_id,
          quarter_no: record.quarter_no,
          [getStatsField(record.event_type)]: 1
        }]);

      if (statsError) throw statsError;

      alert('기록이 저장되었습니다.');
    } catch (error) {
      console.error('기록 저장 실패:', error);
      alert('기록 저장에 실패했습니다.');
    }
  };

  // 이벤트 타입에 따른 통계 필드 반환
  const getStatsField = (eventType: string) => {
    switch (eventType) {
      case 'shot': return 'shots';
      case 'shot_on_target': return 'shots_on_target';
      case 'goal': return 'goals';
      case 'assist': return 'assists';
      case 'pass': return 'passes';
      case 'pass_success': return 'passes_success';
      case 'dribble': return 'dribbles';
      case 'dribble_success': return 'dribbles_success';
      case 'tackle': return 'tackles';
      case 'tackle_success': return 'tackles_success';
      default: return '';
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">경기 기록</h1>
      
      {/* 경기 정보 */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <h2 className="text-xl mb-2">{schedule.opponent_name}</h2>
        <p className="text-gray-600">
          {new Date(schedule.schedule_date).toLocaleDateString()}
          {' - '}
          {schedule.location}
        </p>
      </div>

      {/* 쿼터 선택 */}
      <div className="flex space-x-2 mb-4">
        {Array.from({length: schedule.total_quarters}).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQuarter(i + 1)}
            className={`px-4 py-2 rounded ${
              currentQuarter === i + 1
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200'
            }`}
          >
            {i + 1}Q
          </button>
        ))}
      </div>

      {/* 기록 입력 폼 */}
      <RecordForm
        scheduleId={params.id as string}
        quarterNo={currentQuarter}
        onSubmit={handlePlayerRecord}
      />

      {/* 현재 쿼터 기록 목록 */}
      <RecordList
        scheduleId={params.id as string}
        quarterNo={currentQuarter}
      />
    </div>
  );
} 