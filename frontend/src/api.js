const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function textFromValue(value) {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) return value.map(textFromValue).filter(Boolean).join(', ')
  if (value && typeof value === 'object') return Object.values(value).map(textFromValue).filter(Boolean).join(', ')
  return ''
}

function fieldLabel(field) {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^\w/, (letter) => letter.toUpperCase())
}

function errorMessage(payload, status) {
  if (typeof payload === 'string') {
    const message = payload.trim()
    return message.startsWith('<') ? `Request failed (${status})` : message || `Request failed (${status})`
  }

  const message = payload?.message
  if (message && typeof message === 'object') {
    const details = Object.entries(message)
      .map(([field, detail]) => {
        const readableDetail = textFromValue(detail)
        return readableDetail ? `${fieldLabel(field)}: ${readableDetail}` : ''
      })
      .filter(Boolean)
    if (details.length) return details.join(' · ')
  }

  const errors = payload?.errors || payload?.fieldErrors
  if (errors && typeof errors === 'object') {
    const details = Array.isArray(errors)
      ? errors.map(textFromValue).filter(Boolean)
      : Object.entries(errors).map(([field, detail]) => {
        const readableDetail = textFromValue(detail)
        return readableDetail ? `${fieldLabel(field)}: ${readableDetail}` : ''
      }).filter(Boolean)
    if (details.length) return details.join(' · ')
  }

  return textFromValue(message) || textFromValue(payload?.error) || textFromValue(payload?.Message) || `Request failed (${status})`
}

async function request(path, { token, method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(`Can't reach the backend. Check that it is running and that BACKEND_URL in frontend/.env points to it.`)
  }

  const raw = await response.text()
  let payload = raw
  if (raw) {
    try {
      payload = JSON.parse(raw)
    } catch {
      // Some endpoints return plain text instead of JSON.
    }
  }

  if (!response.ok) {
    throw new ApiError(errorMessage(payload, response.status), response.status)
  }

  return payload
}

export const api = {
  register: (email, password) => request('/amazonPay/auth/register', {
    method: 'POST',
    body: { email, password },
  }),

  login: (email, password) => request('/amazonPay/auth/login', {
    method: 'POST',
    body: { email, password },
  }),

  logout: (token) => request('/amazonPay/auth/logout', {
    token,
    method: 'POST',
  }),

  getCustomer: (token) => request('/amazonPay/Customer/getCustomer/current', { token }),

  registerCustomer: (token, customer) => request('/amazonPay/Customer/register', {
    token,
    method: 'POST',
    body: customer,
  }),

  getAccounts: (token) => request('/amazonPay/Customer/getAccountDetails/current', { token }),

  addAccount: (token, account) => request('/amazonPay/Customer/addAccount', {
    token,
    method: 'POST',
    body: account,
  }),

  changePassKey: (token, accountNumber, newPassKey) => request(
    `/amazonPay/Customer/changePassKey?accountNumber=${encodeURIComponent(accountNumber)}&newPassKey=${encodeURIComponent(newPassKey)}`,
    { token, method: 'PATCH' },
  ),

  getStatement: (token, pageNo, pageSize) => request(
    `/amazonPay/Customer/statement?pageNo=${encodeURIComponent(pageNo)}&pageSize=${encodeURIComponent(pageSize)}`,
    { token },
  ),

  transfer: (token, payment) => request('/amazonPay/transferPayment', {
    token,
    method: 'POST',
    body: payment,
  }),
}

export { API_BASE_URL }
