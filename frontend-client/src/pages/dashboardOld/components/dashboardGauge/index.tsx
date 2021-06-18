import * as React from 'react';
import * as Highcharts from 'highcharts';
import HighcartsMore from 'highcharts/highcharts-more';
import HighchartsReact from 'highcharts-react-official';
import { connect } from 'react-redux';
import Widget from 'components/widget';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import DetailsDialog from './components/detailsDialog';
import { Paper, Popper, Button } from '@material-ui/core';
import './index.scss';
import { RootState } from 'redux/rootReducer';
import { ChartRef } from 'declarations/chart';

HighcartsMore(Highcharts);

type StateProps = ReturnType<typeof mapStateToProps>;

export interface OwnProps {
  id: string;
  options: Highcharts.Options;
  editFormComponent?: React.ComponentClass;
  details: { title: string; render: () => React.ReactElement };
  title: string;
  editingTitle?: string;
  className?: string;
  shouldDisableDetailedView?: boolean;
  hasPopover?: boolean;
  popoverText?: string | null;
  renderEmptyPlaceholder?: () => React.ReactElement;
}

export interface IComponentState {
  detailsIsOpen: boolean;
  popoverAnchorEl: HTMLDivElement;
  /*This is any because it needs to be either a ReactInstance or ReactElement, both of which cause typescript errors due to our old versions, TODO:Switch this to the right type once we are up to date with react and typescript*/
}

type DashboardGaugeProps = StateProps & InjectedIntlProps & OwnProps;

class DashboardGauge extends React.Component<DashboardGaugeProps, IComponentState> {
  private readonly gaugeChart: React.RefObject<ChartRef>;
  private readonly popOverAnchor: React.RefObject<HTMLDivElement>;

  constructor(props: DashboardGaugeProps) {
    super(props);

    this.gaugeChart = React.createRef();
    this.popOverAnchor = React.createRef();

    this.state = {
      detailsIsOpen: false,
      popoverAnchorEl: undefined
    };
  }

  componentDidUpdate(prevProps: Readonly<DashboardGaugeProps>) {
    if (prevProps.isMenuOpen !== this.props.isMenuOpen) {
      // when menu is opened, the content width changes while window width doesnt, thus need to manually recalculate widths
      // for charts
      this.gaugeChart.current && this.gaugeChart.current.chart.reflow();
    }
  }

  render() {
    const {
      hasMultipleAccounts,
      id,
      hasPopover,
      popoverText,
      editFormComponent,
      details,
      title,
      intl,
      className,
      editingTitle,
      shouldDisableDetailedView,
      renderEmptyPlaceholder,
      options
    } = this.props;
    const { detailsIsOpen, popoverAnchorEl } = this.state;
    return (
      <Widget
        renderEmptyPlaceholder={renderEmptyPlaceholder}
        onMouseEnter={() => this.setState({ popoverAnchorEl: this.popOverAnchor.current })}
        onMouseLeave={() => this.setState({ popoverAnchorEl: null })}
        editingTitle={editingTitle}
        id={id}
        editFormComponent={editFormComponent}
        title={title}
        className={
          'gaugeContainer ' +
          (className ? className : '') +
          (id === 'waste-gauge' ? ' hideBorder' : '')
        }
      >
        <HighchartsReact ref={this.gaugeChart} highcharts={Highcharts} options={options} />
        <Button
          className='detailedViewBtn'
          disabled={!hasMultipleAccounts || shouldDisableDetailedView}
          onClick={() => this.setState({ detailsIsOpen: true })}
        >
          {intl.messages['dashboard.widgets.detailedView']}
        </Button>
        {hasMultipleAccounts && details && (
          <DetailsDialog
            title={details.title}
            onClose={() => {
              this.setState({ detailsIsOpen: false });
            }}
            open={detailsIsOpen}
          >
            {details.render()}
          </DetailsDialog>
        )}
        {hasPopover && <div className='popoverAnchor' ref={this.popOverAnchor} />}
        <Popper
          style={{ zIndex: 1000 }}
          open={Boolean(popoverAnchorEl) && !detailsIsOpen}
          anchorEl={popoverAnchorEl}
        >
          <Paper>
            <div className='gaugeContainer__popover__text'>{popoverText}</div>
          </Paper>
        </Popper>
      </Widget>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  hasMultipleAccounts: state.dashboard.accounts && state.dashboard.accounts.length > 1,
  isMenuOpen: state.ui.isMenuOpen
});

export default connect<StateProps, unknown, OwnProps>(mapStateToProps)(injectIntl(DashboardGauge));
