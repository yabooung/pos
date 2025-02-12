'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();

  const handleKakaoLogin = () => {
    const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    const REDIRECT_URI = `${window.location.origin}/oauth/kakao/callback`;
    const SCOPE = encodeURIComponent('profile_nickname profile_image name birthday');
    
    const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}`;
    window.location.href = kakaoURL;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            로그인
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            간편하게 로그인하고 서비스를 이용해보세요
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {/* 카카오 로그인 버튼 */}
          <button
            onClick={handleKakaoLogin}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-[#391B1B] bg-[#FEE500] hover:bg-[#FEE500]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEE500]"
          >
            <div className="flex items-center">
              <Image
                src="/kakao-logo.png"
                alt="Kakao"
                width={24}
                height={24}
                className="mr-2"
              />
              카카오로 시작하기
            </div>
          </button>

          {/* 추가 로그인 버튼들을 위한 공간 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                다른 로그인 방식
              </span>
            </div>
          </div>

          {/* 네이버 로그인 버튼 (비활성화) */}
          <button
            disabled
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#03C75A] opacity-50 cursor-not-allowed"
          >
            <div className="flex items-center">
              준비중
            </div>
          </button>

          {/* 구글 로그인 버튼 (비활성화) */}
          <button
            disabled
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white opacity-50 cursor-not-allowed"
          >
            <div className="flex items-center">
              준비중
            </div>
          </button>
        </div>

        {/* 추가 정보 */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            로그인함으로써 
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 mx-1">
              서비스 이용약관
            </a>
            및
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 mx-1">
              개인정보 처리방침
            </a>
            에 동의합니다
          </p>
        </div>
      </div>
    </div>
  );
} 