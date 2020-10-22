import * as R from 'ramda'
import {
  MENU_OPEN,
  DATA_OPTIONS_UPDATE,
  EXISTING_VALUE_UPDATE
} from '../actionConsts'
import { initState } from '../utils/options'
import { Reducer } from './reducer'
import { SchemaBuilder } from '@autoinvent/conveyor-schema'

export class OptionsReducer extends Reducer {
  constructor(schema: SchemaBuilder) {
    super(schema, initState)
  }

  [MENU_OPEN](state: any, action: any) {
    const payload = R.prop('payload', action)
    // @ts-ignore
    const { modelName, fieldName, rawData } = { ...payload }

    // get schema data about the field
    const field1 = this.schema.getField(modelName, fieldName)

    // get the target model from the field:
    const targetModel = R.path(['type', 'target'], field1) as string

    // get drop-down options
    const options = rawData.map((node: any) => ({
      label: this.schema.getDisplayValue({
        modelName: targetModel,
        node
      }),
      value: R.prop('id', node)
    }))

    return R.assocPath([modelName, fieldName], options, state)
  }

  [DATA_OPTIONS_UPDATE](state: any, action: any) {
    const payload = R.prop('payload', action)
    // @ts-ignore
    const { modelName, fieldName } = { ...payload }
    const targetModelName = R.path(
      ['type', 'target'],
      this.schema.getField(modelName, fieldName)
    ) as any
    const getQueryAllName: (obj: any) => string = R.prop('queryAllName')
    const queryAllName: string = getQueryAllName(
      this.schema.getModel(targetModelName)
    )
    const data = R.path(['data', queryAllName, 'result'], payload) as any
    const options = data.map((option: any) => ({
      label: this.schema.getDisplayValue({
        modelName: targetModelName,
        node: option
      }),
      value: R.prop('id', option)
    }))

    return R.assocPath([modelName, fieldName], options, state)
  }

  [EXISTING_VALUE_UPDATE](state: any, action: any) {
    const payload = R.prop('payload', action)
    // @ts-ignore
    const { modelName, fieldName, value } = { ...payload }
    const options = value.map((option: any) => ({
      label: option,
      value: option
    }))

    return R.assocPath([modelName, fieldName], options, state)
  }
}
