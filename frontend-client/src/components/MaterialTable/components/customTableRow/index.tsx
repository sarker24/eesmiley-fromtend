import * as React from 'react';
import { Checkbox, Icon, IconButton, TableCell, TableRow, Tooltip } from '@material-ui/core';

interface CustomTableRowProps {
  actions?: any;
  icons: any;
  index: number;
  data: any;
  detailPanel?: any;
  hasAnyEditingRow?: boolean;
  options: any;
  onRowSelected?: any;
  path?: any;
  treeDataMaxLevel?: number;
  getFieldValue: any;
  columns?: any;
  onToggleDetailPanel: any;
  onRowClick?: any;
  onEditingApproved?: any;
  onEditingCanceled?: any;
  level?: any;
  isTreeData?: boolean;
  components?: any;
  onTreeExpandClick?: any;
  onTreeExpandChanged?: any;
  localization?: any;
}

export class CustomTableRow extends React.Component<CustomTableRowProps> {

  static defaultProps = {
    actions: [],
    index: 0,
    data: {},
    options: {},
    path: []
  };

  /**
   * Returns the correct padding that the Name field should have, depending on whether or not it's the first column in the table,
   * or in the event that the table is a Tree, but the rows displayed don't have any child rows.
   * @param index
   */
  getNamePaddingLeftInTree(isFirstColumn) {
    const paddingValue = 28;

    if (this.props.treeDataMaxLevel === 0) {
      return paddingValue;
    } else {
      return paddingValue * (this.props.level + (isFirstColumn ? 2 : 1));
    }
  }

  renderColumns() {
    const size = this.getElementSize();
    const mapArr = this.props.columns.filter(columnDef => !columnDef.hidden && !(columnDef.tableData.groupOrder > -1))
      .sort((a, b) => a.tableData.columnOrder - b.tableData.columnOrder)
      .map((columnDef, index) => {
        const value = this.props.getFieldValue(this.props.data, columnDef);
        const isNameColumnInTreeData = columnDef.field === 'name' && this.props.isTreeData;
        const hasChildren = this.props.data.tableData.childRows && this.props.data.tableData.childRows.length > 0;
        const isFirstColumn = !this.props.options.selection && !this.props.options.readMode && index === 0;

        return (
          <React.Fragment key={'fragment-' + index}>
            <this.props.components.Cell
              size={ size }
              icons={ this.props.icons }
              columnDef={ columnDef }
              value={ value }
              key={ 'cell-' + this.props.data.id + '-' + columnDef.tableData.id }
              rowData={ this.props.data }
              style={{
                paddingLeft: isNameColumnInTreeData && this.getNamePaddingLeftInTree(isFirstColumn)
              }}
            >
              {
                (isNameColumnInTreeData && hasChildren) &&
                <IconButton
                  size={ this.getElementSize() }
                  style={ {
                    transition: 'all ease 200ms',
                    position: 'absolute',
                    left: isFirstColumn ? (this.props.level * 28) + 12 : (this.props.level * 28) - 17,
                    top: '50%',
                    marginTop: -20,
                    padding: 8,
                    ...this.rotateIconStyle(this.props.data.tableData.isTreeExpanded)
                  } }
                  onClick={ (event) => {
                    event.stopPropagation();
                    this.props.onTreeExpandClick && this.props.onTreeExpandClick(this.props.data, this.props.data.tableData.isTreeExpanded);
                    this.props.onTreeExpandChanged(this.props.path, this.props.data);
                  } }
                >
                  <this.props.icons.DetailPanel />
                </IconButton>
              }
            </this.props.components.Cell>
          </React.Fragment>
        );
      });
    return mapArr;
  }


  renderActions() {
    const size = this.getElementSize();
    const baseIconSize = size === 'medium' ? 42 : 26;
    const actions = this.props.actions.filter(a => !a.isFreeAction && !this.props.options.selection);
    return (
      <TableCell size={size} padding='none' key='key-actions-column' style={{ width: baseIconSize * actions.length, ...this.props.options.actionsCellStyle }}>
        <div style={{ textAlign: 'right' }}>
          <this.props.components.Actions data={this.props.data} actions={actions} components={this.props.components} size={size} />
        </div>
      </TableCell>
    );
  }

