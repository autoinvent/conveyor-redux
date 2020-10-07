import * as Actions from '../actions'
import {
  FETCH_MODEL_INDEX,
  FETCH_MODEL_DETAIL,
  REQUEST_DELETE_MODEL,
  REQUEST_DELETE_REL_TABLE_MODEL,
  REQUEST_DELETE_MODEL_FROM_DETAIL_PAGE,
  CHANGE_PAGE
} from '../actionConsts'
import * as R from 'ramda'
import { getFilters, getSort, getPage, getDeleteErrors } from '../utils/helpers'
import { map, mergeMap, switchMap } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { selectTableView } from '../utils/tableView'
import { concat } from 'rxjs'
import * as Logger from '../utils/Logger'
import { Epic } from './epic'

export class ModelEpic extends Epic {
  [FETCH_MODEL_INDEX](action$: any, state$: any) {
    return action$.pipe(
      ofType(FETCH_MODEL_INDEX, CHANGE_PAGE),
      map(R.prop('payload')),
      map((payload: EpicPayload) => {
        const variables = {
          filter: getFilters({
            schema: this.schema,
            modelName: payload.modelName as string,
            tableView: selectTableView(state$.value)
          }),
          sort: getSort({
            schema: this.schema,
            modelName: payload.modelName as string,
            tableView: selectTableView(state$.value)
          }),
          page: getPage({
            modelName: payload.modelName as string,
            tableView: selectTableView(state$.value)
          })
        }
        return { modelName: payload.modelName, variables }
      }),
      mergeMap((context: any) => {
        const query = this.queryBuilder.buildQuery({
          modelName: context.modelName,
          queryType: 'index'
        })
        return this.queryBuilder
          .sendRequest({ query, variables: context.variables })
          .then(({ data, error }) => ({ context, data, error }))
      }),
      map(
        ({ context, data, error }: { context: any; data: any; error: any }) => {
          if (error) {
            return Actions.addDangerAlert({
              message: `Error loading ${context.modelName} index.`
            })
          }
          return Actions.updateModelIndex({
            modelName: context.modelName,
            data
          })
        }
      )
    )
  }

  [FETCH_MODEL_DETAIL](action$: any) {
    return action$.pipe(
      ofType(FETCH_MODEL_DETAIL),
      map(R.prop('payload')),
      map((payload: EpicPayload) => {
        const variables = { id: payload.id }
        return { modelName: payload.modelName, id: payload.id, variables }
      }),
      mergeMap((context: any) => {
        const query = this.queryBuilder.buildQuery({
          modelName: context.modelName,
          queryType: 'detail'
        })
        return this.queryBuilder
          .sendRequest({ query, variables: context.variables })
          .then(({ data, error }) => ({ context, data, error }))
      }),
      switchMap(({ context, data, error }): any => {
        if (error) {
          return concat([
            Actions.addDangerAlert({
              message: `Error loading ${context.modelName} details.`
            }),
            Actions.modelNotFound({
              modelName: context.modelName
            })
          ])
        }
        return concat([
          Actions.updateModelDetail({
            modelName: context.modelName,
            id: context.id,
            data
          })
        ])
      })
    )
  }

