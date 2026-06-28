import axios from 'axios'

const apiClient = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('caremate_access_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true
            const refreshToken = localStorage.getItem('caremate_refresh_token')
            if (refreshToken) {
                try {
                    const { data } = await axios.post('/api/auth/refresh', { refreshToken })
                    const newAccess = data.data.accessToken
                    localStorage.setItem('caremate_access_token', newAccess)
                    original.headers.Authorization = `Bearer ${newAccess}`
                    return apiClient(original)
                } catch {
                    localStorage.removeItem('caremate_access_token')
                    localStorage.removeItem('caremate_refresh_token')
                    window.location.href = '/auth'
                }
            } else {
                window.location.href = '/auth'
            }
        }
        return Promise.reject(error)
    },
)

export default apiClient
