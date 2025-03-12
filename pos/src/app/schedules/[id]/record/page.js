'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function RecordGamePage({ params }) {
  // params를 React.use()로 언래핑
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendees, setAttendees] = useState([]);
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [teamColors, setTeamColors] = useState(['홈팀', '원정팀']);
  const [selectedPlayers, setSelectedPlayers] = useState({
    '홈팀': [],
    '원정팀': []
  });
  const [positions, setPositions] = useState(['GK', 'DF', 'MF', 'FW']);
  const [playerPositions, setPlayerPositions] = useState({});
  const [savingData, setSavingData] = useState(false);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (id) {
      fetchSchedule(id);
      fetchAttendees(id);
    }
  }, [id]);

  const fetchSchedule = async (scheduleId) => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('id', scheduleId)
        .single();

      if (error) throw error;
      setSchedule(data);
      
      // 이미 기록이 있는지 확인
      checkExistingRecords(scheduleId);
    } catch (error) {
      console.error('일정 로딩 에러:', error);
      alert('일정을 불러오는데 실패했습니다.');
      router.push('/schedules');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingRecords = async (scheduleId) => {
    try {
      const { data, error } = await supabase
        .from('match_players')
        .select('id')
        .eq('schedule_id', scheduleId)
        .limit(1);

      if (error) throw error;
      
      // 이미 기록이 있으면 통계 페이지로 리다이렉트
      if (data && data.length > 0) {
        alert('이미 기록이 완료된 경기입니다.');
        router.push(`/schedules/${scheduleId}/stats`);
      }
    } catch (error) {
      console.error('기록 확인 에러:', error);
    }
  };

  const fetchAttendees = async (scheduleId) => {
    try {
      const { data, error } = await supabase
        .from('schedule_attendance')
        .select(`
          *,
          profiles:user_id (user_id, name, nickname, email, profile_image)
        `)
        .eq('schedule_id', scheduleId)
        .eq('attendance', true);

      if (error) throw error;
      setAttendees(data || []);
    } catch (error) {
      console.error('참가자 로딩 에러:', error);
    }
  };

  const handlePlayerSelection = (userId, teamColor) => {
    setSelectedPlayers(prev => {
      // 다른 팀에서 이미 선택된 경우 제거
      const otherTeam = teamColors.find(color => color !== teamColor);
      const updatedOtherTeam = prev[otherTeam].filter(id => id !== userId);
      
      // 현재 팀에서 토글
      let updatedTeam;
      if (prev[teamColor].includes(userId)) {
        updatedTeam = prev[teamColor].filter(id => id !== userId);
      } else {
        updatedTeam = [...prev[teamColor], userId];
      }
      
      return {
        ...prev,
        [otherTeam]: updatedOtherTeam,
        [teamColor]: updatedTeam
      };
    });
  };

  const handlePositionChange = (userId, position) => {
    setPlayerPositions(prev => ({
      ...prev,
      [userId]: position
    }));
  };

  const handleQuarterChange = (direction) => {
    if (direction === 'next' && currentQuarter < schedule.total_quarters) {
      setCurrentQuarter(prev => prev + 1);
    } else if (direction === 'prev' && currentQuarter > 1) {
      setCurrentQuarter(prev => prev - 1);
    }
  };

  const saveQuarterData = async () => {
    setSavingData(true);
    
    try {
      // 현재 쿼터의 선수 데이터 생성
      const matchPlayersData = [];
      
      for (const teamColor of teamColors) {
        for (const userId of selectedPlayers[teamColor]) {
          const attendee = attendees.find(a => a.user_id === userId);
          const playerName = attendee?.profiles?.name || attendee?.profiles?.nickname || '알 수 없음';
          
          matchPlayersData.push({
            schedule_id: id,
            user_id: userId,
            player_name: playerName,
            quarter_no: currentQuarter,
            team_color: teamColor,
            position: playerPositions[userId] || null,
            opponent: teamColor === '홈팀' ? '원정팀' : '홈팀'
          });
        }
      }
      
      if (matchPlayersData.length > 0) {
        const { error } = await supabase
          .from('match_players')
          .insert(matchPlayersData);
          
        if (error) throw error;
        
        alert(`${currentQuarter}쿼터 선수 기록이 저장되었습니다.`);
        
        // 마지막 쿼터인 경우 통계 페이지로 이동
        if (currentQuarter === schedule.total_quarters) {
          router.push(`/schedules/${id}/stats`);
        } else {
          // 다음 쿼터로 이동
          setCurrentQuarter(prev => prev + 1);
          // 선택 초기화
          setSelectedPlayers({
            '홈팀': [],
            '원정팀': []
          });
          setPlayerPositions({});
        }
      } else {
        alert('선택된 선수가 없습니다.');
      }
    } catch (error) {
      console.error('데이터 저장 에러:', error);
      alert('선수 기록 저장에 실패했습니다.');
    } finally {
      setSavingData(false);
    }
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
          <button
            onClick={() => router.push('/schedules')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            일정 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{schedule.title} - 경기 기록</h1>
      <p className="text-gray-600 mb-6">
        {new Date(schedule.schedule_date).toLocaleDateString('ko-KR')} | {schedule.location}
      </p>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {currentQuarter}쿼터 선수 기록
            <span className="ml-2 text-sm text-gray-500">
              (총 {schedule.total_quarters}쿼터)
            </span>
          </h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleQuarterChange('prev')}
              disabled={currentQuarter === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              이전 쿼터
            </button>
            <button
              onClick={() => handleQuarterChange('next')}
              disabled={currentQuarter === schedule.total_quarters}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              다음 쿼터
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teamColors.map(teamColor => (
            <div key={teamColor} className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-3">{teamColor}</h3>
              
              <div className="space-y-3">
                {attendees.length > 0 ? (
                  attendees.map(attendee => {
                    const userId = attendee.user_id;
                    const isSelected = selectedPlayers[teamColor].includes(userId);
                    
                    return (
                      <div 
                        key={userId}
                        className={`p-3 border rounded-md ${
                          isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handlePlayerSelection(userId, teamColor)}
                              className="mr-3"
                            />
                            <div>
                              <p className="font-medium">
                                {attendee.profiles?.name || attendee.profiles?.nickname || attendee.profiles?.email || '알 수 없음'}
                              </p>
                            </div>
                          </div>
                          
                          {isSelected && (
                            <select
                              value={playerPositions[userId] || ''}
                              onChange={(e) => handlePositionChange(userId, e.target.value)}
                              className="border rounded-md p-1 text-sm"
                            >
                              <option value="">포지션 선택</option>
                              {positions.map(pos => (
                                <option key={pos} value={pos}>{pos}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-4">참가자가 없습니다.</p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={saveQuarterData}
            disabled={savingData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {savingData ? '저장 중...' : `${currentQuarter}쿼터 기록 저장`}
          </button>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => router.push(`/schedules/${id}`)}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          경기 상세로 돌아가기
        </button>
        
        <button
          onClick={() => {
            if (confirm('정말 기록을 취소하시겠습니까? 저장되지 않은 데이터는 모두 사라집니다.')) {
              router.push(`/schedules/${id}`);
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          기록 취소
        </button>
      </div>
    </div>
  );
} 