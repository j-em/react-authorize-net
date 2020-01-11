import { parse } from 'query-string'
import React, { useEffect, useState } from 'react'

declare global {
  interface Window {
    AuthorizeNetIFrame: { onReceiveCommunication: (queryStr: string) => void }
  }
}

type TransactionResponse = {
  accountNumber: string
  accountType:
    | 'Visa'
    | 'MasterCard'
    | 'Discover'
    | 'AmericanExpress'
    | 'DinersClub'
    | 'JCB'
    | 'eCheck'

  authCode: string
  avsResultCode:
    | 'A'
    | 'B'
    | 'E'
    | 'G'
    | 'N'
    | 'P'
    | 'R'
    | 'S'
    | 'U'
    | 'W'
    | 'X'
    | 'Y'
    | 'Z'
  cvvResultCode: 'M' | 'N' | 'P' | 'S' | 'U'
  errors?: ReadonlyArray<{ errorCode: string; errorText: string }>
  messages: ReadonlyArray<{ code: string; description: string }>
  responseCode: '1' | '2' | '3' | '4'
  transId: string
}

type Message =
  | {
      action: 'resizeWindow'
      width: number
      height: number
    }
  | {
      action: 'cancel'
    }
  | {
      action: 'transactResponse'
      response: string
    }

function isValidMessage(o: unknown): o is Message {
  return typeof o === 'object' && o !== null
}

function isValidTransaction(o: unknown): o is TransactionResponse {
  return o !== null && o !== undefined && typeof o === 'object'
}

const AuthorizeNetPostUrl = {
  production: 'https://accept.authorize.net/payment/payment',
  sandbox: 'https://test.authorize.net/payment/payment'
}

type AcceptHostedProps = {
  style?: React.CSSProperties
  className?: string
  formToken: string
  mode?: 'sandbox' | 'production'
  type?: 'redirect' | 'iframe'

  onReceiveCommunication?: (queryStr: string) => void
  onMessage?: (message: Message) => void

  onCancel?: () => void
  onResize?: (width: number, height: number) => void
  onTransact?: (response: TransactionResponse) => void
}

export const AcceptHosted: React.FC<AcceptHostedProps> = ({
  formToken,
  mode = 'sandbox',
  type = 'iframe',
  onMessage,
  style,
  className,
  children,
  onReceiveCommunication,
  onCancel,
  onResize,
  onTransact
}) => {
  const formTrigger = children ? children : <button>Pay</button>

  useEffect(() => {
    window.AuthorizeNetIFrame = {
      onReceiveCommunication: queryStr => {
        onReceiveCommunication && onReceiveCommunication(queryStr)

        const message: unknown = parse(queryStr)
        if (isValidMessage(message)) {
          onMessage && onMessage(message)

          switch (message.action) {
            case 'transactResponse':
              const json = JSON.parse(message.response)
              if (isValidTransaction(json)) {
                onTransact && onTransact(json)
              }
              break

            case 'resizeWindow':
              onResize && onResize(message.width, message.height)
              break

            case 'cancel':
              onCancel && onCancel()
              break
          }
        }
      }
    }
    return () => {
      delete window.AuthorizeNetIFrame
    }
  }, [])

  const [submitted, setSubmitted] = useState(false)

  switch (type) {
    case 'iframe':
      return (
        <div style={style} className={className}>
          <form
            onSubmit={() => setSubmitted(true)}
            method={'POST'}
            action={AuthorizeNetPostUrl[mode]}
            target={'iframeAuthorizeNet'}
          >
            <input name="token" type={'hidden'} value={formToken} />
            {!submitted && formTrigger}
          </form>

          <iframe
            id={'iframeAuthorizeNet'}
            name={'iframeAuthorizeNet'}
            frameBorder={0}
            width={'100%'}
          />
        </div>
      )

    case 'redirect':
      return (
        <form
          style={style}
          className={className}
          method={'POST'}
          action={AuthorizeNetPostUrl[mode]}
        >
          <input type={'hidden'} name={'token'} value={formToken} />
          {formTrigger}
        </form>
      )
  }
}

export default AcceptHosted
