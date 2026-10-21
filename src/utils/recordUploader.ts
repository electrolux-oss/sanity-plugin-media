import type { SanityClient } from 'sanity'

import type { Uploader } from '../types'

const NEW_ASSET_WINDOW_MS = 2 * 60 * 1000

/**
 * Stores the uploader's user id as `opt.media.uploadedBy.id` on an asset that was just created.
 *
 * Assets that already have an uploader, or were created more than a couple of minutes ago,
 * are left alone: selecting or re-uploading an existing file must not claim it.
 *
 * Uses `getDocument` rather than a query, since queries may not see an asset created a moment ago.
 */
export const recordUploader = async ({
  client,
  assetId,
  uploader
}: {
  client: SanityClient
  assetId: string
  uploader: Uploader
}): Promise<void> => {
  if (!uploader.id) {
    return
  }

  const asset = await client.getDocument<{ opt?: { media?: { uploadedBy?: Uploader | string } } }>(
    assetId
  )

  if (!asset || asset.opt?.media?.uploadedBy) {
    return
  }

  if (Date.now() - new Date(asset._createdAt).getTime() > NEW_ASSET_WINDOW_MS) {
    return
  }

  await client
    .patch(assetId)
    .setIfMissing({ opt: {} })
    .setIfMissing({ 'opt.media': {} })
    .setIfMissing({
      'opt.media.uploadedBy': { id: uploader.id }
    })
    .commit()
}
