import { TableCell, TableRow, Typography } from '@material-ui/core';
import * as React from 'react';

const byString = (o, s) => {
  if (!s) {
    return;
  }

  s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  s = s.replace(/^\./, ''); // strip a leading dot
  const a = s.split('.');
  const n = a.length;
  for (let i = 0; i < n; ++i) {
    const x = a[i];
    if (o && x in o) {
      o = o[x];
    } else {
      return;
    }
  }
  return o;
};

const setByString = (obj, path, value) => {
  let schema = obj; // a moving reference to internal objects within obj

  path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  path = path.replace(/^\./, ''); // strip a leading dot
  const pList = path.split('.');
  const len = pList.length;
  for (let i = 0; i < len - 1; i++) {
    const elem = pList[i];
    if (!schema[elem]) schema[elem] = {};
    schema = schema[elem];
  }

  schema[pList[len - 1]] = value;
};

interface CustomEditRowProps {
  components?: any;
  actions?: any[];
  icons: any;
  index: number;
  data: any;
  detailPanel?: any;
  options: any;
  onRowSelected?: any;
  path?: string;
  columns?: any[];
  onRowClick?: any;
  onEditingApproved?: any;
  onEditingCanceled?: any;
  localization?: any;
  getFieldValue?: any;
  level?: any;
  mode?: any;
  parentId?: any;
  onSubmitHandler?: any;
  onCancelHandler?: any;
  deleteConfirmationText?: any;
  isTreeData?: boolean;
  onTreeExpandChanged?: any;
  onToggleDetailPanel?: any;
}

interface CustomEditRowState {
  data: any;
}

export default class CustomEditRow extends React.Component<CustomEditRowProps, CustomEditRowState> {
  static defaultProps = {
    actions: [],
    index: 0,
    options: {},
    path: [],
    localization: {
      saveTooltip: 'Save',
      cancelTooltip: 'Cancel',
      deleteText: 'Are you sure delete this row?'
    }
  };

  constructor(props) {
    super(props);

    this.state = {
      data: props.data ? JSON.parse(JSON.stringify(props.data)) : this.createRowData()
    };
  }

  createRowData() {
    return this.props.columns
      .filter((column) => column.initialEditValue && column.field)
      .reduce((prev, column) => {
        prev[column.field] = column.initialEditValue;
        return prev;
      }, {});
  }

  renderColumns() {
    const mapArr = this.props.columns
      .filter((columnDef) => !columnDef.hidden && !(columnDef.tableData.groupOrder > -1))
      .sort((a, b) => a.tableData.columnOrder - b.tableData.columnOrder)
      .map((columnDef, index) => {
        const value =
          typeof this.state.data[columnDef.field] !== 'undefined'
            ? this.state.data[columnDef.field]
            : byString(this.state.data, columnDef.field);
        const style: any = {};
        if (index === 0) {
          style.paddingLeft = 24 + this.props.level * 20;
        }

        let allowEditing = false;

        if (columnDef.editable === undefined) {
          allowEditing = true;
        }
        if (columnDef.editable === 'always') {
          allowEditing = true;
        }
        if (columnDef.editable === 'onAdd' && this.props.mode === 'add') {
          allowEditing = true;
        }
        if (columnDef.editable === 'onUpdate' && this.props.mode === 'update') {
          allowEditing = true;
        }
        if (typeof columnDef.editable == 'function') {
          allowEditing = columnDef.editable(columnDef, this.props.data);
        }
        if (!columnDef.field || !allowEditing) {
          //const readonlyValue = this.props.getFieldValue(this.state.data, columnDef);
          return (
            <this.props.components.Cell
              icons={this.props.icons}
              columnDef={columnDef}
              value={value}
              key={columnDef.tableData.id}
              rowData={this.props.data}
            />
          );
        } else {
          const { editComponent, ...cellProps } = columnDef;
          const EditComponent = editComponent || this.props.components.EditField;

          return (
            <TableCell
              //padding={'none'}
              key={columnDef.tableData.id}
              align={['numeric'].indexOf(columnDef.type) !== -1 ? 'right' : 'left'}
              style={this.getIndentation(columnDef, index)}
            >
              <EditComponent
                key={columnDef.tableData.id}
                columnDef={cellProps}
                value={value}
                rowData={this.state.data}
                onChange={(value) => {
                  const data = { ...this.state.data };
                  setByString(data, columnDef.field, value);
                  // data[columnDef.field] = value;
                  this.setState({ data });
                }}
                onRowDataChange={(data) => {
                  this.setState({ data });
                }}
              />
            </TableCell>
          );
        }
      });
    return mapArr;
  }

