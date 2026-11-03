import { TextInput } from '@sanity/ui'
import { type ChangeEvent, type ComponentProps } from 'react'

type Props = Omit<ComponentProps<typeof TextInput>, 'onChange' | 'value'> & {
  onValueChange: (value: number | '') => void
  value?: number
}

const TextInputNumber = (props: Props) => {
  const { onValueChange, value, ...remainingProps } = props

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const regex = /^[0-9\b]+$/

    // Test for number and strip leading zeroes
    if (val === '' || regex.test(val)) {
      onValueChange(parseInt(val, 10) || '')
    }
  }

  return (
    <TextInput
      {...remainingProps}
      onChange={handleChange} //
      value={value ?? ''}
    />
  )
}

export default TextInputNumber
