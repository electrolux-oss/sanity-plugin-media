import groq from 'groq'
import { nanoid } from 'nanoid'
import type { SanityClient } from 'sanity'

import { TAG_DOCUMENT_NAME } from '../constants'
import type { Tag } from '../types'

type ApplyMediaTagsOptions = {
  client: SanityClient
  assetId: string
  mediaTags: string[]
  createTagsOnUpload?: boolean
}

const pendingByAsset = new Map<string, Promise<void>>()

/**
 * Adds the given tags (by name) to an asset, skipping tags it already has.
 * Missing tags are created unless `createTagsOnUpload` is false.
 *
 * Calls for the same asset are serialized, so two fields selecting the same asset
 * can't race and append duplicate references.
 */
export function applyMediaTags(options: ApplyMediaTagsOptions): Promise<void> {
  const { assetId } = options
  const chain = (pendingByAsset.get(assetId) ?? Promise.resolve()).then(() =>
    doApplyMediaTags(options)
  )
  const cleanup: Promise<void> = chain
    .catch(() => undefined)
    .finally(() => {
      if (pendingByAsset.get(assetId) === cleanup) {
        pendingByAsset.delete(assetId)
      }
    })
  pendingByAsset.set(assetId, cleanup)
  return chain
}

async function resolveTag(
  client: SanityClient,
  tagName: string,
  createTagsOnUpload: boolean
): Promise<Tag | null> {
  const existingTag = await client.fetch<Tag | null>(
    groq`*[_type == "${TAG_DOCUMENT_NAME}" && name.current == $tagName][0]`,
    { tagName }
  )

  if (existingTag) {
    return existingTag
  }

  if (!createTagsOnUpload) {
    return null
  }

  return client.create({
    _type: TAG_DOCUMENT_NAME,
    name: { _type: 'slug', current: tagName }
  }) as Promise<Tag>
}

async function doApplyMediaTags({
  client,
  assetId,
  mediaTags,
  createTagsOnUpload = true
}: ApplyMediaTagsOptions): Promise<void> {
  if (mediaTags.length === 0) {
    return
  }

  const resolvedTags = await Promise.all(
    mediaTags.map(tagName => resolveTag(client, tagName, createTagsOnUpload))
  )
  const validTags = resolvedTags.filter((tag): tag is Tag => tag !== null)

  if (validTags.length === 0) {
    return
  }

  const existing = await client.fetch<{ tagIds: string[] | null } | null>(
    groq`*[_id == $assetId][0]{'tagIds': opt.media.tags[]._ref}`,
    { assetId },
    { useCdn: false }
  )
  const existingIds = new Set(existing?.tagIds ?? [])

  const tagReferences = validTags
    .filter(tag => !existingIds.has(tag._id))
    .map(tag => ({
      _key: nanoid(),
      _ref: tag._id,
      _type: 'reference' as const,
      _weak: true
    }))

  if (tagReferences.length === 0) {
    return
  }

  await client
    .patch(assetId)
    .setIfMissing({ opt: {} })
    .setIfMissing({ 'opt.media': {} })
    .setIfMissing({ 'opt.media.tags': [] })
    .append('opt.media.tags', tagReferences)
    .commit()
}
