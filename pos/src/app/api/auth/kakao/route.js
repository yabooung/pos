import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  try {
    const { code } = await request.json();
    
    // 카카오 토큰 받기
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID,
        redirect_uri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    // 카카오 사용자 정보 받기
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();
    
    // 기존 사용자 찾기
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('kakao_id', userData.id)
      .single();

    let user;

    if (existingUser) {
      // 기존 사용자인 경우
      user = existingUser;
    } else {
      // 새 사용자 생성
      const randomId = crypto.randomUUID();
      const email = userData.kakao_account?.email || `${randomId}@kakao.user`;
      
      const { data: { user: newUser }, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        email_verified: true,
        password: crypto.randomUUID(), // 랜덤 패스워드
        user_metadata: {
          kakao_id: userData.id,
          nickname: userData.properties?.nickname,
          profile_image: userData.properties?.profile_image,
          provider: 'kakao',
          has_email: !!userData.kakao_account?.email // 실제 이메일 존재 여부 저장
        }
      });

      if (authError) throw authError;
      user = newUser;
    }

    // profiles 테이블 업데이트
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        kakao_id: userData.id,
        nickname: userData.properties?.nickname,
        email: userData.kakao_account?.email, // 실제 이메일이 있는 경우만 저장
        profile_image: userData.properties?.profile_image,
        last_login: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (profileError) throw profileError;

    // 세션 생성
    const { data: { session }, error: sessionError } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI,
      },
    });

    if (sessionError) throw sessionError;

    return Response.json({
      success: true,
      session,
      user: {
        ...userData,
        access_token: tokenData.access_token
      }
    });

  } catch (error) {
    console.error('카카오 로그인 API 에러:', error);
    return Response.json(
      {
        success: false,
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
} 