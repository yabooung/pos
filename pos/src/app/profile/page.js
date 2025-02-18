'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileInfo from '@/components/profile/ProfileInfo';
import PlayerStats from '@/components/profile/PlayerStats';
import PlayerList from '@/components/profile/PlayerList';
import MatchList from '@/components/profile/MatchList';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
    } catch (error) {
      console.error('프로필 조회 에러:', error);
      alert('프로필을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('로그아웃 에러:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ProfileHeader 
            profile={profile} 
            user={user} 
            onLogout={handleLogout} 
          />
          <ProfileInfo profile={profile} user={user} />
          
          {/* 탭 네비게이션 */}
          <div className="border-t mt-6">
            <div className="flex border-b">
              {['stats', 'players', 'matches'].map((tab) => (
                <button
                  key={tab}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === tab
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'stats' && '선수 스탯'}
                  {tab === 'players' && '선수 목록'}
                  {tab === 'matches' && '경기 목록'}
                </button>
              ))}
            </div>

            {/* 탭 컨텐츠 */}
            <div className="p-6">
              {activeTab === 'stats' && <PlayerStats userId={user.id} />}
              {activeTab === 'players' && <PlayerList userId={user.id} />}
              {activeTab === 'matches' && <MatchList userId={user.id} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 