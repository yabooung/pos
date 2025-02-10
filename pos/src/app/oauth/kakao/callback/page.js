'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function KakaoCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient({
    options: {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    }
  });
  
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleKakaoCallback(code);
    } else {
      console.error('인증 코드가 없습니다.');
      router.push('/auth/test');
    }
  }, [searchParams]);

  const handleKakaoCallback = async (code) => {
    try {
      // 기존 세션이 있다면 로그아웃
      await supabase.auth.signOut();

      const response = await fetch('/api/auth/kakao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code,
          redirectUri: `${window.location.origin}/oauth/kakao/callback`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '카카오 로그인에 실패했습니다.');
      }

      const data = await response.json();
      
      if (data.success && data.session) {
        // 세션 설정
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          console.error('현재 세션 조회 에러:', authError);
        }

        if (!authData?.session) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
          });

          if (setSessionError) throw setSessionError;
        }

        // 세션 설정 확인
        const { data: checkSession } = await supabase.auth.getSession();
        if (checkSession?.session) {
          router.push('/auth/test');
        } else {
          throw new Error('세션 설정에 실패했습니다.');
        }
      } else {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('카카오 콜백 에러:', error);
      alert(error.message);
      router.push('/auth/test');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl mb-4">카카오 로그인 처리중...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
} 