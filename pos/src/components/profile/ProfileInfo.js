export default function ProfileInfo({ profile, user }) {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">이름</p>
          <p className="text-base">{profile?.name || '미설정'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">생일</p>
          <p className="text-base">{profile?.birthday || '미설정'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">가입 경로</p>
          <p className="text-base capitalize">{profile?.provider || '일반'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">계정 생성일</p>
          <p className="text-base">
            {user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '알 수 없음'}
          </p>
        </div>
      </div>
    </div>
  );
} 