  [REQUEST_DELETE_MODEL](action$: any) {
    return action$.pipe(
      ofType(REQUEST_DELETE_MODEL),
      map(R.prop('payload')),
      map((payload: EpicPayload) => {
        const query = this.queryBuilder.buildQuery({
          modelName: payload.modelName,
          queryType: 'delete'
        })
        const variables = { id: payload.id }
        return {
          modelName: payload.modelName,
          id: payload.id,
          query,
          variables
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
      switchMap(({ context, data, error }) => {
        // todo: pass 'node' and 'data' props
        // @ts-ignore
        const displayName = this.schema.getModelLabel({
          modelName: context.modelName
        })

        // get errors from context
        const errors = getDeleteErrors({ data, context })
        if (errors) {
          Logger.epicError('requestDeleteModelEpic', context, error)
          const contactErrors = R.join('. ', errors)
          return concat([
            Actions.addDangerAlert({
              message: `Error deleting ${displayName}. ${contactErrors}`
            })
          ])
        }

        // get errors from 'error' prop
        if (error) {
          Logger.epicError('requestDeleteModelEpic', context, error)
          return concat([
            Actions.addDangerAlert({
              message: `Error deleting ${displayName}.`
            })
          ])
        }

        return concat([
          Actions.updateDeleteModel({
            modelName: context.modelName,
            id: context.id
          }),
          Actions.addSuccessAlert({
            message: `${displayName} was successfully deleted.`
          })
        ])
      })
    )
  }

  [REQUEST_DELETE_REL_TABLE_MODEL](action$: any) {
    return action$.pipe(
      ofType(REQUEST_DELETE_REL_TABLE_MODEL),
      map(R.prop('payload')),
      map((payload: EpicPayload) => {
        const query = this.queryBuilder.buildQuery({
          modelName: payload.modelName,
          queryType: 'delete'
        })
        const variables = { id: payload.id }
        return { ...payload, query, variables }
      }),
      mergeMap((context: any) =>
        this.queryBuilder
          .sendRequest({
            query: context.query,
            variables: context.variables
          })
          .then(({ data, error }) => ({ context, data, error }))
      ),
      switchMap(({ context, data, error }) => {
        // todo: pass node and data props in
        // @ts-ignore
        const displayName = this.schema.getModelLabel({
          modelName: context.modelName
        })

        // get errors from context
        const errors = getDeleteErrors({ data, context })
        if (errors) {
          Logger.epicError('requestDeleteModelEpic', context, error)
          const contactErrors = R.join('. ', errors)
          return concat([
            Actions.addDangerAlert({
              message: `Error deleting ${displayName}. ${contactErrors}`
            })
          ])
        }

        if (error) {
          Logger.epicError('requestDeleteRelTableModelEpic', context, error)
          return concat([
            Actions.addDangerAlert({
              message: `Error deleting ${displayName}.`
            })
          ])
        }

        return concat([
          Actions.fetchModelDetail({
            modelName: context.parentModel,
            id: context.parentId
          }),
          Actions.addSuccessAlert({
            message: `${displayName} was successfully deleted.`
          })
        ])
      })
    )
  }

  [REQUEST_DELETE_MODEL_FROM_DETAIL_PAGE](action$: any) {
    return action$.pipe(
      ofType(REQUEST_DELETE_MODEL_FROM_DETAIL_PAGE),
      map(R.prop('payload')),
      map((payload: EpicPayload) => {
        const query = this.queryBuilder.buildQuery({
          modelName: payload.modelName,
          queryType: 'delete'
        })
        const variables = { id: payload.id }
        return {
          modelName: payload.modelName,
          id: payload.id,
          query,
          variables
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
      switchMap(({ context, data, error }) => {
        // todo: pass node and data props in
        // @ts-ignore
        const displayName = this.schema.getModelLabel({
          modelName: context.modelName
        })

        // get errors from context
        const errors = getDeleteErrors({ data, context })
        if (errors) {
          Logger.epicError('requestDeleteModelEpic', context, error)
          const contactErrors = R.join('. ', errors)
          return concat([
            Actions.addDangerAlert({
              message: `Error deleting ${displayName}. ${contactErrors}`
            })
          ])
        }

        if (error) {
          Logger.epicError(
            'requestDeleteModelFromDetailPageEpic',
            context,
            error
          )
          return concat([
            Actions.addDangerAlert({
              message: `Error deleting ${displayName}.`
            })
          ])
        }

        return concat([
          Actions.removeInstance({
            modelName: context.modelName,
            id: context.id
          }),
          Actions.addSuccessAlert({
            message: `${displayName} was successfully deleted.`
          })
        ])
      })
    )
  }
}
