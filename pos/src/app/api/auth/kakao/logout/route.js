import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    
    // 카카오 로그아웃
    const response = await fetch('https://kapi.kakao.com/v1/user/logout', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    // Supabase에서 토큰 제거
    const { error: updateError } = await supabase
      .from('users')
      .update({
        access_token: null,
        last_logout: new Date().toISOString()
      })
      .eq('access_token', token);

    if (updateError) throw updateError;

    return Response.json({
      success: true,
      data
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
} 