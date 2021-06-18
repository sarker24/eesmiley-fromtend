import Highcharts from 'highcharts';

function createLockedSeries(options: Highcharts.SeriesLineOptions): Highcharts.SeriesLineOptions {
  return {
    ...options,
    tooltip: {
      headerFormat: '',
      ...options.tooltip
    },
    marker: {
      enabled: false,
      states: {
        hover: {
          enabled: false
        }
      }
    }
  };
}

export default createLockedSeries;
