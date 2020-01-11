import React, { useEffect, useState } from 'react'

type FetchProps = {
  url: string
  children: (response: any) => React.ReactElement<any>
}

export const Fetch: React.FC<FetchProps> = props => {
  const [body, setBody] = useState(undefined)

  useEffect(() => {
    fetch(props.url)
      .then(raw => raw.json())
      .then(json => setBody(json))
  }, [props.url])
  return body ? props.children(body) : null
}

export default Fetch
