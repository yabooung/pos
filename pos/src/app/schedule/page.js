 'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState([])
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase.from('schedules').select('*')
      if (error) throw error
      setSchedules(data)
    } catch (error) {
      console.error('Error fetching schedules:', error.message)
    }
  }

  const onSubmit = async (data) => {
    try {
      const { error } = await supabase.from('schedules').insert([data])
      if (error) throw error
      fetchSchedules()
      reset()
    } catch (error) {
      console.error('Error adding schedule:', error.message)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">일정 관리</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">제목</label>
            <input
              type="text"
              id="title"
              {...register('title', { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">날짜</label>
            <input
              type="date"
              id="date"
              {...register('date', { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">시간</label>
            <input
              type="time"
              id="time"
              {...register('time', { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">장소</label>
            <input
              type="text"
              id="location"
              {...register('location', { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">설명</label>
            <textarea
              id="description"
              {...register('description')}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          일정 추가
        </button>
      </form>

      <div className="space-y-4">
        {schedules.map(schedule => (
          <div key={schedule.id} className="p-4 bg-gray-100 rounded-lg">
            <h2 className="text-lg font-bold mb-2">{schedule.title}</h2>
            <p className="text-sm mb-1">날짜: {schedule.date}</p>
            <p className="text-sm mb-1">시간: {schedule.time}</p>
            <p className="text-sm mb-1">장소: {schedule.location}</p>
            <p className="text-sm">{schedule.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SchedulesPage