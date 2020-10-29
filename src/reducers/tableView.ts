import * as R from 'ramda'
import {
  INDEX_ADD_FILTER,
  INDEX_DELETE_FILTER,
  INDEX_CLEAR_FILTERS,
  INDEX_CHANGE_FILTER_FIELD,
  CHANGE_REL_TABLE_PAGE,
  CHANGE_GOTO_PAGE,
  CHANGE_REL_GOTO_PAGE,
  INDEX_TABLE_SORT_CHANGE,
  INDEX_TABLE_FILTER_SUBMIT,
  COLLAPSE_TABLE_CHANGE,
  CHANGE_PAGE,
  UPDATE_MODEL_INDEX,
  INDEX_TABLE_FILTER_CHANGE,
  INDEX_TABLE_FILTER_DROPDOWN,
  UPDATE_MODEL_DETAIL
} from '../actionConsts'
import {
  initState,
  DEFAULT_PAGINATION_AMT,
  removeAll,
  setValues
} from '../utils/tableView'
import { SchemaBuilder } from '@autoinvent/conveyor-schema'
import { Reducer } from './reducer'

export class TableViewReducer extends Reducer {
  constructor(schema: SchemaBuilder) {
    super(schema, initState)
  }

  [INDEX_ADD_FILTER](state: any, action: any) {
    const payload = R.prop('payload', action)
    const modelName = R.prop('modelName', payload)
    const filterOrder = R.pathOr(
      [],
      [modelName, 'filter', 'filterOrder'],
      state
    ) as any[]
    const newFilterOrder = filterOrder.slice()
    newFilterOrder.push('')
    return R.assocPath(
      [modelName, 'filter', 'filterOrder'],
      newFilterOrder,
      state
    )
  }

  [INDEX_DELETE_FILTER](state: any, action: any) {
    const payload = R.prop('payload', action)
    // @ts-ignore
    const { modelName, index } = { ...payload }
    const filterOrder = R.pathOr(
      [],
      [modelName, 'filter', 'filterOrder'],
      state
    )
    const fieldName = filterOrder[index]
    const newFilterOrder = filterOrder.slice()
    newFilterOrder.splice(index, 1)
    if (R.isNil(newFilterOrder) || R.isEmpty(newFilterOrder)) {
      return removeAll(state, modelName)
    }
    return R.assocPath(
      [modelName, 'filter', 'filterOrder'],
      newFilterOrder,
      R.dissocPath([modelName, 'filter', 'filterValue', fieldName], state)
    )
  }

  [INDEX_CLEAR_FILTERS](state: any, action: any) {
    const payload = R.prop('payload', action)
    const modelName = R.prop('modelName', payload)
    return R.assocPath(
      [modelName, 'page', 'currentPage'],
      0,
      removeAll(state, modelName)
    )
  }

  [INDEX_CHANGE_FILTER_FIELD](state: any, action: any) {
    const payload = R.prop('payload', action)
    // @ts-ignore
    const { modelName, fieldName, index } = { ...payload }
    const filterOrder = R.pathOr(
      [],
      [modelName, 'filter', 'filterOrder'],
      state
    ) as any[]
    const newFilterOrder = filterOrder.slice()
    newFilterOrder[index] = fieldName
    return R.assocPath(
      [modelName, 'filter', 'filterOrder'],
      newFilterOrder,
      state
    )
  }

  [INDEX_TABLE_FILTER_CHANGE](state: any, action: any) {
    const payload = R.prop('payload', action)
    // @ts-ignore
    const { modelName, fieldName, value } = { ...payload }
    return R.assocPath(
      [modelName, 'filter', 'filterValue', fieldName, 'value'],
      value,
      state
    )
  }

  [INDEX_TABLE_FILTER_DROPDOWN](state: any, action: any) {
    const payload = R.prop('payload', action)
    // @ts-ignore
    const { modelName, fieldName, operator } = { ...payload }
    return R.assocPath(
      [modelName, 'filter', 'filterValue', fieldName, 'operator'],
      operator,
      state
    )
  }

  [INDEX_TABLE_FILTER_SUBMIT](state: any, action: any) {
    const payload = R.prop('payload', action)
    const modelName = R.prop('modelName', payload)
    const currentFilters = R.pathOr(
      [],
      [modelName, 'filter', 'filterOrder'],
      state
    )
    const filtersAreActive = !(
      R.isNil(currentFilters) || Object.entries(currentFilters).length === 0
    )
    return R.pipe(
      R.assocPath([modelName, 'filter', 'filtersAreActive'], filtersAreActive),
      R.assocPath([modelName, 'page', 'currentPage'], 0)
    )(state)
  }

