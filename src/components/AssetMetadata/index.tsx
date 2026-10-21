import { format } from 'date-fns'
import filesize from 'filesize'

import { DownloadIcon } from '@sanity/icons/Download'
import { SyncIcon } from '@sanity/icons/Sync'
import { Box, Button, Flex, Inline, Stack, Text } from '@sanity/ui'

import useVersionedClient from '../../hooks/useVersionedClient'
import getAssetResolution from '../../utils/getAssetResolution'
import { isImageAsset } from '../../utils/typeGuards'
import ButtonAssetCopy from '../ButtonAssetCopy'

import { type ReactNode, useState } from 'react'

import type { Asset, AssetItem, Uploader } from '../../types'
type Props = {
  asset: Asset
  item?: AssetItem
}

const Row = ({
  action,
  label,
  value,
  wrap = false
}: {
  action?: ReactNode
  label: string
  value: ReactNode
  wrap?: boolean
}) => {
  return (
    <Flex align={wrap ? 'flex-start' : 'center'} justify="space-between">
      <Text
        size={1}
        style={{
          opacity: 0.8,
          width: '40%'
        }}
        textOverflow="ellipsis"
      >
        {label}
      </Text>
      <Flex align="center" gap={1} justify="flex-end" style={{ width: '60%' }}>
        <Text
          size={1}
          style={{
            flex: 1,
            minWidth: 0,
            opacity: 0.4,
            overflowWrap: wrap ? 'anywhere' : undefined,
            textAlign: 'right',
            userSelect: wrap ? 'all' : undefined
          }}
          textOverflow={wrap ? undefined : 'ellipsis'}
          title={typeof value === 'string' ? value : undefined}
        >
          {value}
        </Text>
        {action}
      </Flex>
    </Flex>
  )
}

/** Older builds stored only the user id as a string. */
const formatUploader = (uploadedBy: Uploader | string | undefined): string => {
  if (typeof uploadedBy === 'string') {
    return uploadedBy
  }

  if (!uploadedBy?.id) {
    return 'Unknown'
  }

  return uploadedBy.name ? `${uploadedBy.name} (${uploadedBy.id})` : uploadedBy.id
}

type FetchedUser = { displayName?: string; email?: string }

/**
 * Shows the stored uploader, plus a button that fetches their current name (and email, when
 * Sanity returns it) on demand. Nothing is fetched until the button is clicked.
 */
const UploaderRow = ({ uploadedBy }: { uploadedBy: Uploader | string | undefined }) => {
  const client = useVersionedClient()
  const [fetched, setFetched] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const userId = typeof uploadedBy === 'string' ? uploadedBy : uploadedBy?.id

  const handleFetch = async () => {
    if (!userId) {
      return
    }

    setLoading(true)

    try {
      const response = await client
        .withConfig({ apiVersion: '2021-06-07' })
        .request<FetchedUser | FetchedUser[] | null>({
          uri: `/users/${userId}`,
          tag: 'media.uploader'
        })
      const user = Array.isArray(response) ? response[0] : response

      if (!user?.displayName) {
        setFetched('Not available')
      } else {
        setFetched(user.email ? `${user.displayName} (${user.email})` : user.displayName)
      }
    } catch {
      setFetched('Not available')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Row
      action={
        userId ? (
          <Button
            aria-label="Fetch current name and email"
            disabled={loading}
            fontSize={0}
            icon={SyncIcon}
            mode="bleed"
            onClick={handleFetch}
            padding={1}
            title="Fetch current name and email"
          />
        ) : undefined
      }
      label="Uploaded by"
      value={fetched ?? formatUploader(uploadedBy)}
    />
  )
}

const AssetMetadata = (props: Props) => {
  const { asset, item } = props

  const exif = asset?.metadata?.exif

  // Callbacks
  const handleDownload = () => {
    window.location.href = `${asset.url}?dl=${asset.originalFilename}`
  }

  return (
    <Box marginTop={3}>
      {/* Base */}
      <Box>
        <Stack space={3}>
          <Row label="Size" value={filesize(asset?.size, { base: 10, round: 0 })} />
          <Row label="MIME type" value={asset?.mimeType} />
          <Row label="Extension" value={asset?.extension?.toUpperCase()} />
          {isImageAsset(asset) && <Row label="Dimensions" value={getAssetResolution(asset)} />}
          <Row label="Uploaded" value={format(new Date(asset._createdAt), 'PPp')} />
          <UploaderRow uploadedBy={asset.opt?.media?.uploadedBy} />
          <Row label="Asset ID" value={asset._id} wrap />
        </Stack>
      </Box>
      {/* EXIF */}
      {exif &&
        (exif.DateTimeOriginal ||
          exif.FNumber ||
          exif.FocalLength ||
          exif.ExposureTime ||
          exif.ISO) && (
          <>
            {/* Divider */}
            <Box
              marginY={4}
              style={{
                background: 'var(--card-border-color)',
                height: '1px',
                width: '100%'
              }}
            />
            <Box>
              <Stack space={3}>
                {exif.ISO && <Row label="ISO" value={exif.ISO} />}
                {exif.FNumber && <Row label="Aperture" value={`ƒ/${exif.FNumber}`} />}
                {exif.FocalLength && <Row label="Focal length" value={`${exif.FocalLength}mm`} />}
                {exif.ExposureTime && (
                  <Row label="Exposure time" value={`1/${1 / exif.ExposureTime}`} />
                )}
                {exif.DateTimeOriginal && (
                  <Row
                    label="Original date"
                    value={format(new Date(exif.DateTimeOriginal), 'PPp')}
                  />
                )}
              </Stack>
            </Box>
          </>
        )}

      {/* Asset actions */}
      <Box marginTop={5}>
        <Inline space={2}>
          {/* Download */}
          <Button
            disabled={!item || item?.updating}
            fontSize={1}
            icon={DownloadIcon}
            mode="ghost"
            onClick={handleDownload}
            text="Download"
          />
          {/* Copy to clipboard */}
          <ButtonAssetCopy disabled={!item || item?.updating} url={asset.url} />
        </Inline>
      </Box>
    </Box>
  )
}

export default AssetMetadata
