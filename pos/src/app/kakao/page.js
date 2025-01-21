'use client';

import KakaoLogin from '@/components/KakaoLogin';

export default function TestPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">카카오 로그인/로그아웃 테스트</h1>
      <div className="space-y-4">
        <KakaoLogin />
        
        <div>
          <p className="text-sm text-gray-600 mt-4">
            * 개발자 도구(F12)의 Console 탭에서 결과를 확인하세요
          </p>
        </div>
      </div>
    </div>
  );
}