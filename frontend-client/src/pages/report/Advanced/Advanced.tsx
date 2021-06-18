import { Grid, Paper } from '@material-ui/core';
import MaterialTable, { Column } from 'material-table';
import icons from 'MaterialTable/icons';
import * as React from 'react';
import ExportButton from 'report/Advanced/ExportButton';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { getLocalization, options } from 'report/Advanced/utils/tableUtils';
import { StyledTab, StyledTabs } from 'report/components/TabContainer/components/StyledTabs';
import { AdvancedReportType } from 'report/Advanced/index';
import BalanceScaleIcon from 'icons/balanceScale';
import { makeStyles } from '@material-ui/core/styles';
import { ExportExtension } from 'report/Advanced/utils/tableExport';
import { PageTitle } from 'report/components/ReportPageLayout';

// eslint-disable-next-line @typescript-eslint/ban-types
interface OwnProps<T extends object> {
  registrations: T[];
  resource: AdvancedReportType;
  onResourceChange: (resource: string) => void;
  onExport: (ext: ExportExtension, headers: Column<T>[], data: T[]) => void;
  columns: Column<T>[];
}

// eslint-disable-next-line @typescript-eslint/ban-types
type AdvancedProps<T extends object> = InjectedIntlProps & OwnProps<T>;

// eslint-disable-next-line @typescript-eslint/ban-types
const Advanced = <T extends object>(props: AdvancedProps<T>) => {
  const { resource, onResourceChange, onExport, registrations = [], columns, intl } = props;
  const tableRef = React.useRef<any>(null);
  const localization = getLocalization(intl);
  const classes = useStyles(props);

  const handleExport = (ext: ExportExtension) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const headers = tableRef.current.dataManager.columns as Column<T>[];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const data = tableRef.current.dataManager.sortedData as T[];
    onExport(ext, headers, data);
  };

  return (
    <Grid container spacing={4}>
      <PageTitle>{intl.messages['report.advancedReports.page.title']}</PageTitle>
      <Grid item xs={12}>
        <Paper>
          <StyledTabs
            className={classes.tabs}
            onChange={(e, v) => onResourceChange(v)}
            value={resource}
          >
            <StyledTab
              icon={<BalanceScaleIcon />}
              value={AdvancedReportType.foodwaste}
              label={intl.messages['food_waste']}
            />
            <StyledTab
              icon={<AttachMoneyIcon />}
              value={AdvancedReportType.sales}
              label={intl.messages['report.sales_tab']}
            />
          </StyledTabs>
          <MaterialTable
            tableRef={tableRef}
            style={{ boxShadow: 'none' }}
            icons={icons}
            columns={columns}
            data={registrations}
            options={options}
            actions={[
              {
                isFreeAction: true,
                icon: () => <SaveAltIcon />,
                tooltip: intl.messages['export'],
                onClick: handleExport
              }
            ]}
            components={{
              Action: ExportButton
            }}
            localization={localization}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles({
  tabs: {
    margin: 'auto'
  }
});

export default injectIntl(Advanced);
