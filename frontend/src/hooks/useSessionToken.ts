import { useEffect, useState } from 'react'

export const useSessionToken = (): string => {
  const [token, setToken] = useState('')

  useEffect(() => {
    let clientToken = localStorage.getItem('clientToken')
    if (!clientToken) {
      clientToken = crypto.randomUUID()
      localStorage.setItem('clientToken', clientToken)
    }
    setToken(clientToken)
  }, [])

  return token
}