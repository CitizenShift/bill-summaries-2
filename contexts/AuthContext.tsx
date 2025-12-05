"use client"
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { createClient } from "@/app/utils/supabase/client";

interface UserMetadata {
    gender?: string
    race?: string
    state?: string
    dateOfBirth?: string
    politicalLeaning?: string
}

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signUp: (email: string, password: string, metadata?: UserMetadata) => Promise<{
        user: User | null
        error: AuthError | null
    }>
    logIn: (email: string, password: string) => Promise<{
        user: User | null
        error: AuthError | null
    }>
    logOut: () => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [session, setSession] = useState<Session | null>(null)
    const supabase = createClient()

    useEffect(() => {
        // get the initial session
        const initializeAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    console.log(error)
                }

                setSession(session)
                setUser(session?.user ?? null)
            } catch (error: any) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }

        initializeAuth()

        // listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth event:', event)
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const signUp = async (email: string, password: string, metadata?: UserMetadata) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata || {}
                }
            });

            if (error) {
                return { user: null, error }
            }

            return { user: data?.user, error: null }
        } catch (error) {
            console.error("Signup error:", error)
            return { user: null, error: error as AuthError }
        }
    }

    const logIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                return { user: null, error }
            }

            return { user: data?.user, error: null }
        } catch (error) {
            console.error("Login error:", error)
            return { user: null, error: error as AuthError }
        }
    }

    const logOut = async () => {
        try {
            const { error } = await supabase.auth.signOut()

            if (error) {
                return { error }
            }

            return { error: null }
        } catch (error) {
            console.error("Log out error.", error)
            return { error: error as AuthError }
        }
    }

    const value = {
        user,
        session,
        loading,
        signUp,
        logIn,
        logOut,
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    return context
}