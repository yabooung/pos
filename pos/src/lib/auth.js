'use client';

import { supabase } from './supabase';

export const handleKakaoLogin = async () => {
  try {
    const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    const REDIRECT_URI = `${window.location.origin}/oauth/kakao/callback`;
    
    // 직접 카카오 로그인 페이지로 리다이렉트
    const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile_nickname,profile_image,account_email,birthday,gender,age_range`;
    window.location.href = kakaoURL;
  } catch (error) {
    console.error('카카오 로그인 에러:', error);
    throw error;
  }
};

export const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('로그아웃 에러:', error);
    throw error;
  }
};

export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('세션 조회 에러:', error);
    return null;
  }
}; 