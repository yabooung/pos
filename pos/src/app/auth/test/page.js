'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthTest() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // 현재 사용자 정보 가져오기
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      setUser(user);

      if (user) {
        // 프로필 정보 가져오기
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        setProfile(profile);
      }
    } catch (error) {
      console.error('사용자 정보 조회 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    const REDIRECT_URI = `${window.location.origin}/oauth/kakao/callback`;
    const SCOPE = encodeURIComponent('profile_nickname profile_image name birthday');
    
    const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}`;
    window.location.href = kakaoURL;
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Auth Test</h2>
          
          {user ? (
            <div className="bg-white shadow rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-center space-x-4">
                {profile?.profile_image && (
                  <img 
                    src={profile.profile_image} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div className="text-left">
                  <p className="font-semibold">{profile?.nickname || user.email}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">
                  Provider: {profile?.provider || 'Unknown'}
                </p>
                {profile?.name && (
                  <p className="text-sm text-gray-600">
                    Name: {profile.name}
                  </p>
                )}
                {profile?.birthday && (
                  <p className="text-sm text-gray-600">
                    Birthday: {profile.birthday}
                  </p>
                )}
                {profile?.kakao_id && (
                  <p className="text-sm text-gray-600">
                    Kakao ID: {profile.kakao_id}
                  </p>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={handleKakaoLogin}
              className="w-full px-4 py-2 bg-yellow-300 text-black rounded hover:bg-yellow-400 flex items-center justify-center space-x-2 transition-colors"
            >
              <img 
                src="/kakao-logo.png" 
                alt="Kakao" 
                className="w-5 h-5"
              />
              <span>카카오로 시작하기</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}