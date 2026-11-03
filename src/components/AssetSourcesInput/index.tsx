import { useMemo } from 'react'
import type { InputProps, SchemaAssetSources, SchemaType } from 'sanity'

import { EDIT_MEDIA_SOURCE_NAME } from '../../constants'

type AssetValue = {
  asset?: {
    _ref?: string
  }
}

const isAssetSchemaType = (schemaType: SchemaType | undefined): boolean => {
  if (!schemaType) {
    return false
  }

  if (schemaType.name === 'image' || schemaType.name === 'file') {
    return true
  }

  return isAssetSchemaType(schemaType.type)
}

const withoutEditMedia = (sources: SchemaAssetSources | undefined): SchemaAssetSources => {
  if (!sources) {
    return source => source.name !== EDIT_MEDIA_SOURCE_NAME
  }

  if (typeof sources === 'function') {
    return source => source.name !== EDIT_MEDIA_SOURCE_NAME && sources(source)
  }

  return sources.filter(
    entry => (typeof entry === 'string' ? entry : entry.name) !== EDIT_MEDIA_SOURCE_NAME
  )
}

/**
 * Hides the "Edit Media" asset source on image and file fields that have no asset yet,
 * since there is nothing to edit. Applied to every input through the plugin's form config.
 */
const AssetSourcesInput = (props: InputProps) => {
  const { renderDefault, schemaType, value } = props

  const hideEditMedia =
    isAssetSchemaType(schemaType) && !(value as AssetValue | undefined)?.asset?._ref

  const schemaTypeWithoutEditMedia = useMemo(() => {
    const options = schemaType.options as { sources?: SchemaAssetSources } | undefined
    return {
      ...schemaType,
      options: { ...options, sources: withoutEditMedia(options?.sources) }
    } as typeof schemaType
  }, [schemaType])

  if (!hideEditMedia) {
    return renderDefault(props)
  }

  return renderDefault({ ...props, schemaType: schemaTypeWithoutEditMedia } as InputProps)
}

export default AssetSourcesInput
