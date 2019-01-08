import * as Rebass from 'rebass'

declare module 'rebass' {
  export interface BaseProps<C> {
    style?: React.CSSProperties
  }
}
