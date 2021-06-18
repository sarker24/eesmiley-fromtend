/* missing material table typing from lib, skipping  */
/* eslint-disable */
import * as React from 'react';
import AlteredMaterialTable from 'components/MaterialTable';
import { Column } from 'material-table';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';
import { Checkbox, FormControlLabel, Typography } from '@material-ui/core';
import { injectIntl, InjectedIntlProps } from 'react-intl';

interface ProjectRegistrationPointProps extends InjectedIntlProps {
  registrationPoints: RegistrationPoint[];
  projectRegistrationPoints?: RegistrationPoint[];
  selectAllComponent?: JSX.Element;
  onSelectionChange?: (registrationPoints: RegistrationPoint[]) => void;
  isLoading?: boolean;
  inReadMode: boolean;
}

const tableColumns: Column<RegistrationPoint>[] = [
  {
    title: 'Name',
    field: 'name',
    cellStyle: {
      border: 0,
      position: 'relative',
      paddingTop: '4px',
      paddingBottom: '4px'
    }
  }
];

export const EDIT_MODE_OPTIONS = {
  selection: true,
  readMode: false
};

export const READ_MODE_OPTIONS = {
  selection: false,
  readMode: true
};

class ProjectRegistrationPoints extends React.PureComponent<ProjectRegistrationPointProps> {
  static defaultProps = {
    inReadMode: false,
    projectRegistrationPoints: []
  };
  private tableRef: React.RefObject<any>;
  private areProjectRegPointsSelected: boolean;
  private rowIndex: number;

  constructor(props) {
    super(props);

    this.rowIndex = 0;
    this.areProjectRegPointsSelected = false;
    this.tableRef = React.createRef();
  }

  onRowClick = (event, rowData, detailPanel, path) => {
    const { inReadMode } = this.props;

    if (inReadMode) return;

    this.tableRef.current.dataManager.changeRowSelected(!rowData.tableData.checked, path);
    this.tableRef.current.onSelectionChange(rowData);
  };

  /**
   *  Resets the index used to set a background color on the even rows, when expanding a row.
   *  The index coming from Material Table is not working properly, hence this solution was used.
   * */
  onTreeExpandClick = () => {
    this.rowIndex = 0;
  };

  /**
   *
   *  Since material table doesnt sport support for preselected data, we need to process the preselected
   *  points ourselves and set material talbe dataTable properties:
   *  checked - preselected point
   *  indeterminate - has a child point that is preselected
   *
   *  For read mode we only want to show preselected points & and their ancestors, as for edit mode
   *  we show all available points alongside the preselected.
   *
   *  todo: maybe process input in different data structure? nested arrays not optimal
   * */
  preselectData = (): (RegistrationPoint & { tableData: any })[] => {
    const { projectRegistrationPoints, registrationPoints, inReadMode } = this.props;
    // material table mutates data and adds tableData prop
    const allRegistrationPoints = [...registrationPoints] as (RegistrationPoint & {
      tableData?: any;
    })[];

    if (!inReadMode) {
      return allRegistrationPoints.map((dataPoint) => {
        const isSelected = projectRegistrationPoints.some(
          ({ id }) => id.toString() === dataPoint.id.toString()
        );
        const tableData = { ...dataPoint.tableData, checked: isSelected };
        return { ...dataPoint, tableData };
      });
    } else {
      return allRegistrationPoints.reduce((dataPoints, dataPoint) => {
        const pointExists = projectRegistrationPoints.find(
          ({ id }) => id.toString() === dataPoint.id.toString()
        );

        if (pointExists) {
          const tableData = { ...dataPoint.tableData, checked: true };
          return [...dataPoints, { ...dataPoint, tableData }];
        }

        const ancestorExists = projectRegistrationPoints.find(
          ({ path }) => path && path.split('.').includes(dataPoint.id.toString())
        );

        if (ancestorExists) {
          const tableData = { ...dataPoint.tableData, indeterminate: true };
          return [...dataPoints, { ...dataPoint, tableData }];
        }

        return dataPoints;
      }, []);
    }
  };

  getSelectAllComponent = (registrationPoints: RegistrationPoint[]): JSX.Element => {
    const { intl } = this.props;

    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={!registrationPoints.length}
            value='all'
            color='primary'
            style={{
              marginRight: 38
            }}
          />
        }
        onChange={this.handleSelectAll}
        label={
          <Typography variant='body2' style={{ fontWeight: 'bold' }}>
            {intl.messages['report.filter.no_selection']}
          </Typography>
        }
        style={{
          marginLeft: 0,
          width: '100%'
        }}
      />
    );
  };

  /*
   * our all selection is reverse: deselecting all results in empty selection, which in our case means all are
   * selected.
   * */
  handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const {
      target: { checked }
    } = event;

    if (!checked) {
      return;
    }

    this.tableRef.current.onAllSelected(!checked);
  };

  // Material Table has an issue with this event returning duplicates. (https://github.com/mbrn/material-table/issues/655)
  // The filtering below removes them.
  handleSelectionChange = (
    rows: (RegistrationPoint & { tableData: unknown; children: unknown })[]
  ): void => {
    const { onSelectionChange } = this.props;
    const rowsClean = rows.filter(
      (row, index, array) => array.map((element) => element['id']).indexOf(row['id']) === index
    );

    // strip out children and table related data
    const registrationPointData: RegistrationPoint[] = rowsClean.map(
      ({ tableData, children, ...registrationPoint }) => registrationPoint
    );

    if (onSelectionChange) {
      onSelectionChange(registrationPointData);
    }
  };

  render() {
    const { intl, inReadMode, projectRegistrationPoints, isLoading } = this.props;
    this.rowIndex = 0;
    const tableOptions = {
      toolbar: true,
      showTitle: false,
      showTextRowsSelected: false,
      header: false,
      paging: false,
      selection: true,
      search: true,
      searchFieldAlignment: 'left' as const,
      rowStyle: () => {
        this.rowIndex++;

        return {
          height: 40,
          background: this.rowIndex % 2 === 1 ? '#F6F6F6' : '#FCFCFC'
        };
      },
      selectionProps: {
        color: 'primary'
      },
      ...(inReadMode ? READ_MODE_OPTIONS : EDIT_MODE_OPTIONS)
    };

    if (inReadMode && projectRegistrationPoints.length === 0) {
      return intl.messages['report.filter.no_selection'];
    }

    // fix this instance var hack with separating table data
    return (
      <AlteredMaterialTable
        data={this.preselectData() as RegistrationPoint[]}
        // eslint-disable-next-line
        // @ts-ignore
        columns={tableColumns}
        tableRef={this.tableRef}
        options={tableOptions}
        // eslint-disable-next-line
        // @ts-ignore
        onRowClick={this.onRowClick}
        onTreeExpandClick={this.onTreeExpandClick}
        style={{ margin: '15px 0 30px' }}
        selectAllComponent={
          !inReadMode &&
          projectRegistrationPoints &&
          this.getSelectAllComponent(projectRegistrationPoints)
        }
        isLoading={isLoading}
        onSelectionChange={this.handleSelectionChange}
      />
    );
  }
}

export default injectIntl(ProjectRegistrationPoints);
