import { Box, TextInput } from '@sanity/ui'
import { forwardRef, type ComponentProps } from 'react'

import FormFieldInputLabel from '../FormFieldInputLabel'

type Props = {
  description?: string
  disabled?: boolean
  error?: string
  label: string
  name: string
  placeholder?: string
  value?: string
} & Pick<ComponentProps<typeof TextInput>, 'icon'>

type Ref = HTMLInputElement

const FormFieldInputText = forwardRef<Ref, Props>((props: Props, ref) => {
  const { description, disabled, error, label, name, placeholder, value, ...rest } = props

  return (
    <Box>
      {/* Label */}
      <FormFieldInputLabel description={description} error={error} label={label} name={name} />
      {/* Input */}
      <TextInput
        {...rest}
        autoComplete="off"
        autoFocus
        customValidity={error}
        defaultValue={value}
        disabled={disabled}
        id={name}
        name={name}
        placeholder={placeholder}
        ref={ref}
      />
    </Box>
  )
})

export default FormFieldInputText
