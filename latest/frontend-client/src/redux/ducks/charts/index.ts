import { ChartsState, ChartsActionTypes, ChartsActions, Chart } from './types';

export * from './types';

export const initialState: ChartsState = {
  chartRefs: {}
};

export default function reducer(
  state: ChartsState = initialState,
  action: ChartsActions
): ChartsState {
  switch (action.type) {
    case ChartsActionTypes.REGISTER_CHART:
      return Object.assign({}, state, {
        chartRefs: {
          ...state.chartRefs,
          [action.payload.chartType]:
            state.chartRefs[action.payload.chartType] && action.payload.chartType === 'barGroup'
              ? [...state.chartRefs[action.payload.chartType], action.payload.chartRef]
              : [action.payload.chartRef]
        }
      });

    case ChartsActionTypes.UNREGISTER_CHARTS:
      return Object.assign({}, state, {
        chartRefs: {}
      });

    case ChartsActionTypes.UNREGISTER_CHART:
      return Object.assign({}, state, {
        chartRefs: {
          ...state.chartRefs,
          [action.payload.chartType]: state.chartRefs[action.payload.chartType]
            ? state.chartRefs[action.payload.chartType].filter(
                (chartRef) => chartRef !== action.payload.chartRef
              )
            : null
        }
      });

    default:
      return state;
  }
}

export function registerChart(chartType: string, chartRef: Chart): ChartsActions {
  return {
    type: ChartsActionTypes.REGISTER_CHART,
    payload: { chartType, chartRef }
  };
}

export function unregisterCharts(): ChartsActions {
  return {
    type: ChartsActionTypes.UNREGISTER_CHARTS
  };
}

export function unregisterChart(chartType: string, chartRef: Chart): ChartsActions {
  return {
    type: ChartsActionTypes.UNREGISTER_CHART,
    payload: { chartType, chartRef }
  };
}
