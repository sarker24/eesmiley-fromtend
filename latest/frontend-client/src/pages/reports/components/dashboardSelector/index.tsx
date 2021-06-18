import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Tabs, Tab } from 'material-ui/Tabs';
import { connect } from 'react-redux';
import { dashboardSettings } from 'redux/ducks/reports';

interface StateProps {
  value: any;
}

interface DispatchProps {
  onChange: (value: number) => void;
}

export interface OwnProps {
}

const DashBoards = Object.keys(dashboardSettings).map(id => ({
  value: dashboardSettings[id].id,
  name: dashboardSettings[id].name
}));

type DashboardSelectorProps = StateProps & DispatchProps & InjectedIntlProps & OwnProps;

class DashboardSelector extends React.Component<DashboardSelectorProps> {

  onChange(tabIdx: number) {

    if (this.props.onChange) {
      this.props.onChange(tabIdx);
    }
  }

  render() {

    const { intl, value } = this.props;

    return (
      <div className='dashboardSelector'>

        <Tabs
          inkBarStyle={{
            backgroundColor: '#009688',
            zIndex: 1
          }}
          tabItemContainerStyle={{
            borderBottom: '1px #e0e0e0 solid'
          }}
          onChange={(value) => {
            this.onChange(value);
          }}
          value={value}
        >
          {
            DashBoards.map((option, index) => {
              return (
                <Tab buttonStyle={{ backgroundColor: '#FFFFFF', color: option.value == value ? '#009688' : '#333333' }}
                     key={index} label={intl.messages[option.name]} value={option.value}/>
              );
            })
          }
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  value: state.reports.filter.dashboard !== undefined ? state.reports.filter.dashboard : 0,
});

const mapDispatchToProps = (dispatch) => ({
  onChange: (value: number) => {
    dispatch({
      type: 'esmiley/reports/SET_FILTER',
      payload: {
        dashboard: value
      }
    });
  }
});

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(DashboardSelector));
