import axios from 'axios'
import React, { useState } from 'react'
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Stack,
	TextField,
	Typography,
} from '@mui/material'
import { loginUser, registerUser } from './api'

const Auth = ({
	onLoginSuccess,
}: {
	onLoginSuccess: (token: string) => void
}) => {
	const [isLogin, setIsLogin] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [formData, setFormData] = useState({
		username: '',
		password: '',
		re_password: '',
		email: '',
	})

	// Переключалка режима
	const toggleMode = () => {
		setIsLogin(!isLogin)
		setError(null)
		setSuccess(null)
		setFormData({ username: '', password: '', re_password: '', email: '' }) // Чистим поля
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setSuccess(null)
		setIsSubmitting(true)
		try {
			if (isLogin) {
				const res = await loginUser({
					username: formData.username,
					password: formData.password,
				})
				// SimpleJWT возвращает объект { access: "...", refresh: "..." }
				const token = res.data.access
				localStorage.setItem('token', token)
				onLoginSuccess(token)
			} else {
				// При регистрации отправляем всё (username, email, password, re_password)
				await registerUser(formData)
				setSuccess('Регистрация успешна. Теперь войдите под своим логином.')
				setIsLogin(true)
			}
		} catch (err: unknown) {
			// Используем unknown вместо any
			console.error('Auth error:', err)

			let errorMsg = 'Ошибка доступа. Проверьте данные.'

			// Проверяем, является ли ошибка ошибкой от Axios
			if (axios.isAxiosError(err) && err.response?.data) {
				const data = err.response.data
				// Собираем ошибки из объекта (например, ошибки валидации от Django)
				errorMsg = Object.values(data).flat().join(' ')
			}

			setError(errorMsg)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Box
			sx={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				px: 2,
				bgcolor: 'background.default',
			}}
		>
			<Card sx={{ width: '100%', maxWidth: 460 }}>
				<CardContent sx={{ p: 4 }}>
					<Typography variant='h5' sx={{ mb: 3, textAlign: 'center' }}>
				{isLogin ? '🔑 Вход в систему' : '📝 Регистрация'}
					</Typography>

					<Stack component='form' onSubmit={handleSubmit} spacing={2}>
						{error && <Alert severity='error'>{error}</Alert>}
						{success && <Alert severity='success'>{success}</Alert>}

						<TextField
							label='Логин'
							value={formData.username}
							onChange={e =>
								setFormData({ ...formData, username: e.target.value })
							}
							required
							fullWidth
						/>

						{!isLogin && (
							<TextField
								type='email'
								label='Email'
								value={formData.email}
								onChange={e =>
									setFormData({ ...formData, email: e.target.value })
								}
								required
								fullWidth
							/>
						)}

						<TextField
							type='password'
							label='Пароль'
							value={formData.password}
							onChange={e =>
								setFormData({ ...formData, password: e.target.value })
							}
							required
							fullWidth
						/>

						{!isLogin && (
							<TextField
								type='password'
								label='Повторите пароль'
								value={formData.re_password}
								onChange={e =>
									setFormData({ ...formData, re_password: e.target.value })
								}
								required
								fullWidth
							/>
						)}

						<Button type='submit' variant='contained' disabled={isSubmitting}>
					{isLogin ? 'Войти' : 'Создать аккаунт'}
						</Button>

						<Button variant='text' onClick={toggleMode}>
				{isLogin
					? 'Нет аккаунта? Зарегистрироваться'
					: 'Уже есть аккаунт? Войти'}
						</Button>
					</Stack>
				</CardContent>
			</Card>
		</Box>
	)
}

export default Auth
