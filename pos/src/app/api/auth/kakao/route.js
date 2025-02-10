import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

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

    if (!userData.id) {
      throw new Error('카카오 사용자 정보를 받아오지 못했습니다.');
    }

    // 4. Supabase Admin 클라이언트 생성
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

    // 5. 이메일 설정
    const email = userData.kakao_account?.email || `kakao_${userData.id}@example.com`;

    // 6. 기존 사용자 확인
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
    if (getUserError) throw getUserError;

    const existingUser = users.find(user => 
      user.app_metadata?.provider === 'kakao' && 
      user.user_metadata?.kakao_id === userData.id.toString()
    );

    let userId;

    // 7. 임시 비밀번호 생성 (매 로그인마다 새로 생성)
    const tempPassword = randomBytes(16).toString('hex');

    if (!existingUser) {
      // 8. 새 사용자 생성
      const { data: { user }, error: createUserError } = await supabase.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          provider: 'kakao',
          kakao_id: userData.id.toString(),
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

      // 9. 프로필 생성
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          kakao_id: userData.id.toString(),
          email: email,
          nickname: userData.properties?.nickname,
          profile_image: userData.properties?.profile_image,
          name: userData.kakao_account?.name,
          birthday: userData.kakao_account?.birthday,
          birthday_type: userData.kakao_account?.birthday_type,
          provider: 'kakao'
        });

      if (createProfileError) throw createProfileError;
    } else {
      userId = existingUser.id;
      
      // 10. 기존 사용자 비밀번호 업데이트
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            provider: 'kakao',
            kakao_id: userData.id.toString(),
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

      // 11. 프로필 업데이트
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          kakao_id: userData.id.toString(),
          email: email,
          nickname: userData.properties?.nickname,
          profile_image: userData.properties?.profile_image,
          name: userData.kakao_account?.name,
          birthday: userData.kakao_account?.birthday,
          birthday_type: userData.kakao_account?.birthday_type,
          provider: 'kakao',
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;
    }

    // 12. 임시 비밀번호로 로그인
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: tempPassword,
    });

    if (signInError) throw signInError;

    return Response.json({
      success: true,
      session,
      user: {
        id: userId,
        email: email,
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