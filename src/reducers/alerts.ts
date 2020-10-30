import { initState, handleError } from '../utils/alerts'
import {
  ADD_DANGER_ALERT,
  ADD_SUCCESS_ALERT,
  ADD_ALERT,
  DISMISS_ALERT
} from '../actionConsts'
import { SchemaBuilder } from '@autoinvent/conveyor-schema'
import { Reducer } from './reducer'
import * as R from 'ramda'

export class AlertsReducer extends Reducer {
  constructor(schema: SchemaBuilder) {
    super(schema, initState)
  }

  [ADD_DANGER_ALERT](state: any, action: any) {
    return [...state, handleError({ payload: action.payload, type: 'danger' })]
  }
  [ADD_SUCCESS_ALERT](state: any, action: any) {
    return [...state, handleError({ payload: action.payload, type: 'success' })]
  }
  [ADD_ALERT](state: any, action: any) {
    const alertType = R.prop('type', action.payload)
    // @ts-ignore
    return [
      ...state,
      handleError({
        payload: action.payload,
        type: typeof alertType === 'string' ? alertType : 'success'
      })
    ]
  }
  [DISMISS_ALERT](state: any, action: any) {
    return state.filter(
      (obj: any) =>
        R.prop('expiresOn', obj) > R.prop('expiresOn', action.payload)
    )
  }
}
