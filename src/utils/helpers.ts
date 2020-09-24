import * as R from 'ramda'
import { inputTypes } from '@autoinvent/conveyor-schema'
import * as Actions from '../actions'
import * as consts from '../actionConsts'
import * as Logger from './Logger'
import { SchemaBuilder } from '@autoinvent/conveyor-schema'
import { DEFAULT_PAGINATION_AMT } from './tableView'

export const storeValueToArrayBuffer = (value: number[]) => {
  const arrayBuffer = new ArrayBuffer(value.length)
  const view = new DataView(arrayBuffer)
  for (let i = 0; i < value.length; ++i) {
    view.setUint8(i, value[i])
  }
  return arrayBuffer
}

export const getFilters = ({
  schema,
  modelName,
  tableView
}: {
  schema: SchemaBuilder
  modelName: string
  tableView: any
}) => {
  const fields = schema.getFields(modelName)
  const getFieldFilter = (field: any) => {
    const fieldName: string = R.prop('fieldName', field)
    const operator: string | undefined = R.path(
      [modelName, 'filter', 'filterValue', fieldName, 'operator', 'value'],
      tableView
    )
    const value: any = R.path(
      [modelName, 'filter', 'filterValue', fieldName, 'value'],
      tableView
    )
    if (operator && schema.isBoolean(modelName, fieldName)) {
      return { operator, value: R.isNil(value) ? false : value }
    }
    if (operator && !R.isNil(value) && !R.isEmpty(value)) {
      if (schema.isRel(modelName, fieldName)) {
        if (
          schema.isManyToOne(modelName, fieldName) ||
          schema.isOneToOne(modelName, fieldName)
        ) {
          return { operator, value: R.propOr(value, 'value', value) }
        }
        return { operator, value: value.map((val: any) => val.value) }
      }
      if (schema.isEnum(modelName, fieldName)) {
        return { operator, value: value.value }
      }
      return { operator, value }
    }
    return undefined
  }
  let filters: any = R.map(getFieldFilter, fields)
  // filterFields: default filters, in addition filters set by user; always active
  const defaultFilters: any = R.path(
    [modelName, 'filterFields'],
    schema.schemaJSON
  )
  if (defaultFilters) {
    filters = R.merge(filters, defaultFilters)
  }
  return R.filter<any>(R.identity, filters)
}

export const getSort = ({
  schema,
  modelName,
  tableView
}: {
  schema: SchemaBuilder
  modelName: string
  tableView?: any
}): any => {
  // get sort from user input
  if (tableView) {
    const sortKey: string | undefined = R.path(
      [modelName, 'sort', 'sortKey'],
      tableView
    )
    const fieldName: string | undefined = R.path(
      [modelName, 'sort', 'fieldName'],
      tableView
    )
    if (sortKey && fieldName) {
      return [`${fieldName}_${sortKey}`]
    }
  }
  // otherwise, get default sort from schema
  // sortFields: camel-case fields followed by '_asc' or '_desc'.
  return R.path([modelName, 'sortFields'], schema.schemaJSON)
}

export const getPage = ({
  modelName,
  tableView
}: {
  modelName: string
  tableView: any
}) => {
  const currentPage = R.pathOr(1, [modelName, 'page', 'currentPage'], tableView)
  // eslint-disable-next-line @typescript-eslint/camelcase
  return { current: currentPage, per_page: DEFAULT_PAGINATION_AMT }
}

export const editFieldToQueryInput = ({
  schema,
  modelName,
  fieldName,
  value,
  type
}: {
  schema?: SchemaBuilder
  modelName: string
  fieldName: string
  value: any
  type?: any
}) => {
  if (type === undefined && schema) {
    type = schema.getType(modelName, fieldName)
  }
  if (fieldName === '__typename') {
    return
  }
  if (type.includes('ToMany')) {
    if (R.isNil(value)) {
      return []
    }
    return value.map((value: any) => R.prop('value', value))
  } else if (type.includes('ToOne')) {
    return R.propOr(null, 'value', value)
  } else if (type === 'enum') {
    return R.propOr(null, 'value', value)
  } else if (type === 'file') {
    if (R.isNil(value)) {
      return value
    }
    return storeValueToArrayBuffer(value)
  } else if (type === 'boolean') {
    return typeof value === typeof false ? value : false
  }
  return value
}

