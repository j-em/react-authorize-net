import PropTypes from 'prop-types'
import R from 'ramda'
import React from 'react'
import Accept from './accept-js'

import {
  validateCardCode,
  validateCardNumber,
  validateExpDate
} from './validation'

export enum AuthorizeNetScriptUrl {
  Production = 'https://js.authorize.net/v1/Accept.js',
  Sandbox = 'https://jstest.authorize.net/v1/Accept.js'
}

export interface FormType {
  cardNumber: string
  cardCode: string
  expDate: string
}

export interface State {
  apiErrors: string[]
  values: FormType
  focused?: keyof FormType
}
export interface Props {
  environment: 'sandbox' | 'production'
  clientKey: string
  apiLoginId: string
  onSuccess?: (Response: Accept.Response) => void
  onError?: (errors: string[]) => void
  amount?: number
  component?: React.FunctionComponent<InjectedProps>
  render?: React.FunctionComponent<InjectedProps>
  children?: React.FunctionComponent<InjectedProps>
  initialState?: State
}

type TPropTypes = {
  [T in keyof Props]:
    | PropTypes.Validator<Props[T]>
    | PropTypes.Requireable<Props[T]>
}

export interface InjectedProps extends State {
  amount?: number
  validationErrors: { [K in keyof FormType]: boolean }
  handleSubmit: () => void
  handleFocus: (
    field: keyof FormType,
    ev: React.FocusEvent<HTMLInputElement>
  ) => React.FocusEvent<HTMLInputElement>

  handleBlur: (
    ev: React.FocusEvent<HTMLInputElement>
  ) => React.FocusEvent<HTMLInputElement>
  handleChange: (
    field: keyof FormType,
    ev: React.ChangeEvent<HTMLInputElement>
  ) => React.ChangeEvent<HTMLInputElement>
}

export default class FormContainer extends React.Component<Props, State> {
  static propTypes: Partial<TPropTypes> = {
    amount: PropTypes.number,
    apiLoginId: PropTypes.string.isRequired,
    children: PropTypes.func,
    clientKey: PropTypes.string.isRequired,
    component: PropTypes.func,
    environment: PropTypes.oneOf<'sandbox' | 'production'>([
      'sandbox',
      'production'
    ]).isRequired,
    render: PropTypes.func
  }

  static runValidations: (
    values: FormType
  ) => { [K in keyof FormType]: boolean } = formValues => ({
    cardCode: validateCardCode(formValues.cardCode),
    cardNumber: validateCardNumber(formValues.cardNumber.replace(/\s/g, '')),
    expDate: validateExpDate(formValues.expDate)
  })

  state = this.props.initialState || {
    apiErrors: [],
    focused: undefined,
    values: { cardNumber: '', cardCode: '', expDate: '' }
  }

  constructor(props: any) {
    super(props)
    this.submitHandler = this.submitHandler.bind(this)
    this.changeHandler = this.changeHandler.bind(this)
    this.blurHandler = this.blurHandler.bind(this)
    this.focusHandler = this.focusHandler.bind(this)
  }

  componentDidMount() {
    const script = document.createElement('script')

    switch (this.props.environment) {
      case 'production':
        script.src = AuthorizeNetScriptUrl.Production
        break
      case 'sandbox':
        script.src = AuthorizeNetScriptUrl.Sandbox
        break
    }
    document.head.appendChild(script)
  }

  componentWillUnmount() {
    const head = document.head
    const scripts = head.getElementsByTagName('script')

    Array.from(scripts)
      .filter(
        script =>
          script.src === AuthorizeNetScriptUrl.Production ||
          script.src === AuthorizeNetScriptUrl.Sandbox
      )
      .forEach(injectedScript => head.removeChild(injectedScript))
  }
  submitHandler(): Promise<Accept.Response> {
    const authData = {
      apiLoginID: this.props.apiLoginId,
      clientKey: this.props.clientKey
    }

    const [month, year] = this.state.values.expDate.split('/');

    const cardData = {
      cardCode: this.state.values.cardCode,
      cardNumber: this.state.values.cardNumber.replace(/\s/g, ''),
      month,
      year
    }

    const secureData = { authData, cardData }

    return Accept.dispatchData(secureData)
      .then(response => {
        this.setState({
          values: { cardCode: '', cardNumber: '', expDate: '' }
        })
        if (this.props.onSuccess) {
          this.props.onSuccess(response)
        }
        return response
      })
      .catch(response => {
        this.setState({
          apiErrors: response.messages.message.map((err: any) => err.text)
        })
        if (this.props.onError) {
          this.props.onError(response)
        }

        throw response
      })
  }

  changeHandler(
    field: keyof FormType,
    ev: React.ChangeEvent<HTMLInputElement>
  ) {
    this.setState(oldState => ({
      ...oldState,
      values: {
        ...oldState.values,
        [field]: ev.target.value
      }
    }))
    return ev
  }

  focusHandler(field: keyof FormType, ev: React.FocusEvent<HTMLInputElement>) {
    this.setState({ focused: field })
    return ev
  }

  blurHandler(ev: React.FocusEvent<HTMLInputElement>) {
    this.setState({ focused: undefined })
    return ev
  }

  render() {
    const View =
      this.props.render || this.props.component || this.props.children

    return View ? (
      <div>
        <View
          amount={this.props.amount}
          apiErrors={this.state.apiErrors}
          focused={this.state.focused}
          handleChange={this.changeHandler}
          handleFocus={this.focusHandler}
          handleBlur={this.blurHandler}
          handleSubmit={this.submitHandler}
          validationErrors={FormContainer.runValidations(
            R.pick(['cardCode', 'cardNumber', 'expDate'], this.state.values)
          )}
          values={R.pick(
            ['cardCode', 'cardNumber', 'expDate'],
            this.state.values
          )}
        />
      </div>
    ) : null
  }
}
