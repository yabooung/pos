'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
    } catch (error) {
      console.error('프로필 조회 에러:', error);
      alert('프로필을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('로그아웃 에러:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* 프로필 헤더 */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {profile?.profile_image ? (
                  <Image
                    src={profile.profile_image}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="rounded-full border-4 border-white"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl text-gray-500">
                      {profile?.nickname?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {profile?.nickname || '사용자'}
                  </h2>
                  <p className="text-indigo-100">{profile?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>

          {/* 프로필 정보 */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">이름</p>
                <p className="text-base">{profile?.name || '미설정'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">생일</p>
                <p className="text-base">{profile?.birthday || '미설정'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">가입 경로</p>
                <p className="text-base capitalize">{profile?.provider || '일반'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">계정 생성일</p>
                <p className="text-base">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '알 수 없음'}
                </p>
              </div>
            </div>

            {/* 추가 정보 섹션 */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">계정 설정</h3>
              <div className="space-y-4">
                <button
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-left"
                  onClick={() => alert('준비 중인 기능입니다.')}
                >
                  프로필 수정
                </button>
                <button
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-left"
                  onClick={() => alert('준비 중인 기능입니다.')}
                >
                  알림 설정
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 