export const isValidationError = (response: any) =>
  R.prop('status', response) === 200

const errorMap = ({
  schema,
  type,
  fields,
  message,
  modelName
}: {
  schema: SchemaBuilder
  type: string
  fields: string[]
  message: string
  modelName: string
}) => {
  let fieldNames: string[] = []
  R.forEach(fieldName => {
    fieldNames = R.append(
      // todo: pass 'node' and 'data' props
      schema.getFieldLabel({ modelName, fieldName }),
      fieldNames
    )
  }, fields)

  switch (type) {
    case consts.UNIQUE_CONSTRAINT: {
      const len = fieldNames.length
      let extra = ''
      if (len > 1) {
        extra = `combination of ${fieldNames
          .slice(0, fieldNames.length - 1)
          .join(', ')} and `
      }
      const last = fieldNames[fieldNames.length - 1]
      return `This ${extra}${last} already exists.`
    }
    default:
      return message
  }
}

const getValidationMessage = ({
  schema,
  context,
  parsedErrors
}: {
  schema: SchemaBuilder
  context: any
  parsedErrors: any
}) =>
  R.mapObjIndexed((fieldErrors: any) => {
    let errorsList: string[] = []
    R.forEach((e: any) => {
      const message = errorMap({
        type: R.prop('type', e),
        fields: R.prop('group', e),
        message: R.prop('message', e),
        modelName: R.prop('modelName', context),
        schema
      })
      if (message) {
        errorsList = R.append(message, errorsList)
      }
    }, fieldErrors)
    return errorsList
  }, parsedErrors)

const parseValidationErrors = (response: any) => {
  const errorsStr: string | undefined = R.path(
    ['errors', 0, 'message'],
    response
  )
  let errors = []
  try {
    errors = JSON.parse(errorsStr as string)
  } catch (e) {
    Logger.inputValidationParseValidationErrors(response, e)
  }
  return errors
}

export const prepValidationErrors = ({
  schema,
  context,
  error
}: {
  schema: SchemaBuilder
  context: any
  error: any
}) => {
  const parsedErrors = parseValidationErrors(error.response)
  return getValidationMessage({ schema, context, parsedErrors })
}

export const getEditMutationInputVariables = ({
  schema,
  modelName,
  node
}: {
  schema: SchemaBuilder
  modelName: string
  node: any
}): any =>
  R.pipe(
    R.mapObjIndexed((value, fieldName) =>
      editFieldToQueryInput({ schema, modelName, fieldName, value })
    ),
    R.dissoc('__typename'),
    R.dissoc('id')
  )(node)

export const getDeleteErrors = ({
  data,
  context
}: {
  data: any
  context: any
}): string[] | undefined =>
  R.path(['delete' + context.modelName, 'errors'], data)

const getInputValue = (fieldName: string, formStack: any) => {
  const index = R.prop('index', formStack)
  return R.path(['stack', index, 'fields', fieldName], formStack)
}

// get input values from a create form
export const getCreateSubmitValues = ({
  schema,
  formStack,
  modelName
}: {
  schema: SchemaBuilder
  formStack: any
  modelName: string
}) => {
  const createFields = R.filter(
    field => R.propOr(true, 'showCreate', field),
    schema.getFields(modelName)
  )
  const formStackIndex = R.prop('index', formStack)
  const origin = R.prop('originModelName', formStack)
  if (origin && formStackIndex === 0) {
    const originFieldName = R.prop('originFieldName', formStack)
    createFields[originFieldName] = originFieldName
  }

  const inputs = Object.assign(
    {},
    ...Object.entries(createFields).map(([fieldName]) => ({
      [fieldName]: editFieldToQueryInput({
        schema,
        modelName,
        fieldName,
        value: getInputValue(fieldName, formStack)
      })
    }))
  )
  return R.pickBy((_, fieldName) => {
    // Ignore fields who have submitCreate as false,
    // defaults to true
    return R.propOr(true, 'submitCreate', schema.getField(modelName, fieldName))
  }, inputs)
}

