'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function ScheduleForm({ schedule }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isGameCompleted, setIsGameCompleted] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  const [formData, setFormData] = useState({
    season_id: schedule?.season_id || '',
    schedule_type: schedule?.schedule_type || 'friendly',
    title: schedule?.title || '',
    schedule_date: schedule?.schedule_date ? new Date(schedule.schedule_date).toISOString().split('T')[0] : '',
    location: schedule?.location || '',
    opponent_name: schedule?.opponent_name || '',
    total_quarters: schedule?.total_quarters || 4,
    min_players: schedule?.min_players || 5,
    max_players: schedule?.max_players || 12
  });

  useEffect(() => {
    fetchSeasons();
    fetchUsers();
    
    // 기존 일정이 있는 경우 경기 완료 여부 확인
    if (schedule) {
      checkGameStatus(schedule.id);
    }
  }, [schedule]);

  const fetchSeasons = async () => {
    try {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setSeasons(data || []);
      
      // 시즌이 있고 초기 시즌 ID가 없는 경우 첫 번째 시즌 선택
      if (data?.length > 0 && !formData.season_id) {
        setFormData(prev => ({ ...prev, season_id: data[0].id }));
      }
    } catch (error) {
      console.error('시즌 로딩 에러:', error);
      alert('시즌 정보를 불러오는데 실패했습니다.');
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('사용자 로딩 에러:', error);
    }
  };

  const checkGameStatus = async (scheduleId) => {
    try {
      // match_players 테이블에서 해당 일정에 대한 기록이 있는지 확인
      const { data, error } = await supabase
        .from('match_players')
        .select('id')
        .eq('schedule_id', scheduleId)
        .limit(1);

      if (error) throw error;
      
      // 기록이 있으면 경기 완료로 간주
      setIsGameCompleted(data && data.length > 0);
      
      // 경기 참가자 불러오기
      if (data && data.length > 0) {
        fetchAttendance(scheduleId);
      }
    } catch (error) {
      console.error('경기 상태 확인 에러:', error);
    }
  };

  const fetchAttendance = async (scheduleId) => {
    try {
      const { data, error } = await supabase
        .from('schedule_attendance')
        .select('user_id')
        .eq('schedule_id', scheduleId)
        .eq('attendance', true);

      if (error) throw error;
      
      if (data) {
        const userIds = data.map(item => item.user_id);
        setSelectedUsers(userIds);
      }
    } catch (error) {
      console.error('참가자 로딩 에러:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserSelection = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSubmit = { ...formData };
      let scheduleId = schedule?.id;
      
      if (scheduleId) {
        // 업데이트
        const { error } = await supabase
          .from('schedules')
          .update(dataToSubmit)
          .eq('id', scheduleId);
          
        if (error) throw error;
      } else {
        // 새로 생성
        const { data, error } = await supabase
          .from('schedules')
          .insert(dataToSubmit)
          .select()
          .single();
          
        if (error) throw error;
        scheduleId = data.id;
      }

      // 경기 완료 후 상태이고 사용자가 선택된 경우 출석 정보 저장
      if (isGameCompleted && selectedUsers.length > 0) {
        // 기존 출석 정보 삭제
        await supabase
          .from('schedule_attendance')
          .delete()
          .eq('schedule_id', scheduleId);
        
        // 새 출석 정보 추가
        const attendanceToInsert = selectedUsers.map(userId => ({
          schedule_id: scheduleId,
          user_id: userId,
          response_status: 'confirmed',
          attendance: true,
          attendance_time: new Date().toISOString()
        }));
        
        const { error: attendanceError } = await supabase
          .from('schedule_attendance')
          .insert(attendanceToInsert);
          
        if (attendanceError) throw attendanceError;
      }
      
      router.push(`/schedules/${scheduleId}`);
    } catch (error) {
      console.error('스케줄 저장 에러:', error);
      alert('스케줄 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">
        {schedule ? '일정 수정' : '새 일정 생성'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 경기 상태 표시 */}
        {schedule && (
          <div className="mb-4">
            <span className={`px-3 py-1 rounded-full text-sm ${
              isGameCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {isGameCompleted ? '경기 완료' : '경기 전'}
            </span>
          </div>
        )}
        
        {/* 기본 정보 (항상 표시) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">시즌</label>
          <select
            name="season_id"
            value={formData.season_id}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">시즌 선택</option>
            {seasons.map(season => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">일정 유형</label>
          <select
            name="schedule_type"
            value={formData.schedule_type}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="friendly">친선경기</option>
            <option value="league">리그경기</option>
            <option value="tournament">토너먼트</option>
            <option value="practice">연습</option>
            <option value="meeting">미팅</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
          <input
            type="date"
            name="schedule_date"
            value={formData.schedule_date}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">장소</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">상대팀</label>
          <input
            type="text"
            name="opponent_name"
            value={formData.opponent_name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        {/* 경기 전 상태일 때만 표시할 필드들 */}
        {!isGameCompleted && (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">쿼터 수</label>
              <input
                type="number"
                name="total_quarters"
                value={formData.total_quarters}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">최소 인원</label>
              <input
                type="number"
                name="min_players"
                value={formData.min_players}
                onChange={handleChange}
                min="1"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">최대 인원</label>
              <input
                type="number"
                name="max_players"
                value={formData.max_players}
                onChange={handleChange}
                min="1"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        )}
        
        {/* 경기 완료 상태일 때만 표시할 필드들 */}
        {isGameCompleted && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">참가 선수</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {users.map(user => (
                <div 
                  key={user.user_id}
                  className={`p-2 border rounded-md cursor-pointer ${
                    selectedUsers.includes(user.user_id) 
                      ? 'bg-blue-100 border-blue-500' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleUserSelection(user.user_id)}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.user_id)}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    <span>{user.name || user.nickname || user.email}</span>
                  </div>
                </div>
              ))}
            </div>
            {users.length === 0 && (
              <p className="text-gray-500 text-sm mt-2">등록된 사용자가 없습니다.</p>
            )}
          </div>
        )}
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '저장 중...' : (schedule ? '수정하기' : '생성하기')}
          </button>
        </div>
      </form>
    </div>
  );
} 