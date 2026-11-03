import { SelectIcon } from '@sanity/icons/Select'
import { Box, Button } from '@sanity/ui'
import { Menu, MenuButton, MenuDivider, MenuItem } from '@sanity/ui/menu'
import { useDispatch } from 'react-redux'
import Select from 'react-select'

import { operators } from '../../config/searchFacets'
import { usePortalPopoverProps } from '../../hooks/usePortalPopoverProps'
import useTypedSelector from '../../hooks/useTypedSelector'
import useVisibleTags from '../../hooks/useVisibleTags'
import { searchActions } from '../../modules/search'
import { reactSelectComponents, useReactSelectStyles } from '../../styled/react-select/single'
import type {
  TagSelectOption,
  SearchFacetInputSearchableProps,
  SearchFacetOperatorType,
  WithId
} from '../../types'
import getTagSelectOptions from '../../utils/getTagSelectOptions'
import SearchFacet from '../SearchFacet'

type Props = {
  facet: WithId<SearchFacetInputSearchableProps>
}

const SearchFacetTags = ({ facet }: Props) => {
  const reactSelectStyles = useReactSelectStyles()

  // Redux
  const dispatch = useDispatch()
  const tags = useVisibleTags()
  const tagsFetching = useTypedSelector(state => state.tags.fetching)
  const allTagOptions = getTagSelectOptions(tags)

  const popoverProps = usePortalPopoverProps()

  const handleChange = (option: TagSelectOption | null) => {
    dispatch(
      searchActions.facetsUpdateById({
        id: facet.id,
        value: option
      })
    )
  }

  const handleOperatorItemClick = (operatorType: SearchFacetOperatorType) => {
    dispatch(
      searchActions.facetsUpdateById({
        id: facet.id,
        operatorType
      })
    )
  }

  const selectedOperatorType: SearchFacetOperatorType = facet.operatorType

  return (
    <SearchFacet facet={facet}>
      {/* Optional operators */}
      {facet?.operatorTypes && (
        <MenuButton
          button={
            <Button
              fontSize={1}
              iconRight={SelectIcon}
              padding={2}
              text={operators[selectedOperatorType].label}
            />
          }
          id="operators"
          menu={
            <Menu>
              {facet.operatorTypes.map((operatorType, index) => {
                if (operatorType) {
                  const selected = operatorType === selectedOperatorType
                  return (
                    <MenuItem
                      disabled={selected}
                      fontSize={1}
                      key={operatorType}
                      onClick={() => handleOperatorItemClick(operatorType)}
                      padding={2}
                      gap={4}
                      style={{ minWidth: '150px' }}
                      text={operators[operatorType].label}
                    />
                  )
                }

                // oxlint-disable-next-line react/no-array-index-key -- null entries in the static operator list are dividers with no identity of their own
                return <MenuDivider key={index} />
              })}
            </Menu>
          }
          popover={popoverProps}
        />
      )}

      {/* Value */}
      {!operators[selectedOperatorType].hideInput && (
        <Box marginX={1} style={{ width: '160px' }}>
          <Select
            components={reactSelectComponents}
            instanceId="facet-searchable"
            isClearable
            isDisabled={tagsFetching}
            isSearchable
            name="tags"
            noOptionsMessage={() => 'No tags'}
            onChange={handleChange}
            options={allTagOptions}
            placeholder={tagsFetching ? 'Loading...' : 'Select...'}
            styles={reactSelectStyles}
            value={facet?.value}
          />
        </Box>
      )}
    </SearchFacet>
  )
}

export default SearchFacetTags
