import * as R from 'ramda'
import {
  SEARCH_QUERY_TEXT_CHANGED,
  SEARCH_QUERY_LINK_CLICKED,
  UPDATE_QUICK_SEARCH_ENTRIES,
  UPDATE_SEARCH_PAGE_ENTRIES,
  SEARCH_QUERY_FILTER_CLICKED,
  SEARCH_BLUR,
  TRIGGER_SEARCH
} from '../actionConsts'
import { initState } from '../utils/search'
import { Reducer } from './reducer'
import { SchemaBuilder } from '@autoinvent/conveyor-schema'
import { Config } from '../types'

/**
 * A class containing reducers handling search actions
 */
export class SearchReducer extends Reducer {
  /**
   * Creates a reducer object that can reduce all reducers into one
   * @param schema - [Conveyor-Schema](https://github.com/autoinvent/conveyor-schema)
   * @param config Custom user inputted configurations
   */
  constructor(schema: SchemaBuilder, config: Config) {
    super(schema, initState, config)
  }

  /**
   * Dispatched by [fetchSearchEntries](./searchepic.html#fetch_search_entries)
   * @param state Redux state
   * @param action object {type: string, payload: {queryString: string, data: object}}
   * @returns Updates conveyor.search.quickSearchEntries with an object containing matching objects in state
   */
  [UPDATE_QUICK_SEARCH_ENTRIES](state: any, action: any) {
    const data: object[] = R.pathOr([], ['payload', 'data'], action)
    if (data.length <= 0) {
      return { ...state, quickSearchEntries: [] }
    }

    const quickSearchEntries = R.pipe(
      R.map((entry: any) => ({
        id: entry.id,
        modelName: entry.__typename,
        // @ts-ignore
        modelLabel: this.schema.getModelLabel({
          modelName: entry.__typename,
          node: entry
        }),
        name: this.schema.getDisplayValue({
          modelName: entry.__typename,
          node: entry
        })
      })),
      R.map((obj) => ({
        ...obj,
        detailURL: `/${obj.modelName}/${obj.id}`
      }))
    )(data)
    return { ...state, quickSearchEntries }
  }

  /**
   * Dispatched by [fetchSearchEntries](./searchepic.html#fetch_search_entries)
   * @param state Redux state
   * @param action object {type: string, payload: {queryString: string, data: object}}
   * @returns Updates conveyor.search.searchPageEntries with an object containing matching objects in state,
   * and conveyor.search.searchPageFilters with an object containing the filter checkboxes to display
   */
  [UPDATE_SEARCH_PAGE_ENTRIES](state: any, action: any) {
    const data: object[] = R.pathOr([], ['payload', 'data'], action)
    if (data.length <= 0) {
      return { ...state, searchPageEntries: [], searchPageFilters: [] }
    }

    const searchPageEntries = R.pipe(
      R.map((entry: any) => ({
        id: entry.id,
        modelName: entry.__typename,
        // @ts-ignore
        modelLabel: this.schema.getModelLabel({
          modelName: entry.__typename,
          node: entry
        }),
        name: this.schema.getDisplayValue({
          modelName: entry.__typename,
          node: entry
        })
      })),
      R.map((obj) => ({
        ...obj,
        detailURL: `/${obj.modelName}/${obj.id}`
      }))
    )(data)

    const modelCounts: object = R.countBy(
      R.prop('modelName'),
      searchPageEntries
    )
    const uniqModels: string[] = R.keys(modelCounts)

    const getFilterObj: (modelName: string) => object | undefined = (
      modelName: string
    ) => R.find(R.propEq('modelName')(modelName))(state.searchPageFilters)

    const searchPageFilters = R.map((modelName: string) => ({
      modelName,
      displayLabel: this.schema.getModelLabelPlural({ modelName }),
      checked: R.propOr(true, 'checked', getFilterObj(modelName)),
      count: R.propOr(0, modelName, modelCounts)
    }))(uniqModels)

    return { ...state, searchPageEntries, searchPageFilters }
  }

  /**
   * Dispatched each time the search input is changed.
   * @param state Redux state
   * @param action object {type: string, payload: {queryText: string}}
   * @returns Updates conveyor.queryText with the new text in state
   */
  [SEARCH_QUERY_TEXT_CHANGED](state: any, action: any) {
    const newQueryText = action.payload.queryText
    if (newQueryText) {
      return R.assoc('queryText', newQueryText, state)
    }
    // Do not reset the searchPageEntries
    return R.assoc('searchPageEntries', state.searchPageEntries, initState)
  }

  /**
   * Dispatched each time a search filter box is checked/unchecked
   * @param state Redux state
   * @param action object {type: string, payload: {modelName: string}}
   * @returns Updates conveyor.search.searchPageFilters by toggling the "checked" value
   * corresponding to the model name that was clicked.
   */
  [SEARCH_QUERY_FILTER_CLICKED](state: any, action: any) {
    const toggleFilter = (
      modelName: string | undefined,
      filters: any
    ): Array<object> =>
      R.map((filter: object) =>
        R.when(
          R.propEq('modelName', modelName),
          R.assoc('checked', R.not(R.prop('checked' as any, filter)))
        )(filter as any)
      )(filters)

    const modelName: string | undefined = R.path(
      ['payload', 'modelName'],
      action
    )

    return R.assoc(
      'searchPageFilters',
      toggleFilter(modelName, state.searchPageFilters),
      state
    )
  }

  /**
   * Dispatched after selecting a search query
   * @returns Sets conveyor.search to its initial state
   */
  [SEARCH_QUERY_LINK_CLICKED]() {
    return initState
  }

  /**
   * Dispatched when clicking outside the search box
   * @param state Redux state
   * @returns Sets conveyor.search.dropdown to false
   */
  [SEARCH_BLUR](state: any) {
    return R.assoc('dropdown', false, state)
  }

  /**
   * Dispatched when clicking inside the search box
   * @param state Redux state
   * @returns Sets conveyor.search.dropdown to true
   */
  [TRIGGER_SEARCH](state: any) {
    return R.assoc('dropdown', true, state)
  }
}
