import * as React from 'react';
import { connect } from 'react-redux';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { formatWeight } from 'utils/number-format';
import { createHighchartsSeries } from 'redux/ducks/data/highcharts';
import { Button } from '@material-ui/core';
import { RootState } from 'redux/rootReducer';
import './index.scss';
import { Point } from 'highcharts';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';
import { ChartRef } from 'declarations/chart';

interface OwnProps {
  handleClick: (registrationPoint: RegistrationPoint, color: string) => void;
}

type StoreProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

let self: BarGauge;

type BarGaugeProps = StoreProps & DispatchProps & InjectedIntlProps & OwnProps;

class BarGauge extends React.Component<BarGaugeProps> {
  private barChart: React.RefObject<ChartRef>;

  constructor(props: BarGaugeProps) {
    super(props);
    self = this;

    this.barChart = React.createRef();
  }

  handleBackClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const { createHighchartsSeries } = this.props;
    createHighchartsSeries();
  };

  handleParentClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const { pointMap, createHighchartsSeries, selectedPoint } = this.props;
    const parent = selectedPoint.parentId ? pointMap.get(selectedPoint.parentId) : null;
    createHighchartsSeries(parent);
  };

  handleChartClick = (e: Highcharts.SeriesClickEventObject) => {
    e.preventDefault();
    const point = e.point as Point & { registrationPointId: string; clickable: boolean };
    const { pointMap, createHighchartsSeries, handleClick } = this.props;
    const nextSelectedPoint = pointMap.get(point.registrationPointId);
    if (point.clickable) {
      createHighchartsSeries(nextSelectedPoint);
    } else {
      handleClick(nextSelectedPoint, point.color as string);
    }
  };

  render() {
    const { highchartSeries, selectedPoint, pointMap, intl, isLoading } = this.props;
    const parentOfSelectedPoint =
      selectedPoint && selectedPoint.parentId && pointMap.get(selectedPoint.parentId);
    const bars =
      highchartSeries.length === 0
        ? 0
        : [...new Set(highchartSeries.map((registration) => registration.data[0].name))].length;
    const chartOptions: Highcharts.Options = {
      credits: {
        enabled: false
      },
      chart: {
        height:
          bars > 0
            ? window.innerWidth < 1280
              ? (bars + 1) * 31
              : (bars + 1) * 46.09
            : window.innerHeight > 768
            ? 300
            : 170,
        type: 'bar',
        spacingTop: 30,
        style: {
          cursor: 'pointer' as const
        },
        reflow: true
      },
      exporting: {
        enabled: false
      },
      legend: {
        enabled: false
      },
      xAxis: {
        lineWidth: 0,
        minorGridLineWidth: 0,
        labels: {
          x: window.innerWidth <= 1024 ? -8 : -15,
          style: {
            fontWeight: 'normal',
            color: '#333',
            fontSize: window.innerWidth < 1280 ? '10px' : '12px',
            fontFamily: 'Roboto'
          }
        },
        type: 'category' as const
      },
      yAxis: {
        title: {
          text: undefined
        },
        tickAmount: 100,
        labels: {
          enabled: false
        },
        stackLabels: {
          enabled: true,
          x: 5,
          style: {
            fontWeight: 'normal',
            color: '#333',
            fontSize: window.innerWidth < 1280 ? '10px' : '12px',
            fontFamily: 'Roboto'
          },
          formatter: function () {
            return formatWeight(this.total);
          }
        },
        gridLineWidth: 0
      },
      plotOptions: {
        bar: {
          pointWidth: window.innerWidth < 1280 ? 20 : 35.09,
          borderWidth: 0,
          shadow: {
            color: '#666666',
            opacity: 0.4,
            width: 0.3,
            offsetX: 0.4,
            offsetY: 3
          },
          stacking: 'normal' as const,
          events: {
            click: function (event) {
              this.onMouseOut();
              self.handleChartClick(event);
            }
          }
        }
      },
      series: highchartSeries.map((s) => ({ ...s, type: 'bar' })),
      tooltip: {
        enabled: true,
        outside: true,
        formatter: function () {
          return `
            <b>${this.point.series.name}</b>
            <br>
            <span>
              ${formatWeight(this.y, false)} / ${formatWeight(this.total, false)}
            </span>
          `;
        }
      },
      colors: ['#ff7da7', '#bcaed1', '#a8cfd1', '#ffcc73', '#7ca5ef', '#c287ef'],
      title: { text: undefined }
    };
    if (isLoading) {
      return <div>Loading</div>;
    }
    if (highchartSeries.length === 0) {
      return (
        <div>
          <p>
            {
              intl.messages[
                'dashboard.widgets.expectedWeeklyWasteGauge.bars.noRegistrationsForPeriod'
              ]
            }
          </p>
        </div>
      );
    }
    return (
      <div className='barGauge'>
        <div className='barGauge-buttons'>
          {selectedPoint ? (
            <Button variant='contained' color='primary' onClick={this.handleBackClick}>
              {intl.messages['base.back']}
            </Button>
          ) : null}
          {parentOfSelectedPoint ? (
            <Button variant='contained' color='primary' onClick={this.handleParentClick}>
              {'< ' + parentOfSelectedPoint.name}
            </Button>
          ) : null}
        </div>
        {selectedPoint ? <h4>{selectedPoint.name}</h4> : null}
        <HighchartsReact highcharts={Highcharts} options={chartOptions} ref={this.barChart} />
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  isLoading: state.data.registrationPoints.initializing,
  highchartSeries: state.data.highcharts.series,
  selectedPoint: state.data.highcharts.selectedPoint,
  pointMap: state.data.registrationPoints.registrationPointsMap
});

const mapDispatchToProps = {
  createHighchartsSeries
};

export default connect<StoreProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(BarGauge));
