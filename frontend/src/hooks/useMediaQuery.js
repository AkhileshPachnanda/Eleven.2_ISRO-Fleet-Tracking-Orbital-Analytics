import { useState, useEffect } from 'react'

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = () => setMatches(media.matches)
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    }

    media.addListener(listener)
    return () => media.removeListener(listener)
  }, [query])

  return matches
}
