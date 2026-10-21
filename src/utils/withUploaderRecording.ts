import type { AssetSource, AssetSourceUploader, SanityClient } from 'sanity'

import type { Uploader } from '../types'
import { recordUploader } from './recordUploader'

type AssetRefPatch = {
  type?: string
  path?: unknown[]
  value?: { _ref?: string }
}

const getUploadedAssetId = (patches: unknown): string | undefined => {
  const list = (Array.isArray(patches) ? patches : [patches]) as AssetRefPatch[]
  const assetPatch = list.find(
    patch =>
      patch?.type === 'set' &&
      patch.path?.length === 1 &&
      patch.path[0] === 'asset' &&
      typeof patch.value?._ref === 'string'
  )

  return assetPatch?.value?._ref
}

/**
 * Wraps an asset source's `Uploader` so that assets uploaded in this browser are attributed
 * to `uploader`. Only uploads started here are seen, so collaborators' changes never trigger it.
 * Sources without an `Uploader` are returned unchanged.
 */
export const withUploaderRecording = (
  source: AssetSource,
  { client, uploader }: { client: SanityClient; uploader: Uploader }
): AssetSource => {
  const BaseUploader = source.Uploader

  if (!BaseUploader) {
    return source
  }

  class RecordingUploader extends BaseUploader {
    override upload(...args: Parameters<AssetSourceUploader['upload']>) {
      const [files, options] = args
      const onChange = options?.onChange

      return super.upload(files, {
        ...options,
        onChange: patches => {
          onChange?.(patches)

          const assetId = getUploadedAssetId(patches)

          if (assetId) {
            recordUploader({ client, assetId, uploader }).catch(err => {
              console.error('[sanity-plugin-media] Failed to record the uploader:', err)
            })
          }
        }
      })
    }
  }

  return { ...source, Uploader: RecordingUploader }
}
