'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function KakaoCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleKakaoCallback(code);
    } else {
      console.error('인증 코드가 없습니다.');
      router.push('/');
    }
  }, [searchParams]);

  const handleKakaoCallback = async (code) => {
    try {
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

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '카카오 로그인에 실패했습니다.');
      }

      if (data.session) {
        // Supabase 세션 설정
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });

        if (sessionError) {
          throw sessionError;
        }

        // 세션이 정상적으로 설정되었는지 확인
        const { data: { user }, error: getUserError } = await supabase.auth.getUser();
        
        if (getUserError || !user) {
          throw new Error('사용자 세션 확인에 실패했습니다.');
        }

        console.log('로그인 성공:', user);
        router.push('/auth/test');
      } else {
        throw new Error('세션 정보가 없습니다.');
      }
    } catch (error) {
      console.error('카카오 콜백 에러:', error);
      alert(error.message);
      router.push('/');
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