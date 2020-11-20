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
    const epics: ROEpic[] = []
    const methods = new Set()
    let obj: Record<string, any> = this //eslint-disable-line
    do {
      obj = Object.getPrototypeOf(obj)
      Object.getOwnPropertyNames(obj).forEach(name => methods.add(name))
    } while (Object.getPrototypeOf(obj).constructor.name != 'Epic')
    R.forEach(
      methodName => {
        if (
          !R.includes(methodName, [
            'constructor',
            'makeEpic',
            '__reactstandin__regenerateByEval'
          ])
        ) {
          const epic: ROEpic = (action$, state$) =>
            // @ts-ignore
            this[methodName](action$, state$)
          Object.defineProperty(epic, 'name', { value: this.constructor.name })
          epics.push(epic)
        }
      },
      [...methods]
    )
    return epics
  }
}
