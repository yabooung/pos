'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function MatchList({ matches, onMatchUpdate }) {
  const supabase = createClientComponentClient();

  const handleDelete = async (matchId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', matchId);

      if (error) throw error;
      onMatchUpdate();
    } catch (error) {
      console.error('경기 삭제 에러:', error);
      alert('경기 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <div key={match.id} className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">
                {new Date(match.schedule_date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <h3 className="text-lg font-medium">{match.opponent_name}</h3>
              <p className="text-sm text-gray-600">{match.location}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleDelete(match.id)}
                className="text-red-600 hover:text-red-800"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 