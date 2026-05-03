import axios from 'axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	Alert,
	AppBar,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	Grid,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	Tab,
	Tabs,
	TextField,
	Toolbar,
	Typography,
} from '@mui/material'
import {
	approveEvaluation,
	createEvaluation,
	deleteEvaluation,
	getDepartments,
	getEmployees,
	getEvaluations,
	getMe,
	rejectEvaluation,
	submitEvaluation,
	updateEvaluation,
	type CreateEvaluationPayload,
	type Department,
	type Employee,
	type Evaluation,
	type EvaluationStatus,
	type User,
} from './api'
import Auth from './Auth'

const statusLabels: Record<EvaluationStatus, string> = {
	draft: 'Черновик',
	submitted: 'На согласовании',
	approved: 'Утверждена',
	rejected: 'Отклонена',
}

const statusColors: Record<
	EvaluationStatus,
	'default' | 'warning' | 'info' | 'success' | 'error'
> = {
	draft: 'default',
	submitted: 'info',
	approved: 'success',
	rejected: 'error',
}

function App() {
	const [employees, setEmployees] = useState<Employee[]>([])
	const [departments, setDepartments] = useState<Department[]>([])
	const [evaluations, setEvaluations] = useState<Evaluation[]>([])
	const [users, setUsers] = useState<User[]>([])
	const [currentUser, setCurrentUser] = useState<User | null>(null)
	const [statusFilter, setStatusFilter] = useState<'all' | EvaluationStatus>('all')
	const [departmentFilter, setDepartmentFilter] = useState<'all' | number>('all')
	const [token, setToken] = useState<string | null>(
		localStorage.getItem('token'),
	)
	const [loading, setLoading] = useState(!!token)
	const [activeTab, setActiveTab] = useState<'employees' | 'mine' | 'manage'>(
		'employees',
	)
	const [dialogOpen, setDialogOpen] = useState(false)
	const [editingEvaluationId, setEditingEvaluationId] = useState<number | null>(null)
	const [actionError, setActionError] = useState<string | null>(null)
	const [actionSuccess, setActionSuccess] = useState<string | null>(null)
	const [formState, setFormState] = useState<CreateEvaluationPayload>({
		employee: 0,
		reviewer: 0,
		title: '',
		notes: '',
	})

	const handleLogout = useCallback(() => {
		localStorage.removeItem('token')
		setToken(null)
		setEmployees([])
		setDepartments([])
		setEvaluations([])
		setCurrentUser(null)
		setUsers([])
		setActiveTab('employees')
		setActionError(null)
		setActionSuccess(null)
	}, [])

	const handleAuthError = useCallback(
		(err: unknown) => {
			if (axios.isAxiosError(err) && err.response?.status === 401) {
				handleLogout()
			}
		},
		[handleLogout],
	)

	const fetchLookupUsers = useCallback(async () => {
		try {
			const response = await axios.get<User[]>('http://127.0.0.1:8000/api/auth/users/', {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			})
			setUsers(response.data)
		} catch (err: unknown) {
			handleAuthError(err)
		}
	}, [handleAuthError])

	const refreshData = useCallback(async () => {
		setLoading(true)
		setActionError(null)
		try {
			const [employeeRes, departmentRes, evaluationRes, meRes] = await Promise.all([
				getEmployees(),
				getDepartments(),
				getEvaluations(),
				getMe(),
			])
			setEmployees(employeeRes.data)
			setDepartments(departmentRes.data)
			setEvaluations(evaluationRes.data)
			setCurrentUser(meRes.data)
			await fetchLookupUsers()
		} catch (err: unknown) {
			handleAuthError(err)
			setActionError('Не удалось загрузить данные. Проверьте подключение к API.')
		} finally {
			setLoading(false)
		}
	}, [fetchLookupUsers, handleAuthError])

	useEffect(() => {
		if (!token) {
			return
		}
		const timer = window.setTimeout(() => {
			void refreshData()
		}, 0)
		return () => window.clearTimeout(timer)
	}, [refreshData, token])

	const isHR = currentUser?.is_hr ?? false
	const isReviewer = currentUser?.is_reviewer ?? false
	const isManager = currentUser?.is_manager ?? false

	const myEvaluations = useMemo(() => {
		if (!currentUser) {
			return []
		}
		return evaluations.filter(
			item =>
				item.reviewer === currentUser.id ||
				item.assigned_by === currentUser.id ||
				item.manager === currentUser.id,
		)
	}, [currentUser, evaluations])

	const filteredEvaluations = useMemo(() => {
		return evaluations.filter(item => {
			const statusMatches = statusFilter === 'all' || item.status === statusFilter
			const employee = employees.find(candidate => candidate.id === item.employee)
			const departmentMatches =
				departmentFilter === 'all' || employee?.department === departmentFilter
			return statusMatches && departmentMatches
		})
	}, [departmentFilter, employees, evaluations, statusFilter])

	const openCreateDialog = () => {
		setEditingEvaluationId(null)
		setFormState({ employee: 0, reviewer: 0, title: '', notes: '' })
		setDialogOpen(true)
	}

	const openEditDialog = (evaluation: Evaluation) => {
		setEditingEvaluationId(evaluation.id)
		setFormState({
			employee: evaluation.employee,
			reviewer: evaluation.reviewer,
			title: evaluation.title,
			notes: evaluation.notes ?? '',
		})
		setDialogOpen(true)
	}

	const closeDialog = () => {
		setDialogOpen(false)
		setActionError(null)
	}

	const handleSaveEvaluation = async () => {
		if (!formState.employee || !formState.reviewer || !formState.title.trim()) {
			setActionError('Заполните сотрудника, reviewer и заголовок оценки.')
			return
		}

		try {
			if (editingEvaluationId) {
				await updateEvaluation(editingEvaluationId, formState)
				setActionSuccess('Оценка обновлена.')
			} else {
				await createEvaluation(formState)
				setActionSuccess('Оценка назначена.')
			}
			closeDialog()
			await refreshData()
		} catch (err: unknown) {
			if (axios.isAxiosError(err)) {
				setActionError(err.response?.data?.error || 'Не удалось сохранить оценку.')
			}
		}
	}

	const handleWorkflowAction = async (
		actionType: 'submit' | 'approve' | 'reject',
		evaluationId: number,
	) => {
		try {
			if (actionType === 'submit') {
				await submitEvaluation(evaluationId)
			}
			if (actionType === 'approve') {
				await approveEvaluation(evaluationId)
			}
			if (actionType === 'reject') {
				await rejectEvaluation(evaluationId)
			}
			setActionSuccess('Статус оценки обновлен.')
			await refreshData()
		} catch (err: unknown) {
			if (axios.isAxiosError(err)) {
				setActionError(err.response?.data?.error || 'Операция отклонена сервером.')
			}
		}
	}

	const handleDeleteEvaluation = async (evaluationId: number) => {
		try {
			await deleteEvaluation(evaluationId)
			setActionSuccess('Оценка удалена.')
			await refreshData()
		} catch (err: unknown) {
			if (axios.isAxiosError(err)) {
				setActionError(err.response?.data?.error || 'Не удалось удалить оценку.')
			}
		}
	}

	if (!token) return <Auth onLoginSuccess={t => setToken(t)} />

	return (
		<Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
			<AppBar position='static'>
				<Toolbar sx={{ gap: 2 }}>
					<Typography variant='h6' sx={{ flexGrow: 1 }}>
						Employee Performance Review
					</Typography>
					{currentUser && (
						<Stack direction='row' spacing={1}>
							{currentUser.is_hr && <Chip size='small' label='HR' color='primary' />}
							{currentUser.is_reviewer && (
								<Chip size='small' label='Reviewer' color='secondary' />
							)}
							{currentUser.is_manager && (
								<Chip size='small' label='Manager' color='success' />
							)}
						</Stack>
					)}
					<Button color='inherit' onClick={handleLogout}>
						Выйти
					</Button>
				</Toolbar>
			</AppBar>

			<Container sx={{ py: 4 }}>
				{actionError && <Alert severity='error'>{actionError}</Alert>}
				{actionSuccess && (
					<Alert severity='success' sx={{ mt: actionError ? 2 : 0 }}>
						{actionSuccess}
					</Alert>
				)}

				<Tabs
					value={activeTab}
					onChange={(_, value) => setActiveTab(value)}
					sx={{ mb: 3, mt: 2 }}
				>
					<Tab value='employees' label='Сотрудники' />
					<Tab value='mine' label='Мои оценки' />
					{isHR && <Tab value='manage' label='Управление оценками' />}
				</Tabs>

				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
						<CircularProgress />
					</Box>
				) : (
					<>
						{activeTab === 'employees' && (
							<Grid container spacing={2}>
								{employees.map(employee => (
									<Grid key={employee.id} size={{ xs: 12, md: 6, lg: 4 }}>
										<Card>
											<CardContent>
												<Typography variant='h6'>
													{employee.last_name} {employee.first_name}
												</Typography>
												<Typography color='text.secondary'>
													{employee.position}
												</Typography>
												<Typography variant='body2' sx={{ mt: 1 }}>
													Департамент: {employee.department_name}
												</Typography>
												<Typography variant='body2'>{employee.email}</Typography>
												<Chip
													size='small'
													sx={{ mt: 1 }}
													label={employee.is_active ? 'Активен' : 'Неактивен'}
													color={employee.is_active ? 'success' : 'default'}
												/>
											</CardContent>
										</Card>
									</Grid>
								))}
							</Grid>
						)}

						{activeTab === 'mine' && (
							<Grid container spacing={2}>
								{myEvaluations.length === 0 && (
									<Typography color='text.secondary'>
										Нет оценок, связанных с вашим аккаунтом.
									</Typography>
								)}
								{myEvaluations.map(item => (
									<Grid key={item.id} size={{ xs: 12, md: 6 }}>
										<Card>
											<CardContent>
												<Stack direction='row' justifyContent='space-between'>
													<Typography variant='h6'>{item.title}</Typography>
													<Chip
														label={statusLabels[item.status]}
														color={statusColors[item.status]}
														size='small'
													/>
												</Stack>
												<Typography sx={{ mt: 1 }}>
													Сотрудник: {item.employee_name}
												</Typography>
												<Typography variant='body2' color='text.secondary'>
													Reviewer: {item.reviewer_username} | HR:{' '}
													{item.assigned_by_username}
												</Typography>
												<Typography variant='body2' sx={{ mt: 1 }}>
													{item.notes || 'Комментарий не добавлен'}
												</Typography>

												<Stack direction='row' spacing={1} sx={{ mt: 2 }}>
													{isReviewer && item.status === 'draft' && (
														<Button
															size='small'
															variant='contained'
															onClick={() =>
																handleWorkflowAction('submit', item.id)
															}
														>
															Отправить
														</Button>
													)}
													{isManager && item.status === 'submitted' && (
														<>
															<Button
																size='small'
																variant='contained'
																color='success'
																onClick={() =>
																	handleWorkflowAction('approve', item.id)
																}
															>
																Утвердить
															</Button>
															<Button
																size='small'
																variant='outlined'
																color='error'
																onClick={() =>
																	handleWorkflowAction('reject', item.id)
																}
															>
																Отклонить
															</Button>
														</>
													)}
												</Stack>
											</CardContent>
										</Card>
									</Grid>
								))}
							</Grid>
						)}

						{activeTab === 'manage' && isHR && (
							<>
								<Stack
									direction={{ xs: 'column', md: 'row' }}
									spacing={2}
									sx={{ mb: 2 }}
								>
									<FormControl sx={{ minWidth: 220 }}>
										<InputLabel>Статус</InputLabel>
										<Select
											label='Статус'
											value={statusFilter}
											onChange={event =>
												setStatusFilter(
													event.target.value as 'all' | EvaluationStatus,
												)
											}
										>
											<MenuItem value='all'>Все</MenuItem>
											<MenuItem value='draft'>Черновик</MenuItem>
											<MenuItem value='submitted'>На согласовании</MenuItem>
											<MenuItem value='approved'>Утверждена</MenuItem>
											<MenuItem value='rejected'>Отклонена</MenuItem>
										</Select>
									</FormControl>

									<FormControl sx={{ minWidth: 220 }}>
										<InputLabel>Департамент</InputLabel>
										<Select
											label='Департамент'
											value={departmentFilter}
											onChange={event => {
												const value = event.target.value
												setDepartmentFilter(value === 'all' ? 'all' : Number(value))
											}}
										>
											<MenuItem value='all'>Все</MenuItem>
											{departments.map(department => (
												<MenuItem key={department.id} value={department.id}>
													{department.name}
												</MenuItem>
											))}
										</Select>
									</FormControl>

									<Button variant='contained' onClick={openCreateDialog}>
										Назначить оценку
									</Button>
								</Stack>

								<Grid container spacing={2}>
									{filteredEvaluations.map(item => (
										<Grid key={item.id} size={{ xs: 12, md: 6 }}>
											<Card>
												<CardContent>
													<Stack direction='row' justifyContent='space-between'>
														<Typography variant='h6'>{item.title}</Typography>
														<Chip
															label={statusLabels[item.status]}
															color={statusColors[item.status]}
															size='small'
														/>
													</Stack>
													<Typography sx={{ mt: 1 }}>
														Сотрудник: {item.employee_name}
													</Typography>
													<Typography variant='body2' color='text.secondary'>
														Reviewer: {item.reviewer_username}
													</Typography>
													<Typography variant='body2' sx={{ mt: 1 }}>
														{item.notes || 'Комментарий не добавлен'}
													</Typography>
													<Stack direction='row' spacing={1} sx={{ mt: 2 }}>
														<Button
															size='small'
															variant='outlined'
															onClick={() => openEditDialog(item)}
															disabled={item.status !== 'draft'}
														>
															Изменить
														</Button>
														<Button
															size='small'
															variant='outlined'
															color='error'
															onClick={() => handleDeleteEvaluation(item.id)}
															disabled={item.status !== 'draft'}
														>
															Удалить
														</Button>
													</Stack>
												</CardContent>
											</Card>
										</Grid>
									))}
								</Grid>
							</>
						)}
					</>
				)}
			</Container>

			<Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth='sm'>
				<DialogTitle>
					{editingEvaluationId ? 'Редактировать оценку' : 'Назначить оценку'}
				</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ mt: 1 }}>
						<FormControl fullWidth>
							<InputLabel>Сотрудник</InputLabel>
							<Select
								label='Сотрудник'
								value={formState.employee}
								onChange={event =>
									setFormState(prev => ({
										...prev,
										employee: Number(event.target.value),
									}))
								}
							>
								{employees.map(employee => (
									<MenuItem key={employee.id} value={employee.id}>
										{employee.last_name} {employee.first_name} - {employee.department_name}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControl fullWidth>
							<InputLabel>Reviewer</InputLabel>
							<Select
								label='Reviewer'
								value={formState.reviewer}
								onChange={event =>
									setFormState(prev => ({
										...prev,
										reviewer: Number(event.target.value),
									}))
								}
							>
								{users
									.filter(user => user.is_reviewer)
									.map(user => (
										<MenuItem key={user.id} value={user.id}>
											{user.username}
										</MenuItem>
									))}
							</Select>
						</FormControl>

						<TextField
							label='Заголовок оценки'
							value={formState.title}
							onChange={event =>
								setFormState(prev => ({ ...prev, title: event.target.value }))
							}
							fullWidth
						/>

						<TextField
							label='Комментарий'
							value={formState.notes ?? ''}
							onChange={event =>
								setFormState(prev => ({ ...prev, notes: event.target.value }))
							}
							fullWidth
							minRows={3}
							multiline
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={closeDialog}>Отмена</Button>
					<Button onClick={handleSaveEvaluation} variant='contained'>
						Сохранить
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	)
}

export default App
