'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function PlayerRecordForm({ matchId, players, existingRecords, onRecordUpdate }) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [recordData, setRecordData] = useState({
    quarter_no: 1,
    team_color: 'HOME',
    position: 'FW',
    shots: 0,
    shots_on_target: 0,
    goals: 0,
    assists: 0,
    passes: 0,
    passes_success: 0,
    dribbles: 0,
    dribbles_success: 0,
    tackles: 0,
    tackles_success: 0
  });

  const supabase = createClientComponentClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. match_players 테이블에 기록 추가/수정
      const { data: matchPlayer, error: matchPlayerError } = await supabase
        .from('match_players')
        .upsert({
          schedule_id: matchId,
          user_id: selectedPlayer,
          quarter_no: recordData.quarter_no,
          team_color: recordData.team_color,
          position: recordData.position
        })
        .select()
        .single();

      if (matchPlayerError) throw matchPlayerError;

      // 2. player_stats 테이블에 상세 기록 추가
      const { error: statsError } = await supabase
        .from('player_stats')
        .upsert({
          match_player_id: matchPlayer.id,
          quarter_no: recordData.quarter_no,
          shots: recordData.shots,
          shots_on_target: recordData.shots_on_target,
          goals: recordData.goals,
          assists: recordData.assists,
          passes: recordData.passes,
          passes_success: recordData.passes_success,
          dribbles: recordData.dribbles,
          dribbles_success: recordData.dribbles_success,
          tackles: recordData.tackles,
          tackles_success: recordData.tackles_success
        });

      if (statsError) throw statsError;

      // 폼 초기화 및 데이터 새로고침
      setSelectedPlayer('');
      setRecordData({
        quarter_no: 1,
        team_color: 'HOME',
        position: 'FW',
        shots: 0,
        shots_on_target: 0,
        goals: 0,
        assists: 0,
        passes: 0,
        passes_success: 0,
        dribbles: 0,
        dribbles_success: 0,
        tackles: 0,
        tackles_success: 0
      });
      onRecordUpdate();

    } catch (error) {
      console.error('선수 기록 저장 에러:', error);
      alert('선수 기록 저장에 실패했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">선수</label>
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">선수 선택</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.nickname}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">쿼터</label>
          <select
            value={recordData.quarter_no}
            onChange={(e) => setRecordData({...recordData, quarter_no: parseInt(e.target.value)})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {[1, 2, 3, 4].map((quarter) => (
              <option key={quarter} value={quarter}>{quarter}쿼터</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">팀</label>
          <select
            value={recordData.team_color}
            onChange={(e) => setRecordData({...recordData, team_color: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="HOME">홈팀</option>
            <option value="AWAY">원정팀</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatInput
          label="슈팅"
          value={recordData.shots}
          onChange={(value) => setRecordData({...recordData, shots: value})}
        />
        <StatInput
          label="유효슈팅"
          value={recordData.shots_on_target}
          onChange={(value) => setRecordData({...recordData, shots_on_target: value})}
        />
        <StatInput
          label="득점"
          value={recordData.goals}
          onChange={(value) => setRecordData({...recordData, goals: value})}
        />
        <StatInput
          label="어시스트"
          value={recordData.assists}
          onChange={(value) => setRecordData({...recordData, assists: value})}
        />
        <StatInput
          label="패스 시도"
          value={recordData.passes}
          onChange={(value) => setRecordData({...recordData, passes: value})}
        />
        <StatInput
          label="패스 성공"
          value={recordData.passes_success}
          onChange={(value) => setRecordData({...recordData, passes_success: value})}
        />
        <StatInput
          label="드리블 시도"
          value={recordData.dribbles}
          onChange={(value) => setRecordData({...recordData, dribbles: value})}
        />
        <StatInput
          label="드리블 성공"
          value={recordData.dribbles_success}
          onChange={(value) => setRecordData({...recordData, dribbles_success: value})}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          기록 저장
        </button>
      </div>
    </form>
  );
}

function StatInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
  );
} 