export default function PlayerList({ userId }) {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((player) => (
        <div key={player} className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xl text-gray-500">{player}</span>
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900">선수 {player}</h4>
            <p className="text-sm text-gray-500">포지션: 공격수</p>
          </div>
        </div>
      ))}
    </div>
  );
} 