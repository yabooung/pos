import Image from 'next/image';

export default function TeamHeader({ team }) {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-8">
      <div className="flex items-center space-x-4">
        {team?.team_logo ? (
          <Image
            src={team.team_logo}
            alt="Team Logo"
            width={80}
            height={80}
            className="rounded-full border-4 border-white"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-2xl text-gray-500">
              {team?.name?.[0]?.toUpperCase() || 'T'}
            </span>
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-white">{team?.name || '팀 이름'}</h2>
          <p className="text-indigo-100">{team?.location || '지역'}</p>
        </div>
      </div>
    </div>
  );
}