'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function NewSchedulePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    season_id: '',
    schedule_type: 'friendly', // 친선경기를 기본값으로
    location: '',
    opponent_name: '',
    total_quarters: 4,
    min_players: 5,
    max_players: 12,
    schedule_date: '',
    schedule_time: ''
  });

  useEffect(() => {
    loadSeasons();
  }, []);

  const loadSeasons = async () => {
    try {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('is_active', true)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setSeasons(data || []);
      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, season_id: data[0].id }));
      }
    } catch (error) {
      console.error('시즌 로딩 에러:', error);
      alert('시즌 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 날짜와 시간 결합
      const scheduleDateTime = new Date(`${formData.schedule_date}T${formData.schedule_time}`);

      const { data, error } = await supabase
        .from('schedules')
        .insert([{
          ...formData,
          schedule_date: scheduleDateTime.toISOString(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      alert('경기 일정이 등록되었습니다.');
      router.push('/schedules');
    } catch (error) {
      console.error('일정 등록 에러:', error);
      alert('일정 등록에 실패했습니다.');
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">새 경기 일정 등록</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white shadow rounded-lg p-6">
        {/* 시즌 선택 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            시즌
          </label>
          <select
            value={formData.season_id}
            onChange={(e) => setFormData(prev => ({ ...prev, season_id: e.target.value }))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            {seasons.map(season => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
        </div>

        {/* 경기 유형 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            경기 유형
          </label>
          <select
            value={formData.schedule_type}
            onChange={(e) => setFormData(prev => ({ ...prev, schedule_type: e.target.value }))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="friendly">친선경기</option>
            <option value="league">리그경기</option>
            <option value="cup">컵경기</option>
            <option value="practice">연습경기</option>
          </select>
        </div>

        {/* 장소 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            장소
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* 상대팀 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상대팀
          </label>
          <input
            type="text"
            value={formData.opponent_name}
            onChange={(e) => setFormData(prev => ({ ...prev, opponent_name: e.target.value }))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* 날짜와 시간 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              날짜
            </label>
            <input
              type="date"
              value={formData.schedule_date}
              onChange={(e) => setFormData(prev => ({ ...prev, schedule_date: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시간
            </label>
            <input
              type="time"
              value={formData.schedule_time}
              onChange={(e) => setFormData(prev => ({ ...prev, schedule_time: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* 쿼터 및 인원 설정 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              쿼터 수
            </label>
            <input
              type="number"
              value={formData.total_quarters}
              onChange={(e) => setFormData(prev => ({ ...prev, total_quarters: parseInt(e.target.value) }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="1"
              max="8"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최소 인원
            </label>
            <input
              type="number"
              value={formData.min_players}
              onChange={(e) => setFormData(prev => ({ ...prev, min_players: parseInt(e.target.value) }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최대 인원
            </label>
            <input
              type="number"
              value={formData.max_players}
              onChange={(e) => setFormData(prev => ({ ...prev, max_players: parseInt(e.target.value) }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="1"
              required
            />
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => router.push('/schedules')}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            등록하기
          </button>
        </div>
      </form>
    </div>
  );
} 