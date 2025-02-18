import Image from 'next/image';

export default function ProfileHeader({ profile, user, onLogout }) {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {profile?.profile_image ? (
            <Image
              src={profile.profile_image}
              alt="Profile"
              width={80}
              height={80}
              className="rounded-full border-4 border-white"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl text-gray-500">
                {profile?.nickname?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-white">
              {profile?.nickname || '사용자'}
            </h2>
            <p className="text-indigo-100">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
} 