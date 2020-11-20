import * as R from 'ramda'
import { LOCATION_CHANGE } from 'connected-react-router'
import { ofType } from 'redux-observable'
import { concat } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { getPath, pathFunctions } from '../utils/helpers'
import { Epic } from './epic'

export class RouteEpic extends Epic {
  [LOCATION_CHANGE](action$: any) {
    return action$.pipe(
      ofType(LOCATION_CHANGE),
      map(getPath),
      switchMap(path => {
        const pipeActions: (obArray: [object]) => [object] = R.pipe(
          R.ap(pathFunctions),
          // @ts-ignore
          R.reject(R.equals(undefined)),
          R.flatten
        )
        const actions = pipeActions([{ path, schema: this.schema }])
        return concat(actions)
      })
    )
  }
}
