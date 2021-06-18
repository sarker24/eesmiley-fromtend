import { Checkbox, FormControlLabel, IconButton, InputAdornment, Menu, MenuItem, TextField, Toolbar, Tooltip, Typography, withStyles } from '@material-ui/core';
import { lighten } from '@material-ui/core/styles/colorManipulator';
import classNames  from 'classnames';
import { CsvBuilder } from 'filefy';
import * as React from 'react';

interface CustomTableToolbarProps {
  actions?: any;
  columns?: any;
  columnsButton?: boolean;
  components: any;
  getFieldValue: any;
  localization: any;
  onColumnsChanged: any;
  onSearchChanged: any;
  search: boolean;
  searchFieldStyle?: any;
  searchText: string;
  selectedRows?: any[];
  title?: any;
  showTitle: boolean;
  showTextRowsSelected: boolean;
  toolbarButtonAlignment: string;
  searchFieldAlignment: string;
  renderData?: any[];
  data?: any;
  exportAllData?: boolean;
  exportButton?: boolean;
  exportDelimiter?: string;
  exportFileName?: string;
  exportCsv?: any;
  classes?: any;
  icons?: any;
  selectAllComponent?: any;
}

interface CustomTableToolbarState {
  columnsButtonAnchorEl: any;
  exportButtonAnchorEl: any;
}

export class CustomTableToolbar extends React.Component<CustomTableToolbarProps, CustomTableToolbarState> {

  static defaultProps = {
    actions: [],
    columns: [],
    columnsButton: false,
    localization: {
      addRemoveColumns: 'Add or remove columns',
      nRowsSelected: '{0} row(s) selected',
      showColumnsTitle: 'Show Columns',
      showColumnsAriaLabel: 'Show Columns',
      exportTitle: 'Export',
      exportAriaLabel: 'Export',
      exportName: 'Export as CSV',
      searchTooltip: 'Search',
      searchPlaceholder: 'Search'
    },
    search: true,
    showTitle: true,
    showTextRowsSelected:true,
    toolbarButtonAlignment: 'right',
    searchFieldAlignment: 'right',
    searchText: '',
    selectedRows: [],
    title: 'No Title!'
  };

  constructor(props) {
    super(props);
    this.state = {
      columnsButtonAnchorEl: null,
      exportButtonAnchorEl: null
    };
  }

  defaultExportCsv = () => {
    const columns = this.props.columns
      .filter(columnDef => {
        return !columnDef.hidden && columnDef.field && columnDef.export !== false;
      });

    const dataToExport = this.props.exportAllData ? this.props.data : this.props.renderData;

    const data = dataToExport.map(rowData =>
      columns.map(columnDef => {
        return this.props.getFieldValue(rowData, columnDef);
      })
    );

    const builder = new CsvBuilder((this.props.exportFileName || this.props.title || 'data') + '.csv');
    builder
      .setDelimeter(this.props.exportDelimiter)
      .setColumns(columns.map(columnDef => columnDef.title))
      .addRows(data)
      .exportFile();
  }

  exportCsv = () => {
    if (this.props.exportCsv) {
      this.props.exportCsv(this.props.columns, this.props.data);
    } else {
      this.defaultExportCsv();
    }
    this.setState({ exportButtonAnchorEl: null });
  }

