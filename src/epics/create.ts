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

        const imageFields = R.filter(
          (obj: any) =>
            this.schema.isFile(
              payload.modelName as string,
              R.prop('fieldName', obj)
            ),
          this.schema.getFields(payload.modelName as string)
        )
        const imageFieldsList = Object.keys(imageFields)
        const omitList = R.append('id', imageFieldsList)

        const variables = {
          input: R.omit(omitList, createValues)
        }

        return {
          modelName: payload.modelName,
          variables,
          query,
          inputWithFile: R.filter(
            n => !R.isNil(n),
            R.pick(imageFieldsList, createValues)
          )
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

        let actions = [
          Actions.addSuccessAlert({
            message: `${context.modelName} successfully created.`
          })
        ]

        const IdPath = ['result', 'id']

        // images exist
        if (!R.isEmpty(R.prop('inputWithFile', context))) {
          actions = R.append(
            Actions.onInlineFileSubmit({
              modelName: context.modelName,
              id: R.path(IdPath, data),
              fileData: context.inputWithFile,
              fromCreate: true
            }),
            actions
          )
        } else {
          // createSuccessful called in inlineFileSubmit; otherwise prepend it here
          actions = R.prepend(Actions.onSaveCreateSuccessful({}), actions)
        }

        return concat(actions)
      })
    )
  }
}
