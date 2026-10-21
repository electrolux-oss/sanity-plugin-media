import type { MutationEvent } from '@sanity/client'
import groq from 'groq'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import type { SanityDocument } from 'sanity'

import { Card, Flex, PortalProvider } from '@sanity/ui'

import { inputs } from '../../config/searchFacets'
import { TAG_DOCUMENT_NAME } from '../../constants'
import { AssetBrowserDispatchProvider } from '../../contexts/AssetSourceDispatchContext'
import { useToolOptions } from '../../contexts/ToolOptionsContext'
import useTypedSelector from '../../hooks/useTypedSelector'
import useVersionedClient from '../../hooks/useVersionedClient'
import { assetsActions } from '../../modules/assets'
import { searchActions } from '../../modules/search'
import { tagsActions } from '../../modules/tags'
import GlobalStyle from '../../styled/GlobalStyles'
import Controls from '../Controls'
import DebugControls from '../DebugControls'
import Dialogs from '../Dialogs'
import Header from '../Header'
import Items from '../Items'
import Notifications from '../Notifications'
import PickedBar from '../PickedBar'
import ReduxProvider from '../ReduxProvider'
import TagsPanel from '../TagsPanel'
import UploadDropzone from '../UploadDropzone'

import type { AssetSourceComponentProps } from 'sanity'

import type { Asset, Tag } from '../../types'
type Props = {
  assetType?: AssetSourceComponentProps['assetType']
  document?: SanityDocument
  onClose?: AssetSourceComponentProps['onClose']
  onSelect?: AssetSourceComponentProps['onSelect']
  schemaType?: AssetSourceComponentProps['schemaType']
  selectedAssets?: AssetSourceComponentProps['selectedAssets']
}

const getMediaTagNames = (schemaType?: AssetSourceComponentProps['schemaType']): string[] => {
  const mediaTags = (schemaType?.options as { mediaTags?: string[] } | undefined)?.mediaTags ?? []
  const names = mediaTags.map(tag => tag?.trim()).filter((tag): tag is string => Boolean(tag))
  return Array.from(new Set(names))
}

/**
 * Applies a tag facet for each of the field's `options.mediaTags` once tags have loaded.
 * Facet changes trigger the (debounced) asset search, which loads the first page.
 */
const useMediaTagFacets = (tagNames: string[]) => {
  const dispatch = useDispatch()
  const tagsByIds = useTypedSelector(state => state.tags.byIds)
  const tagsLoaded = useTypedSelector(
    state => state.tags.fetchCount >= 0 || Boolean(state.tags.fetchingError)
  )
  const enabled = tagNames.length > 0

  useEffect(() => {
    if (!enabled || !tagsLoaded) {
      return
    }

    const tagFacetInput = inputs.tag

    if (tagFacetInput.type !== 'searchable') {
      return
    }

    const tagItems = Object.values(tagsByIds)

    dispatch(searchActions.facetsClear())

    tagNames.forEach(name => {
      const tagItem = tagItems.find(item => item.tag.name.current === name)

      if (tagItem) {
        dispatch(
          searchActions.facetsAdd({
            facet: {
              ...tagFacetInput,
              operatorType: 'references',
              value: { label: tagItem.tag.name.current, value: tagItem.tag._id }
            }
          })
        )
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, tagsLoaded])
}

const BrowserContent = ({
  onClose,
  schemaType
}: {
  onClose?: AssetSourceComponentProps['onClose']
  schemaType?: AssetSourceComponentProps['schemaType']
}) => {
  const client = useVersionedClient()
  const [portalElement, setPortalElement] = useState<HTMLDivElement | null>(null)
  const dispatch = useDispatch()
  const tagNames = useMemo(() => getMediaTagNames(schemaType), [schemaType])
  const hasMediaTags = tagNames.length > 0

  useMediaTagFacets(tagNames)

  useEffect(() => {
    const handleAssetUpdate = (update: MutationEvent) => {
      const { documentId, result, transition } = update

      if (transition === 'appear') {
        dispatch(assetsActions.listenerCreateQueue({ asset: result as Asset }))
      }

      if (transition === 'disappear') {
        dispatch(assetsActions.listenerDeleteQueue({ assetId: documentId }))
      }

      if (transition === 'update') {
        dispatch(assetsActions.listenerUpdateQueue({ asset: result as Asset }))
      }
    }

    const handleTagUpdate = (update: MutationEvent) => {
      const { documentId, result, transition } = update

      if (transition === 'appear') {
        dispatch(tagsActions.listenerCreateQueue({ tag: result as Tag }))
      }

      if (transition === 'disappear') {
        dispatch(tagsActions.listenerDeleteQueue({ tagId: documentId }))
      }

      if (transition === 'update') {
        dispatch(tagsActions.listenerUpdateQueue({ tag: result as Tag }))
      }
    }

    // Fetch assets: first page (with media tags, the tag facets trigger the first fetch instead)
    if (!hasMediaTags) {
      dispatch(assetsActions.loadPageIndex({ pageIndex: 0 }))
    }

    // Fetch all tags
    dispatch(tagsActions.fetchRequest())

    // Listen for asset and tag changes in published documents.
    // Remember that Sanity listeners ignore joins, order clauses and projections!
    // Also note that changes to the selected document (if present) will automatically re-load the media plugin
    // due to the desk pane re-rendering.
    const subscriptionAsset = client
      .listen(
        groq`*[_type in ["sanity.fileAsset", "sanity.imageAsset"] && !(_id in path("drafts.**"))]`
      )
      .subscribe(handleAssetUpdate)

    const subscriptionTag = client
      .listen(groq`*[_type == "${TAG_DOCUMENT_NAME}" && !(_id in path("drafts.**"))]`)
      .subscribe(handleTagUpdate)

    return () => {
      subscriptionAsset?.unsubscribe()
      subscriptionTag?.unsubscribe()
    }
  }, [client, dispatch, hasMediaTags])

  return (
    <PortalProvider element={portalElement}>
      <UploadDropzone>
        <Dialogs />
        <Notifications />

        <Card display="flex" height="fill" ref={setPortalElement}>
          <Flex direction="column" flex={1}>
            {/* Header */}
            <Header onClose={onClose} />

            {/* Browser Controls */}
            <Controls />

            <Flex flex={1}>
              <Flex align="flex-end" direction="column" flex={1} style={{ position: 'relative' }}>
                <PickedBar />
                <Items />
              </Flex>
              <TagsPanel />
            </Flex>

            {/* Debug */}
            <DebugControls />
          </Flex>
        </Card>
      </UploadDropzone>
    </PortalProvider>
  )
}

const Browser = (props: Props) => {
  const client = useVersionedClient()
  const { excludeTagSlugs } = useToolOptions()

  return (
    <ReduxProvider
      assetType={props?.assetType}
      client={client}
      document={props?.document}
      excludeTagSlugs={excludeTagSlugs}
      selectedAssets={props?.selectedAssets}
    >
      <AssetBrowserDispatchProvider onSelect={props?.onSelect}>
        <GlobalStyle />
        <BrowserContent onClose={props?.onClose} schemaType={props?.schemaType} />
      </AssetBrowserDispatchProvider>
    </ReduxProvider>
  )
}

export default Browser
