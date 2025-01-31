'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 세션 확인
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    
    getInitialSession();

    // 세션 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Supabase 카카오 로그인 테스트
  const testSupabaseKakaoLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      console.log('Supabase Kakao Login 시도:', data);
    } catch (error) {
      console.error('Supabase 카카오 로그인 에러:', error);
    }
  };

  // Supabase 로그아웃 테스트
  const testSupabaseLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('로그아웃 성공');
    } catch (error) {
      console.error('로그아웃 에러:', error);
    }
  };

  // 세션 정보 확인
  const checkSessionInfo = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('현재 세션 정보:', session);
  };

  // Provider Token 확인
  const checkProviderToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Provider Token:', session?.provider_token);
    console.log('Access Token:', session?.access_token);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">레이아웃 & 인증 테스트</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">현재 상태</h2>
        <p className="mb-2">
          로딩 중: {loading ? '예' : '아니오'}
        </p>
        <p className="mb-2">
          로그인 상태: {session ? '로그인됨' : '로그아웃됨'}
        </p>
        {session && (
          <pre className="bg-gray-100 p-2 rounded">
            {JSON.stringify(session, null, 2)}
          </pre>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-x-4">
          <button 
            onClick={testSupabaseKakaoLogin}
            className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500 disabled:opacity-50"
            disabled={!!session}
          >
            Supabase 카카오 로그인
          </button>
          
          <button 
            onClick={testSupabaseLogout}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
            disabled={!session}
          >
            Supabase 로그아웃
          </button>
        </div>

        <div className="space-x-4">
          <button 
            onClick={checkSessionInfo}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            세션 정보 확인
          </button>

          <button 
            onClick={checkProviderToken}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            토큰 정보 확인
          </button>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-600">
          * 개발자 도구(F12)의 Console 탭에서 결과를 확인하세요
        </p>
      </div>
    </div>
  );
}