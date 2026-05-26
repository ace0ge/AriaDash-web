import { useState, useRef, useCallback } from 'react'

interface UseSwipeOptions {
  threshold?: number
  edgeOnly?: boolean
  onClick?: () => void
}

export function useSwipe(options: UseSwipeOptions) {
  const { threshold = 80, edgeOnly = false, onClick } = options
  const [translateX, setTranslateX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [revealed, setRevealed] = useState<'none' | 'left' | 'right'>('none')
  const startX = useRef(0)
  const startY = useRef(0)
  const lastX = useRef(0)
  const lastY = useRef(0)
  const swipingRef = useRef(false)

  const closeReveal = useCallback(() => {
    setRevealed('none')
    setTranslateX(0)
  }, [])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (edgeOnly && e.touches[0]!.clientX > 20) return
    startX.current = e.touches[0]!.clientX
    startY.current = e.touches[0]!.clientY
    lastX.current = startX.current
    lastY.current = startY.current
    swipingRef.current = false
  }, [edgeOnly])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    lastX.current = e.touches[0]!.clientX
    lastY.current = e.touches[0]!.clientY
    const dx = lastX.current - startX.current
    const dy = lastY.current - startY.current
    if (!swipingRef.current && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      swipingRef.current = true
      setIsSwiping(true)
    }
    if (swipingRef.current) {
      const base = revealed === 'left' ? -threshold : revealed === 'right' ? threshold : 0
      let newX = base + dx
      if (revealed === 'left') newX = Math.min(0, Math.max(-threshold, newX))
      if (revealed === 'right') newX = Math.max(0, Math.min(threshold, newX))
      setTranslateX(newX)
    }
  }, [threshold, revealed])

  const onTouchEnd = useCallback(() => {
    const dx = lastX.current - startX.current
    const dy = lastY.current - startY.current
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    if (absDx < 10 && absDy < 10) {
      if (revealed !== 'none') {
        closeReveal()
      } else {
        onClick?.()
      }
      setIsSwiping(false)
      swipingRef.current = false
      return
    }

    if (!swipingRef.current) {
      setIsSwiping(false)
      return
    }

    if (revealed !== 'none') {
      closeReveal()
    } else if (absDx >= threshold) {
      if (dx < 0) {
        setRevealed('left')
        setTranslateX(-threshold)
      } else {
        setRevealed('right')
        setTranslateX(threshold)
      }
    } else {
      setTranslateX(0)
    }

    setIsSwiping(false)
    swipingRef.current = false
  }, [threshold, revealed, onClick, closeReveal])

  return {
    translateX,
    isSwiping,
    revealed,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
    closeReveal,
  }
}
