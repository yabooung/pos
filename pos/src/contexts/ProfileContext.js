// // contexts/ProfileContext.js
// 'use client';

// import { createContext, useContext, useState, useEffect } from 'react';
// import { supabase } from '@/lib/supabase';

// const ProfileContext = createContext();

// export function ProfileProvider({ children }) {
//   const [session, setSession] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // 세션과 프로필 정보 초기화
//     const initializeProfile = async () => {
//       try {
//         const { data: { session } } = await supabase.auth.getSession();
//         setSession(session);

//         if (session) {
//           const { data: profileData } = await supabase
//             .from('profiles')
//             .select('*')
//             .eq('id', session.user.id)
//             .single();
          
//           setProfile(profileData);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     initializeProfile();

//     // 세션 변경 구독
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
//       setSession(currentSession);
      
//       if (currentSession) {
//         const { data: profileData } = await supabase
//           .from('profiles')
//           .select('*')
//           .eq('id', currentSession.user.id)
//           .single();
        
//         setProfile(profileData);
//       } else {
//         setProfile(null);
//       }
//     });

//     return () => subscription?.unsubscribe();
//   }, []);

//   return (
//     <ProfileContext.Provider value={{ session, profile, loading }}>
//       {children}
//     </ProfileContext.Provider>
//   );
// }

// export function useProfile() {
//   return useContext(ProfileContext);
// }