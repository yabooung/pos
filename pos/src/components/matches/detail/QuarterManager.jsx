'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function QuarterManager({ matchId }) {
  const [quarters, setQuarters] = useState([]);
  const [currentQuarter, setCurrentQuarter] = useState(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchQuarters();
  }, [matchId]);

  const fetchQuarters = async () => {
    const { data, error } = await supabase
      .from('game_records')
      .select('*')
      .eq('schedule_id', matchId)
      .in('event_type', ['QUARTER_START', 'QUARTER_END'])
      .order('created_at');

    if (!error) {
      const processedQuarters = processQuarterData(data);
      setQuarters(processedQuarters);
      const active = processedQuarters.find(q => !q.ended_at);
      setCurrentQuarter(active);
    }
  };

  const startQuarter = async (quarterNo) => {
    try {
      const { data, error } = await supabase
        .from('game_records')
        .insert({
          schedule_id: matchId,
          quarter_no: quarterNo,
          event_type: 'QUARTER_START',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      fetchQuarters();
    } catch (error) {
      console.error('쿼터 시작 에러:', error);
      alert('쿼터 시작에 실패했습니다.');
    }
  };

  const endQuarter = async (quarterNo) => {
    try {
      const { data, error } = await supabase
        .from('game_records')
        .insert({
          schedule_id: matchId,
          quarter_no: quarterNo,
          event_type: 'QUARTER_END',
          ended_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      fetchQuarters();
    } catch (error) {
      console.error('쿼터 종료 에러:', error);
      alert('쿼터 종료에 실패했습니다.');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">쿼터 관리</h2>
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((quarterNo) => {
          const quarter = quarters.find(q => q.quarter_no === quarterNo);
          const isActive = currentQuarter?.quarter_no === quarterNo;
          
          return (
            <div key={quarterNo} className="border rounded-lg p-4">
              <h3 className="text-center font-medium mb-2">{quarterNo}쿼터</h3>
              <div className="space-y-2">
                {!quarter ? (
                  <button
                    onClick={() => startQuarter(quarterNo)}
                    className="w-full bg-indigo-600 text-white px-3 py-2 rounded-md text-sm"
                    disabled={currentQuarter && !currentQuarter.ended_at}
                  >
                    쿼터 시작
                  </button>
                ) : !quarter.ended_at ? (
                  <button
                    onClick={() => endQuarter(quarterNo)}
                    className="w-full bg-red-600 text-white px-3 py-2 rounded-md text-sm"
                  >
                    쿼터 종료
                  </button>
                ) : (
                  <div className="text-center text-sm text-gray-500">완료</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 