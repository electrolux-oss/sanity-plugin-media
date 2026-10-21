import type { AssetSource, AssetSourceUploader } from 'sanity'

export type UploadRejection = {
  files: File[]
  maximumUploadSize: number
}

type RejectionListener = (rejection: UploadRejection) => void

const listeners = new Set<RejectionListener>()

export const subscribeToUploadRejections = (listener: RejectionListener): (() => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Wraps an asset source's `Uploader` so files larger than `maximumUploadSize` are rejected
 * before they are uploaded. Sources without an `Uploader` are returned unchanged.
 *
 * Rejections are reported to `subscribeToUploadRejections` listeners (to explain why), then
 * thrown, which makes Studio cancel the upload and reset the field's upload state.
 */
export const withMaximumUploadSize = (
  source: AssetSource,
  maximumUploadSize: number
): AssetSource => {
  const BaseUploader = source.Uploader

  if (!BaseUploader) {
    return source
  }

  class SizeLimitedUploader extends BaseUploader {
    override upload(...args: Parameters<AssetSourceUploader['upload']>) {
      const [files] = args
      const tooLarge = files.filter(file => file.size > maximumUploadSize)

      if (tooLarge.length > 0) {
        listeners.forEach(listener => listener({ files: tooLarge, maximumUploadSize }))
        throw new Error(
          `[sanity-plugin-media] ${tooLarge
            .map(file => file.name)
            .join(', ')} exceeds the maximum upload size of ${maximumUploadSize} bytes`
        )
      }

      return super.upload(...args)
    }
  }

  return { ...source, Uploader: SizeLimitedUploader }
}
