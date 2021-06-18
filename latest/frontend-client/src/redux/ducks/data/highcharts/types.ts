import { WasteAccountRegistrationPoint } from 'redux/ducks/dashboard';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';

export type AccountRegistrationPoint = WasteAccountRegistrationPoint & {
  level: number;
};

export interface HighchartDataPoint {
  name: string;
  data: {
    clickable: boolean;
    name: string;
    registrationPointId: string;
    y: number;
  }[];
}

export interface DataHighchartsState {
  series: HighchartDataPoint[];
  loading: boolean;
  failure: boolean;
  selectedPoint?: RegistrationPoint;
}

export enum DataHighchartsActionTypes {
  SET_HIGHCHARTS_SERIES_REQUEST = 'esmiley/data/highcharts/SET_HIGHCHARTS_SERIES_REQUEST',
  SET_HIGHCHARTS_SERIES_SUCCESS = 'esmiley/data/highcharts/SET_HIGHCHARTS_SERIES_SUCCESS',
  SET_HIGHCHARTS_SERIES_FAILURE = 'esmiley/data/highcharts/SET_HIGHCHARTS_SERIES_FAILURE'
}

type SetHighchartsSeriesRequestAction = {
  type: typeof DataHighchartsActionTypes.SET_HIGHCHARTS_SERIES_REQUEST;
};

type SetHighchartsSeriesSuccessAction = {
  type: typeof DataHighchartsActionTypes.SET_HIGHCHARTS_SERIES_SUCCESS;
  payload: {
    series: HighchartDataPoint[];
    selectedPoint?: RegistrationPoint;
  };
};

type SetHighchartsSeriesFailureAction = {
  type: typeof DataHighchartsActionTypes.SET_HIGHCHARTS_SERIES_FAILURE;
};

export type DataHighchartsActions =
  | SetHighchartsSeriesRequestAction
  | SetHighchartsSeriesSuccessAction
  | SetHighchartsSeriesFailureAction;
