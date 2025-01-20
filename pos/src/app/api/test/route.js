export async function GET() {
  try {
    return Response.json({
      success: true,
      data: {
        message: "Hello from the API!",
        timestamp: new Date().toISOString()
      }
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

export async function POST(request) {
  const body = await request.json();
  
  return Response.json({
    message: "Data received successfully",
    data: body,
    timestamp: new Date().toISOString()
  });
} 