import { SortIcon } from '@sanity/icons/Sort'
import { Button } from '@sanity/ui'
import { Menu, MenuButton, MenuDivider, MenuItem } from '@sanity/ui/menu'
import { Fragment } from 'react'
import { useDispatch } from 'react-redux'

import { getOrderTitle } from '../../config/orders'
import { ORDER_OPTION_GROUPS } from '../../constants'
import { usePortalPopoverProps } from '../../hooks/usePortalPopoverProps'
import useTypedSelector from '../../hooks/useTypedSelector'
import { assetsActions } from '../../modules/assets'

const OrderSelect = () => {
  // Redux
  const dispatch = useDispatch()
  const order = useTypedSelector(state => state.assets.order)

  const popoverProps = usePortalPopoverProps()

  return (
    <MenuButton
      button={
        <Button
          fontSize={1}
          icon={SortIcon}
          mode="bleed"
          padding={3}
          text={getOrderTitle(order.field, order.direction)}
        />
      }
      id="order"
      menu={
        <Menu>
          {ORDER_OPTION_GROUPS.map((group, groupIndex) => (
            <Fragment key={group[0].field}>
              {groupIndex > 0 && <MenuDivider />}
              {group.map(item => {
                const selected = order.field === item.field && order.direction === item.direction
                return (
                  <MenuItem
                    disabled={selected}
                    fontSize={1}
                    iconRight={selected}
                    key={`${item.field}-${item.direction}`}
                    onClick={() =>
                      dispatch(
                        assetsActions.orderSet({
                          order: { direction: item.direction, field: item.field }
                        })
                      )
                    }
                    padding={2}
                    selected={selected}
                    gap={4}
                    style={{ minWidth: '200px' }}
                    text={getOrderTitle(item.field, item.direction)}
                  />
                )
              })}
            </Fragment>
          ))}
        </Menu>
      }
      popover={popoverProps}
    />
  )
}

export default OrderSelect
