'use client';
import { useState, useEffect } from 'react';

const KakaoLogin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  
  const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
  
  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
  
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const accessToken = localStorage.getItem('kakao_access_token');
      
      if (!accessToken) {
        setIsLoggedIn(false);
        return;
      }

      const response = await fetch('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      
      if (data.id) {
        setIsLoggedIn(true);
        setUserInfo(data);
      } else {
        setIsLoggedIn(false);
        localStorage.removeItem('kakao_access_token');
      }
    } catch (error) {
      console.error('로그인 상태 확인 에러:', error);
      setIsLoggedIn(false);
      localStorage.removeItem('kakao_access_token');
    }
  };
  
  const handleLogin = () => {
    window.location.href = kakaoURL;
  };

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem('kakao_access_token');
      
      const response = await fetch('/api/auth/kakao/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.removeItem('kakao_access_token');
        setIsLoggedIn(false);
        setUserInfo(null);
        alert('로그아웃되었습니다.');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('로그아웃 에러:', error);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="space-x-4">
        {!isLoggedIn ? (
          <button 
            onClick={handleLogin}
            className="bg-yellow-300 text-black px-4 py-2 rounded-lg hover:bg-yellow-400"
          >
            카카오 로그인
          </button>
        ) : (
          <button 
            onClick={handleLogout}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            로그아웃
          </button>
        )}
      </div>

      {isLoggedIn && userInfo && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold mb-2">사용자 정보</h3>
          <p>닉네임: {userInfo.properties?.nickname}</p>
          <p>이메일: {userInfo.kakao_account?.email}</p>
        </div>
      )}
    </div>
  );
};

export default KakaoLogin; 