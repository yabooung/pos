'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          seasons (
            name
          )
        `)
        .order('schedule_date', { ascending: false });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('일정 로딩 에러:', error);
      alert('일정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">경기 일정</h1>
        <Link 
          href="/schedules/new" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          새 일정 등록
        </Link>
      </div>

      <div className="grid gap-4">
        {schedules.map((schedule) => (
          <div 
            key={schedule.id} 
            className="bg-white shadow rounded-lg p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">
                  vs {schedule.opponent_name}
                </h2>
                <p className="text-gray-600">
                  {new Date(schedule.schedule_date).toLocaleString()}
                </p>
                <p className="text-gray-600">{schedule.location}</p>
                <p className="text-sm text-gray-500">
                  {schedule.seasons?.name}
                </p>
              </div>
              <div className="space-x-2">
                <Link
                  href={`/schedules/${schedule.id}/record`}
                  className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  기록하기
                </Link>
                <Link
                  href={`/schedules/${schedule.id}`}
                  className="inline-block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  상세보기
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 