  [INDEX_TABLE_SORT_CHANGE](state: any, action: any) {
    const payload = R.prop('payload', action)
    // @ts-ignore
    const { modelName, fieldName, sortKey } = { ...payload }
    return R.pipe(
      R.assocPath([modelName, 'sort'], { fieldName, sortKey }),
      R.assocPath([modelName, 'page', 'currentPage'], 0)
    )(state)
  }

  [COLLAPSE_TABLE_CHANGE](state: any, action: any) {
    const payload = R.prop('payload', action)
    // @ts-ignore
    const { modelName, fieldName, collapse } = { ...payload }
    return R.assocPath(
      [modelName, 'fields', fieldName, 'collapse'],
      !collapse,
      state
    )
  }

  [CHANGE_PAGE](state: any, action: any) {
    const payload = R.prop('payload', action)
    // @ts-ignore
    const { modelName, updatedPageIndex, isValid = true } = { ...payload }
    const newState = R.assocPath([modelName, 'page', 'canGoto'], isValid, state)
    if (!isValid) {
      return newState
    }
    return R.assocPath(
      [modelName, 'page', 'currentPage'],
      updatedPageIndex,
      newState
    )
  }

  // todo: make sure works
  [CHANGE_REL_TABLE_PAGE](state: any, action: any) {
    const payload = R.prop('payload', action)
    // @ts-ignore
    const { modelName, fieldName, updatedPageIndex, isValid = true } = {
      ...payload
    }
    const newState = R.assocPath(
      [modelName, 'fields', fieldName, 'page', 'canGoto'],
      isValid,
      state
    )
    if (!isValid) {
      return newState
    }
    return R.assocPath(
      [modelName, 'fields', fieldName, 'page', 'currentPage'],
      updatedPageIndex,
      newState
    )
  }

  [CHANGE_GOTO_PAGE](state: any, action: any) {
    const payload = R.prop('payload', action)
    // @ts-ignore
    const { modelName, pageIndex } = { ...payload }
    return R.assocPath([modelName, 'page', 'goto'], pageIndex, state)
  }

  // todo: make sure works
  [CHANGE_REL_GOTO_PAGE](state: any, action: any) {
    const payload = R.prop('payload', action)
    // @ts-ignore
    const { modelName, fieldName, pageIndex } = { ...payload }
    return R.assocPath(
      [modelName, 'fields', fieldName, 'page', 'goto'],
      pageIndex,
      state
    )
  }

  [UPDATE_MODEL_INDEX](state: any, action: any) {
    const payload = R.prop('payload', action)
    const modelName = R.prop('modelName', payload)
    // @ts-ignore
    const count = R.path(['payload', 'data', 'count'], action)

    let lastIndex = null
    if (count) {
      // @ts-ignore
      lastIndex = Math.ceil(count / DEFAULT_PAGINATION_AMT)
    }

    return R.pipe(
      R.assocPath([modelName, 'page', 'lastIndex'], lastIndex),
      R.assocPath([modelName, 'page', 'total'], count),
      R.assocPath([modelName, 'page', 'amtPerPage'], DEFAULT_PAGINATION_AMT)
    )(state)
  }

  [UPDATE_MODEL_DETAIL](state: any, action: any) {
    const payload = R.prop('payload', action)
    const modelName = R.prop('modelName', payload)
    // @ts-ignore
    const newNode = R.path(['payload', 'data', 'result'], action)

    if (newNode) {
      // @ts-ignore
      for (const [fieldName, obj] of Object.entries(newNode) as any) {
        const type = this.schema.getType(modelName, fieldName)

        // if multi-rel type
        if (type && type.includes('ToMany') && !R.isEmpty(obj)) {
          const totalDataLength = obj.length
          const lastIndexRel = Math.ceil(
            totalDataLength / DEFAULT_PAGINATION_AMT
          )
          if (lastIndexRel > 0) {
            state = R.pipe(
              R.assocPath(
                [modelName, 'fields', fieldName, 'page', 'lastIndex'],
                lastIndexRel
              ),
              R.assocPath(
                [modelName, 'fields', fieldName, 'page', 'total'],
                totalDataLength
              ),
              R.assocPath(
                [modelName, 'fields', fieldName, 'page', 'amtPerPage'],
                DEFAULT_PAGINATION_AMT
              )
            )(state)
          }
        }
      }
    }
    return state
  }
}
