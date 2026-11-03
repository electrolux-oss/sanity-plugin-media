import { AddIcon } from '@sanity/icons/Add'
import { ChevronDownIcon } from '@sanity/icons/ChevronDown'
import { CloseIcon } from '@sanity/icons/Close'
import { Box, Card, Flex, rem, Text, useTheme_v2 } from '@sanity/ui'
import { components } from 'react-select'
import type { StylesConfig } from 'react-select'
import { Virtuoso } from 'react-virtuoso'
import { useColorSchemeValue } from 'sanity'

import type { TagSelectOption } from '../../types'
import { getSchemeColor } from '../../utils/getSchemeColor'
export const useReactSelectStyles = (): StylesConfig<TagSelectOption, true> => {
  const scheme = useColorSchemeValue()
  const { color, font, radius, space } = useTheme_v2()

  return {
    control: (styles, { isFocused }) => {
      let boxShadow = `inset 0 0 0 1px var(--card-border-color)`
      if (isFocused) {
        boxShadow = `inset 0 0 0 1px ${color.input.default.enabled.border},
        0 0 0 1px var(--card-bg-color),
        0 0 0 3px var(--card-focus-ring-color) !important`
      }

      return {
        ...styles,
        backgroundColor: 'var(--card-bg-color)',
        color: 'inherit',
        border: 'none',
        borderRadius: radius[1],
        boxShadow,
        margin: 0,
        minHeight: '35px',
        outline: 'none',
        padding: rem(space[1]),
        transition: 'none',
        '&:hover': {
          boxShadow: `inset 0 0 0 1px ${color.input.default.hovered.border}`
        }
      }
    },
    indicatorsContainer: (styles, { isDisabled }) => ({
      ...styles,
      opacity: isDisabled ? 0.25 : 1
    }),
    input: styles => ({
      ...styles,
      color: 'var(--card-fg-color)',
      fontFamily: font.text.family,
      marginLeft: rem(space[2])
    }),
    menuList: styles => ({
      ...styles
    }),
    multiValue: (styles, { isDisabled }) => ({
      ...styles,
      backgroundColor: color.button.ghost.primary.hovered.bg,
      borderRadius: radius[2],
      opacity: isDisabled ? 0.5 : 1
    }),
    multiValueLabel: () => ({
      color: color.button.ghost.primary.hovered.fg,
      fontSize: 'inherit',
      padding: 0
    }),
    multiValueRemove: styles => ({
      ...styles,
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      svg: { color: color.button.ghost.primary.hovered.fg },
      '&:hover': {
        backgroundColor: color.button.ghost.primary.selected.bg
      }
    }),
    noOptionsMessage: styles => ({
      ...styles,
      fontFamily: font.text.family,
      lineHeight: '1em'
    }),
    option: (styles, { isFocused }) => ({
      ...styles,
      backgroundColor: isFocused ? color.avatar.blue.bg : 'transparent',
      borderRadius: radius[2],
      color: isFocused ? getSchemeColor(scheme, 'bg') : 'inherit',
      padding: `${rem(space[1])} ${rem(space[2])}`,
      '&:hover': {
        backgroundColor: color.avatar.blue.bg,
        color: getSchemeColor(scheme, 'bg')
      }
    }),
    placeholder: styles => ({
      ...styles,
      marginLeft: rem(space[2])
    }),
    valueContainer: styles => ({
      ...styles,
      margin: 0,
      padding: 0
    })
  }
}

const DropdownIndicator = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      <Box paddingX={2}>
        <Text size={1}>
          <ChevronDownIcon />
        </Text>
      </Box>
    </components.DropdownIndicator>
  )
}

const Menu = (props: any) => {
  return (
    <components.Menu {...props}>
      <Card radius={1} shadow={2}>
        {props.children}
      </Card>
    </components.Menu>
  )
}

const renderOption = (_index: number, item: { props: object }) => {
  return <Option {...item.props} />
}

const MenuList = (props: any) => {
  const { children } = props

  const MAX_ROWS = 5
  const OPTION_HEIGHT = 37

  if (Array.isArray(children)) {
    const height =
      children.length > MAX_ROWS ? OPTION_HEIGHT * MAX_ROWS : children.length * OPTION_HEIGHT

    return (
      <Virtuoso
        className="media__custom-scrollbar"
        data={children}
        itemContent={renderOption}
        style={{ height }}
      />
    )
  }
  return <components.MenuList {...props}>{children}</components.MenuList>
}

const MultiValueLabel = (props: any) => {
  return (
    <Box padding={2} paddingRight={1}>
      <Text size={1} weight="medium">
        <components.MultiValueLabel {...props} />
      </Text>
    </Box>
  )
}

const MultiValueRemove = (props: any) => {
  return (
    <components.MultiValueRemove {...props}>
      <CloseIcon color="#1f2123" />
    </components.MultiValueRemove>
  )
}

const Option = (props: any) => {
  return (
    <Box paddingX={1} paddingY={1}>
      <components.Option {...props}>
        <Flex align="center">
          {props.data.__isNew__ && <AddIcon style={{ marginRight: '3px' }} />}
          {props.children}
        </Flex>
      </components.Option>
    </Box>
  )
}

export const reactSelectComponents = {
  DropdownIndicator,
  IndicatorSeparator: null,
  Menu,
  MenuList,
  MultiValueLabel,
  MultiValueRemove,
  Option
}
