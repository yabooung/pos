export default function MatchList({ userId }) {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((match) => (
        <div key={match} className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">2024-03-{match}</p>
              <h4 className="text-lg font-medium text-gray-900">홈팀 vs 어웨이팀</h4>
            </div>
            <div className="text-2xl font-bold text-gray-900">2 - 1</div>
          </div>
        </div>
      ))}
    </div>
  );
} 