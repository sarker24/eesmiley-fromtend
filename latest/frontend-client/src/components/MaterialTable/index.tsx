import * as React from 'react';
import MaterialTable, { Localization, MaterialTableProps } from 'material-table';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import CustomTableRow from './components/customTableRow';
import CustomTableToolbar from './components/customTableToolbar';
import TableIcons from './icons';
import { createMuiTheme, Paper } from '@material-ui/core';
import palette from 'styles/palette';
import { MuiThemeProvider } from '@material-ui/core/styles';


export interface AlteredMaterialTableProps<T extends object> extends MaterialTableProps<T> {
  onTreeExpandClick?: (data: T, isTreeExpanded: boolean) => void;
  selectAllComponent?: JSX.Element;
  noContentMessage?: string;
}

class AlteredMaterialTable<T extends object> extends React.Component<AlteredMaterialTableProps<T> & InjectedIntlProps, {}> {
  private localization: Localization;
  private expandedTrees: number[];

  constructor(props) {
    super(props);

    this.expandedTrees = [];
    this.localization = {
      header: {
        actions: ''
      },
      body: {
        editTooltip: props.intl.messages['edit'],
        deleteTooltip: props.intl.messages['data_table.delete'],
        emptyDataSourceMessage: props.noContentMessage || props.intl.messages['settings.content.noRegistrationPoints'],
        editRow: {
          deleteText: props.intl.messages['settings.content.deleteConfirmation'],
          cancelTooltip: props.intl.messages['base.cancel'],
          saveTooltip: props.intl.messages['base.ok']
        },
      },
      pagination: {
        previousTooltip: props.intl.messages['settings.content.table.prevPage'],
        nextTooltip: props.intl.messages['settings.content.table.nextPage'],
        labelRowsSelect: props.intl.messages['settings.content.table.rows']
      },
      toolbar: {
        searchTooltip: props.intl.messages['search'],
        searchPlaceholder: props.intl.messages['search']
      }
    };
  }

  /**
   * Clicking on an arrow that expands/collapses the row to show/hide its children rows will trigger this callback
   *
   * @param { data }
   * @param { isTreeExpanded }
   * */
  onTreeExpandClick = (data, isTreeExpanded: boolean) => {
    if (!isTreeExpanded && this.expandedTrees.indexOf(data.id) === -1) {
      this.expandedTrees.push(data.id);
    } else if (isTreeExpanded && this.expandedTrees.indexOf(data.id) !== -1) {
      this.expandedTrees.splice(this.expandedTrees.indexOf(data.id), 1);
      data.tableData.childRows.length &&
      this.collapseChildrenRows(data.tableData.childRows);
    }
    this.props.onTreeExpandClick && this.props.onTreeExpandClick(data, isTreeExpanded);
  }

  /**
   * Collapse the children rows found under a specific row that has just been closed.
   * This is a 'nice to have', so that it resets the view when you, for example,
   * close the root node, after expanding all its child nodes.
   *
   * @param { data }
   * */
  collapseChildrenRows(data) {
    data.map(child => {
      this.expandedTrees.indexOf(child.id) !== -1 &&
      this.expandedTrees.splice(this.expandedTrees.indexOf(child.id), 1);

      if (child.tableData.isTreeExpanded) {
        this.props.tableRef.current.dataManager.changeTreeExpand(child.tableData.path);
      }

      if (child.tableData.childRows && child.tableData.childRows.length) {
        this.collapseChildrenRows(child.tableData.childRows);
      }
    });
  }

  /**
   * Override the default MT table toolbar with a custom one, and render it.
   *
   * @param { props }
   * */
  overrideToolbar = (props): JSX.Element => {
    return (
      <CustomTableToolbar {...props} selectAllComponent={this.props.selectAllComponent}/>
    );
  }

  /**
   * Override the default MT table row with a custom one, and render it.
   *
   * @param { props }
   * */
  overrideTableRow = (props): JSX.Element => {
    const rowData = props.data;
    const isTreeExpanded = this.expandedTrees.includes(rowData.id) ? true : rowData.tableData.isTreeExpanded;

    if (isTreeExpanded !== rowData.tableData.isTreeExpanded) {
      this.props.tableRef.current.dataManager.changeTreeExpand(rowData.tableData.path);
    }

    return <CustomTableRow {...props} onTreeExpandClick={this.onTreeExpandClick}/>;
  }

  render() {
    const theme = createMuiTheme({
      palette: palette
    });
    const { components, ...rest } = this.props;

    return (
      <MuiThemeProvider theme={theme}>
        <MaterialTable
          icons={TableIcons}
          // @ts-ignore
          parentChildData={(row, rows) => rows.find(a => a.id === row.parentId)}
          components={{
            Toolbar: this.overrideToolbar,
            Row: this.overrideTableRow,
            Container: props => <Paper {...props} elevation={0}/>,
            ...components
          }}
          localization={this.localization}
          {...rest}
        />
      </MuiThemeProvider>
    );
  }
}

export default injectIntl(AlteredMaterialTable);
