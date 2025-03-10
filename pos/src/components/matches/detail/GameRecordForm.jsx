'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function GameRecordForm({ matchId, players, onRecordSaved }) {
  const [recordData, setRecordData] = useState({
    quarter_no: 1,
    event_type: 'GOAL',
    team_color: 'HOME',
    player_id: '',
    minute: 1,
    description: ''
  });

  const supabase = createClientComponentClient();

  const eventTypes = [
    { value: 'GOAL', label: '득점' },
    { value: 'ASSIST', label: '어시스트' },
    { value: 'SHOT', label: '슈팅' },
    { value: 'SAVE', label: '선방' },
    { value: 'FOUL', label: '파울' },
    { value: 'YELLOW_CARD', label: '옐로카드' },
    { value: 'RED_CARD', label: '레드카드' },
    { value: 'SUBSTITUTION', label: '선수교체' },
    { value: 'QUARTER_START', label: '쿼터 시작' },
    { value: 'QUARTER_END', label: '쿼터 종료' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 선수 정보 가져오기
      const selectedPlayer = players.find(p => p.id === recordData.player_id);
      
      const { data, error } = await supabase
        .from('game_records')
        .insert({
          schedule_id: matchId,
          quarter_no: recordData.quarter_no,
          event_type: recordData.event_type,
          team_color: recordData.team_color,
          player_id: recordData.player_id,
          player_name: selectedPlayer?.nickname,
          minute: recordData.minute,
          description: recordData.description
        })
        .select()
        .single();

      if (error) throw error;

      // 폼 초기화
      setRecordData({
        quarter_no: 1,
        event_type: 'GOAL',
        team_color: 'HOME',
        player_id: '',
        minute: 1,
        description: ''
      });

      onRecordSaved(data);
    } catch (error) {
      console.error('기록 저장 에러:', error);
      alert('기록 저장에 실패했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <label className="block text-sm font-medium text-gray-700">이벤트</label>
          <select
            value={recordData.event_type}
            onChange={(e) => setRecordData({...recordData, event_type: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {eventTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
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

        <div>
          <label className="block text-sm font-medium text-gray-700">시간(분)</label>
          <input
            type="number"
            min="1"
            max="40"
            value={recordData.minute}
            onChange={(e) => setRecordData({...recordData, minute: parseInt(e.target.value)})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">선수</label>
        <select
          value={recordData.player_id}
          onChange={(e) => setRecordData({...recordData, player_id: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">선수 선택</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>{player.nickname}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">설명</label>
        <textarea
          value={recordData.description}
          onChange={(e) => setRecordData({...recordData, description: e.target.value})}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          기록 추가
        </button>
      </div>
    </form>
  );
} 