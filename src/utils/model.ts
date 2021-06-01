import * as R from 'ramda'
import { selectTableView } from './tableView'
import { SchemaBuilder } from '@autoinvent/conveyor-schema'

export const initState = {}

export const DEFAULT_PAGINATION_AMT = 20

const slicePageData = (data: any, idx: number) => {
  const firstIdx = (idx - 1) * DEFAULT_PAGINATION_AMT
  const lastIdx = idx * DEFAULT_PAGINATION_AMT
  //const firstIdx = idx * DEFAULT_PAGINATION_AMT // obj of firstIdx included
  //const lastIdx = (idx + 1) * DEFAULT_PAGINATION_AMT // obj of lastIdx NOT included => cutoff point

  // slice(first_index, cutoff_index)
  return data.slice(firstIdx, lastIdx)
}

/**
 * Gets store for a given model. Called by [getPaginatedNode](./modules.html#getpaginatednode)
 * @param state Redux state
 * @param modelName Model name
 * @returns conveyor.model.modelName
 */
export const getModelStore = (state: any, modelName: string) =>
  R.path(['conveyor', 'model', modelName], state)

  /**
   * Returns a portion of data for a paginated table
   * @param schema - [Conveyor-Schema](https://github.com/autoinvent/conveyor-schema)
   * @param state Redux state
   * @param modelName Model Name
   * @param id Node ID
   * @returns List of objects
   */
export const getPaginatedNode = (
  schema: SchemaBuilder,
  state: any,
  modelName: string,
  id: string
) => {
  const modelStore = getModelStore(state, modelName)
  const node = R.pathOr(null, ['values', id], modelStore)

  // do not change the redux store
  const updatedNode = modelStore === null ? null : {}
  if (node) {
    for (const [fieldName, obj] of Object.entries(node)) {
      const type = schema.getType(modelName, fieldName)
      const model = schema.getModel(modelName)
      const paginate = R.pathOr(true, ['fields', fieldName, 'paginate'], model)

      // if multi-rel type
      if (type && type.includes('ToMany') && !R.isEmpty(obj) && paginate) {
        const idx = R.pathOr(
          1,
          [modelName, 'fields', fieldName, 'page', 'currentPage'],
          selectTableView(state)
        )
        // @ts-ignore
        updatedNode[fieldName] = slicePageData(obj, idx)
      } else {
        // @ts-ignore
        updatedNode[fieldName] = obj
      }
    }
  }
  return updatedNode
}

/**
 * TODO DOCS
 * @param modelName Model name
 * @param tabList 
 * @returns 
 */
export const getTabIdentifier = ({
  modelName,
  tabList
}: {
  modelName: string
  tabList: any
}) => {
  return R.prepend(modelName, tabList).join('.')
}

export const getDefaultModelStore = () => ({ order: [], values: {} })

/**
 * Returns a list of values with a specified order
 * @param store Part of store with order and values
 * @returns List of values with a specified order
 */
export const getOrderedValues = (store: any) => {
  const order = R.prop('order', store)
  const values = R.prop('values', store)
  if (R.isNil(order) || R.isNil(values)) {
    return []
  }
  return order.map((id: string) => values[id])
}

export const updateIndex = (state: any, modelName: string, data: any) => {
  if (!data) data = []
  const oldStore = R.propOr(getDefaultModelStore(), modelName, state) as any
  const newStore = getDefaultModelStore() as any

  newStore.order = data.map(R.prop('id'))
  for (const node of data) {
    const oldNode = R.propOr({}, node.id, oldStore.values)
    newStore.values[node.id] = R.mergeDeepRight(oldNode, node)
  }
  return { ...state, [modelName]: newStore }
}

/**
 * Curried function which returns value of conveyor.model from the passed in argument. 
 * Returns initState if value is null.
 */
export const selectModel = R.pathOr(initState, ['conveyor', 'model'])
export const getDetailUrl = ({
  modelName,
  id
}: {
  modelName: string
  id: string
}) => `/${modelName}/${id}`
export const getIndexUrl = ({ modelName }: { modelName: string }) =>
  `/${modelName}`
