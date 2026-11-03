import type { SanityDocument } from '@sanity/client'

import { TAG_DOCUMENT_NAME } from '../constants'
import type { Asset, FileAsset, ImageAsset, Tag } from '../types'

export const isFileAsset = (asset: Asset): asset is FileAsset => {
  return asset._type === 'sanity.fileAsset'
}

export const isImageAsset = (asset: Asset): asset is ImageAsset => {
  return asset._type === 'sanity.imageAsset'
}

export const isAssetDocument = (document: SanityDocument): document is Asset => {
  return document._type === 'sanity.fileAsset' || document._type === 'sanity.imageAsset'
}

export const isTagDocument = (document: SanityDocument): document is Tag => {
  return document._type === TAG_DOCUMENT_NAME
}

export const isSanityDocument = (value: unknown): value is SanityDocument => {
  return typeof value === 'object' && value !== null && '_id' in value && '_type' in value
}
