import * as R from 'ramda'
import {
  UPDATE_MODEL_INDEX,
  UPDATE_MODEL_DETAIL,
  UPDATE_DELETE_MODEL,
  REMOVE_INSTANCE,
  MODEL_NOT_FOUND
} from '../actionConsts'
import { initState, updateIndex, getDefaultModelStore } from '../utils/model'
import { SchemaBuilder } from '@autoinvent/conveyor-schema'
import { Reducer } from './reducer'

export class ModelReducer extends Reducer {
  constructor(schema: SchemaBuilder) {
    super(schema, initState)
  }

  [MODEL_NOT_FOUND](state: any, action: any) {
    const modelName = R.path(['payload', 'modelName'], action) as string
    return { ...state, [modelName]: 'NOTFOUND' }
  }

  [UPDATE_MODEL_INDEX](state: any, action: any) {
    const modelName = R.path(['payload', 'modelName'], action) as string
    // @ts-ignore
    const data = R.path(['payload', 'data', 'result'], action)
    return updateIndex(state, modelName, data)
  }

  [UPDATE_MODEL_DETAIL](state: any, action: any) {
    const modelName = R.path(['payload', 'modelName'], action) as string
    // @ts-ignore
    const id = R.path(['payload', 'id'], action) as string
    const store = {
      ...(R.propOr(getDefaultModelStore(), modelName, state) as object)
    } as any
    const oldNode = R.prop(id, store.values)
    const newNode = R.path(['payload', 'data', 'result'], action)

    if (!oldNode) {
      store.order.push(id)
    }
    store.values[id] = newNode

    return { ...state, [modelName]: store }
  }

  [UPDATE_DELETE_MODEL](state: any, action: any) {
    const modelName = R.path(['payload', 'modelName'], action) as string
    const id = R.path(['payload', 'id'], action) as string
    const store = {
      ...(R.propOr(getDefaultModelStore(), modelName, state) as object)
    } as any
    store.values = R.dissoc(id, store.values)
    store.order = R.without([id], store.order)
    return { ...state, [modelName]: store }
  }

  [REMOVE_INSTANCE](state: any, action: any) {
    const modelName = R.path(['payload', 'modelName'], action) as string
    const id = R.path(['payload', 'id'], action) as string
    return R.assocPath(
      [modelName, 'values', id.toString()],
      { result: null },
      state
    )
  }
}
