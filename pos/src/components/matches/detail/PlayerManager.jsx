'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function PlayerManager({ matchId }) {
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPlayers();
    fetchMatchPlayers();
  }, [matchId]);

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('nickname');

    if (!error) {
      setPlayers(data);
    }
  };

  const fetchMatchPlayers = async () => {
    const { data, error } = await supabase
      .from('match_players')
      .select('user_id, team_color')
      .eq('schedule_id', matchId);

    if (!error) {
      setSelectedPlayers(data);
    }
    setLoading(false);
  };

  const addPlayer = async (playerId, teamColor) => {
    try {
      const player = players.find(p => p.id === playerId);
      const { error } = await supabase
        .from('match_players')
        .insert({
          schedule_id: matchId,
          user_id: playerId,
          player_name: player.nickname,
          team_color: teamColor
        });

      if (error) throw error;
      fetchMatchPlayers();
    } catch (error) {
      console.error('선수 추가 에러:', error);
      alert('선수 추가에 실패했습니다.');
    }
  };

  const removePlayer = async (playerId) => {
    try {
      const { error } = await supabase
        .from('match_players')
        .delete()
        .eq('schedule_id', matchId)
        .eq('user_id', playerId);

      if (error) throw error;
      fetchMatchPlayers();
    } catch (error) {
      console.error('선수 제거 에러:', error);
      alert('선수 제거에 실패했습니다.');
    }
  };

  if (loading) {
    return <div>로딩중...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">참가 선수 관리</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-md font-medium mb-3">홈팀</h3>
          <div className="space-y-2">
            {players.map(player => {
              const isSelected = selectedPlayers.some(
                sp => sp.user_id === player.id && sp.team_color === 'HOME'
              );
              
              return (
                <div key={player.id} className="flex items-center justify-between p-2 border rounded">
                  <span>{player.nickname}</span>
                  {isSelected ? (
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      제거
                    </button>
                  ) : (
                    <button
                      onClick={() => addPlayer(player.id, 'HOME')}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      추가
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-md font-medium mb-3">원정팀</h3>
          <div className="space-y-2">
            {players.map(player => {
              const isSelected = selectedPlayers.some(
                sp => sp.user_id === player.id && sp.team_color === 'AWAY'
              );
              
              return (
                <div key={player.id} className="flex items-center justify-between p-2 border rounded">
                  <span>{player.nickname}</span>
                  {isSelected ? (
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      제거
                    </button>
                  ) : (
                    <button
                      onClick={() => addPlayer(player.id, 'AWAY')}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      추가
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 