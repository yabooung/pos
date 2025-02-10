import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  try {
    // 1. 요청에서 인증 코드 받기
    const { code, redirectUri } = await request.json();

    // 2. 카카오 액세스 토큰 받기
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID,
        redirect_uri: redirectUri,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      throw new Error('카카오 액세스 토큰을 받아오지 못했습니다.');
    }

    // 3. 카카오 사용자 정보 받기
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();
    console.log('카카오 사용자 정보:', userData);

    if (!userData.id) {
      throw new Error('카카오 사용자 정보를 받아오지 못했습니다.');
    }

    // 5. 이메일 설정 (카카오 이메일이 없는 경우 대체 이메일 생성)
    const email = userData.kakao_account?.email;
    const userEmail = email || `kakao_${userData.id}@example.com`;

    // 안전한 랜덤 비밀번호 생성 (32자)
    const tempPassword = randomBytes(16).toString('hex');

    // 6. 기존 사용자 확인
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
    if (getUserError) throw getUserError;

    const existingUser = users.find(user => user.email === userEmail);
    let userId;

    if (!existingUser) {
      // 7. 새 사용자 생성
      const { data: { user }, error: createUserError } = await supabase.auth.admin.createUser({
        email: userEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          provider: 'kakao',
          kakao_id: userData.id,
          nickname: userData.properties?.nickname,
          profile_image: userData.properties?.profile_image,
        },
        app_metadata: {
          provider: 'kakao',
          providers: ['kakao']
        }
      });

      if (createUserError) throw createUserError;
      userId = user.id;

      // 8. 프로필 생성
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          kakao_id: userData.id,
          email: userEmail,
          nickname: userData.properties?.nickname,
          profile_image: userData.properties?.profile_image,
          name: userData.properties?.nickname,
          provider: 'kakao'
        });

      if (createProfileError) throw createProfileError;

      // 이메일 확인 처리
      await supabase.rpc('confirm_user', { user_id: userId });
    } else {
      userId = existingUser.id;
      
      // 기존 사용자 메타데이터 업데이트
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            provider: 'kakao',
            kakao_id: userData.id,
            nickname: userData.properties?.nickname,
            profile_image: userData.properties?.profile_image,
          },
          app_metadata: {
            provider: 'kakao',
            providers: ['kakao']
          }
        }
      );

      if (updateError) throw updateError;
    }

    // 9. 생성된 비밀번호로 로그인
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: tempPassword,
    });

    if (signInError) throw signInError;

    return Response.json({
      success: true,
      session: signInData.session,
      user: {
        id: userId,
        email: userEmail,
        nickname: userData.properties?.nickname
      }
    });

  } catch (error) {
    console.error('카카오 로그인 에러:', error);
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