import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // auth_users 테이블에서 카카오 사용자 정보 조회
    const { data, error } = await supabase
      .from('auth_users')
      .select('*')
      .eq('provider', 'kakao');
    
    if (error) throw error;

    return NextResponse.json({ users: data });
  } catch (error) {
    console.error('카카오 사용자 조회 에러:', error);
    return NextResponse.json(
      { error: '카카오 사용자 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 