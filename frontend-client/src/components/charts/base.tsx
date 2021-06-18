import { InjectedIntlProps, injectIntl } from 'react-intl';
import { charts } from 'styles/palette';
import * as React from 'react';
import moment from 'moment';
import classNames from 'classnames';
import * as Highcharts from 'highcharts';
import _merge from 'lodash/merge';
import _flattenDeep from 'lodash/flattenDeep';
import _startCase from 'lodash/startCase';
import _isEqual from 'lodash/isEqual';
import { Chart } from 'highcharts';

export interface IOwnProps extends React.HTMLAttributes<HTMLElement> {
  configuration?: Highcharts.Options | Highcharts.Options[];
  series?: Highcharts.SeriesColumnOptions[] | Highcharts.SeriesGaugeOptions[];
  palette?: Highcharts.Color[];
  shouldResize?: boolean;
  id?: string;
  className?: string;
}

type IComponentProps = IOwnProps & InjectedIntlProps;

class Component extends React.Component<IComponentProps, undefined> {
  private containerRef: React.RefObject<HTMLDivElement>;
  private chart: Chart;
  private shouldResize: boolean;

  constructor(props: IComponentProps) {
    super(props);
    this.containerRef = React.createRef();
    this.shouldResize = this.props.shouldResize;

    Highcharts.setOptions({
      lang: {
        drillUpText: `<strong>↩ ${props.intl.messages['base.back']} <strong>`,
        months: moment.months().map(_startCase),
        weekdays: moment.weekdays().map(_startCase),
        shortMonths: moment.monthsShort().map(_startCase)
      },
      time: {
        useUTC: false
      }
    });
  }

  options = (
    { configuration, series, palette }: IComponentProps,
    animation = false
  ): Highcharts.Options => {
    const configurationArray = _flattenDeep([configuration]);

    return _merge(
      {
        title: {
          text: ''
        },
        chart: {
          renderTo: this.containerRef.current,
          animation: {
            duration: 100
          }
        },
        drilldown: {
          drillUpButton: {
            position: {
              x: -10,
              y: 0
            },
            theme: {
              fill: 'white',
              'stroke-width': 0,
              states: {
                hover: {
                  fill: 'rgba(153, 153, 153, 0.2)'
                }
              }
            }
          }
        },
        exporting: {
          buttons: {
            contextButton: {
              enabled: false
            }
          }
        }
      },
      {
        series
      },
      {
        colors: palette || charts.default
      },
      {
        plotOptions: {
          series: {
            animation
          }
        }
      },
      {
        credits: {
          enabled: false
        },
        xAxis: {
          labels: {
            style: {
              color: '#000000'
            }
          }
        },
        yAxis: {
          labels: {
            style: {
              color: '#000000'
            }
          }
        }
      },
      // Custom options
      ...configurationArray
    ) as Highcharts.Options;
  };

  onResize = () => {
    if (this.chart && this.containerRef.current) {
      const { clientHeight, clientWidth } = this.containerRef.current;
      this.chart.setSize(clientWidth, clientHeight);
      this.shouldResize = false;
    }
  };

  handleResize = () => {
    if (this.shouldResize === false) {
      this.shouldResize = true;
      setTimeout(() => {
        this.onResize();
      }, 300);
    }
  };

  componentDidMount() {
    this.chart = new Highcharts.Chart(this.options(this.props, true));

    window.addEventListener('resize', this.handleResize);

    setTimeout(() => {
      this.onResize();
    }, 0);
  }

  UNSAFE_componentWillReceiveProps(nextProps: IComponentProps) {
    if (_isEqual(this.props, nextProps)) return;

    const dataIsChanged = !_isEqual(nextProps.series, this.props.series);

    this.chart.destroy();
    this.chart = new Highcharts.Chart(this.options(nextProps, dataIsChanged));
    this.onResize();
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    this.chart.destroy();
    window.removeEventListener('resize', this.handleResize);
  }

  render() {
    return (
      <div
        id={this.props.id}
        className={classNames('chart', { [this.props.className]: !!this.props.className })}
        ref={this.containerRef}
      />
    );
  }
}

export default injectIntl(Component);
