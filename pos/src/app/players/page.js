'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import PlayerForm from '../../components/players/PlayerForm';
import PlayerList from '../../components/players/PlayerList';

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('nickname');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setPlayers(data || []);
    } catch (error) {
      console.error('선수 목록 조회 에러:', error.message);
      alert('선수 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setIsFormOpen(true);
  };

  const handleDelete = async (playerId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', playerId);

      if (error) throw error;
      
      await fetchPlayers();
    } catch (error) {
      console.error('선수 삭제 에러:', error.message);
      alert('선수 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">선수 관리</h1>
          <button
            onClick={() => {
              setEditingPlayer(null);
              setIsFormOpen(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            새 선수 등록
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            등록된 선수가 없습니다.
          </div>
        ) : (
          <PlayerList
            players={players}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {isFormOpen && (
          <PlayerForm
            player={editingPlayer}
            onClose={() => {
              setIsFormOpen(false);
              setEditingPlayer(null);
            }}
            onSubmitSuccess={() => {
              setIsFormOpen(false);
              setEditingPlayer(null);
              fetchPlayers();
            }}
          />
        )}
      </div>
    </div>
  );
} 