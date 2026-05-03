import axios from 'axios'

const api = axios.create({
	baseURL: 'http://127.0.0.1:8000/api/',
})

// 🔑 токен
api.interceptors.request.use(config => {
	const token = localStorage.getItem('token')
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

export interface User {
	id: number
	username: string
	email: string
	is_hr: boolean
	is_reviewer: boolean
	is_manager: boolean
}

export interface Department {
	id: number
	name: string
	description: string
}

export interface Employee {
	id: number
	first_name: string
	last_name: string
	email: string
	position: string
	department: number
	department_name: string
	is_active: boolean
}

export type EvaluationStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

export interface Evaluation {
	id: number
	employee: number
	employee_name: string
	reviewer: number
	reviewer_username: string
	assigned_by: number
	assigned_by_username: string
	manager: number | null
	manager_username: string | null
	title: string
	notes: string
	status: EvaluationStatus
	created_at: string
	updated_at: string
}

export interface CreateEvaluationPayload {
	employee: number
	reviewer: number
	title: string
	notes?: string
}

export interface EvaluationActionPayload {
	notes?: string
}

// 📡 API
export const getDepartments = () => api.get<Department[]>('employees/departments/')
export const getEmployees = () => api.get<Employee[]>('employees/employees/')
export const getEvaluations = () => api.get<Evaluation[]>('evaluations/')
export const createEvaluation = (payload: CreateEvaluationPayload) =>
	api.post<Evaluation>('evaluations/', payload)
export const updateEvaluation = (id: number, payload: CreateEvaluationPayload) =>
	api.put<Evaluation>(`evaluations/${id}/`, payload)
export const submitEvaluation = (id: number, payload: EvaluationActionPayload = {}) =>
	api.post(`evaluations/${id}/submit/`, payload)
export const approveEvaluation = (id: number, payload: EvaluationActionPayload = {}) =>
	api.post(`evaluations/${id}/approve/`, payload)
export const rejectEvaluation = (id: number, payload: EvaluationActionPayload = {}) =>
	api.post(`evaluations/${id}/reject/`, payload)
export const deleteEvaluation = (id: number) => api.delete(`evaluations/${id}/`)

export const registerUser = (userData: Record<string, string>) =>
	api.post('auth/users/', userData)

export const loginUser = (credentials: Record<string, string>) =>
	api.post('auth/jwt/create/', credentials)

export const getMe = () => api.get<User>('auth/users/me/')

export default api
