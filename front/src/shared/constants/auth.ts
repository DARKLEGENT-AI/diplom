const TOKEN_KEY = 'meduchet-token'

export const getAuthToken = () => window.localStorage.getItem(TOKEN_KEY)

export const setAuthToken = (token: string) => {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export const clearAuthToken = () => {
  window.localStorage.removeItem(TOKEN_KEY)
}