  renderSelectionColumn() {
    const { options, data, path, onRowSelected } = this.props;
    let checkboxProps = options.selectionProps || {};
    if (typeof checkboxProps === 'function') {
      checkboxProps = checkboxProps(data);
    }

    const size = this.getElementSize();
    const baseIconSize = size === 'medium' ? 42 : 26;
    const { selectedRows, ...rest } = checkboxProps;

    const styles = size === 'medium' ? {
      marginLeft: 0
    } : {
      padding: '4px',
      marginLeft: 5
    };

    return (
      <TableCell size={this.getElementSize()} padding='none' key='key-selection-column' style={{ width: baseIconSize + 9, border: '0' }}>
        <Checkbox
          disabled={options.readMode}
          size={size}
          checked={data.tableData.checked === true}
          indeterminate={!data.tableData.checked && (data.tableData.indeterminate || this.hasSelectedChildRows(data))}
          onClick={(e) => e.stopPropagation()}
          value={data.tableData.id.toString()}
          onChange={(event) => onRowSelected(event, path, data)}
          style={styles}
          {...rest}
        />
      </TableCell>
    );
  }

  /**
   *  Checkes whether or not the registration point has any selected children.
   *  Used in order to determine whether the checkbox should have an indeterminate state
   *  @param { registrationPoint: {} }
   * */
  hasSelectedChildRows = (registrationPoint) => {
    if(registrationPoint.tableData && registrationPoint.tableData.childRows) {
      return registrationPoint.tableData.childRows.some((childRow) => {
        return childRow.tableData.checked === true ? childRow.tableData.checked : this.hasSelectedChildRows(childRow );
      });
    }
    return false;
  }

  rotateIconStyle = isOpen => ({
    transform: isOpen ? 'rotate(90deg)' : 'none'
  })

  renderDetailPanelColumn() {

    const CustomIcon = ({ icon, ...rest }) => typeof icon === 'string' ? <Icon { ...rest }>{icon}</Icon> : React.createElement(icon, { ...rest });

    if (typeof this.props.detailPanel == 'function') {
      return (
        <TableCell size={this.getElementSize()} padding='none' key='key-detail-panel-column' style={{ width: 42, textAlign: 'center' }}>
          <IconButton
            size={this.getElementSize()}
            style={{ transition: 'all ease 200ms', ...this.rotateIconStyle(this.props.data.tableData.showDetailPanel) }}
            onClick={(event) => {
              this.props.onToggleDetailPanel(this.props.path, this.props.detailPanel);
              event.stopPropagation();
            }}
          >
            <this.props.icons.DetailPanel />
          </IconButton>
        </TableCell>
      );
    }
    else {
      return (
        <TableCell size={this.getElementSize()} padding='none' key='key-detail-panel-column'>
          <div style={{ width: 42 * this.props.detailPanel.length, textAlign: 'center', display: 'flex' }}>
            {this.props.detailPanel.map((panel, index) => {

              if (typeof panel === 'function') {
                panel = panel(this.props.data);
              }

              const isOpen = (this.props.data.tableData.showDetailPanel || '').toString() === panel.render.toString();

              let iconButton = <this.props.icons.DetailPanel />;
              let animation = true;
              if (isOpen) {
                if (panel.openIcon) {
                  iconButton = <CustomIcon icon={panel.openIcon} />;
                  animation = false;
                }
                else if (panel.icon) {
                  iconButton = <CustomIcon icon={panel.icon} />;
                }
              }
              else if (panel.icon) {
                iconButton = <CustomIcon icon={panel.icon} />;
                animation = false;
              }

              iconButton = (
                <IconButton
                  size={this.getElementSize()}
                  key={'key-detail-panel-' + index}
                  style={{ transition: 'all ease 200ms', ...this.rotateIconStyle(animation && isOpen) }}
                  disabled={panel.disabled}
                  onClick={(event) => {
                    this.props.onToggleDetailPanel(this.props.path, panel.render);
                    event.stopPropagation();
                  }}
                >
                  {iconButton}
                </IconButton>);

              if (panel.tooltip) {
                iconButton = <Tooltip key={'key-detail-panel-' + index} title={panel.tooltip}>{iconButton}</Tooltip>;
              }

              return iconButton;
            })}
          </div>
        </TableCell>
      );
    }
  }

