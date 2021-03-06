import * as R from 'ramda'
import { SchemaBuilder } from '@autoinvent/conveyor-schema'
import type { QueryTool, ROEpic, Config } from '../types'

/**
 * The epic class that each Conveyor Epic types will extend from.
 */
export class Epic {
  /** [Conveyor-Schema](https://github.com/autoinvent/conveyor-schema) */
  schema: SchemaBuilder
  /** Tool for building and sending queries */
  queryTool: QueryTool
  /** Custom user inputted configurations */
  config: Config

  /**
   * Creates an Epic object
   * @param schema - [Conveyor-Schema](https://github.com/autoinvent/conveyor-schema)
   * @param queryTool Tool for building and sending queries
   * @param config Custom user inputted configurations
   */
  constructor(schema: SchemaBuilder, queryTool: QueryTool, config: Config) {
    this.schema = schema
    this.queryTool = queryTool
    this.config = config
  }

  /**
   * Creates epics
   * @returns List of epics
   */
  makeEpic() {
    const epics: ROEpic[] = []
    R.forEach((methodName) => {
      if (!R.includes(methodName, ['constructor', 'makeEpic'])) {
        const epic: ROEpic = (action$, state$) =>
          // @ts-ignore
          this[methodName](action$, state$)
        Object.defineProperty(epic, 'name', { value: this.constructor.name })
        epics.push(epic)
      }
    }, Object.getOwnPropertyNames(Object.getPrototypeOf(this)))
    return epics
  }
}
