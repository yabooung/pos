'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface RecordFormProps {
  scheduleId: string;
  quarterNo: number;
  onSubmit: (record: any) => void;
}

export default function RecordForm({ scheduleId, quarterNo, onSubmit }: RecordFormProps) {
  const [formData, setFormData] = useState({
    team_color: 'red',
    event_type: 'goal',
    player_name: '',
    minute: 0,
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      quarter_no: quarterNo
    });
    // 폼 초기화
    setFormData(prev => ({
      ...prev,
      player_name: '',
      minute: 0,
      description: ''
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-4 mb-4">
      <div className="grid grid-cols-2 gap-4">
        {/* 팀 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">팀</label>
          <select
            value={formData.team_color}
            onChange={(e) => setFormData(prev => ({ ...prev, team_color: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="red">Red Team</option>
            <option value="blue">Blue Team</option>
          </select>
        </div>

        {/* 이벤트 타입 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">이벤트</label>
          <select
            value={formData.event_type}
            onChange={(e) => setFormData(prev => ({ ...prev, event_type: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="goal">골</option>
            <option value="assist">어시스트</option>
            <option value="shot">슈팅</option>
            <option value="shot_on_target">유효슈팅</option>
            <option value="pass">패스</option>
            <option value="pass_success">패스 성공</option>
            <option value="dribble">드리블</option>
            <option value="dribble_success">드리블 성공</option>
            <option value="tackle">태클</option>
            <option value="tackle_success">태클 성공</option>
          </select>
        </div>

        {/* 선수 이름 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">선수</label>
          <input
            type="text"
            value={formData.player_name}
            onChange={(e) => setFormData(prev => ({ ...prev, player_name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* 시간(분) 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">시간(분)</label>
          <input
            type="number"
            value={formData.minute}
            onChange={(e) => setFormData(prev => ({ ...prev, minute: parseInt(e.target.value) }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            min="0"
            max="60"
            required
          />
        </div>

        {/* 설명 입력 */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">설명</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={2}
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          기록 저장
        </button>
      </div>
    </form>
  );
} 