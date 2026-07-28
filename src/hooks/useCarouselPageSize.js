import { useEffect, useState } from 'react'

const DESKTOP_QUERY = '(min-width: 768px)'
const DESKTOP_PAGE_SIZE = 6
const MOBILE_PAGE_SIZE = 3

function getPageSize() {
  if (typeof window === 'undefined') return DESKTOP_PAGE_SIZE
  return window.matchMedia(DESKTOP_QUERY).matches ? DESKTOP_PAGE_SIZE : MOBILE_PAGE_SIZE
}

export default function useCarouselPageSize() {
  const [pageSize, setPageSize] = useState(getPageSize)

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY)
    const onChange = () => setPageSize(getPageSize())
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return pageSize
}
