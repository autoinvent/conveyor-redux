import * as R from 'ramda'
import * as Actions from '../actionConsts'
import { getDisplayValue, getField } from 'conveyor'

const initState = {}

const getEditValue = (schema, { modelName, fieldName, value }) => {
  const field = getField(schema, modelName, fieldName)
  const fieldType = R.prop('type', field)
  if (R.type(fieldType) === 'Object') {
    const type = R.prop('type', fieldType)
    const relModelName = R.prop('target', fieldType)
    if (type.includes('ToMany')) {
      return value.map(node => {
        const displayName = getDisplayValue({
          schema,
          modelName: relModelName,
          node
        })
        const id = R.prop('id', node)
        return { label: displayName, value: id }
      })
    } else if (type.includes('ToOne')) {
      if (R.isNil(value)) {
        return null
      }
      return {
        label: getDisplayValue({
          schema,
          modelName: relModelName,
          node: value
        }),
        value: R.prop('id', value)
      }
    } else {
      return R.prop('id', value)
    }
  } else if (fieldType === 'enum') {
    if (R.isNil(value)) {
      return null
    }
    return { label: R.path(['choices', value], field), value }
  }
  return value
}

export const generateEditReducer = schema => (state = initState, action) => {
  const payload = action.payload
  switch (action.type) {
    case Actions.TABLE_ROW_EDIT: {
      const { modelName, id, node } = { ...payload }
      const nodeFlattened = R.mapObjIndexed((value, fieldName) => {
        const editValue = getEditValue(schema, { modelName, fieldName, value })
        return {
          currentValue: editValue,
          initialValue: editValue
        }
      }, node)
      // if id is int, assocPath() creates list instead of object
      return R.assocPath([modelName, id.toString()], nodeFlattened, state)
    }
    case Actions.ATTRIBUTE_EDIT: {
      const { modelName, id, fieldName, value } = { ...payload }
      const editValue = getEditValue(schema, { modelName, fieldName, value })
      const editState = {
        initialValue: editValue,
        currentValue: editValue
      }
      return R.assocPath(
        [modelName, id.toString(), fieldName],
        editState,
        state
      )
    }
    case Actions.TABLE_EDIT_CANCEL: {
      const { modelName, id } = { ...payload }
      return R.dissocPath([modelName, id], state)
    }
    case Actions.ATTRIBUTE_EDIT_CANCEL: {
      const { modelName, fieldName, id } = { ...payload }

      // Remove the field from the edit store
      return R.dissocPath([modelName, id, fieldName], state)
    }
    case Actions.INDEX_EDIT_SUBMIT: {
      const modelName = R.prop('modelName', payload)
      const id = R.prop('id', payload)

      // use 'rawEditValues' to save data in backend...
      const rawEditValues = R.path([modelName, id], state)
      console.log('INDEX EDIT SUBMIT', rawEditValues)

      // on success, delete value from edit
      return R.dissocPath([modelName, id], state)
    }
    case Actions.DETAIL_TABLE_EDIT_SUBMIT: {
      const modelName = R.prop('modelName', payload)
      const id = R.prop('id', payload)

      // use 'rawEditValues' to save data in backend...
      const rawEditValues = R.path([modelName, id], state)
      console.log('DETAIL TABLE EDIT SUBMIT', rawEditValues)

      // on success, delete value from edit
      return R.dissocPath([modelName, id], state)
    }
    case Actions.DETAIL_ATTRIBUTE_SUBMIT: {
      const modelName = R.prop('modelName', payload)
      const id = R.prop('id', payload)

      // use 'rawEditValues' to save data in backend...
      const rawEditValues = R.path([modelName, id], state)
      console.log('DETAIL ATTRIBUTE SUBMIT', rawEditValues)

      // on success, delete value from edit
      return R.dissocPath([modelName, id], state)
    }
    case Actions.EDIT_INPUT_CHANGE: {
      const { modelName, id, fieldName, value } = { ...payload }

      return R.assocPath(
        [modelName, id.toString(), fieldName, 'currentValue'],
        value,
        state
      )
    }
    case Actions.FILE_SUBMIT: {
      // handle file here
      return state
    }
    default:
      return state
  }
}

export const selectEdit = state => R.prop('edit', state)
