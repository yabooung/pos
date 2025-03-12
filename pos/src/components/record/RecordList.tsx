'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface RecordListProps {
  scheduleId: string;
  quarterNo: number;
}

export default function RecordList({ scheduleId, quarterNo }: RecordListProps) {
  const [records, setRecords] = useState<any[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadRecords();
  }, [scheduleId, quarterNo]);

  const loadRecords = async () => {
    const { data, error } = await supabase
      .from('game_records')
      .select('*')
      .eq('schedule_id', scheduleId)
      .eq('quarter_no', quarterNo)
      .order('minute', { ascending: true });

    if (data) setRecords(data);
  };

  const getEventTypeText = (eventType: string) => {
    const types: { [key: string]: string } = {
      goal: '골',
      assist: '어시스트',
      shot: '슈팅',
      shot_on_target: '유효슈팅',
      pass: '패스',
      pass_success: '패스 성공',
      dribble: '드리블',
      dribble_success: '드리블 성공',
      tackle: '태클',
      tackle_success: '태클 성공'
    };
    return types[eventType] || eventType;
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">{quarterNo}쿼터 기록</h3>
      <div className="space-y-2">
        {records.map((record) => (
          <div
            key={record.id}
            className={`p-2 rounded ${
              record.team_color === 'red' ? 'bg-red-100' : 'bg-blue-100'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{record.minute}분</span>
              <span>{record.player_name}</span>
              <span>{getEventTypeText(record.event_type)}</span>
            </div>
            {record.description && (
              <p className="text-sm text-gray-600 mt-1">{record.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 