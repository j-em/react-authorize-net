const successResponse: Accept.Response = {
  messages: { resultCode: 'Ok', message: [] },

  opaqueData: { dataDescriptor: '', dataValue: '' }
}

const dispatchData = (_: {
  authData: Accept.AuthData
  cardData: Accept.CardData
}): Promise<Accept.Response> => {
  return new Promise((resolve, _) => {
    return resolve(successResponse)
  })
}
export { dispatchData }