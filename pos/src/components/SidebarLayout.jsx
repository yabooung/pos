'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  Home, 
  Calendar, 
  FileText, 
  Users, 
  ClipboardCheck
} from 'lucide-react'

const SidebarLayout = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const handleKakaoLogin = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/oauth/kakao/callback`,
          queryParams: {
            scope: 'profile_nickname profile_image'
          }
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('카카오 로그인 에러:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('로그아웃 에러:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigationItems = [
    { href: '/', label: '홈', icon: <Home className="w-4 h-4" /> },
    { href: '/schedule', label: '일정 관리', icon: <Calendar className="w-4 h-4" /> },
    { href: '/matches', label: '경기 기록', icon: <FileText className="w-4 h-4" /> },
    { href: '/members', label: '회원 관리', icon: <Users className="w-4 h-4" /> },
    { href: '/attendance', label: '출석 관리', icon: <ClipboardCheck className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white shadow-sm">
        <div className="h-full px-3 py-4">
          <h1 className="px-3 text-lg font-semibold text-gray-900 mb-6">
            축구 동아리 관리
          </h1>
          
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-6 px-3">
            {loading ? (
              <button 
                disabled
                className="w-full justify-center flex items-center px-4 py-2 text-sm rounded bg-gray-100 text-gray-400"
              >
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                처리중...
              </button>
            ) : user ? (
              <>
                <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm">
                    {user.user_metadata?.full_name || user.user_metadata?.name || '사용자'}님
                  </p>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <button 
                onClick={handleKakaoLogin}
                className="w-full px-4 py-2 text-sm rounded bg-yellow-400 text-black hover:bg-yellow-500 transition-colors"
              >
                카카오 로그인
              </button>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}

export default SidebarLayout