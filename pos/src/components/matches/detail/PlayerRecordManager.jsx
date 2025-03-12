'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function PlayerRecordManager({ matchId, currentQuarter }) {
  const [matchPlayers, setMatchPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [records, setRecords] = useState([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchMatchPlayers();
  }, [matchId]);

  useEffect(() => {
    if (selectedPlayer) {
      fetchPlayerRecords(selectedPlayer.user_id);
    }
  }, [selectedPlayer]);

  const fetchMatchPlayers = async () => {
    const { data, error } = await supabase
      .from('match_players')
      .select(`
        *,
        profiles:user_id (
          nickname
        )
      `)
      .eq('schedule_id', matchId);

    if (!error) {
      setMatchPlayers(data);
    }
  };

  const fetchPlayerRecords = async (playerId) => {
    const { data, error } = await supabase
      .from('game_records')
      .select('*')
      .eq('schedule_id', matchId)
      .eq('player_id', playerId)
      .order('created_at', { ascending: true });

    if (!error) {
      setRecords(data);
    }
  };

  const addRecord = async (recordData) => {
    try {
      const { data, error } = await supabase
        .from('game_records')
        .insert({
          schedule_id: matchId,
          quarter_no: currentQuarter,
          player_id: selectedPlayer.user_id,
          player_name: selectedPlayer.profiles.nickname,
          team_color: selectedPlayer.team_color,
          ...recordData
        })
        .select()
        .single();

      if (error) throw error;
      fetchPlayerRecords(selectedPlayer.user_id);
    } catch (error) {
      console.error('기록 추가 에러:', error);
      alert('기록 추가에 실패했습니다.');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">선수별 기록</h2>

      {/* 선수 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">선수 선택</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">홈팀</h3>
            <div className="space-y-2">
              {matchPlayers
                .filter(p => p.team_color === 'HOME')
                .map(player => (
                  <button
                    key={player.user_id}
                    onClick={() => setSelectedPlayer(player)}
                    className={`w-full text-left px-3 py-2 rounded ${
                      selectedPlayer?.user_id === player.user_id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {player.profiles.nickname}
                  </button>
                ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">원정팀</h3>
            <div className="space-y-2">
              {matchPlayers
                .filter(p => p.team_color === 'AWAY')
                .map(player => (
                  <button
                    key={player.user_id}
                    onClick={() => setSelectedPlayer(player)}
                    className={`w-full text-left px-3 py-2 rounded ${
                      selectedPlayer?.user_id === player.user_id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {player.profiles.nickname}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 선수 기록 입력 폼 */}
      {selectedPlayer && (
        <div className="border-t pt-4">
          <h3 className="text-md font-medium mb-4">
            {selectedPlayer.profiles.nickname}의 기록
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => addRecord({
                event_type: 'SHOT',
                description: '슈팅 시도',
                minute: Math.floor(Date.now() / 1000) % 40 + 1
              })}
              className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              슈팅
            </button>
            <button
              onClick={() => addRecord({
                event_type: 'GOAL',
                description: '득점',
                minute: Math.floor(Date.now() / 1000) % 40 + 1
              })}
              className="px-3 py-2 bg-green-100 rounded hover:bg-green-200"
            >
              득점
            </button>
            <button
              onClick={() => addRecord({
                event_type: 'ASSIST',
                description: '어시스트',
                minute: Math.floor(Date.now() / 1000) % 40 + 1
              })}
              className="px-3 py-2 bg-blue-100 rounded hover:bg-blue-200"
            >
              어시스트
            </button>
            <button
              onClick={() => addRecord({
                event_type: 'FOUL',
                description: '파울',
                minute: Math.floor(Date.now() / 1000) % 40 + 1
              })}
              className="px-3 py-2 bg-red-100 rounded hover:bg-red-200"
            >
              파울
            </button>
          </div>

          {/* 기록 목록 */}
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">기록 내역</h4>
            <div className="space-y-2">
              {records.map(record => (
                <div key={record.id} className="flex items-center justify-between text-sm border-b pb-2">
                  <span>{record.minute}분</span>
                  <span className="font-medium">{record.event_type}</span>
                  <span>{record.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 