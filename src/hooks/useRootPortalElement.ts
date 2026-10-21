import { useEffect, useState } from 'react'

const useRootPortalElement = () => {
  const [container] = useState(() => document.createElement('div'))

  useEffect(() => {
    container.classList.add('media-portal')
    document.body.appendChild(container)
    return () => {
      document.body.removeChild(container)
    }
  }, [container])

  return container
}

export default useRootPortalElement
