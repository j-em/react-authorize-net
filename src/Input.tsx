import React from 'react'
import MaskedInput, { MaskedInputProps } from 'react-text-mask'
import { Box, Flex } from 'rebass'

export interface Props
  extends React.InputHTMLAttributes<HTMLInputElement>,
    MaskedInputProps {
  valid: boolean
  focused: boolean
  label?: JSX.Element | string
}

const Input = (props: Props) => {
  const {
    onChange,
    onFocus,
    onBlur,
    mask,
    valid,
    focused,
    label,
    className,
    ...otherProps
  } = props

  const onChangeHandler: (
    ev: React.ChangeEvent<HTMLInputElement>
  ) => void = ev => {
    ev.persist()
    if (onChange) {
      onChange(ev)
    }
  }

  const onFocusHandler: (
    ev: React.FocusEvent<HTMLInputElement>
  ) => void = ev => {
    ev.persist()
    if (onFocus) {
      onFocus(ev)
    }
  }

  const onBlurHandler: (
    ev: React.FocusEvent<HTMLInputElement>
  ) => void = ev => {
    ev.persist()
    if (onBlur) {
      onBlur(ev)
    }
  }

  return (
    <Flex className={className} alignItems="center">
      {props.label ? (
        <Flex flexDirection={'row-reverse'} mr={2}>
          {props.label}
        </Flex>
      ) : null}
      <Box>
        <MaskedInput
          mask={mask}
          onChange={onChangeHandler}
          onFocus={onFocusHandler}
          onBlur={onBlurHandler}
          style={{
            ...otherProps,
            boxSizing: 'border-box',
            color: 'inherit',
            fontSize: 'inherit',
            width: '100%'
          }}
          {...otherProps}
        />
      </Box>
    </Flex>
  )
}

export default Input
