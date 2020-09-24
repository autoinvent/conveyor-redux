import * as R from 'ramda'
import { combineReducers } from 'redux'
import { AlertsReducer } from './alerts'
import { CreateReducer } from './create'
import { EditReducer } from './edit'
import { ModalReducer } from './modal'
import { ModelReducer } from './model'
import { OptionsReducer } from './options'
import { TooltipReducer } from './tooltip'
import { TableViewReducer } from './tableView'
import { SearchReducer } from './search'
import { SchemaBuilder } from '@autoinvent/conveyor-schema'

const conveyorReducerMap = {
  alerts: AlertsReducer,
  create: CreateReducer,
  edit: EditReducer,
  modal: ModalReducer,
  model: ModelReducer,
  options: OptionsReducer,
  tooltip: TooltipReducer,
  tableView: TableViewReducer,
  search: SearchReducer
}

export class ConveyorReducer {
  constructor(schema: SchemaBuilder, overrides?: any) {
    const identity: (value: any) => any = R.identity
    const mergedReducerMap = R.filter(
      identity,
      R.mergeRight(conveyorReducerMap, overrides)
    )
    R.forEachObjIndexed((Reducer, key) => {
      // @ts-ignore
      this[key] = new Reducer(schema)
    }, mergedReducerMap)
  }

  makeReducer(): any {
    return combineReducers(
      // @ts-ignore
      R.map(Reducer => (state, action) => Reducer.reduce(state, action), this)
    )
  }
}
