export async function POST(request) {
  try {
    const response = await fetch('https://kapi.kakao.com/v1/user/logout', {
      headers: {
        'Authorization': `Bearer ${request.headers.get('Authorization')}`,
      },
    });

    const data = await response.json();

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