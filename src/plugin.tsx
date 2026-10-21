import {
  type AssetSource,
  type AssetSourceResolver,
  definePlugin,
  type Tool as SanityTool
} from 'sanity'

import { EditIcon } from '@sanity/icons/Edit'
import { ImageIcon } from '@sanity/icons/Image'
import EditAssetTool from './components/EditAssetTool'
import FormBuilderTool from './components/FormBuilderTool'
import Tool from './components/Tool'
import UploadRejectionToasts from './components/UploadRejectionToasts'
import { ToolOptionsProvider } from './contexts/ToolOptionsContext'
import mediaTag from './schemas/tag'
import { withMaximumUploadSize } from './utils/withMaximumUploadSize'
import { withUploaderRecording } from './utils/withUploaderRecording'

import type { MediaToolOptions } from './types'
const plugin = {
  icon: ImageIcon,
  name: 'media',
  title: 'Media'
}

export const mediaAssetSource = {
  ...plugin,
  component: FormBuilderTool,
  uploadMode: 'component'
} satisfies AssetSource

const selectOnlyMediaAssetSource = {
  ...plugin,
  component: FormBuilderTool
} satisfies AssetSource

const editMediaAssetSource = {
  icon: EditIcon,
  name: 'edit-media',
  title: 'Edit Media',
  component: EditAssetTool
} satisfies AssetSource

const tool = {
  ...plugin,
  component: Tool,
  __internalApplicationType: 'sanity/media'
} satisfies SanityTool

export const media = definePlugin<MediaToolOptions | void>(options => {
  const maximumUploadSize = options?.maximumUploadSize

  const resolveAssetSources: AssetSourceResolver = (prev, { currentUser, getClient }) => {
    const client = getClient({ apiVersion: '2022-10-01' })

    const sources = prev.map(source => {
      const recorded = currentUser
        ? withUploaderRecording(source, {
            client,
            uploader: { id: currentUser.id }
          })
        : source

      return maximumUploadSize ? withMaximumUploadSize(recorded, maximumUploadSize) : recorded
    })

    return [
      ...sources,
      options?.uploadMenu === false ? selectOnlyMediaAssetSource : mediaAssetSource,
      editMediaAssetSource
    ]
  }

  return {
    name: 'media',
    studio: {
      components: {
        layout: props => (
          <ToolOptionsProvider options={options}>
            {maximumUploadSize ? <UploadRejectionToasts /> : null}
            {props.renderDefault(props)}
          </ToolOptionsProvider>
        )
      }
    },
    form: {
      file: {
        assetSources: resolveAssetSources
      },
      image: {
        assetSources: resolveAssetSources
      }
    },
    schema: {
      types: [mediaTag]
    },
    tools: prev => {
      return [...prev, tool]
    }
  }
})
