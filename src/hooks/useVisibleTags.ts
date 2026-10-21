import { useMemo } from 'react'

import { useToolOptions } from '../contexts/ToolOptionsContext'
import { selectTags } from '../modules/tags'
import type { TagItem } from '../types'
import useTypedSelector from './useTypedSelector'

/** All tags, minus those hidden by the `excludeTags` plugin option. */
const useVisibleTags = (): TagItem[] => {
  const { excludeTagSlugs } = useToolOptions()
  const tags = useTypedSelector(selectTags)

  return useMemo(
    () =>
      excludeTagSlugs.length > 0
        ? tags.filter(tagItem => !excludeTagSlugs.includes(tagItem.tag.name.current))
        : tags,
    [excludeTagSlugs, tags]
  )
}

export default useVisibleTags
