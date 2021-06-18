import * as fwConfig from './foodwasteConfig';
import * as salesConfig from './salesConfig';
import { AdvancedReportType } from 'report/Advanced';

export function createConfig(type: AdvancedReportType) {
  if (type === AdvancedReportType.foodwaste) {
    return fwConfig;
  } else {
    return salesConfig;
  }
}