  renderSearch() {
    const localization = { ...CustomTableToolbar.defaultProps.localization, ...this.props.localization };
    if (this.props.search) {
      return (
        <TextField
          className={this.props.searchFieldAlignment === 'left' && this.props.showTitle === false ? null : this.props.classes.searchField}
          value={this.props.searchText}
          onChange={event => this.props.onSearchChanged(event.target.value)}
          placeholder={localization.searchPlaceholder}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Tooltip title={localization.searchTooltip}>
                  <this.props.icons.Search color='inherit' fontSize='small' />
                </Tooltip>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  disabled={!this.props.searchText}
                  onClick={() => this.props.onSearchChanged('')}
                  style={this.props.searchText.length === 0 ? { visibility: 'hidden' } : {}}
                >
                  <this.props.icons.ResetSearch color='inherit' fontSize='small' />
                </IconButton>
              </InputAdornment>
            ),
            style: this.props.searchFieldStyle
          }}
        />
      );
    }
    else {
      return null;
    }
  }

  renderDefaultActions() {
    const localization = { ...CustomTableToolbar.defaultProps.localization, ...this.props.localization };
    return (
      <div>
        {this.props.columnsButton &&
        <span>
            <Tooltip title={localization.showColumnsTitle}>
              <IconButton
                color='inherit'
                onClick={event => this.setState({ columnsButtonAnchorEl: event.currentTarget })}
                aria-label={localization.showColumnsAriaLabel}>

                <this.props.icons.ViewColumn />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={this.state.columnsButtonAnchorEl}
              open={Boolean(this.state.columnsButtonAnchorEl)}
              onClose={() => this.setState({ columnsButtonAnchorEl: null })}>
              <MenuItem key={'text'} disabled style={{ opacity: 1, fontWeight: 600, fontSize: 12 }}>
                {localization.addRemoveColumns}
              </MenuItem>
              {
                this.props.columns.map((col, index) => {
                  return (
                    <MenuItem key={col.tableData.id} disabled={col.removable === false}>
                      <FormControlLabel
                        label={col.title}
                        control={
                          <Checkbox
                            checked={!col.hidden}
                            onChange={(event, checked) => {
                              this.props.onColumnsChanged(col.tableData.id, !checked);
                            }
                            } />
                        }
                      />
                    </MenuItem>
                  );
                })
              }
            </Menu>
          </span>
        }
        {this.props.exportButton &&
        <span>
            <Tooltip title={localization.exportTitle}>
              <IconButton
                color='inherit'
                onClick={event => this.setState({ exportButtonAnchorEl: event.currentTarget })}
                aria-label={localization.exportAriaLabel}>
                <this.props.icons.Export />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={this.state.exportButtonAnchorEl}
              open={Boolean(this.state.exportButtonAnchorEl)}
              onClose={() => this.setState({ exportButtonAnchorEl: null })}
            >
              <MenuItem key='export-csv' onClick={this.exportCsv}>
                {localization.exportName}
              </MenuItem>
            </Menu>
          </span>

        }
        <this.props.components.Actions actions={this.props.actions && this.props.actions.filter(a => a.isFreeAction)} components={this.props.components} />
      </div>
    );
  }

  renderSelectedActions() {
    return (
      <React.Fragment>
        <this.props.components.Actions actions={this.props.actions.filter(a => !a.isFreeAction)} data={this.props.selectedRows} components={this.props.components} />
      </React.Fragment>
    );
  }

  renderActions() {
    const { classes } = this.props;

    return (
      <div className={classes.actions}>
        <div>
          {this.props.selectedRows && this.props.selectedRows.length > 0
            ? this.renderSelectedActions()
            : this.renderDefaultActions()
          }
        </div>
      </div>
    );
  }

  render() {
    const { classes, selectAllComponent } = this.props;
    const localization = { ...CustomTableToolbar.defaultProps.localization, ...this.props.localization };
    const title =this.props.showTextRowsSelected && this.props.selectedRows && this.props.selectedRows.length  > 0 ? localization.nRowsSelected.replace('{0}', this.props.selectedRows.length) : this.props.showTitle ? this.props.title : null;
    return (
      <>
      <Toolbar className={classNames(classes.root, { [classes.highlight]: this.props.showTextRowsSelected &&this.props.selectedRows && this.props.selectedRows.length > 0 })}>
        {title && <div className={classes.title}>
          <Typography variant='h6'>{title}</Typography>
        </div>}
        {this.props.searchFieldAlignment === 'left' && this.renderSearch()}
        {this.props.toolbarButtonAlignment === 'left' && this.renderActions()}
        <div className={classes.spacer} />
        {this.props.searchFieldAlignment === 'right' && this.renderSearch()}
        {this.props.toolbarButtonAlignment === 'right' && this.renderActions()}
      </Toolbar >
        {
          selectAllComponent
        }
      </>
    );
  }
}

export const styles = theme => ({
  root: {
    paddingLeft: 0,
    paddingRight: 0,
    minHeight: 0,
    marginBottom: '23px'
  },
  highlight:
    theme.palette.type === 'light'
      ? {
        color: theme.palette.secondary.main,
        backgroundColor: lighten(theme.palette.secondary.light, 0.85)
      }
      : {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark
      },
  spacer: {
    flex: '1 1 10%'
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto'
  }
});

export default withStyles(styles)(CustomTableToolbar);
