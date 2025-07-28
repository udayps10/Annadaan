'use client'

import { useState, useCallback } from 'react'

interface AlertState {
  isOpen: boolean
  title?: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
}

export function useAlert() {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    message: '',
    type: 'info'
  })

  const showAlert = useCallback((
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info', 
    title?: string
  ) => {
    setAlertState({
      isOpen: true,
      message,
      type,
      title
    })
  }, [])

  const showSuccess = useCallback((message: string, title?: string) => {
    showAlert(message, 'success', title)
  }, [showAlert])

  const showError = useCallback((message: string, title?: string) => {
    showAlert(message, 'error', title)
  }, [showAlert])

  const showWarning = useCallback((message: string, title?: string) => {
    showAlert(message, 'warning', title)
  }, [showAlert])

  const showInfo = useCallback((message: string, title?: string) => {
    showAlert(message, 'info', title)
  }, [showAlert])

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }))
  }, [])

  return {
    alertState,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideAlert
  }
}
