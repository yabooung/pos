'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function KakaoCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      // 백엔드로 인증 코드 전송
      handleKakaoLogin(code);
    }
  }, [searchParams]);

  const handleKakaoLogin = async (code) => {
    try {
      // 1. 백엔드에 인증 코드 전송
      const response = await fetch('/api/auth/kakao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      const data = await response.json();
      console.log('카카오 로그인 응답:', data); // 응답 확인용
      
      if (data.success) {
        // access_token 저장
        localStorage.setItem('kakao_access_token', data.user.access_token);
        // 사용자 정보도 저장
        localStorage.setItem('kakao_user', JSON.stringify(data.user));
        
        // 상태 업데이트를 위해 새로고침
        window.location.href = '/kakao';  // router.push() 대신 사용
      } else {
        console.error('로그인 실패:', data.error);
        alert('로그인에 실패했습니다.');
        router.push('/kakao');
      }
    } catch (error) {
      console.error('카카오 로그인 에러:', error);
      alert('로그인 처리 중 오류가 발생했습니다.');
      router.push('/kakao');
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