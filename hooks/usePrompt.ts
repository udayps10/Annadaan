'use client'

import { useState, useCallback } from 'react'

interface PromptState {
  isOpen: boolean
  title: string
  message: string
  placeholder?: string
  defaultValue?: string
  type?: 'text' | 'datetime-local'
  resolve?: (value: string | null) => void
}

export function usePrompt() {
  const [promptState, setPromptState] = useState<PromptState>({
    isOpen: false,
    title: '',
    message: '',
    placeholder: '',
    defaultValue: '',
    type: 'text'
  })

  const showPrompt = useCallback((
    title: string,
    message: string,
    options?: {
      placeholder?: string
      defaultValue?: string
      type?: 'text' | 'datetime-local'
    }
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      setPromptState({
        isOpen: true,
        title,
        message,
        placeholder: options?.placeholder || '',
        defaultValue: options?.defaultValue || '',
        type: options?.type || 'text',
        resolve
      })
    })
  }, [])

  const handleConfirm = useCallback((value: string) => {
    if (promptState.resolve) {
      promptState.resolve(value)
    }
    setPromptState(prev => ({ ...prev, isOpen: false, resolve: undefined }))
  }, [promptState.resolve])

  const handleCancel = useCallback(() => {
    if (promptState.resolve) {
      promptState.resolve(null)
    }
    setPromptState(prev => ({ ...prev, isOpen: false, resolve: undefined }))
  }, [promptState.resolve])

  return {
    promptState,
    showPrompt,
    handleConfirm,
    handleCancel
  }
}
