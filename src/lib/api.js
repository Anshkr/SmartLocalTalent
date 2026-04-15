import axios from 'axios'
import useAuthStore from '../store/authStore'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 60000,
})

API.interceptors.request.use(config => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

API.interceptors.response.use(
  res => res,
  err => {
    // Only redirect on 401 when NOT already on auth pages
    const isAuthPage = window.location.pathname === '/login' ||
                       window.location.pathname === '/register'
    if (err.response?.status === 401 && !isAuthPage) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────
export const registerAPI      = data   => API.post('/auth/register', data)
export const loginAPI         = data   => API.post('/auth/login', data)
export const getMeAPI         = ()     => API.get('/auth/me')
export const setupTotpAPI     = ()     => API.post('/auth/setup-totp')
export const verifyTotpAPI    = code   => API.post('/auth/verify-totp', { totpCode: code })
export const forgotPasswordAPI = data  => API.post('/auth/forgot-password', data)
export const resetPasswordAPI  = data  => API.post('/auth/reset-password', data)
export const changePasswordAPI = data  => API.post('/auth/change-password', data)

// ── Workers ───────────────────────────────────
export const getWorkersAPI   = params  => API.get('/workers', { params })
export const getWorkerAPI    = id      => API.get(`/workers/${id}`)
export const updateWorkerAPI = data    => API.patch('/workers/me', data)
export const toggleOnlineAPI = online  => API.patch('/workers/me/online', { isOnline: online })

// ── Job Requests ──────────────────────────────
export const sendRequestAPI    = data        => API.post('/requests', data)
export const getMyRequestsAPI  = ()          => API.get('/requests/my')
export const updateStatusAPI   = (id,status) => API.patch(`/requests/${id}/status`, { status })

// ── Messages ──────────────────────────────────
export const getMessagesAPI  = jobId => API.get(`/messages/${jobId}`)
export const sendMessageAPI  = data  => API.post('/messages', data)

// ── Reviews ───────────────────────────────────
export const submitReviewAPI    = data     => API.post('/reviews', data)
export const getWorkerReviewsAPI = workerId => API.get(`/reviews/worker/${workerId}`)

// ── Transactions ──────────────────────────────
export const payJobAPI          = data    => API.post('/transactions/pay', data)
export const getMyTransactionsAPI = ()    => API.get('/transactions/my')
export const getJobTransactionsAPI = jobId => API.get(`/transactions/job/${jobId}`)

// ── Withdrawals ───────────────────────────────
export const getWithdrawalsAPI    = ()         => API.get('/withdrawals/my')
export const requestWithdrawalAPI = data       => API.post('/withdrawals', data)
export const getAdminWithdrawalsAPI = ()       => API.get('/admin/withdrawals')
export const updateWithdrawalAPI  = (id,status)=> API.patch(`/withdrawals/${id}`, { status })

// ── Admin ─────────────────────────────────────
export const getAdminStatsAPI       = ()              => API.get('/admin/stats')
export const getAdminWorkersAPI     = ()              => API.get('/admin/workers')
export const updateWorkerStatusAPI  = (id,status)     => API.patch(`/admin/workers/${id}/status`, { status })
export const getAdminCustomersAPI   = ()              => API.get('/admin/customers')
export const getAdminJobsAPI        = ()              => API.get('/admin/jobs')
export const getAdminDisputesAPI    = ()              => API.get('/admin/disputes')
export const resolveDisputeAPI      = (id,resolution) => API.patch(`/admin/disputes/${id}/resolve`, { resolution })
export const getAdminAccountsAPI    = ()              => API.get('/admin/accounts')
export const createAdminAccountAPI  = data            => API.post('/admin/accounts', data)
export const deleteAdminAccountAPI  = id              => API.delete(`/admin/accounts/${id}`)

export default API