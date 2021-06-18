import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';
import {
  AccountRegistrationPoint,
  DataHighchartsActions,
  DataHighchartsActionTypes,
  DataHighchartsState,
  HighchartDataPoint
} from './types';
import { ThunkResult } from 'redux/types';
import { WasteAccountRegistrationPoint } from 'redux/ducks/dashboard';

export * from './types';

export const initialState: DataHighchartsState = {
  series: [],
  loading: false,
  failure: false
};

export default function reducer(
  state: DataHighchartsState = initialState,
  action: DataHighchartsActions
): DataHighchartsState {
  switch (action.type) {
    case DataHighchartsActionTypes.SET_HIGHCHARTS_SERIES_REQUEST: {
      return { ...state, loading: true };
    }
    case DataHighchartsActionTypes.SET_HIGHCHARTS_SERIES_SUCCESS: {
      const { selectedPoint, series } = action.payload;
      return { ...state, series, selectedPoint, loading: false };
    }
    case DataHighchartsActionTypes.SET_HIGHCHARTS_SERIES_FAILURE: {
      return { ...state, loading: false, failure: true, series: [], selectedPoint: null };
    }
    default: {
      return state;
    }
  }
}

export function createHighchartsSeries(
  fromPoint: RegistrationPoint = null
): ThunkResult<DataHighchartsActions, DataHighchartsActions> {
  return (dispatch, getStore) => {
    dispatch({ type: DataHighchartsActionTypes.SET_HIGHCHARTS_SERIES_REQUEST });

    const pointMap = getStore().data.registrationPoints.registrationPointsMap;
    const accounts = getStore().dashboard.data.foodWaste.accounts;

    const allRegistrations = accounts.reduce((registrations, account) => {
      const { registrationPoints } = account;
      registrationPoints.forEach((point) => {
        registrations.push({
          ...point,
          level: getLevel(point)
        });
      });
      return registrations;
    }, [] as AccountRegistrationPoint[]);

    const descendantRegistrations = fromPoint
      ? allRegistrations.filter((point) => isEqualOrAncestor(point, fromPoint))
      : allRegistrations;
    const series = buildPointLevelStack(pointMap, descendantRegistrations, fromPoint);

    return dispatch({
      type: DataHighchartsActionTypes.SET_HIGHCHARTS_SERIES_SUCCESS,
      payload: { series, selectedPoint: fromPoint }
    });
  };
}

function buildPointLevelStack(
  pointsMap: Map<string, RegistrationPoint>,
  registrations: AccountRegistrationPoint[],
  fromPoint: RegistrationPoint
): HighchartDataPoint[] {
  const level = fromPoint ? getLevel(fromPoint) + 1 : 0;
  const stacks: { [index: string]: HighchartDataPoint } = registrations.reduce((all, point) => {
    const levelCommonNode = pointsMap.get(getCommonId(point, fromPoint));
    const levelSegmentNode = pointsMap.get(getSegmentId(point, levelCommonNode));
    const stack = all[levelCommonNode.name + '_' + levelSegmentNode.name];
    if (stack) {
      const data = stack.data[0];
      data.y += point.amount;
      if (!data.clickable && level + 1 < point.level) {
        stack.data[0].clickable = true;
      }
    } else {
      all[levelCommonNode.name + '_' + levelSegmentNode.name] = {
        name: levelSegmentNode.name,
        data: [
          {
            name: levelCommonNode.name,
            y: point.amount,
            registrationPointId: levelSegmentNode.id,
            clickable: level + 1 < point.level
          }
        ]
      };
    }

    return all;
  }, {} as { [name: string]: HighchartDataPoint });

  return Object.keys(stacks).map((key) => stacks[key]);
}

function getLevel(point: WasteAccountRegistrationPoint | RegistrationPoint): number {
  if (!point || !point.path) {
    return 0;
  }
  return point.path.split('.').length;
}

function getCommonId(point: AccountRegistrationPoint, fromPoint: RegistrationPoint): string {
  if (!fromPoint) {
    return point.path ? point.path.split('.')[0] : point.registrationPointId;
  }

  return getSegmentId(point, fromPoint);
}

function getSegmentId(point: AccountRegistrationPoint, commonNode: RegistrationPoint): string {
  const level = getLevel(commonNode);
  if (point.registrationPointId === commonNode.id || point.level === level + 1) {
    return point.registrationPointId;
  }

  return point.path.split('.')[level + 1];
}

function isEqualOrAncestor(point: AccountRegistrationPoint, ancestor: RegistrationPoint): boolean {
  if (point.registrationPointId === ancestor.id) {
    return true;
  }

  // root cant have ancestors
  if (!point.path) {
    return false;
  }

  const ancestorIds = point.path.split('.');
  return ancestorIds.includes(ancestor.id);
}
