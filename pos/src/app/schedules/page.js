'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          seasons (name),
          match_players (id)
        `)
        .order('schedule_date', { ascending: false });

      if (error) throw error;
      
      // 경기 완료 여부 확인 (match_players 데이터 존재 여부로 판단)
      const processedData = data.map(schedule => ({
        ...schedule,
        isCompleted: schedule.match_players && schedule.match_players.length > 0
      }));
      
      setSchedules(processedData || []);
    } catch (error) {
      console.error('일정 로딩 에러:', error);
      alert('일정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 이 일정을 삭제하시겠습니까?')) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // 목록 새로고침
      fetchSchedules();
    } catch (error) {
      console.error('일정 삭제 에러:', error);
      alert('일정 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 일정 유형에 따른 한글 표시
  const getScheduleTypeText = (type) => {
    const types = {
      'friendly': '친선경기',
      'league': '리그경기',
      'tournament': '토너먼트',
      'practice': '연습',
      'meeting': '미팅'
    };
    return types[type] || type;
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  // 경기 상태에 따른 배지 스타일
  const getStatusBadge = (isCompleted) => {
    if (isCompleted) {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
          경기 완료
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
          경기 전
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // 필터링된 일정 목록
  const filteredSchedules = schedules.filter(schedule => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'completed') return schedule.isCompleted;
    if (statusFilter === 'upcoming') return !schedule.isCompleted;
    return true;
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">일정 관리</h1>
        <Link 
          href="/schedules/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          새 일정 추가
        </Link>
      </div>

      {/* 상태 필터 */}
      <div className="mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-md ${
              statusFilter === 'all' 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setStatusFilter('upcoming')}
            className={`px-3 py-1 rounded-md ${
              statusFilter === 'upcoming' 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            경기 전
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded-md ${
              statusFilter === 'completed' 
                ? 'bg-green-600 text-white' 
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            경기 완료
          </button>
        </div>
      </div>

      {filteredSchedules.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">등록된 일정이 없습니다.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">제목</th>
                <th className="py-2 px-4 border-b text-left">날짜</th>
                <th className="py-2 px-4 border-b text-left">유형</th>
                <th className="py-2 px-4 border-b text-left">장소</th>
                <th className="py-2 px-4 border-b text-left">상대팀</th>
                <th className="py-2 px-4 border-b text-left">상태</th>
                <th className="py-2 px-4 border-b text-center">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map(schedule => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">
                    <Link 
                      href={`/schedules/${schedule.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {schedule.title}
                    </Link>
                  </td>
                  <td className="py-2 px-4 border-b">{formatDate(schedule.schedule_date)}</td>
                  <td className="py-2 px-4 border-b">{getScheduleTypeText(schedule.schedule_type)}</td>
                  <td className="py-2 px-4 border-b">{schedule.location}</td>
                  <td className="py-2 px-4 border-b">{schedule.opponent_name || '-'}</td>
                  <td className="py-2 px-4 border-b">{getStatusBadge(schedule.isCompleted)}</td>
                  <td className="py-2 px-4 border-b text-center">
                    <div className="flex justify-center space-x-2">
                      <Link 
                        href={`/schedules/${schedule.id}`}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        상세
                      </Link>
                      <Link 
                        href={`/schedules/${schedule.id}/edit`}
                        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        수정
                      </Link>
                      {!schedule.isCompleted && (
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          삭제
                        </button>
                      )}
                      {!schedule.isCompleted && (
                        <Link 
                          href={`/schedules/${schedule.id}/record`}
                          className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                        >
                          기록
                        </Link>
                      )}
                      {schedule.isCompleted && (
                        <Link 
                          href={`/schedules/${schedule.id}/stats`}
                          className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                        >
                          통계
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 