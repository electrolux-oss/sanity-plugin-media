import type { AssetSource, AssetSourceUploader, SanityClient } from 'sanity'
import * as z from 'zod'

import type { Uploader } from '../types'
import { recordUploader } from './recordUploader'

const assetRefPatchSchema = z.object({
  type: z.literal('set'),
  path: z.tuple([z.literal('asset')]),
  value: z.object({ _ref: z.string() })
})

const getUploadedAssetId = (patches: unknown): string | undefined => {
  const list: unknown[] = Array.isArray(patches) ? patches : [patches]

  for (const patch of list) {
    const result = assetRefPatchSchema.safeParse(patch)

    if (result.success) {
      return result.data.value._ref
    }
  }

  return undefined
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
