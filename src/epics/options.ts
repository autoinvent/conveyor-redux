import { getSort } from '../utils/helpers'
import { concat } from 'rxjs'
import { map, mergeMap, switchMap } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import * as Actions from '../actions'
import {
  QUERY_SELECT_MENU_OPEN,
  RELATIONSHIP_SELECT_MENU_OPEN
} from '../actionConsts'
import * as Logger from '../utils/Logger'
import * as R from 'ramda'
import { Epic } from './epic'
import { EpicPayload } from '../types'

/**
 * A class containing Epics which handle options (Selectable string menus, relation dropdown menus, etc.)
 */
export class OptionsEpic extends Epic {
  /**
   * Dispatched when opening a 'creatable_string_select' field's menu.
   * @param action$ object {type: string, payload: {modelName: string, fieldName: string}}
   * @returns - Actions.[existingValueUpdate](./optionsreducer.html#existing_value_update)({modelName: string, fieldName: string, data: object})
   */
  [QUERY_SELECT_MENU_OPEN](action$: any) {
    return action$.pipe(
      ofType(QUERY_SELECT_MENU_OPEN),
      map(R.prop('payload')),
      map((payload: EpicPayload) => {
        const modelName = R.prop('modelName', payload)
        const fieldName = R.prop('fieldName', payload)
        const variables = {
          modelName: payload.modelName,
          fieldName: payload.fieldName
        }

        return { variables, modelName, fieldName }
      }),
      mergeMap((context: any) => {
        const query = this.queryTool.buildQuery({
          modelName: context.modelName,
          fieldName: context.fieldName,
          queryType: 'selectExistingFields'
        })

        return this.queryTool
          .sendRequest({ query, variables: context.variables })
          .then(({ data, error }) => ({
            context,
            data,
            error
          }))
      }),
      map(
        ({ context, data, error }: { context: any; data: any; error: any }) => {
          if (error) {
            Logger.epicError('querySelectMenuOpenEpic', context, error)

            return Actions.addDangerAlert({
              message: 'Error loading form option.'
            })
          }

          return Actions.existingValueUpdate({
            modelName: context.modelName,
            fieldName: context.fieldName,
            value: data
          })
        }
      )
    )
  }

  /**
   * Dispatched when opening a relation field's dropdown menu.
   * @param action$ object {type: string, payload: {modelName: string, fieldName: string}}
   * @returns - \[ \
   *  Actions.[dataOptionsUpdate](./optionsreducer.html#data_options_update)({modelName: string, fieldName: string, data: object}), \
   *  Actions.[updateModelIndex](./modelreducer.html#update_model_index)({modelName: string, data: object}) \
   * ]
   */
  [RELATIONSHIP_SELECT_MENU_OPEN](action$: any) {
    return action$.pipe(
      ofType(RELATIONSHIP_SELECT_MENU_OPEN),
      map(R.prop('payload')),
      map((payload: EpicPayload) => {
        const modelName = R.prop('modelName', payload) as string
        const fieldName = R.prop('fieldName', payload) as string
        const field = this.schema.getField(modelName, fieldName)
        const targetModel = R.path(['type', 'target'], field) as string
        const variables = {
          sort: getSort({ schema: this.schema, modelName: targetModel })
        }

        return { variables, modelName, fieldName, targetModel }
      }),
      mergeMap((context: any) => {
        const query = this.queryTool.buildQuery({
          modelName: context.targetModel,
          queryType: 'select'
        })

        return this.queryTool
          .sendRequest({ query, variables: context.variables })
          .then(({ data, error }) => ({ context, data, error }))
      }),
      switchMap(({ context, data, error }): any => {
        if (error) {
          Logger.epicError('relationshipSelectMenuOpenEpic', context, error)

          return Actions.addDangerAlert({
            message: 'Error loading form option.'
          })
        }

        return concat([
          Actions.dataOptionsUpdate({
            modelName: context.modelName,
            fieldName: context.fieldName,
            data
          }),
          Actions.updateModelIndex({ modelName: context.targetModel, data })
        ])
      })
    )
  }
}
