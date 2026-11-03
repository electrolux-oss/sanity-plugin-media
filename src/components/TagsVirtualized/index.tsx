import { Flex, Label } from '@sanity/ui'
import { memo, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'

import { PANEL_HEIGHT } from '../../constants'
import useTypedSelector from '../../hooks/useTypedSelector'
import { selectAssetsPicked } from '../../modules/assets'
import type { TagActions, TagItem } from '../../types'
import Tag from '../Tag'

type TagRow = {
  actions: TagActions[]
  tagItem: TagItem
}

type Row = string | TagRow

const VirtualRow = memo(({ isScrolling, item }: { isScrolling?: boolean; item: Row }) => {
  // Render label
  if (typeof item === 'string') {
    return (
      <Flex
        align="center"
        justify="space-between"
        key={item}
        paddingX={3}
        style={{ height: `${PANEL_HEIGHT}px` }}
      >
        <Label size={0}>{item}</Label>
      </Flex>
    )
  }

  // Render tag - only display actions if we're not in the process of scrolling
  return (
    <Tag
      actions={isScrolling ? undefined : item.actions}
      key={item.tagItem.tag._id}
      tag={item.tagItem}
    />
  )
})

const toRows = (tagItems: TagItem[], actions: TagActions[]): TagRow[] => {
  return tagItems.map(tagItem => ({ actions, tagItem }))
}

const getRowKey = (_index: number, item: Row) => {
  return typeof item === 'string' ? item : item.tagItem.tag._id
}

const renderRow = (_index: number, item: Row, context: { isScrolling: boolean }) => {
  return <VirtualRow isScrolling={context.isScrolling} item={item} />
}

const TagsVirtualized = ({ tags }: { tags: TagItem[] }) => {
  const assetsPicked = useTypedSelector(selectAssetsPicked)

  // State
  const [isScrolling, setIsScrolling] = useState(false)

  // TODO: refactor, there's most certainly a more performant way to do this

  // Filter out all tag IDS used (across all) and dedupe
  const pickedTagIds = assetsPicked?.reduce((acc: string[], val) => {
    const assetTagIds = val?.asset?.opt?.media?.tags?.map(tag => tag._ref) || []
    acc = acc.concat(assetTagIds)
    return acc
  }, [])
  const pickedTagIdsUnique = [...new Set(pickedTagIds)]

  // Segment tags into two buckets:
  // 1. those which exist in all picked assets ('applied to all')
  // 2. those which exist in some picked assets ('applied to some')
  const tagIdsSegmented = pickedTagIdsUnique.reduce(
    (acc: { appliedToAll: string[]; appliedToSome: string[] }, tagId) => {
      const tagIsInEveryAsset = assetsPicked.every(assetItem => {
        const tagIndex =
          assetItem.asset.opt?.media?.tags?.findIndex(tag => tag._ref === tagId) ?? -1
        return tagIndex >= 0
      })

      if (tagIsInEveryAsset) {
        acc.appliedToAll.push(tagId)
      } else {
        acc.appliedToSome.push(tagId)
      }

      return acc
    },
    {
      appliedToAll: [],
      appliedToSome: []
    }
  )

  const tagsAppliedToAll = toRows(
    tags.filter(tag => tagIdsSegmented.appliedToAll.includes(tag.tag._id)),
    ['delete', 'edit', 'removeAll', 'search']
  )
  const tagsAppliedToSome = toRows(
    tags.filter(tag => tagIdsSegmented.appliedToSome.includes(tag.tag._id)),
    ['applyAll', 'delete', 'edit', 'removeAll', 'search']
  )
  const tagsUnused = toRows(
    tags.filter(tag => !pickedTagIdsUnique.includes(tag.tag._id)),
    ['applyAll', 'delete', 'edit', 'search']
  )

  let items: Row[] = []
  if (assetsPicked.length === 0) {
    items = toRows(tags, ['delete', 'edit', 'search'])
  } else {
    if (tagsAppliedToAll?.length > 0) {
      items = [
        ...items, //
        assetsPicked.length === 1 ? 'Used' : 'Used by all',
        ...tagsAppliedToAll
      ]
    }
    if (tagsAppliedToSome?.length > 0) {
      items = [
        ...items, //
        'Used by some',
        ...tagsAppliedToSome
      ]
    }
    if (tagsUnused?.length > 0) {
      items = [
        ...items, //
        'Unused',
        ...tagsUnused
      ]
    }
  }

  return (
    <Virtuoso
      className="media__custom-scrollbar"
      computeItemKey={getRowKey}
      context={{ isScrolling }}
      data={items}
      isScrolling={setIsScrolling}
      itemContent={renderRow}
      style={{ flex: 1, overflowX: 'hidden' }}
    />
  )
}

export default TagsVirtualized
