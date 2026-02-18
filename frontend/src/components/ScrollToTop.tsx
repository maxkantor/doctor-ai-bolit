import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { scrollToTop } from '../utils/scrollToTop'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    scrollToTop()
  }, [pathname])

  useEffect(() => {
    scrollToTop()
    const times = [0, 50, 100, 200]
    const ids = times.map((ms) => setTimeout(scrollToTop, ms))
    return () => ids.forEach(clearTimeout)
  }, [pathname])

  return null
}
