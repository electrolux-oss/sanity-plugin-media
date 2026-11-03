import type { ImageAsset } from '../types'

const getAssetResolution = (asset: ImageAsset): string => {
  return `${asset.metadata.dimensions.width}x${asset.metadata.dimensions.height}px`
}

export default getAssetResolution
