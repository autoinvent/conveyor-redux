import * as R from 'ramda'

export const initState = {
  queryText: '',
  quickSearchEntries: [],
  searchPageEntries: [],
  searchPageFilters: [],
  dropdown: false
}

/**
 * Curried function which returns the value of conveyor.search from the passed in value.
 * Returns initState if the value is null
 */
export const selectSearch = R.pathOr(initState, ['conveyor', 'search'])

/**
 * Returns the value of 'dropdown' from the result of [selectSearch](./modules.html#selectsearch)
 * @param state Redux state
 * @returns value of conveyor.search.dropdown in state
 */
export const selectSearchDropdown = (state: any) =>
  R.prop('dropdown', selectSearch(state))

/**
 * Returns value of 'entries' from the result of [selectSearch](./modules.html#selectsearch)
 * @param state Redux state
 * @returns Value of conveyor.search.entries in state
 */
export const selectQuickSearchEntries = (state: any) =>
  R.prop('quickSearchEntries', selectSearch(state))

export const selectSearchPageEntries = (state: any) =>
  R.prop('searchPageEntries', selectSearch(state))

export const selectSearchPageFilters = (state: any) =>
  R.prop('searchPageFilters', selectSearch(state))
/**
 * Returns value of 'queryText' from the result of [selectSearch](./modules.html#selectsearch)
 * @param state Redux state
 * @returns Value of conveyor.search.queryText in state
 */
export const selectSearchQueryText = (state: any) =>
  R.prop('queryText', selectSearch(state))
