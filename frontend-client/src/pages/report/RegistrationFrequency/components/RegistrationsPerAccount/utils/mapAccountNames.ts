import { AccountData } from 'redux/ducks/reports-new/selectors';
import { SeriesData } from 'redux/ducks/reportData';

export default function mapAccountNames(
  accounts: AccountData[],
  seriesData?: SeriesData
): SeriesData | null {
  if (!seriesData) {
    return {
      series: [],
      aggregates: {}
    };
  }

  return {
    ...seriesData,
    series: seriesData.series.map((s) => ({
      ...s,
      points: s.points.map((point) => {
        const account = accounts.find((account) => account.id === point.label);
        const label = account ? account.name : point.label;
        return { ...point, label };
      })
    }))
  };
}
