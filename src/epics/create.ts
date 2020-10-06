import { ofType } from 'redux-observable'
import { concat } from 'rxjs'
import { map, mergeMap } from 'rxjs/operators'
import * as R from 'ramda'
import { SAVE_CREATE } from '../actionConsts'
import * as Actions from '../actions'
import * as Logger from '../utils/Logger'
import { selectCreate } from '../utils/create'
import {
  getCreateSubmitValues,
  isValidationError,
  prepValidationErrors
} from '../utils/helpers'
import { Epic } from './epic'

export class CreateEpic extends Epic {
  [SAVE_CREATE](action$: any, state$: any) {
    return action$.pipe(
      ofType(SAVE_CREATE),
      map(R.prop('payload')),
      map((payload: EpicPayload) => {
        const formStack = selectCreate(state$.value)
        const query = this.queryBuilder.buildQuery({
          modelName: payload.modelName,
          queryType: 'create'
        })
        const createValues = getCreateSubmitValues({
          schema: this.schema,
          formStack,
          modelName: payload.modelName as string
        })
        const variables = {
          input: R.omit(['id'], createValues)
        }
        return {
          modelName: payload.modelName,
          variables,
          query
        }
      }),
      mergeMap((context: any) =>
        this.queryBuilder
          .sendRequest({
            query: context.query,
            variables: context.variables
          })
          .then(({ data, error }) => ({ context, data, error }))
      ),
      mergeMap(({ context, data, error }) => {
        if (error) {
          Logger.epicError('saveCreateEpic', context, error)
          const errorActions = []
          if (isValidationError(error.response)) {
            const errors = prepValidationErrors({
              schema: this.schema,
              context,
              error
            })
            errorActions.push(Actions.onValidationErrorCreate({ errors }))
          }
          errorActions.push(
            Actions.addDangerAlert({ message: 'Error submitting form.' })
          )
          return concat(errorActions)
        }
        return concat([
          Actions.onSaveCreateSuccessful({}),
          Actions.addSuccessAlert({
            message: `${context.modelName} successfully created.`
          })
        ])
      })
    )
  }
}
