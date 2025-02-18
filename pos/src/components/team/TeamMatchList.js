export default function TeamMatchList({ teamId }) {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((match) => (
        <div key={match} className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">2024-03-{match}</p>
              <h4 className="text-lg font-medium text-gray-900">우리팀 vs 상대팀</h4>
              <p className="text-sm text-indigo-600">홈 경기</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">2 - 1</div>
              <p className="text-sm text-green-600">승리</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 