export const fileSubmitToBlob = ({
  payload,
  query,
  value
}: {
  payload: any
  query: any
  value: any
}) => {
  const formData = new FormData()
  const modelName = R.prop('modelName', payload)
  const fieldName = R.prop('fieldName', payload)
  const id = R.prop('id', payload)
  const fileData: Record<string, BlobPart> | undefined = R.propOr(
    false,
    'fileData',
    payload
  )

  let variableInputDict
  let fileInputDict: Record<string, BlobPart> = {}

  if (fileData) {
    // @ts-ignore
    variableInputDict = R.map(() => consts.CREATE_FILE, fileData)
    fileInputDict = fileData
  } else if (value) {
    variableInputDict = { [fieldName]: consts.CREATE_FILE }
    // type needed => reconciliation is not in schema
    const arrayBuffer = editFieldToQueryInput({
      modelName,
      fieldName,
      value,
      type: inputTypes.FILE_TYPE
    })
    fileInputDict = { [fieldName]: arrayBuffer }
  }
  if (query) {
    formData.append('query', query)
  }
  const variables = JSON.stringify({
    id,
    input: variableInputDict
  })
  formData.append('variables', variables)

  for (const [fieldName, contents] of Object.entries(fileInputDict)) {
    formData.append(
      fieldName,
      new Blob([contents], { type: 'application/octet-stream' }),
      fieldName
    )
  }
  return formData
}

// RouteEpic helpers
export const isModelPathPrefix = (path: string[], schema: SchemaBuilder) =>
  path.length >= 2 &&
  path[0] === '' &&
  R.propOr(false, path[1], schema.schemaJSON) &&
  (schema.getHasIndex(path[1]) || schema.getHasDetail(path[1]))

export const modelIndexPath = ({
  path,
  schema
}: {
  path: string[]
  schema: SchemaBuilder
}) => {
  if (path.length === 2 && isModelPathPrefix(path, schema)) {
    const modelName = path[1]

    if (schema.getHasIndex(modelName) && modelName in schema.schemaJSON) {
      return [Actions.fetchModelIndex({ modelName })]
    }
  }
}

export const modelDetailPath = ({
  path,
  schema
}: {
  path: string[]
  schema: SchemaBuilder
}) => {
  if (
    path.length >= 3 &&
    isModelPathPrefix(path, schema) &&
    path[2] !== 'create'
  ) {
    return [Actions.fetchModelDetail({ modelName: path[1], id: path[2] })]
  }
}

export const modelCreatePath = ({
  path,
  schema
}: {
  path: string[]
  schema: SchemaBuilder
}) => {
  if (
    path.length === 3 &&
    isModelPathPrefix(path, schema) &&
    path[2] === 'create'
  ) {
    return []
  }
}

export const pathFunctions = [modelIndexPath, modelDetailPath, modelCreatePath]

export const getPath = (locationChangeAction: string) =>
  R.pipe(
    R.pathOr('', ['payload', 'location', 'pathname']),
    pathname => pathname.split('/'),
    R.dropLastWhile(R.equals(''))
  )(locationChangeAction)

// ValidationEpic helpers
export const tableChangedFields = ({
  modelName,
  id,
  state$
}: {
  modelName: string
  id: string
  state$: any
}): any => {
  const changeFields: (state: object) => object = R.pipe(
    R.path(['value', 'conveyor', 'edit', modelName, id]),
    // @ts-ignore
    R.filter(
      (val: any) =>
        !R.equals(R.prop('currentValue', val), R.prop('initialValue', val))
    ),
    R.map((field: any) => R.prop('currentValue', field))
  )
  return changeFields(state$)
}

export const getMissingFieldsMessage = ({
  schema,
  missingFields,
  modelName
}: {
  schema: SchemaBuilder
  missingFields: any
  modelName: string
}) =>
  R.reduce(
    (acc: string, fieldName: string) =>
      acc + schema.getFieldLabel({ modelName, fieldName }) + ', ',
    '',
    missingFields
  ).slice(0, -2)
