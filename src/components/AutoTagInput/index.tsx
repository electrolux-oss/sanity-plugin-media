import { useToast } from '@sanity/ui'
import { useEffect, useRef } from 'react'
import type { InputProps } from 'sanity'

import { useToolOptions } from '../../contexts/ToolOptionsContext'
import useVersionedClient from '../../hooks/useVersionedClient'
import { applyMediaTags } from '../../utils/applyMediaTags'

type AssetValue = {
  asset?: {
    _ref: string
  }
}

export type AutoTagInputProps = InputProps & {
  mediaTags?: string[]
}

/**
 * Image / file input that tags the selected or uploaded asset with `mediaTags`.
 *
 * Tags come from the `mediaTags` prop, falling back to `options.mediaTags` on the field
 * (which also pre-filters the media browser). Only changes made after mount are tagged,
 * so opening a document never patches its existing assets.
 */
export function AutoTagInput(props: AutoTagInputProps) {
  const { renderDefault, schemaType, value, mediaTags: mediaTagsProp } = props
  const toast = useToast()
  const client = useVersionedClient()
  const { createTagsOnUpload } = useToolOptions()

  const mediaTags =
    mediaTagsProp ?? (schemaType?.options as { mediaTags?: string[] } | undefined)?.mediaTags
  const currentAssetRef = (value as AssetValue | undefined)?.asset?._ref

  const prevAssetRef = useRef(currentAssetRef)

  useEffect(() => {
    const previousRef = prevAssetRef.current
    prevAssetRef.current = currentAssetRef

    if (!mediaTags?.length || !currentAssetRef || currentAssetRef === previousRef) {
      return
    }

    applyMediaTags({
      client,
      assetId: currentAssetRef,
      mediaTags,
      createTagsOnUpload
    }).catch(err => {
      console.error('[sanity-plugin-media] Failed to apply auto-tags:', err)
      toast.push({
        closable: true,
        status: 'error',
        title: `Failed to apply the media ${
          mediaTags.length === 1 ? 'tag' : 'tags'
        } ${mediaTags.join(', ')}`
      })
    })
  }, [currentAssetRef, mediaTags, client, createTagsOnUpload, toast])

  return renderDefault(props as InputProps)
}
