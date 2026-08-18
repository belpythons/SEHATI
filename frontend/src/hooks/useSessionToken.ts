import { useEffect, useState } from 'react'

const TOKEN_KEY = 'clientToken'

/**
 * Get or initialize client token synchronously
 */
export const getClientToken = (): string => {
  let clientToken = localStorage.getItem(TOKEN_KEY)
  if (!clientToken) {
    clientToken = crypto.randomUUID()
    localStorage.setItem(TOKEN_KEY, clientToken)
  }
  return clientToken
}

/**
 * React hook to retrieve client token
 */
export const useSessionToken = (): string => {
  const [token, setToken] = useState<string>(getClientToken)

  useEffect(() => {
    setToken(getClientToken())
  }, [])

  return token
}