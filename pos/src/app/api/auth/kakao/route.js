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

    return Response.json({
      success: true,
      user: {
        ...userData,
        access_token: tokenData.access_token  // 토큰도 함께 전달
      }
    });
  } catch (error) {
    console.error('카카오 로그인 API 에러:', error);
    return Response.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
} 