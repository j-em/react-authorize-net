import { mount, shallow } from 'enzyme'
import R from 'ramda'
import * as React from 'react'
// @ts-ignore
import Accept from '../src/accept-js'
import {
  AuthorizeNetScriptUrl as ScriptUrl,
  InjectedProps,
  Props as FormContainerProps
} from '../src/FormContainer'
import { FormComponent, FormContainer } from '../src/index'
import {
  validateCardCode,
  validateCardNumber,
  validateExpDate
} from '../src/validation'

const Credentials = {
  apiLoginId: process.env.AUTHORIZENET_LOGINID as string,
  clientKey: process.env.AUTHORIZENET_CLIENTKEY as string
}

jest.mock('../src/accept-js')

const TestForm = (props: InjectedProps) => {
  return (
    <form
      id="testForm"
      onSubmit={() => {
        props.handleSubmit()
      }}
    >
      <input
        id="cardCode"
        onFocus={R.curry(props.handleFocus)('cardCode')}
        onBlur={R.curry(props.handleBlur)}
        onChange={e => props.handleChange('cardCode', e)}
      />
      <input
        id="cardNumber"
        onFocus={R.curry(props.handleFocus)('cardNumber')}
        onBlur={R.curry(props.handleBlur)}
        onChange={R.curry(props.handleChange)('cardNumber')}
      />

      <input
        id="expDate"
        onFocus={R.curry(props.handleFocus)('expDate')}
        onChange={R.curry(props.handleChange)('expDate')}
      />

      <button id="submitButton" type="submit" onClick={props.handleSubmit} />
    </form>
  )
}

const TestContainerProps: FormContainerProps = {
  amount: 25,
  apiLoginId: Credentials.apiLoginId,
  clientKey: Credentials.clientKey,
  environment: 'sandbox'
}

describe('Form validation', () => {
  describe('Card code', () => {
    it('should be 3 digits', () => {
      expect(validateCardCode('123')).toBeTruthy()
    })

    it('should be 4 digits', () => {
      expect(validateCardCode('1234')).toBeTruthy()
    })

    it('should not be less than 3 digits', () => {
      expect(validateCardCode('12')).toBeFalsy()
    })
  })

  describe('Card number', () => {
    const testNumber = '5555555555554444'

    it('should be between 13-16 digits', () => {
      expect(validateCardNumber(testNumber)).toBeTruthy()
    })
    it('should not be 13 digits', () => {
      expect(validateCardNumber(R.take(12, testNumber))).toBeFalsy()
    })
    it('should not be more than 16 digits', () => {
      expect(validateCardNumber(`${testNumber}1234`)).toBeFalsy()
    })
  })
  describe('expiration date', () => {
    it('should have valid format', () => {
      expect(validateExpDate('09/12')).toBeTruthy()
    })
  })
})

describe('FormContainer', () => {
  const renderer = jest.fn(TestForm)

  beforeEach(() => {
    renderer.mockClear()
  })

  it('should inject Accept.js library properly when mounting', () => {
    // @ts-ignore
    const container = mount(<FormContainer {...TestContainerProps} />)
    expect(
      Array.from(document.head.getElementsByTagName('script')).some(
        script => script.src === ScriptUrl.Sandbox
      )
    ).toBeTruthy()
    container.unmount()

    container.setProps({ environment: 'production' })
    container.mount()

    expect(
      Array.from(document.head.getElementsByTagName('script')).some(
        script => script.src === ScriptUrl.Production
      )
    ).toBeTruthy()

    container.unmount()
  })

  it('should remove previously injected Accept.js library when unmounting', () => {
    // @ts-ignore
    const container = mount(<FormContainer {...TestContainerProps} />)
    container.unmount()
    expect(
      Array.from(document.head.getElementsByTagName('script')).every(
        script =>
          script.src !== ScriptUrl.Sandbox &&
          script.src !== ScriptUrl.Production
      )
    ).toBeTruthy()
  })

  it('should not render anything if there is no component passed', () => {
    const container = mount(<FormContainer {...TestContainerProps} />)
    expect(container.html()).toBeNull()
  })
  it('should be able to render properly', () => {
    mount(<FormContainer {...TestContainerProps} render={renderer} />)
    expect(renderer).toHaveBeenCalled()

    renderer.mockClear()

    mount(<FormContainer {...TestContainerProps} component={renderer} />)
    expect(renderer).toHaveBeenCalled()

    renderer.mockClear()
    mount(<FormContainer {...TestContainerProps}>{renderer}</FormContainer>)
    expect(renderer).toHaveBeenCalled()
  })

  describe('changeHandler()', () => {
    it('should update form values when called', () => {
      const container = shallow(
        <FormContainer {...TestContainerProps} render={renderer} />
      )
      ;(container.instance() as any).changeHandler('cardCode', {
        target: { value: '1234' }
      })

      expect((container.state() as any).values.cardCode).toBe('1234')
    })
  })

  describe('focusHandler()', () => {
    it('should update the focused form fields properly', () => {
      const container = shallow(
        <FormContainer {...TestContainerProps} render={renderer} />
      )
      ;(container.instance() as any).focusHandler('cardCode')

      expect(container.state('focused')).toBe('cardCode')
    })
  })

  describe('blurHandler()', () => {
    it('should reset the focused state to its initial value', () => {
      const container = shallow(
        <FormContainer {...TestContainerProps} render={renderer} />
      )
      container.setState({ focused: 'cardCode' })
      expect(container.state('focused')).toBe('cardCode')
      ;(container.instance() as any).blurHandler()

      expect(container.state('focused')).toBeUndefined()
    })
  })
  describe('submitHandler()', () => {
    it('should handle successful submission', done => {
      ;(Accept.dispatchData as any).mockResolvedValue({
        messages: { message: [] }
      })
      const container = shallow(
        <FormContainer {...TestContainerProps} render={renderer} />
      )

      const submission = (container.instance() as any).submitHandler()

      submission.then((response: Accept.Response) => {
        expect(response).toBeDefined()
        done()
      })
    })

    it('should handle failed submission', done => {
      ;(Accept.dispatchData as any).mockRejectedValue({
        messages: { message: [{ text: '' }] }
      })

      const container = shallow(
        <FormContainer {...TestContainerProps} render={renderer} />
      )

      const submission = (container.instance() as any).submitHandler()

      submission.catch((response: Accept.Response) => {
        expect(response).toBeDefined()
        done()
      })
    })

    it('should notify onSuccess callback on successful submission', done => {
      ;(Accept.dispatchData as any).mockResolvedValue({
        messages: { message: [] }
      })

      const callback = jest.fn()

      const container = shallow(
        <FormContainer
          {...TestContainerProps}
          onSuccess={callback}
          render={renderer}
        />
      )

      const submission = (container.instance() as any).submitHandler()

      submission.then(() => {
        expect(callback).toBeCalledTimes(1)
        done()
      })
    })

    it('should notify onError callback on failed submission', done => {
      ;(Accept.dispatchData as any).mockRejectedValue({
        messages: { message: [{ text: '' }] }
      })
      const callback = jest.fn()

      const container = shallow(
        <FormContainer
          {...TestContainerProps}
          onError={callback}
          render={renderer}
        />
      )

      const submission = (container.instance() as any).submitHandler()

      submission.catch((response: Accept.Response) => {
        expect(response).toBeDefined()
        done()
      })
    })

    it("should render using the default bundled UI", () => {
      const container = mount(<FormContainer {...TestContainerProps} render={FormComponent} />)
      expect(container).toMatchSnapshot()
      
    })
  })
})
