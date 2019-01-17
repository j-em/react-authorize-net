import '@storybook/addon-actions'
import centered from "@storybook/addon-centered"
import { text, withKnobs } from '@storybook/addon-knobs/react'
import { storiesOf } from '@storybook/react'
import React from 'react'
import { Helmet } from 'react-helmet'
import { FormComponent, FormContainer } from '../src/index'
import Input from '../src/Input'

storiesOf('Payment form', module)
  .addDecorator(withKnobs)
  .addDecorator(centered)
  .add('with default credentials', () => {
    return (
      <div style={{width: "700px" }}>
        <Helmet>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Helmet>
        <FormContainer
          clientKey={text('clientKey', process.env.AUTHORIZENET_CLIENTKEY)}
          apiLoginId={text('apiLoginId', process.env.AUTHORIZENET_LOGINID)}
          environment="sandbox"
          component={FormComponent}
          amount={25}
        />
      </div>
    )
  })
