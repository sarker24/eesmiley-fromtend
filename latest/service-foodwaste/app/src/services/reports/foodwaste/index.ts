import * as hooks from './hooks/index';
import { default as TotalOverview } from './overview';
import { default as TotalStatus } from './status';
import { default as TotalMetrics } from './top-metrics';
import { default as TotalTrend } from './trend';
import { default as TotalPerAccount } from './per-account';

const Foodwaste = {
  OverviewService: TotalOverview,
  StatusService: TotalStatus,
  TopMetricService: TotalMetrics,
  TrendService: TotalTrend,
  PerAccountService: TotalPerAccount,
  hooks
};


export default Foodwaste;
