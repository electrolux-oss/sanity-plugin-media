import type { AssetSourceComponentProps } from 'sanity'

import { divider, inputs } from './config/searchFacets'
import type { SearchFacetInputProps, SearchFacetDivider, SearchFacetGroup, Order } from './types'

export const SUPPORTED_ASSET_TYPES = [
  'file',
  'image'
] as const satisfies AssetSourceComponentProps['assetType'][]

// Sort order dropdown options, with menu dividers between groups
export const ORDER_OPTION_GROUPS: Order[][] = [
  [
    { direction: 'desc', field: '_createdAt' },
    { direction: 'asc', field: '_createdAt' }
  ],
  [
    { direction: 'desc', field: '_updatedAt' },
    { direction: 'asc', field: '_updatedAt' }
  ],
  [
    { direction: 'asc', field: 'originalFilename' },
    { direction: 'desc', field: 'originalFilename' }
  ],
  [
    { direction: 'desc', field: 'size' },
    { direction: 'asc', field: 'size' }
  ]
]

export const DEFAULT_ORDER: Order = { direction: 'desc', field: '_createdAt' }

export const FACETS: (SearchFacetDivider | SearchFacetGroup | SearchFacetInputProps)[] = [
  inputs.tag,
  divider,
  inputs.inUse,
  inputs.inCurrentDocument,
  divider,
  inputs.title,
  inputs.altTexts,
  inputs.creditLine,
  inputs.description,
  divider,
  inputs.isOpaque,
  divider,
  inputs.fileName,
  inputs.size,
  inputs.type,
  divider,
  inputs.orientation,
  inputs.width,
  inputs.height
]

export const GRID_TEMPLATE_COLUMNS = {
  SMALL: '3rem 100px auto 1.5rem',
  LARGE: '3rem 100px auto 5.5rem 5.5rem 3.5rem 8.5rem 4.75rem 2rem'
}
export const EDIT_MEDIA_SOURCE_NAME = 'edit-media'
export const PANEL_HEIGHT = 32 // px
export const TAG_DOCUMENT_NAME = 'media.tag'
export const TAGS_PANEL_WIDTH = 250 // px
