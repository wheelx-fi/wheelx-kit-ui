import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Text } from '../ui'

interface Props {
  stop: boolean
  onTick?: (seconds: number) => void
  valueStyle?: Record<string, unknown>
}

const Timer = ({ stop, onTick, valueStyle }: Props) => {
  const [seconds, setSeconds] = useState<number>(0)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const timer = useRef<NodeJS.Timeout | null>(null)

  const formatTime = (totalSeconds: number): string => {
    return `${totalSeconds} s`
  }

  const startTimer = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true)
      setSeconds(0)
    }
  }, [isRunning])

  useEffect(() => {
    startTimer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (onTick) {
      onTick(seconds)
    }
  }, [seconds, onTick])

  useEffect(() => {
    if (isRunning) {
      timer.current = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (timer.current) {
        clearInterval(timer.current)
      }
    }
  }, [isRunning])

  useEffect(() => {
    if (stop) {
      setIsRunning(false)
      if (timer.current) {
        clearInterval(timer.current)
        timer.current = null
      }
    }
  }, [stop])

  return (
    <Text
      variant={{
        base: 'content8',
        md: 'content7'
      }}
      color={'#15003E'}
      {...(valueStyle || {})}
    >
      {formatTime(seconds)}
    </Text>
  )
}

export default Timer
