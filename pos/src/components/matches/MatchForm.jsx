'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function MatchForm({ onClose, onSubmitSuccess, match }) {
  const supabase = createClientComponentClient();
  const [formData, setFormData] = useState({
    schedule_type: match?.schedule_type || 'OFFICIAL',
    location: match?.location || '',
    opponent_name: match?.opponent_name || '',
    total_quarters: match?.total_quarters || 4,
    min_players: match?.min_players || 11,
    max_players: match?.max_players || 18,
    schedule_date: match?.schedule_date || new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('schedules')
        .upsert({
          ...formData,
          id: match?.id
        })
        .select()
        .single();

      if (error) throw error;
      onSubmitSuccess();
    } catch (error) {
      console.error('경기 저장 에러:', error);
      alert('경기 저장에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{match ? '경기 수정' : '새 경기 등록'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">경기 유형</label>
            <select
              value={formData.schedule_type}
              onChange={(e) => setFormData({...formData, schedule_type: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="OFFICIAL">공식전</option>
              <option value="PRACTICE">연습경기</option>
              <option value="FRIENDLY">친선경기</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">경기 일시</label>
            <input
              type="datetime-local"
              value={formData.schedule_date}
              onChange={(e) => setFormData({...formData, schedule_date: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">장소</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">상대팀</label>
            <input
              type="text"
              value={formData.opponent_name}
              onChange={(e) => setFormData({...formData, opponent_name: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              저장
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 