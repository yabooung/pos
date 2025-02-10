'use client';

import { useEffect, useState } from 'react';
import { handleKakaoLogin, handleLogout, getSession } from '@/lib/auth';

export default function AuthTestPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userMetadata, setUserMetadata] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const session = await getSession();
      setSession(session);
      setUserMetadata(session?.user?.user_metadata || null);
    } catch (error) {
      console.error('사용자 확인 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  const onKakaoLogin = async () => {
    try {
      setLoading(true);
      await handleKakaoLogin();
    } catch (error) {
      alert('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onLogout = async () => {
    try {
      setLoading(true);
      await handleLogout();
      alert('로그아웃되었습니다.');
    } catch (error) {
      alert('로그아웃 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">인증 테스트 페이지</h1>
        
        {/* 상태 표시 */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">현재 상태</h2>
          <p className="mb-2">로딩 중: {loading ? '예' : '아니오'}</p>
          <p className="mb-2">로그인 상태: {session ? '로그인됨' : '로그아웃됨'}</p>
        </div>

        {/* 버튼 영역 */}
        <div className="space-y-4">
          <button
            onClick={onKakaoLogin}
            disabled={loading || !!session}
            className="w-full bg-yellow-400 text-black py-2 px-4 rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            카카오로 로그인
          </button>

          <button
            onClick={onLogout}
            disabled={loading || !session}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            로그아웃
          </button>
        </div>

        {/* 사용자 정보 표시 */}
        {session && userMetadata && (
          <div className="mt-8 p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">사용자 정보</h2>
            <div className="space-y-2">
              <p>닉네임: {userMetadata.nickname || '없음'}</p>
              <p>생일: {userMetadata.birthday || '없음'}</p>
              <p>성별: {userMetadata.gender || '없음'}</p>
              <p>연령대: {userMetadata.age_range || '없음'}</p>
              <p>이메일 인증: {userMetadata.email_verified ? '완료' : '미완료'}</p>
              {userMetadata.profile_image && (
                <div>
                  <p className="mb-2">프로필 이미지:</p>
                  <img
                    src={userMetadata.profile_image}
                    alt="프로필"
                    className="w-20 h-20 rounded-full"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 디버그 정보 */}
        {session && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">세션 정보</h2>
            <pre className="overflow-auto text-sm">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}