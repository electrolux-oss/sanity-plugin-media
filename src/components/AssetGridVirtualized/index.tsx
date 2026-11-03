import { memo } from 'react'
import {
  type ContextProp,
  type GridItemProps,
  type GridListProps,
  VirtuosoGrid
} from 'react-virtuoso'
import { styled } from 'styled-components'

import useTypedSelector from '../../hooks/useTypedSelector'
import type { CardAssetData, CardUploadData } from '../../types'
import CardAsset from '../CardAsset'
import CardUpload from '../CardUpload'

type Props = {
  items: (CardAssetData | CardUploadData)[]
  onLoadMore?: () => void
}

const CARD_HEIGHT = 220
const CARD_WIDTH = 240

const VirtualCell = memo(
  ({ item, selected }: { item: CardAssetData | CardUploadData; selected: boolean }) => {
    if (item?.type === 'asset') {
      return <CardAsset id={item.id} selected={selected} />
    }

    if (item?.type === 'upload') {
      return <CardUpload id={item.id} />
    }

    return null
  }
)

const StyledItemContainer = styled.div`
  height: ${CARD_HEIGHT}px;
  width: ${CARD_WIDTH}px;
`

type GridContext = { selectedIds: string[] }

const ItemContainer = ({
  context: _context,
  ...rest
}: GridItemProps & ContextProp<GridContext>) => {
  return <StyledItemContainer {...rest} />
}

const StyledListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, ${CARD_WIDTH}px);
  grid-template-rows: repeat(auto-fill, ${CARD_HEIGHT}px);
  justify-content: center;
  margin: 0 auto;
`

const ListContainer = ({
  context: _context,
  ...rest
}: GridListProps & ContextProp<GridContext>) => {
  return <StyledListContainer {...rest} />
}

const renderItem = (_index: number, item: CardAssetData | CardUploadData, context: GridContext) => {
  return <VirtualCell item={item} selected={context.selectedIds.includes(item.id)} />
}

const AssetGridVirtualized = (props: Props) => {
  const { items, onLoadMore } = props

  // Redux
  const selectedAssets = useTypedSelector(state => state.selected.assets)

  const selectedIds = (selectedAssets && selectedAssets.map(asset => asset._id)) || []
  const totalCount = items?.length

  if (totalCount === 0) {
    return null
  }

  return (
    <VirtuosoGrid
      className="media__custom-scrollbar"
      components={{
        Item: ItemContainer,
        List: ListContainer
      }}
      computeItemKey={(_index, item) => item.id}
      context={{ selectedIds }}
      data={items}
      endReached={onLoadMore}
      itemContent={renderItem}
      overscan={48}
      style={{ overflowAnchor: 'none', overflowX: 'hidden', overflowY: 'scroll' }}
      totalCount={totalCount}
    />
  )
}

export default AssetGridVirtualized
