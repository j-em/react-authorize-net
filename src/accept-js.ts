const dispatchData = async (payload: {
  authData: Accept.AuthData
  cardData: Accept.CardData
}): Promise<Accept.Response> => {
  return new Promise((resolve, reject) =>
    Accept.dispatchData(payload, response => {
      switch (response.messages.resultCode) {
        case 'Ok':
          resolve(response)
          break

        case 'Error':
          reject(response)
          break
      }
    })
  )
}

export default { dispatchData }
