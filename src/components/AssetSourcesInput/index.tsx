import { useMemo } from 'react'
import type { InputProps, SchemaAssetSources, SchemaType } from 'sanity'

import { EDIT_MEDIA_SOURCE_NAME } from '../../constants'
import { getAssetRef } from '../../utils/getAssetRef'

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

  const hideEditMedia = isAssetSchemaType(schemaType) && !getAssetRef(value)

  const schemaTypeWithoutEditMedia = useMemo(() => {
    const options: { sources?: SchemaAssetSources } | undefined = schemaType.options
    return Object.assign({}, schemaType, {
      options: { ...options, sources: withoutEditMedia(options?.sources) }
    })
  }, [schemaType])

  if (!hideEditMedia) {
    return renderDefault(props)
  }

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- InputProps is a union keyed on schemaType, so swapping in a copy of the same schema type can't be expressed without a cast
  return renderDefault({ ...props, schemaType: schemaTypeWithoutEditMedia } as InputProps)
}

export default AssetSourcesInput
