'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          // 사용자 메타데이터 가져오기
          const { user } = session;
          
          // profiles 테이블 업데이트
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              kakao_id: user.user_metadata?.kakao_id,
              nickname: user.user_metadata?.nickname,
              email: user.email,
              profile_image: user.user_metadata?.profile_image,
              birthday: user.user_metadata?.birthday,
              birthday_type: user.user_metadata?.birthday_type,
              gender: user.user_metadata?.gender,
              age_range: user.user_metadata?.age_range,
              email_verified: user.email_confirmed,
              last_login: new Date().toISOString()
            }, {
              onConflict: 'id'
            });

          if (profileError) {
            console.error('Profile update error:', profileError);
          }
        } catch (error) {
          console.error('Error updating profile:', error);
        }
        
        router.push('/auth/test');
      }
    });
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl mb-4">로그인 처리중...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}