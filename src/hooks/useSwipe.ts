import { useState, useRef, useCallback } from 'react'

interface UseSwipeOptions {
  threshold?: number
  edgeOnly?: boolean
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onClick?: () => void
}

export function useSwipe(options: UseSwipeOptions) {
  const { threshold = 80, edgeOnly = false, onSwipeLeft, onSwipeRight, onClick } = options
  const [translateX, setTranslateX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const swipingRef = useRef(false)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (edgeOnly && e.touches[0]!.clientX > 20) return
    startX.current = e.touches[0]!.clientX
    startY.current = e.touches[0]!.clientY
    swipingRef.current = false
  }, [edgeOnly])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0]!.clientX - startX.current
    const dy = e.touches[0]!.clientY - startY.current
    if (!swipingRef.current && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      swipingRef.current = true
      setIsSwiping(true)
    }
    if (swipingRef.current) {
      setTranslateX(dx)
    }
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!swipingRef.current) {
      onClick?.()
      setTranslateX(0)
      return
    }
    const dx = translateX
    if (dx > threshold) {
      onSwipeRight?.()
    } else if (dx < -threshold) {
      onSwipeLeft?.()
    }
    setTranslateX(0)
    setIsSwiping(false)
    swipingRef.current = false
  }, [threshold, translateX, onSwipeLeft, onSwipeRight, onClick])

  return {
    translateX,
    isSwiping,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
    reset: () => setTranslateX(0),
  }
}
