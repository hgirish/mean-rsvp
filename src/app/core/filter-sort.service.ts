import { Injectable } from '@angular/core'
import { DatePipe } from '@angular/common'

@Injectable()
export class FilterSortService {
  constructor(private datePipe: DatePipe) {}

  private _objArrayCheck(array: any[]): boolean {
    const item0 = array[0]
    const check = !!(
      array.length &&
      item0 !== null &&
      Object.prototype.toString.call(item0) === '[object Object]'
    )
    return check
  }

  search(
    array: any[],
    query: string,
    excludeProps?: string | string[],
    dateFormat?: string
  ) {
    if (!query || !this._objArrayCheck(array)) {
      return array
    }

    const lQuery = query.toLowerCase()
    const isoDateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/ // ISO UTC
    const dateF = dateFormat ? dateFormat : 'medium'
    const filteredArray = array.filter(item => {
      for (const key in item) {
        if (item.hasOwnProperty(key)) {
          if (!excludeProps || excludeProps.indexOf(key) === -1) {
            const thisVal = item[key]
            if (
              typeof thisVal === 'string' &&
              !thisVal.match(isoDateRegex) &&
              thisVal.toLowerCase().indexOf(lQuery) !== -1
            ) {
              return true
            } else if (
              (thisVal instanceof Date ||
                thisVal.toString().match(isoDateRegex)) &&
              this.datePipe
                .transform(thisVal, dateF)
                .toLowerCase()
                .indexOf(lQuery) !== -1
            ) {
              return true
            }
          }
        }
      }
    })
    return filteredArray
  }

  noSearchResults(arr: any[], query: string): boolean {
    return !!(!arr.length && query)
  }

  orderByDate(array: any[], prop: string, reverse?: boolean) {
    if (!prop || !this._objArrayCheck(array)) {
      return array
    }
    const sortedArray = array.sort((a, b) => {
      const dateA = new Date(a[prop]).getTime()
      const dateB = new Date(b[prop]).getTime()
      return !reverse ? dateA - dateB : dateB - dateA
    })
    return sortedArray
  }
}