  getStyle(index, level) {
    let style: any = {
      transition: 'all ease 300ms',
    };

    if (typeof this.props.options.rowStyle === 'function') {
      style = {
        ...style,
        ...this.props.options.rowStyle(this.props.data, index, level)
      };
    }
    else if (this.props.options.rowStyle) {
      style = {
        ...style,
        ...this.props.options.rowStyle
      };
    }

    if (this.props.onRowClick) {
      style.cursor = 'pointer';
    }

    if (this.props.hasAnyEditingRow) {
      style.opacity = 0.3;
    }

    return style;
  }

  getElementSize = () => {
    return this.props.options.padding === 'default' ? 'medium' : 'small';
  }

  render() {
    const renderColumns = this.renderColumns();
    if (this.props.options.selection || this.props.options.readMode) {
      renderColumns.splice(0, 0, this.renderSelectionColumn());
    }
    if (this.props.actions && this.props.actions.filter(a => !a.isFreeAction && !this.props.options.selection).length > 0) {
      if (this.props.options.actionsColumnIndex === -1) {
        renderColumns.push(this.renderActions());
      } else if (this.props.options.actionsColumnIndex >= 0) {
        let endPos = 0;
        if (this.props.options.selection) {
          endPos = 1;
        }
        renderColumns.splice(this.props.options.actionsColumnIndex + endPos, 0, this.renderActions());
      }
    }

    // Lastly we add detail panel icon
    if (this.props.detailPanel) {
      if (this.props.options.detailPanelColumnAlignment === 'right') {
        renderColumns.push(this.renderDetailPanelColumn());
      } else {
        renderColumns.splice(0, 0, this.renderDetailPanelColumn());
      }
    }

    this.props.columns
      .filter(columnDef => columnDef.tableData.groupOrder > -1)
      .forEach(columnDef => {
        renderColumns.splice(0, 0, <TableCell size={this.getElementSize()} padding='none' key={'key-group-cell' + columnDef.tableData.id} />);
      });

    const {
      icons,
      data,
      columns,
      components,
      detailPanel,
      getFieldValue,
      isTreeData,
      onRowClick,
      onRowSelected,
      onTreeExpandChanged,
      onTreeExpandClick,
      onToggleDetailPanel,
      onEditingCanceled,
      onEditingApproved,
      options,
      hasAnyEditingRow,
      treeDataMaxLevel,
      ...rowProps } = this.props;

    return (
      <>
        <TableRow
          {...rowProps}
          hover={onRowClick ? true : false}
          key={data.id}
          style={this.getStyle(this.props.index, this.props.level)}
          onClick={(event) => {
            onRowClick && onRowClick(event, this.props.data,
              (panelIndex) => {
                let panel = detailPanel;
                if (Array.isArray(panel)) {
                  panel = panel[panelIndex || 0].render;
                }

                onToggleDetailPanel(this.props.path, panel);
              }, this.props.path);
          }}
        >
          {renderColumns}
        </TableRow>
        {this.props.data.tableData.childRows && this.props.data.tableData.isTreeExpanded &&
        this.props.data.tableData.childRows.map((data, index) => {
          if (data.tableData.editing) {
            return (
              <this.props.components.EditRow
                columns={this.props.columns.filter(columnDef => { return !columnDef.hidden; })}
                components={this.props.components}
                data={data}
                icons={this.props.icons}
                localization={this.props.localization}
                key={index}
                mode={data.tableData.editing}
                options={this.props.options}
                isTreeData={this.props.isTreeData}
                detailPanel={this.props.detailPanel}
                onEditingCanceled={onEditingCanceled}
                onEditingApproved={onEditingApproved}
              />
            );
          } else {
            return (
              <this.props.components.Row
                {...this.props}
                data={data}
                index={index}
                key={index}
                level={this.props.level + 1}
                path={[...this.props.path, index]}
                onEditingCanceled={onEditingCanceled}
                onEditingApproved={onEditingApproved}
                hasAnyEditingRow={this.props.hasAnyEditingRow}
                treeDataMaxLevel={treeDataMaxLevel}
              />
            );
          }
        })
        }
        {this.props.data.tableData && this.props.data.tableData.showDetailPanel &&
        <TableRow
          // selected={this.props.index % 2 === 0}
        >
          <TableCell size={this.getElementSize()} colSpan={renderColumns.length} padding='none'>
            {this.props.data.tableData.showDetailPanel(this.props.data)}
          </TableCell>
        </TableRow>
        }
      </>
    );
  }
}

export default CustomTableRow;
