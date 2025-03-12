'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';

export default function ScheduleDetailPage({ params }) {
  // params를 React.use()로 언래핑
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGameCompleted, setIsGameCompleted] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [matchPlayers, setMatchPlayers] = useState([]);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (id) {
      fetchSchedule(id);
      checkGameStatus(id);
      fetchAttendees(id);
      fetchMatchPlayers(id);
    }
  }, [id]);

  const fetchSchedule = async (scheduleId) => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          seasons (name)
        `)
        .eq('id', scheduleId)
        .single();

      if (error) throw error;
      setSchedule(data);
    } catch (error) {
      console.error('일정 로딩 에러:', error);
      alert('일정을 불러오는데 실패했습니다.');
      router.push('/schedules');
    } finally {
      setLoading(false);
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
    } catch (error) {
      console.error('경기 상태 확인 에러:', error);
    }
  };

  const fetchAttendees = async (scheduleId) => {
    try {
      const { data, error } = await supabase
        .from('schedule_attendance')
        .select(`
          *,
          profiles:user_id (name, nickname, email, profile_image)
        `)
        .eq('schedule_id', scheduleId)
        .eq('attendance', true);

      if (error) throw error;
      setAttendees(data || []);
    } catch (error) {
      console.error('참가자 로딩 에러:', error);
    }
  };

  const fetchMatchPlayers = async (scheduleId) => {
    try {
      const { data, error } = await supabase
        .from('match_players')
        .select(`
          *,
          profiles:user_id (name, nickname, email, profile_image)
        `)
        .eq('schedule_id', scheduleId);

      if (error) throw error;
      setMatchPlayers(data || []);
    } catch (error) {
      console.error('경기 선수 로딩 에러:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 이 일정을 삭제하시겠습니까?')) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      router.push('/schedules');
    } catch (error) {
      console.error('일정 삭제 에러:', error);
      alert('일정 삭제에 실패했습니다.');
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

  // 팀 색상에 따른 배경색 클래스
  const getTeamColorClass = (color) => {
    const colors = {
      'red': 'bg-red-100 text-red-800',
      'blue': 'bg-blue-100 text-blue-800',
      'green': 'bg-green-100 text-green-800',
      'yellow': 'bg-yellow-100 text-yellow-800',
      'purple': 'bg-purple-100 text-purple-800',
      'orange': 'bg-orange-100 text-orange-800',
      'pink': 'bg-pink-100 text-pink-800',
      'gray': 'bg-gray-100 text-gray-800'
    };
    return colors[color] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-gray-500">일정을 찾을 수 없습니다.</p>
          <Link 
            href="/schedules"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            일정 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{schedule.title}</h1>
          <span className={`mt-2 inline-block px-3 py-1 rounded-full text-sm ${
            isGameCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {isGameCompleted ? '경기 완료' : '경기 전'}
          </span>
        </div>
        <div className="flex space-x-2">
          <Link 
            href="/schedules"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            목록으로
          </Link>
          <Link 
            href={`/schedules/${id}/edit`}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            수정하기
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            삭제하기
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">시즌</h3>
            <p className="mt-1 text-lg">{schedule.seasons?.name || '없음'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">일정 유형</h3>
            <p className="mt-1 text-lg">{getScheduleTypeText(schedule.schedule_type)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">날짜</h3>
            <p className="mt-1 text-lg">{formatDate(schedule.schedule_date)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">장소</h3>
            <p className="mt-1 text-lg">{schedule.location}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">상대팀</h3>
            <p className="mt-1 text-lg">{schedule.opponent_name || '-'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">쿼터 수</h3>
            <p className="mt-1 text-lg">{schedule.total_quarters}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">최소 인원</h3>
            <p className="mt-1 text-lg">{schedule.min_players}명</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">최대 인원</h3>
            <p className="mt-1 text-lg">{schedule.max_players}명</p>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500">생성일</h3>
            <p className="mt-1 text-lg">{new Date(schedule.created_at).toLocaleString('ko-KR')}</p>
          </div>
        </div>
      </div>

      {/* 참가자 목록 */}
      {attendees.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">참가자 목록</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {attendees.map(attendee => (
              <div key={attendee.id} className="flex items-center p-2 border rounded-md">
                {attendee.profiles?.profile_image && (
                  <img 
                    src={attendee.profiles.profile_image} 
                    alt={attendee.profiles.name || attendee.profiles.nickname} 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                )}
                <span>{attendee.profiles?.name || attendee.profiles?.nickname || attendee.profiles?.email || '알 수 없음'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 경기 선수 정보 (경기 완료 시에만 표시) */}
      {isGameCompleted && matchPlayers.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">경기 선수 정보</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">선수명</th>
                  <th className="py-2 px-4 border-b text-left">쿼터</th>
                  <th className="py-2 px-4 border-b text-left">팀</th>
                  <th className="py-2 px-4 border-b text-left">포지션</th>
                </tr>
              </thead>
              <tbody>
                {matchPlayers.map(player => (
                  <tr key={player.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      {player.player_name || player.profiles?.name || player.profiles?.nickname || '알 수 없음'}
                    </td>
                    <td className="py-2 px-4 border-b">{player.quarter_no}쿼터</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs ${getTeamColorClass(player.team_color)}`}>
                        {player.team_color}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">{player.position || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 경기 기록 버튼 (경기 전 상태일 때만 표시) */}
      {!isGameCompleted && (
        <div className="mt-6 flex justify-center">
          <Link 
            href={`/schedules/${id}/record`}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
          >
            경기 기록 시작하기
          </Link>
        </div>
      )}

      {/* 경기 통계 버튼 (경기 완료 상태일 때만 표시) */}
      {isGameCompleted && (
        <div className="mt-6 flex justify-center">
          <Link 
            href={`/schedules/${id}/stats`}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 text-center"
          >
            경기 통계 보기
          </Link>
        </div>
      )}
    </div>
  );
} 