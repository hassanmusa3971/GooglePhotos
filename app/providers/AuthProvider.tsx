import { Session } from "@supabase/supabase-js";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { supabase } from "~/utils/supabase";


type AuthContextType = {
      session: Session | null,
      user: Session['user'] | null,
}
const AuthContext = createContext<AuthContextType>({
      session: null,
      user: null,
})


export const AuthContextProvider = ({ children }:PropsWithChildren) => {
      const [session, setSession] = useState<Session | null>(null)

      useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session)
        })
    
        supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session)
        })
      }, [])
    
      return(
            <AuthContext.Provider value={{session, user: session?.user ?? null}}>{children}</AuthContext.Provider>
      )
}

export const useAuth = () => useContext(AuthContext)