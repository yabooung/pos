export default function TeamPlayerList({ teamId }) {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((player) => (
        <div key={player} className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xl text-gray-500">{player}</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-medium text-gray-900">선수 {player}</h4>
                <p className="text-sm text-gray-500">포지션: 공격수</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-indigo-600">등번호: {player * 7}</p>
                <p className="text-sm text-gray-500">나이: {20 + player}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 