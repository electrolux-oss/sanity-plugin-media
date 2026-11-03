import { useToast } from '@sanity/ui/toast'
import { useEffect, useEffectEvent } from 'react'

import useTypedSelector from '../../hooks/useTypedSelector'

const Notifications = () => {
  const items = useTypedSelector(state => state.notifications.items)
  const toast = useToast()

  const pushLastItem = useEffectEvent(() => {
    const lastItem = items.at(-1)

    if (lastItem) {
      toast.push({
        closable: true,
        status: lastItem.status,
        title: lastItem.title
      })
    }
  })

  useEffect(() => {
    pushLastItem()
  }, [items.length])

  return null
}

export default Notifications
