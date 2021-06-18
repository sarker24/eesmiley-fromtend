import * as React from 'react';
import Advanced from 'report/Advanced/Advanced';
import { connect } from 'react-redux';
import { getRegistrations, getSelectedAccountNames } from 'redux/ducks/reports-new/selectors';
import { fetchData } from 'redux/ducks/reportData';
import { createConfig } from 'report/Advanced/utils/configFactory';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { ExportExtension, exportTable } from 'report/Advanced/utils/tableExport';
import { getSalesRegistrations } from 'redux/ducks/reportData/selector';
import { ThemeProvider } from '@material-ui/styles';
import { RootState } from 'redux/rootReducer';
import { Column } from 'material-table';

export enum AdvancedReportType {
  foodwaste = 'foodwaste',
  sales = 'sales'
}

const tableTheme = {
  overrides: {
    MuiTableCell: {
      head: {
        fontSize: '0.8rem'
      },
      body: {
        fontSize: '0.8rem',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
      }
    }
  }
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;
type AdvancedContainerProps = StateProps & DispatchProps & InjectedIntlProps;

const AdvancedContainer: React.FunctionComponent<AdvancedContainerProps> = (props) => {
  const {
    registrations,
    salesRegistrations,
    filterLoading,
    selectedGuestTypeNames,
    accounts,
    settings,
    timeRange,
    fetchData,
    intl
  } = props;
  const { massUnit } = settings;
  const [resource, setResource] = React.useState<AdvancedReportType>(AdvancedReportType.foodwaste);
  const { createExportConfig, createTableColumnConfig } = createConfig(resource);
  React.useEffect(() => {
    if (resource === AdvancedReportType.foodwaste) {
      fetchData('guestRegistrations');
    } else {
      fetchData('salesRegistrations');
    }
  }, [filterLoading, accounts, timeRange.to, timeRange.from, selectedGuestTypeNames, resource]);

  const handleResourceChange = (resource) => setResource(resource);

  const handleExport = (ext: ExportExtension, headers: Column<any>[], data: any[]) => {
    const exportConfig = createExportConfig(intl, { timeRange, massUnit });
    exportTable({ ext, headers, data, options: exportConfig });
  };

  const columns = createTableColumnConfig(intl, {
    currency: settings.currency,
    massUnit: settings.massUnit
  });

  const registrationData =
    resource === AdvancedReportType.foodwaste ? registrations : salesRegistrations;
  return (
    <ThemeProvider theme={(outerTheme) => ({ ...outerTheme, ...tableTheme })}>
      <Advanced
        registrations={registrationData}
        resource={resource}
        onResourceChange={handleResourceChange}
        columns={columns as any[]}
        onExport={handleExport}
      />
    </ThemeProvider>
  );
};

const mapStateToProps = (state: RootState) => ({
  registrations: getRegistrations(state),
  guestRegistrations: state.reportData.guestRegistrations,
  salesRegistrations: getSalesRegistrations(state),
  timeRange: state.newReports.timeRange,
  selectedGuestTypeNames: state.newReports.selectedGuestTypeNames,
  accounts: getSelectedAccountNames(state),
  filterLoading: state.newReports.loading,
  settings: { currency: state.settings.currency, massUnit: state.settings.unit }
});

const mapDispatchToProps = { fetchData };

export default connect<StateProps, DispatchProps, unknown>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(AdvancedContainer));
