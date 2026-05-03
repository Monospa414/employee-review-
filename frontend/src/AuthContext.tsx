/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useEffect, useState } from 'react'
import { getMe, type User } from './api'

export const AuthContext = createContext<{
	user: User | null
	login: (token: string) => void
	logout: () => void
	loading: boolean
} | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	const fetchUser = async () => {
		try {
			const res = await getMe()
			setUser(res.data)
		} catch {
			localStorage.removeItem('token')
			setUser(null)
		} finally {
			setLoading(false)
		}
	}

	const login = (token: string) => {
		localStorage.setItem('token', token)
		fetchUser()
	}

	const logout = () => {
		localStorage.removeItem('token')
		setUser(null)
	}

	useEffect(() => {
		if (localStorage.getItem('token')) {
			const timer = window.setTimeout(() => {
				void fetchUser()
			}, 0)
			return () => window.clearTimeout(timer)
		} else {
			const timer = window.setTimeout(() => {
				setLoading(false)
			}, 0)
			return () => window.clearTimeout(timer)
		}
	}, [])

	return (
		<AuthContext.Provider value={{ user, login, logout, loading }}>
			{children}
		</AuthContext.Provider>
	)
}
