'use client';

import ScheduleForm from '../../../components/schedules/ScheduleForm';

export default function NewSchedulePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">새 일정 추가</h1>
      <ScheduleForm />
    </div>
  );
} 