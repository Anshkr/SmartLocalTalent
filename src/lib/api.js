import axios from 'axios'
import useAuthStore from '../store/authStore'

console.log("ENV:", import.meta.env)
console.log("API URL:", import.meta.env.VITE_API_URL)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

API.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────
export const registerAPI = (data)  => API.post('/auth/register', data)
export const loginAPI    = (data)  => API.post('/auth/login', data)
export const getMeAPI    = ()      => API.get('/auth/me')

// ── Workers ───────────────────────────────
export const getWorkersAPI   = (params)   => API.get('/workers', { params })
export const getWorkerAPI    = (id)       => API.get(`/workers/${id}`)
export const updateWorkerAPI = (data)     => API.patch('/workers/me', data)
export const toggleOnlineAPI = (isOnline) => API.patch('/workers/me/online', { isOnline })

// ── Job Requests ──────────────────────────
export const sendRequestAPI   = (data)        => API.post('/requests', data)
export const getMyRequestsAPI = ()            => API.get('/requests/my')
export const updateStatusAPI  = (id, status)  => API.patch(`/requests/${id}/status`, { status })

// ── Messages ──────────────────────────────
export const getMessagesAPI = (jobId) => API.get(`/messages/${jobId}`)
export const sendMessageAPI = (data)  => API.post('/messages', data)

// ── Reviews ───────────────────────────────
export const submitReviewAPI = (data) => API.post('/reviews', data)

// ── Withdrawals ───────────────────────────
export const getWithdrawalsAPI    = ()     => API.get('/withdrawals/my')
export const requestWithdrawalAPI = (data) => API.post('/withdrawals', data)
export const updateWithdrawalAPI  = (id, status) => API.patch(`/withdrawals/${id}`, { status })

// ── Admin ─────────────────────────────────
export const getAdminStatsAPI         = ()              => API.get('/admin/stats')
export const getAdminWorkersAPI       = ()              => API.get('/admin/workers')
export const updateWorkerStatusAPI    = (id, status)    => API.patch(`/admin/workers/${id}/status`, { status })
export const getAdminCustomersAPI     = ()              => API.get('/admin/customers')
export const getAdminJobsAPI          = ()              => API.get('/admin/jobs')
export const getAdminDisputesAPI      = ()              => API.get('/admin/disputes')
export const resolveDisputeAPI        = (id, resolution) => API.patch(`/admin/disputes/${id}/resolve`, { resolution })
export const getAdminWithdrawalsAPI   = ()              => API.get('/admin/withdrawals')

export default API