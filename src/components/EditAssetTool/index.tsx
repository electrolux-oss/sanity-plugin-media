import { PortalProvider } from '@sanity/ui'
import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { type AssetSourceComponentProps, type SanityDocument, useFormValue } from 'sanity'

import { AssetBrowserDispatchProvider } from '../../contexts/AssetSourceDispatchContext'
import useRootPortalElement from '../../hooks/useRootPortalElement'
import useTypedSelector from '../../hooks/useTypedSelector'
import useVersionedClient from '../../hooks/useVersionedClient'
import { assetsActions } from '../../modules/assets'
import { dialogActions } from '../../modules/dialog'
import { tagsActions } from '../../modules/tags'
import GlobalStyle from '../../styled/GlobalStyles'
import constructFilter from '../../utils/constructFilter'
import Dialogs from '../Dialogs'
import Notifications from '../Notifications'
import ReduxProvider from '../ReduxProvider'

/**
 * Loads the asset (and all tags, so its tag references resolve when saving) and opens its
 * edit dialog. Calls `onClose` once every dialog has been dismissed, so the asset source
 * unmounts and can be opened again.
 */
const EditAssetDialog = ({ assetId, onClose }: { assetId: string; onClose: () => void }) => {
  const dispatch = useDispatch()
  const openDialogCount = useTypedSelector(state => state.dialog.items.length)
  const hasOpenedRef = useRef(false)

  useEffect(() => {
    const queryFilter = `${constructFilter({
      assetTypes: ['file', 'image'],
      searchFacets: []
    })} && _id == $assetId`

    dispatch(assetsActions.fetchRequest({ params: { assetId }, queryFilter }))
    dispatch(tagsActions.fetchRequest())
    dispatch(dialogActions.showAssetEdit({ assetId }))
  }, [assetId, dispatch])

  useEffect(() => {
    if (openDialogCount > 0) {
      hasOpenedRef.current = true
    } else if (hasOpenedRef.current) {
      onClose()
    }
  }, [openDialogCount, onClose])

  return (
    <>
      <Dialogs />
      <Notifications />
    </>
  )
}

const EditAssetTool = (props: AssetSourceComponentProps) => {
  const { onClose, selectedAssets } = props

  const portalElement = useRootPortalElement()
  const currentDocument = useFormValue([]) as SanityDocument | null | undefined
  const client = useVersionedClient()

  const assetId = selectedAssets[0]?._id

  useEffect(() => {
    if (!assetId) {
      onClose()
    }
  }, [assetId, onClose])

  if (!assetId) {
    return null
  }

  return (
    <ReduxProvider
      assetType={props.assetType}
      client={client}
      document={currentDocument ?? undefined}
      selectedAssets={selectedAssets}
    >
      <AssetBrowserDispatchProvider onSelect={props.onSelect}>
        <GlobalStyle />
        <PortalProvider element={portalElement}>
          <EditAssetDialog assetId={assetId} onClose={onClose} />
        </PortalProvider>
      </AssetBrowserDispatchProvider>
    </ReduxProvider>
  )
}

export default EditAssetTool
