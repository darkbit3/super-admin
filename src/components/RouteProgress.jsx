import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function RouteProgress() {
  const location = useLocation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 380)
    return () => clearTimeout(timer)
  }, [location.pathname])

  return visible ? <div className="route-progress" role="progressbar" aria-label="Loading page" /> : null
}
