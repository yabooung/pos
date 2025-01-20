'use client';

export default function TestPage() {
  const testGet = async () => {
    const res = await fetch('/api/test');
    const data = await res.json();
    console.log('GET 결과:', data);
  };

  const testPost = async () => {
    const res = await fetch('/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '테스트',
        age: 25
      })
    });
    const data = await res.json();
    console.log('POST 결과:', data);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">API 테스트 페이지</h1>
      <div className="space-x-4">
        <button 
          onClick={testGet}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          GET 테스트
        </button>
        <button 
          onClick={testPost}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          POST 테스트
        </button>
      </div>
    </div>
  );
} 