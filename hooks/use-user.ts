"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name?: string
  role: string
}

export function useUser() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasFetched, setHasFetched] = useState(false)

  useEffect(() => {
    let isMounted = true

    const getUser = async () => {
      // Prevent multiple simultaneous calls
      if (hasFetched && user) {
        return
      }

      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!isMounted) return

        if (authUser) {
          // Get user role from database
          try {
            const response = await fetch(`/api/users/${authUser.id}`, {
              cache: 'no-store',
              // Add timestamp to prevent caching
              headers: {
                'Cache-Control': 'no-cache',
              },
            })
            
            if (!isMounted) return

            if (response.ok) {
              const userData = await response.json()
              setUser({
                id: authUser.id,
                email: authUser.email || "",
                name: userData.name || authUser.user_metadata?.name,
                role: userData.role || "MEMBER",
              })
              setHasFetched(true)
            } else if (response.status === 404) {
              // If user not found in DB, try to get from metadata as fallback
              console.warn("User not found in database, using metadata")
              setUser({
                id: authUser.id,
                email: authUser.email || "",
                name: authUser.user_metadata?.name,
                role: authUser.user_metadata?.role || "MEMBER",
              })
              setHasFetched(true)
            } else {
              // Other errors - use metadata as fallback
              setUser({
                id: authUser.id,
                email: authUser.email || "",
                name: authUser.user_metadata?.name,
                role: authUser.user_metadata?.role || "MEMBER",
              })
              setHasFetched(true)
            }
          } catch (fetchError) {
            if (!isMounted) return
            console.error("Error fetching user from API:", fetchError)
            // Fallback to metadata
            setUser({
              id: authUser.id,
              email: authUser.email || "",
              name: authUser.user_metadata?.name,
              role: authUser.user_metadata?.role || "MEMBER",
            })
            setHasFetched(true)
          }
        } else {
          setUser(null)
          setHasFetched(true)
        }
      } catch (error) {
        if (!isMounted) return
        console.error("Error fetching user:", error)
        setUser(null)
        setHasFetched(true)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    getUser()

    // Listen for auth changes (only significant events)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only refresh on sign in/out events, not on token refresh
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        setHasFetched(false)
        if (session?.user) {
          getUser()
        } else {
          setUser(null)
          setHasFetched(true)
        }
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase]) // Only depend on supabase client

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return { user, loading, signOut }
}



