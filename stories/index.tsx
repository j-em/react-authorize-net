import '@storybook/addon-actions'

import { storiesOf } from '@storybook/react'
import React from 'react'
import { FaArrowLeft, FaInfoCircle } from 'react-icons/fa'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { FormComponent, FormContainer } from '../src'

const AuthorizeNetAuthInfo = {
  clientKey: process.env.AUTHORIZENET_CLIENTKEY,
  apiLoginId: process.env.AUTHORIZENET_LOGINID
}

storiesOf('FormComponent', module)
  .add('with default style', () => {
    return (
      <FormContainer
        {...AuthorizeNetAuthInfo}
        environment="sandbox"
        component={FormComponent}
        amount={25}
      />
    )
  })
  .add('with custom style (using style objects)', () => {
    return (
      <FormContainer
        {...AuthorizeNetAuthInfo}
        environment="sandbox"
        component={props => (
          <FormComponent
            {...props}
            style={{
              form: { backgroundColor: 'white' },
              input: {
                backgroundColor: 'white',
                fontFamily: 'monospace',
                color: 'black',
                border: '1px solid black'
              },
              button: {
                backgroundColor: 'white',
                border: '1px solid black',
                boxShadow: 'none',
                color: 'black'
              }
            }}
          />
        )}
        amount={25}
      />
    )
  })

  .add('with custom style (using styled-components)', () => {
    const StyledForm = styled(FormComponent)`
      font-family: monospace;
      button {
        background-color: white;
        color: black;
        border: 1px solid black;
      }
    `

    return (
      <FormContainer
        {...AuthorizeNetAuthInfo}
        amount={25}
        environment={'sandbox'}
        component={StyledForm}
      />
    )
  })
  .add('as a payment step', () => {
    return (
      <div
        style={{ height: '100vh', backgroundColor: '#6772e5', padding: '20px' }}
      >
        <div
          style={{
            alignItems: 'center',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'inline-flex',
            margin: '1em 0em',
            padding: '16px'
          }}
        >
          <FaArrowLeft color="white" fontSize={'1.5em'} />
          <Text color="white" fontFamily="roboto" pl={2}>
            back
          </Text>
        </div>
        <Flex alignItems="center" px={[3, 5] as any} py={[3, 0] as any}>
          <FaInfoCircle color="white" fontSize="2em" />
          <Text
            color="white"
            fontFamily="roboto"
            fontSize={4}
            fontWeight={'500'}
            textAlign="center"
            p={3}
          >
            Payment details
          </Text>
        </Flex>

        <FormContainer
          {...AuthorizeNetAuthInfo}
          environment={'sandbox'}
          amount={25}
        />
      </div>
    )
  })
