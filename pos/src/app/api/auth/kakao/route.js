import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  try {
    console.log('1. 카카오 콜백 시작');
    const { code, redirectUri } = await request.json();
    
    // 카카오 토큰 받기
    console.log('2. 카카오 토큰 요청');
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
    console.log('3. 카카오 토큰 응답:', tokenData);

    if (!tokenData.access_token) {
      throw new Error('Failed to get Kakao access token');
    }

    // 카카오 사용자 정보 받기
    console.log('4. 카카오 사용자 정보 요청');
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();
    console.log('5. 카카오 사용자 정보:', userData);

    if (!userData.id) {
      throw new Error('Failed to get Kakao user info');
    }

    const email = userData.kakao_account?.email;
    const userEmail = email || `${userData.id}@kakao.user`;

    // Supabase Admin 클라이언트 생성
    console.log('6. Supabase 클라이언트 생성');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 1. 이메일로 auth.users에서 기존 사용자 찾기
    console.log('7. 기존 사용자 검색');
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
    
    if (getUserError) {
      console.error('사용자 목록 조회 에러:', getUserError);
      throw getUserError;
    }

    const existingAuthUser = users.find(user => user.email === userEmail);
    console.log('8. 기존 사용자 여부:', !!existingAuthUser);

    let userId;
    const tempPassword = crypto.randomUUID();

    if (!existingAuthUser) {
      console.log('9. 새 사용자 생성 시작');
      const { data, error: createError } = await supabase.auth.admin.createUser({
        email: userEmail,
        password: tempPassword,
        email_confirmed: true,
        user_metadata: {
          provider: 'kakao',
          kakao_id: userData.id,
          nickname: userData.properties?.nickname,
          profile_image: userData.properties?.profile_image,
        }
      });

      if (createError) {
        console.error('사용자 생성 에러:', createError);
        throw createError;
      }

      userId = data.user.id;
      console.log('10. 새 사용자 생성 완료:', userId);
    } else {
      console.log('9. 기존 사용자 업데이트 시작');
      userId = existingAuthUser.id;
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { 
          password: tempPassword,
          email_confirmed: true,
          user_metadata: {
            provider: 'kakao',
            kakao_id: userData.id,
            nickname: userData.properties?.nickname,
            profile_image: userData.properties?.profile_image,
          }
        }
      );

      if (updateError) {
        console.error('사용자 업데이트 에러:', updateError);
        throw updateError;
      }
      console.log('10. 기존 사용자 업데이트 완료');
    }

    // profiles 테이블 업데이트
    console.log('11. 프로필 업데이트 시작');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        kakao_id: userData.id,
        email: userEmail,
        name: userData.properties?.name || userData.properties?.nickname,
        nickname: userData.properties?.nickname,
        profile_image: userData.properties?.profile_image,
        birthday: userData.kakao_account?.birthday,
        birthday_type: userData.kakao_account?.birthday_type,
        gender: userData.kakao_account?.gender,
        age_range: userData.kakao_account?.age_range,
        email_verified: true,
        last_login: new Date().toISOString()
      });

    if (profileError) {
      console.error('프로필 업데이트 에러:', profileError);
      throw profileError;
    }
    console.log('12. 프로필 업데이트 완료');

    // 로그인 시도
    console.log('13. 로그인 시도');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: tempPassword,
    });

    if (signInError) {
      console.error('로그인 에러:', signInError);
      throw signInError;
    }
    console.log('14. 로그인 성공');

    return Response.json({ 
      success: true, 
      session: signInData.session,
      debug: {
        isNewUser: !existingAuthUser,
        userId,
        kakaoId: userData.id
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