import * as Actions from './actionConsts'

export const actionDisp = (type: string) => (payload: any) => ({
  type,
  payload
})

// delete

export const updateDeleteDetail = actionDisp(Actions.UPDATE_DELETE_DETAIL)
export const cancelDeleteDetail = actionDisp(Actions.CANCEL_DELETE_DETAIL)
export const fetchDeleteDetail = actionDisp(Actions.FETCH_DELETE_DETAIL)

// edit

export const onTableRowEdit = actionDisp(Actions.TABLE_ROW_EDIT)
export const onAttributeEdit = actionDisp(Actions.ATTRIBUTE_EDIT)
export const onTableEditCancel = actionDisp(Actions.TABLE_EDIT_CANCEL)
export const onAttributeEditCancel = actionDisp(Actions.ATTRIBUTE_EDIT_CANCEL)
export const onIndexEditSubmit = actionDisp(Actions.INDEX_EDIT_SUBMIT)
export const onDetailTableEditSubmit = actionDisp(
  Actions.DETAIL_TABLE_EDIT_SUBMIT
)
export const onDetailAttributeEditSubmit = actionDisp(
  Actions.DETAIL_ATTRIBUTE_EDIT_SUBMIT
)
export const onEditInputChange = actionDisp(Actions.EDIT_INPUT_CHANGE)
export const onInlineFileSubmit = actionDisp(Actions.INLINE_FILE_SUBMIT)
export const onInlineFileDelete = actionDisp(Actions.INLINE_FILE_DELETE)
export const onValidationErrorEdit = actionDisp(Actions.VALIDATION_ERROR_EDIT)
export const onValidationErrorTableRow = actionDisp(
  Actions.VALIDATION_ERROR_TABLE_ROW
)
export const onDetailTableRemoveSubmit = actionDisp(
  Actions.DETAIL_TABLE_REMOVE_SUBMIT
)

// input

export const onMenuOpen = actionDisp(Actions.MENU_OPEN)

// create

export const onCreateInputChange = actionDisp(Actions.CREATE_INPUT_CHANGE)
export const onCancelCreate = actionDisp(Actions.CANCEL_CREATE)
export const onSaveCreate = actionDisp(Actions.SAVE_CREATE)
export const onSaveCreateSuccessful = actionDisp(Actions.SAVE_CREATE_SUCCESSFUL)
export const onStackCreate = actionDisp(Actions.STACK_CREATE)
export const onDetailCreate = actionDisp(Actions.DETAIL_CREATE)
export const onIndexCreate = actionDisp(Actions.INDEX_CREATE)
export const onUpdateFormStackIndex = actionDisp(
  Actions.UPDATE_FORM_STACK_INDEX
)
export const onValidationErrorCreate = actionDisp(
  Actions.VALIDATION_ERROR_CREATE
)

// tooltip

export const fetchModelTooltip = actionDisp(Actions.FETCH_MODEL_TOOLTIP)
export const updateModelTooltip = actionDisp(Actions.UPDATE_MODEL_TOOLTIP)

// tableView

export const changePage = actionDisp(Actions.CHANGE_PAGE)
export const collapseTableChange = actionDisp(Actions.COLLAPSE_TABLE_CHANGE)
export const indexAddFilter = actionDisp(Actions.INDEX_ADD_FILTER)
export const indexClearFilters = actionDisp(Actions.INDEX_CLEAR_FILTERS)
export const indexChangeFilterField = actionDisp(
  Actions.INDEX_CHANGE_FILTER_FIELD
)
export const indexDeleteFilter = actionDisp(Actions.INDEX_DELETE_FILTER)
export const indexTableFilterChange = actionDisp(
  Actions.INDEX_TABLE_FILTER_CHANGE
)
export const indexTableFilterSubmit = actionDisp(
  Actions.INDEX_TABLE_FILTER_SUBMIT
)
export const indexTableFilterDropdown = actionDisp(
  Actions.INDEX_TABLE_FILTER_DROPDOWN
)
export const indexTableSortChange = actionDisp(Actions.INDEX_TABLE_SORT_CHANGE)
export const changeRelTablePage = actionDisp(Actions.CHANGE_REL_TABLE_PAGE)
export const changeGotoPage = actionDisp(Actions.CHANGE_GOTO_PAGE)
export const changeRelGotoPage = actionDisp(Actions.CHANGE_REL_GOTO_PAGE)

// model

export const fetchModelDetail = actionDisp(Actions.FETCH_MODEL_DETAIL)
export const fetchModelIndex = actionDisp(Actions.FETCH_MODEL_INDEX)
export const updateModelDetail = actionDisp(Actions.UPDATE_MODEL_DETAIL)
export const updateModelIndex = actionDisp(Actions.UPDATE_MODEL_INDEX)
export const modelNotFound = actionDisp(Actions.MODEL_NOT_FOUND)
export const requestDeleteModel = actionDisp(Actions.REQUEST_DELETE_MODEL)
export const updateDeleteModel = actionDisp(Actions.UPDATE_DELETE_MODEL)
export const requestDeleteRelTableModel = actionDisp(
  Actions.REQUEST_DELETE_REL_TABLE_MODEL
)
export const requestDeleteModelFromDetailPage = actionDisp(
  Actions.REQUEST_DELETE_MODEL_FROM_DETAIL_PAGE
)
export const removeInstance = actionDisp(Actions.REMOVE_INSTANCE)

// search

export const fetchSearchEntries = actionDisp(Actions.FETCH_SEARCH_ENTRIES)
export const searchQueryTextChange = actionDisp(
  Actions.SEARCH_QUERY_TEXT_CHANGED
)
export const searchQueryLinkClicked = actionDisp(
  Actions.SEARCH_QUERY_LINK_CLICKED
)
export const updateSearchEntries = actionDisp(Actions.UPDATE_SEARCH_ENTRIES)
export const onSearchBlur = actionDisp(Actions.SEARCH_BLUR)
export const onTriggerSearch = actionDisp(Actions.TRIGGER_SEARCH)

// options

export const dataOptionsUpdate = actionDisp(Actions.DATA_OPTIONS_UPDATE)
export const existingValueUpdate = actionDisp(Actions.EXISTING_VALUE_UPDATE)
export const querySelectMenuOpen = actionDisp(Actions.QUERY_SELECT_MENU_OPEN)
export const relationshipSelectMenuOpen = actionDisp(
  Actions.RELATIONSHIP_SELECT_MENU_OPEN
)

// alerts

export const addDangerAlert = actionDisp(Actions.ADD_DANGER_ALERT)
export const addSuccessAlert = actionDisp(Actions.ADD_SUCCESS_ALERT)
export const dismissAlert = actionDisp(Actions.DISMISS_ALERT)

// validation

export const saveCreateCheck = actionDisp(Actions.SAVE_CREATE_CHECK)
export const detailAttributeEditSubmitCheck = actionDisp(
  Actions.DETAIL_ATTRIBUTE_EDIT_SUBMIT_CHECK
)
export const detailTableEditSubmitCheck = actionDisp(
  Actions.DETAIL_TABLE_EDIT_SUBMIT_CHECK
)
export const indexEditSubmitCheck = actionDisp(Actions.INDEX_EDIT_SUBMIT_CHECK)