  getIndentation(columnDef, index) {
    if (columnDef.field === 'name') {
      const paddingLeft = index === 0 ? 56 : 28;

      if (this.props.data && this.props.data.path) {
        return { paddingLeft: paddingLeft + this.props.data.path.split('.').length * 28 };
      } else if (this.props.parentId) {
        return {
          paddingLeft:
            paddingLeft + (this.props.path ? this.props.path.split('.').length + 1 : 1) * 28
        };
      } else {
        return { paddingLeft: paddingLeft };
      }
    }
  }

  renderActions() {
    const localization = { ...CustomEditRow.defaultProps.localization, ...this.props.localization };
    const actions = [
      {
        icon: this.props.icons.Check,
        tooltip: localization.saveTooltip,
        onClick: () => {
          if (this.state.data.name && this.state.data.name.trim().length) {
            const newData = this.state.data;
            delete newData.tableData;
            this.props.onEditingApproved(this.props.mode, this.state.data, this.props.data);
            this.props.onSubmitHandler(this.state.data, this.props.mode);
          }
        }
      },
      {
        icon: this.props.icons.Clear,
        tooltip: localization.cancelTooltip,
        onClick: () => {
          this.props.onEditingCanceled(this.props.mode, this.props.data);
          this.props.onCancelHandler();
        }
      }
    ];
    return (
      <TableCell
        padding='none'
        key='key-actions-column'
        style={{ width: 42 * actions.length, padding: '0px 5px' }}
      >
        <div style={{ textAlign: 'right' }}>
          <this.props.components.Actions
            data={this.props.data}
            actions={actions}
            components={this.props.components}
          />
        </div>
      </TableCell>
    );
  }

  getStyle() {
    const backgroundColor =
      this.props.mode === 'delete'
        ? 'rgba(255, 0, 0, 0.1)'
        : (this.props.mode === 'update' || this.props.mode === 'add') && 'rgba(0, 0, 0, 0.03)';

    const style = {
      backgroundColor: backgroundColor,
      height: this.props.mode === 'update' || this.props.mode === 'add' ? '100px' : '55px',
      borderBottom: '1px solid red'
    };

    return style;
  }

  render() {
    const localization = { ...CustomEditRow.defaultProps.localization, ...this.props.localization };

    let columns;
    if (this.props.mode === 'add' || this.props.mode === 'update') {
      columns = this.renderColumns();
    } else {
      const colSpan = this.props.columns.filter(
        (columnDef) => !columnDef.hidden && !(columnDef.tableData.groupOrder > -1)
      ).length;
      columns = [
        <TableCell
          padding={this.props.options.actionsColumnIndex === 0 ? 'none' : undefined}
          key='key-selection-cell'
          style={{ whiteSpace: 'normal' }}
          colSpan={colSpan}
        >
          <Typography variant='h6'>
            {this.props.deleteConfirmationText
              ? this.props.deleteConfirmationText
              : localization.deleteText}
          </Typography>
        </TableCell>
      ];
    }

    if (this.props.options.selection) {
      columns.splice(0, 0, <TableCell padding='none' key='key-selection-cell' />);
    }

    if (this.props.options.actionsColumnIndex === -1) {
      columns.push(this.renderActions());
    } else if (this.props.options.actionsColumnIndex >= 0) {
      let endPos = 0;
      if (this.props.options.selection) {
        endPos = 1;
      }
      if (this.props.isTreeData) {
        endPos = 1;
        if (this.props.options.selection) {
          columns.splice(1, 1);
        }
      }
      columns.splice(this.props.options.actionsColumnIndex + endPos, 0, this.renderActions());
    }

    // Lastly we add detail panel icon
    if (this.props.detailPanel) {
      const aligment = this.props.options.detailPanelColumnAlignment;
      const index = aligment === 'left' ? 0 : columns.length;
      columns.splice(index, 0, <TableCell padding='none' key='key-detail-panel-cell' />);
    }

    this.props.columns
      .filter((columnDef) => columnDef.tableData.groupOrder > -1)
      .forEach((columnDef) => {
        columns.splice(
          0,
          0,
          <TableCell padding='none' key={'key-group-cell' + columnDef.tableData.id} />
        );
      });

    const {
      detailPanel,
      isTreeData,
      onRowClick,
      onRowSelected,
      onTreeExpandChanged,
      onToggleDetailPanel,
      onEditingApproved,
      onEditingCanceled,
      parentId,
      onCancelHandler,
      onSubmitHandler,
      getFieldValue,
      deleteConfirmationText,
      ...rowProps
    } = this.props;

    return (
      <>
        <TableRow {...rowProps} style={this.getStyle()}>
          {columns}
        </TableRow>
      </>
    );
  }
}
