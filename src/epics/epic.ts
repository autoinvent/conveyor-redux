import * as R from 'ramda'
import { SchemaBuilder } from '@autoinvent/conveyor-schema'

export class Epic {
  schema: SchemaBuilder
  queryBuilder: QueryBuilder

  constructor(schema: SchemaBuilder, queryBuilder: QueryBuilder) {
    this.schema = schema
    this.queryBuilder = queryBuilder
  }

  makeEpic() {
    let epics: ROEpic[] = []
    R.forEach(methodName => {
      if (!R.includes(methodName, ['constructor', 'makeEpic'])) {
        // @ts-ignore
        const epic: ROEpic = (action$, state$) => this[methodName](action$, state$)
        Object.defineProperty(epic, 'name', { value: this.constructor.name })
        epics.push(epic)
      }
    }, Object.getOwnPropertyNames(Object.getPrototypeOf(this)))
    return epics
  }
}