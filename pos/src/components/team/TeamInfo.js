export default function TeamInfo({ team }) {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">창단일</p>
          <p className="text-base">{team?.founded_date || '미설정'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">홈구장</p>
          <p className="text-base">{team?.home_stadium || '미설정'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">리그</p>
          <p className="text-base">{team?.league || '미설정'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">감독</p>
          <p className="text-base">{team?.manager || '미설정'}</p>
        </div>
      </div>
    </div>
  );
} 