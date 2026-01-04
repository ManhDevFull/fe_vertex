import { removeAuth, updateAuth } from '@/redux/reducers/authReducer'
import store from '@/redux/store'
import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import queryString from 'query-string'
import { restApiBase } from '@/utils/env'

const baseURL = restApiBase
const normalizedBaseUrl = baseURL.replace(/\/\/+$/, '')

type StoredAuth = {
  token?: string
}

const getStoredAuth = (): StoredAuth | null => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem('token')
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

const getAccessToken = () => getStoredAuth()?.token ?? ''

const decodeBase64 = (value: string): string => {
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    return window.atob(value)
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value, 'base64').toString('binary')
  }
  return ''
}

const decodeTokenExpiry = (token: string): number | null => {
  const [, payload] = token.split('.')
  if (!payload) return null
  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = decodeBase64(normalized)
    const json = decodeURIComponent(
      decoded
        .split('')
        .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    )
    const parsed = JSON.parse(json)
    if (typeof parsed.exp === 'number') {
      return parsed.exp
    }
  } catch {
    return null
  }
  return null
}

const shouldRefreshToken = (token: string | null, thresholdSeconds = 60) => {
  if (!token) return false
  const exp = decodeTokenExpiry(token)
  if (!exp) return false
  const now = Date.now() / 1000
  return exp - now <= thresholdSeconds
}

let refreshPromise: Promise<string | null> | null = null

const requestRefresh = async (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${normalizedBaseUrl}/Auth/refresh-token`,
        {},
        { withCredentials: true }
      )
      .then((response) => {
        const payload = response.data?.data ?? response.data ?? {}
        const newToken = payload.accessToken ?? payload.token ?? ''
        if (!newToken) {
          return null
        }
        store.dispatch(updateAuth({ token: newToken }))
        return newToken
      })
      .catch((error) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('token')
        }
        store.dispatch(removeAuth())
        throw error
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

const axiosClient = axios.create({
  baseURL,
  withCredentials: true,
  paramsSerializer: (params) => queryString.stringify(params),
})

axiosClient.interceptors.request.use(async (config: InternalAxiosRequestConfig & { _retry?: boolean }) => {
  if (typeof config.url === 'string' && !/^https?:\/\//i.test(config.url)) {
    config.url = config.url.replace(/^\/+/, '')
  }

  let accessToken = getAccessToken()
  if (shouldRefreshToken(accessToken)) {
    try {
      const refreshed = await requestRefresh()
      if (refreshed) {
        accessToken = refreshed
      }
    } catch {
      accessToken = ''
    }
  }

  const headers = AxiosHeaders.from(config.headers ?? {})
  headers.set('Accept', 'application/json')
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }
  config.headers = headers

  if (config.data === undefined) {
    config.data = null
  }

  return config
})

axiosClient.interceptors.response.use(
  (res) => {
    // Treat 2xx with empty body (e.g. 204 No Content) as success instead of throwing
    if (res.status >= 200 && res.status < 300) {
      return res.data ?? true
    }
    return Promise.reject(res.data)
  },
  async (error) => {
    const originalRequest = error?.config
    const status = error?.response?.status

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const newToken = await requestRefresh()
        if (newToken) {
          originalRequest.headers = {
            ...(originalRequest.headers ?? {}),
            Authorization: `Bearer ${newToken}`,
          }
          return axiosClient(originalRequest)
        }
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error?.response?.data || error)
  }
)

export default axiosClient
