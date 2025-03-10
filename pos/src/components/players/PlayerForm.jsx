'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function PlayerForm({ player, onClose, onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    nickname: player?.nickname || '',
    name: player?.name || '',
    email: player?.email || '',
    birthday: player?.birthday || '',
    profile_image: player?.profile_image || '',
    kakao_id: player?.kakao_id || '',
    provider: 'kakao'
  });
  const [kakaoUsers, setKakaoUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchKakaoUsers();
  }, []);

  const fetchKakaoUsers = async () => {
    try {
      const response = await fetch('/api/users/kakao');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setKakaoUsers(data.users || []);
    } catch (error) {
      console.error('카카오 사용자 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.nickname) {
        throw new Error('닉네임은 필수 입력 항목입니다.');
      }

      if (formData.birthday && !/^\d{4}$/.test(formData.birthday)) {
        throw new Error('생일은 MMDD 형식으로 입력해주세요 (예: 0907)');
      }

      const dataToSubmit = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      let error;
      if (player) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(dataToSubmit)
          .eq('id', player.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            ...dataToSubmit,
            created_at: new Date().toISOString()
          }]);
        error = insertError;
      }

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      onSubmitSuccess();
    } catch (error) {
      console.error('선수 저장 에러:', error.message);
      alert(error.message || '선수 정보 저장에 실패했습니다.');
    }
  };

  const handleKakaoUserSelect = (userId) => {
    const selectedUser = kakaoUsers.find(user => user.id === userId);
    if (selectedUser) {
      setFormData(prev => ({
        ...prev,
        kakao_id: selectedUser.id,
        email: selectedUser.email || prev.email,
        name: selectedUser.name || prev.name,
        profile_image: selectedUser.avatar_url || prev.profile_image,
        provider: 'kakao'
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {player ? '선수 정보 수정' : '새 선수 등록'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {loading ? (
            <div className="text-center py-2">
              카카오 사용자 목록을 불러오는 중...
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                카카오 계정 연동
              </label>
              <select
                value={formData.kakao_id}
                onChange={(e) => handleKakaoUserSelect(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">카카오 계정 선택</option>
                {kakaoUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email} ({user.name || '이름 없음'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">닉네임 *</label>
            <input
              type="text"
              required
              value={formData.nickname}
              onChange={(e) => setFormData({...formData, nickname: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">이름</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">생일</label>
            <input
              type="text"
              placeholder="MMDD"
              maxLength="4"
              value={formData.birthday}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d]/g, '');
                if (value.length <= 4) {
                  setFormData({...formData, birthday: value});
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">예: 0907</p>
          </div>

          <div className="flex gap-4 pt-4">
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