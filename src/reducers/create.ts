import * as R from 'ramda'
import {
  initState,
  handleCreateInputChange,
  handleStackPop,
  handleClearErrorSave,
  handleStackPush,
  handleDetailCreate,
  handleEnterFormStack,
  handleValidationErrorCreate
} from '../utils/create'
import {
  CREATE_INPUT_CHANGE,
  CANCEL_CREATE,
  SAVE_CREATE_SUCCESSFUL,
  SAVE_CREATE,
  STACK_CREATE,
  DETAIL_CREATE,
  INDEX_CREATE,
  UPDATE_FORM_STACK_INDEX,
  VALIDATION_ERROR_CREATE
} from '../actionConsts'
import { Reducer } from './reducer'
import { SchemaBuilder } from '@autoinvent/conveyor-schema'

export class CreateReducer extends Reducer {
  constructor(schema: SchemaBuilder) {
    super(schema, initState)
  }

  [CREATE_INPUT_CHANGE](state: any, action: any) {
    return handleCreateInputChange(state, action)
  }

  [CANCEL_CREATE](state: any) {
    return handleStackPop(state)
  }

  [SAVE_CREATE_SUCCESSFUL](state: any) {
    return handleStackPop(state)
  }

  [SAVE_CREATE](state: any) {
    return handleClearErrorSave(state)
  }

  [STACK_CREATE](state: any, action: any) {
    return handleStackPush(state, action)
  }

  [DETAIL_CREATE](state: any, action: any) {
    return handleDetailCreate(this.schema, state, action)
  }

  [INDEX_CREATE](state: any, action: any) {
    return handleEnterFormStack(state, action)
  }

  [UPDATE_FORM_STACK_INDEX](state: any, action: any) {
    return R.assoc('index', R.path(['payload', 'index'], action), state)
  }

  [VALIDATION_ERROR_CREATE](state: any, action: any) {
    return handleValidationErrorCreate(state, action)
  }
}
