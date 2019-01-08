export const validateCardCode = (input: string) =>
  RegExp(/^\d{3}\d?$/).test(input)

export const validateCardNumber = (input: string) =>
  RegExp(/^\d{4}-?\d{4}-?\d{4}-?\d{4}$/).test(input)

export const validateExpDate = (input: string) =>
  RegExp(/^\d\d\/\d\d$/).test(input)
