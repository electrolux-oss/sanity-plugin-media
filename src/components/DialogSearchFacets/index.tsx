import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { Box } from '@sanity/ui'

import { dialogActions } from '../../modules/dialog'
import Dialog from '../Dialog'
import SearchFacets from '../SearchFacets'
import SearchFacetsControl from '../SearchFacetsControl'

import type { ReactNode } from 'react'
import type { DialogSearchFacetsProps } from '../../types'
type Props = {
  children: ReactNode
  dialog: DialogSearchFacetsProps
}

const DialogSearchFacets = (props: Props) => {
  const {
    children,
    dialog: { id }
  } = props

  // Redux
  const dispatch = useDispatch()

  // Callbacks
  const handleClose = useCallback(() => {
    dispatch(dialogActions.clear())
  }, [])

  return (
    <Dialog animate header="Filters" id={id} onClose={handleClose} width={1}>
      <Box padding={3}>
        <SearchFacets layout="stack" />
        <SearchFacetsControl />
      </Box>

      {children}
    </Dialog>
  )
}

export default DialogSearchFacets
