'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import ScheduleForm from '../../../../components/schedules/ScheduleForm';
import { use } from 'react';

export default function EditSchedulePage({ params }) {
  // params를 React.use()로 언래핑
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (id) {
      fetchSchedule(id);
    }
  }, [id]);

  const fetchSchedule = async (scheduleId) => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('id', scheduleId)
        .single();

      if (error) throw error;
      setSchedule(data);
    } catch (error) {
      console.error('일정 로딩 에러:', error);
      alert('일정을 불러오는데 실패했습니다.');
      router.push('/schedules');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-gray-500">일정을 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push('/schedules')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            일정 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">일정 수정</h1>
      <ScheduleForm schedule={schedule} />
    </div>
  );
} 