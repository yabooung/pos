export default function PlayerInfo({ profile }) {
  return (
    <div className="p-6 border-t">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-500">이메일</label>
          <p className="font-medium">{profile?.email}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">생년월일</label>
          <p className="font-medium">{profile?.birthday || '미설정'}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">가입일</label>
          <p className="font-medium">
            {new Date(profile?.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
} 