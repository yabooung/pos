import Image from 'next/image';

export default function ProfileHeader({ profile, onEditProfile }) {
  return (
    <div className="relative p-6">
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24">
          <Image
            src={profile?.profile_image || '/default-avatar.png'}
            alt="Profile"
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profile?.nickname}</h1>
          <p className="text-gray-600">{profile?.name}</p>
        </div>
      </div>
    </div>
  );
} 