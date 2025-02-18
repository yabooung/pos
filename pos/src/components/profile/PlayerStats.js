export default function PlayerStats({ userId }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-medium text-gray-900 mb-2">득점</h4>
        <p className="text-3xl font-bold text-indigo-600">15</p>
        <p className="text-sm text-gray-500 mt-1">이번 시즌</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-medium text-gray-900 mb-2">어시스트</h4>
        <p className="text-3xl font-bold text-indigo-600">8</p>
        <p className="text-sm text-gray-500 mt-1">이번 시즌</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-medium text-gray-900 mb-2">출전 경기</h4>
        <p className="text-3xl font-bold text-indigo-600">22</p>
        <p className="text-sm text-gray-500 mt-1">이번 시즌</p>
      </div>
    </div>
  );
} 