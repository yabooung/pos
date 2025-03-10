import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    
    // 인증 처리
    await supabase.auth.exchangeCodeForSession(code);

    // 새로 로그인한 사용자 정보 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // 이름과 생일이 일치하는 프로필 찾기
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('name', user.user_metadata.name)
        .eq('birthday', user.user_metadata.birthday)
        .is('kakao_id', null); // 아직 연동되지 않은 프로필만

      if (profiles && profiles.length > 0) {
        // 일치하는 프로필이 있으면 카카오 ID 연동
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            kakao_id: user.id,
            provider: 'kakao',
            email: user.email,
            profile_image: user.user_metadata.avatar_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', profiles[0].id);

        if (updateError) {
          console.error('프로필 연동 에러:', updateError);
        }
      }
    }
  }

  // 홈페이지로 리다이렉트
  return NextResponse.redirect(new URL('/', requestUrl.origin));
} 