import '@storybook/addon-actions'
import centered from '@storybook/addon-centered'
import { text, withKnobs } from '@storybook/addon-knobs/react'
import { storiesOf } from '@storybook/react'
import React from 'react'
import { FaArrowLeft, FaInfoCircle } from 'react-icons/fa'
import { Box, Button, Flex, Text } from 'rebass'
import { FormComponent, FormContainer } from '../src/index'
import Input from '../src/Input'

const DefaultContainer = _ => (
  <FormContainer
    clientKey={process.env.AUTHORIZENET_CLIENTKEY}
    apiLoginId={process.env.AUTHORIZENET_LOGINID}
    environment="sandbox"
    component={FormComponent}
    amount={25}
  />
)

storiesOf('FormContainer', module)
  .add('standalone', () => {
    return <DefaultContainer />
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

        <DefaultContainer />
      </div>
    )
  })
