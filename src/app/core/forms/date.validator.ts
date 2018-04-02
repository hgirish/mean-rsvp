import { AbstractControl, ValidatorFn } from '@angular/forms'
import { DATE_REGEX } from './formUtils.factory'

export function dateValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const dateStr = control.value

    if (!DATE_REGEX.test(dateStr)) {
      return null
    }

    const monthLengthArr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    const invalidObj = { date: true }

    const dateArr = dateStr.split('/')
    const month = parseInt(dateArr[0], 10)
    const day = parseInt(dateArr[1], 10)
    const year = parseInt(dateArr[2], 10)

    const now = new Date()

    if (year < now.getFullYear() || year > 3000 || month === 0 || month > 12) {
      return invalidObj
    }

    if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
      monthLengthArr[1] = 29
    }

    if (!(day > 0 && day <= monthLengthArr[month - 1])) {
      return invalidObj
    }

    const date = new Date(dateStr)
    if (date <= now) {
      return invalidObj
    }

    return null
  }
}
