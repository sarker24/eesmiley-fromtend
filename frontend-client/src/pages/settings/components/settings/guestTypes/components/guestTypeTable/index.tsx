/* eslint-disable */

import * as React from 'react';
import { connect } from 'react-redux';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import * as uiDispatch from 'redux/ducks/ui';

// MATERIAL TABLE
import { Column, MTableBody, Options } from 'material-table';
import AlteredMaterialTable, { AlteredMaterialTableProps } from 'components/MaterialTable';

// ICONS
import CheckIcon from '@material-ui/icons/Check';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityIcon from '@material-ui/icons/Visibility';
import AddPhotoIcon from '@material-ui/icons/AddAPhoto';

// OVERWRITTEN MATERIAL TABLE COMPONENTS
import CustomTableBody from 'components/MaterialTable/components/customTableBody';
import CustomTableHead from 'components/MaterialTable/components/customTableHead';
import CustomEditRow from 'components/MaterialTable/components/customEditRow';
import CustomTableAction from 'components/MaterialTable/components/customTableAction';

// MISC
import { colors, IconButton, Tooltip } from '@material-ui/core';
import { WithWidth } from '@material-ui/core/withWidth';
import palette from 'styles/palette';
import ImageGallery from 'modalContent/image-gallery';
import Input from 'components/input';

import { validate } from 'validator';
import { showNotification } from 'redux/ducks/notification';

import { scrollToEl } from 'utils/helpers';
import { isIE11 } from 'utils/browsers';
import { Slide } from '@material-ui/core';
import { GuestType } from 'redux/ducks/guestTypes/types';

// MT options (https://material-table.com/#/docs/all-props)
const materialTableOptions = {
  actionsColumnIndex: -1,
  showTitle: false,
  search: false,
  searchFieldAlignment: 'left',
  emptyRowsWhenPaging: false,
  paginationType: 'stepped',
  toolbarButtonAlignment: 'right',
  headerStyle: {
    backgroundColor: colors.grey['50'],
    padding: '0px'
  },
  rowStyle: {
    //CRAS: IE11 has an issue with transitioning opacity on table rows
    transition: (isIE11 ? '' : 'opacity 300ms ease-out, ') + 'background-color 500ms ease-out',
    borderBottom: `1px solid ${colors.grey['200']}`,
    height: 55
  },
  pageSize: 25,
  pageSizeOptions: [10, 15, 20, 25],
  actionsCellStyle: {
    whiteSpace: 'pre'
  }
};

interface DispatchProps {
  showModal: (data) => void;
  showNotification: (message: string, isError?: boolean, icon?: JSX.Element) => void;
}

interface OwnProps {
  guestTypes: GuestType[];

  onDelete(arg: any): void;

  onCreate(arg: any): void;

  onUpdate(arg: any): void;
}

type GuestTypeTableProps = DispatchProps & InjectedIntlProps & WithWidth & OwnProps;

const NEW_OR_UPDATED_ROW = 'new-or-updated-row';
const deleteTransitionDuration = 1000;

type ActionFunction = (
  row: any
) => {
  onClick: (event, rowData) => void;
  icon: () => any;
  tooltip: string;
};

class GuestTypeTable extends React.Component<GuestTypeTableProps, {}> {
  deletedRow: any;
  tableRef = React.createRef<any>();

  // customActions: Custom actions to be added besides the default ones 'Edit' & 'Delete', on each table row
  private customActions: ActionFunction[];

  // whitelistedKeys: Array including properties that we want to work with. Taken from old solution.
  private whitelistedKeys: string[];
  // newRow: Variable which we can use to determine if the row we're rendering is a newly added one. (Styling purposes)
  private newRow: number | string;
  // updatedRow: Just like newRow, this is used to determine if the row we're rendering has just been updated. (Styling purposes)
  private updatedRow: number | string;

  constructor(props: GuestTypeTableProps) {
    super(props);

    this.customActions = [
      (row) => ({
        icon: () =>
          row.active ? (
            <VisibilityIcon color={'primary'} />
          ) : (
            <VisibilityOffIcon style={{ color: colors.grey['400'] }} />
          ),
        tooltip: row.active
          ? props.intl.messages['base.deactivate']
          : props.intl.messages['base.activate'],
        onClick: (event, rowData) => {
          const newData = Object.assign({}, rowData);
          newData.active = !newData.active;
          this.onRowUpdate(newData, rowData);
        }
      })
    ];

    this.whitelistedKeys = ['image', 'name'];
  }

  shouldComponentUpdate(
    nextProps: Readonly<GuestTypeTableProps>,
    nextState: Readonly<{}>,
    nextContext: any
  ): boolean {
    return nextProps.guestTypes !== this.props.guestTypes;
  }

  componentDidMount(): void {
    window.addEventListener('keyup', this.onKeyUp);
  }

  componentWillUnmount(): void {
    window.removeEventListener('keyup', this.onKeyUp);
  }

  /**
   * KeyUp handler: Cancels the Edit Row
   * */
  onKeyUp = (event): void => {
    if (event.which === 27) {
      // If Esc key is pressed
      const mode = this.tableRef.current.state.showAddRow ? 'add' : 'update';

      this.tableRef.current.onEditingCanceled(mode);
      this.onCancelHandler();
    }
  };

  /**
   * Takes the registration-points data coming from the endpoint, parses it,
   * and starts setting up the columns based on the fields.
   * @returns { Column[] } - array of columns that will be passed as a prop to MT
   * */
  extractColumnsFromData = (): Column<GuestType>[] => {
    const enabledColumns = this.whitelistedKeys;

    return enabledColumns.map((key) => {
      switch (key) {
        case 'name':
          return this.setupNameColumn(key);
          break;

        case 'image':
          return this.setupImageColumn(key);
          break;

        default:
          return this.setupDefaultColumn(key);
      }
    });
  };

  /**
   * Returns an object with needed data for custom-rendering
   * @returns { Column } - object including properties needed to custom-render the field in the table
   * */
  setupDefaultColumn = (key): Column<GuestType> => {
    const { intl } = this.props;

    return {
      title: intl.messages[key],
      field: key
    };
  };

  /**
   * Returns an object with needed data for custom-rendering
   * @param { key }
   * @returns { Column } - object including properties needed to custom-render the field in the table
   * */
  setupNameColumn = (key): Column<GuestType> => {
    const { intl } = this.props;

    return {
      title: intl.messages[key],
      field: key,
      cellStyle: {
        position: 'relative',
        width: '70%',
        whiteSpace: 'pre'
      },
      headerStyle: {
        paddingLeft: 28,
        width: '70%'
      },
      customSort: (a, b) => {
        return a.name.localeCompare(b.name, intl.locale, { sensitivity: 'base' });
      },
      render: this.renderNameColumn,
      editComponent: (props) => this.renderNameEditMode(props, key)
    };
  };

  /**
   * Renders the data for the 'Name' column
   * @param { rowData } - row data
   * @returns { string | JSX.Element } - returns the value needed to be rendered, or the value together with an icon if it's a newly added row
   * */
  renderNameColumn = (rowData): string | JSX.Element => {
    const { intl } = this.props;
    const isNewRow = this.newRow === rowData.id;
    const transitionDuration = isNewRow ? '0.3' : '1';
    const opacityValue = isNewRow ? 1 : 0;
    const checkIconStyle = {
      transition: 'opacity ' + transitionDuration + 's ease-out 1s',
      opacity: opacityValue,
      width: 20,
      height: 20,
      verticalAlign: 'bottom',
      marginLeft: 10
    };

    this.newRow = this.newRow === rowData.id ? undefined : this.newRow;

    return (
      <>
        {!rowData.active ? (
          <span style={{ transition: 'opacity 300ms ease-out', opacity: 0.4 }}>
            {rowData.name}
            <Tooltip
              className={'tooltip'}
              title={(intl.messages['settings.guestType'] as any).one}
              enterTouchDelay={50}
              leaveTouchDelay={2500}
            >
              <VisibilityOffIcon
                htmlColor={'#000'}
                style={{
                  cursor: 'help',
                  width: 15,
                  height: 15,
                  verticalAlign: 'text-bottom',
                  marginLeft: 5
                }}
              />
            </Tooltip>
          </span>
        ) : (
          <span>{rowData.name}</span>
        )}
        <CheckIcon htmlColor={palette.primary1Color} style={checkIconStyle} />
      </>
    );
  };

  /**
   * Renders the custom edit component for the 'Name' column
   * @param { props } - props
   * @param { key } - the key
   * @returns { JSX.Element } - the element that should be rendered instead of the default edit component provided by MT
   * */
  renderNameEditMode = (props, key): JSX.Element => {
    const { intl } = this.props;

    return (
      <Input
        type={'text'}
        shouldValidate={(value: string) => {
          return value ? this.isValidData(props.rowData, key) && value.trim().length > 0 : false;
        }}
        required
        value={props.value}
        focusOnMount={true}
        name={`${key}_field`}
        style={{ width: '50%', marginTop: '-6px' }}
        label={intl.messages[`${key}`]}
        onKeyDown={(event) => this.onInputKeyDown(event, props)}
        onChange={(e: any, value: string) => props.onChange(value)}
      />
    );
  };

  /*
   *
   *
   * */
  isValidData(rowData, key) {
    const validation = validate(`${'product'}-post-request`, rowData);
    return !(validation.hasOwnProperty(key) && validation[key]);
  }

  /**
   * Returns an object with needed data for custom-rendering
   * @param { key }
   * @returns { Column } - returns the value needed to be rendered, or the value together with an icon if it's a newly added row
   * */
  setupImageColumn = (key): Column<GuestType> => {
    const { intl, width } = this.props;

    return {
      title: intl.messages[key],
      field: key,
      headerStyle: {
        width: 80,
        textAlign: 'center',
        fontFamily: '"Roboto", "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif',
        letterSpacing: '0.024em'
      },
      cellStyle: {
        width: 80,
        position: 'relative',
        textAlign: 'center'
      },
      hidden: width === 'xs' || width === 'sm',
      sorting: false,
      disableClick: true,
      editComponent: (props) => {
        return this.renderImageContent(props.rowData, true);
      },
      render: (rowData) => {
        return this.renderImageContent(rowData);
      }
    };
  };

  /**
   * Renders the 'Image' column in non-Edit mode, in both scenarios (if an image exists or not)
   * @param { rowData } - row data
   * @returns { JSX.Element } - returns the element that should be rendered (either a thumbnail or the default icon)
   * */
  renderImageContent = (rowData, editMode?: boolean): JSX.Element => {
    const { intl } = this.props;
    return (
      <Tooltip
        title={intl.messages['settings.uploadImage']}
        aria-label={intl.messages['settings.uploadImage']}
      >
        <IconButton
          onClick={() =>
            this.onImageClickHandler(rowData, (newData) => {
              this.onRowUpdate(newData, rowData);
            })
          }
          style={{
            margin: '0 auto',
            position: 'relative',
            display: 'block',
            padding: rowData.image && 0
          }}
        >
          {rowData.image ? (
            <img
              className='thumbnail'
              src={rowData.image}
              style={{
                height: editMode ? '50px' : '37px',
                width: editMode ? '50px' : '37px',
                borderRadius: '4px',
                cursor: 'pointer',
                verticalAlign: 'middle'
              }}
            />
          ) : (
            <AddPhotoIcon htmlColor={colors.grey['400']} />
          )}
        </IconButton>
      </Tooltip>
    );
  };

  /**
   *
   * @param { data } - row data
   * @param { callBack } - row data
   * */
  onImageClickHandler(rowData: GuestType, callBack: (data: GuestType) => void): void {
    this.props.showModal({
      title: null,
      fullBleed: true,
      className: 'imageGallery',
      content: (
        <ImageGallery
          imageUrl={rowData.hasOwnProperty('image') ? rowData.image : null}
          onSelection={(image: any) => {
            const newData = Object.assign({}, rowData);

            newData.image = image.url;
            callBack(newData);
          }}
        />
      )
    });
  }

  /**
   * Checks whether the user pressed Enter or Escape, and approve or cancel the editing depending on the action
   * @param { event }
   * @param { props }
   * */
  onInputKeyDown = (event, props): void => {
    const mode = this.tableRef.current.state.showAddRow ? 'add' : 'update';

    if (event.which === 13) {
      if (props.rowData.name && props.rowData.name.trim().length) {
        this.tableRef.current.onEditingApproved(
          mode,
          props.rowData,
          this.tableRef.current.state.lastEditingRow
        );
        if (mode === 'update') {
          return this.onSubmitHandler(props.rowData);
        }
      }
    }
  };

  /**
   * Render an Edit Row
   *
   * @param { props }
   * */
  renderEditRow = (props): JSX.Element => {
    return (
      <props.components.EditRow
        columns={props.columns.filter((columnDef) => {
          return !columnDef.hidden;
        })}
        data={props.initialFormData}
        components={props.components}
        icons={props.icons}
        key='key-add-row'
        mode='add'
        localization={{
          // @ts-ignore
          ...MTableBody.defaultProps.localization.editRow,
          ...props.localization.editRow
        }}
        options={props.options}
        isTreeData={props.isTreeData}
        detailPanel={props.detailPanel}
        onEditingCanceled={props.onEditingCanceled}
        onEditingApproved={props.onEditingApproved}
        getFieldValue={props.getFieldValue}
      />
    );
  };

  /**
   * Override the default MT table body with a custom one, and render it.
   * This is needed to block the default behaviour that renders an Edit row at the end or beginning of the table body.
   *
   * @param { props }
   * */
  overrideTableBody = (props): JSX.Element => {
    return <CustomTableBody {...props} />;
  };

  /**
   * Override the default MT table head with a custom one, and render it.
   *
   * @param { props }
   * */
  overrideTableHead = (props): JSX.Element => {
    return <CustomTableHead {...props} draggable={false} />;
  };

  /**
   * Override the default MT Overlay with an empty <span> in order to 'deactivate' it
   *
   * @param { props }
   * */
  overrideOverlay = (props): JSX.Element => <span />;

  /**
   * Override the default MT table edit row with a custom one, and render it.
   *
   * @param { props }
   * */
  overrideEditRow = (props): JSX.Element => {
    let deleteConfirmationText;
    const slidingIn =
      props.data && props.data.id && props.data.id === this.deletedRow ? false : true;
    const slideDuration =
      props.data && props.data.id && props.data.id === this.deletedRow
        ? deleteTransitionDuration
        : 0;

    if (props.mode === 'delete') {
      const { intl } = this.props;

      deleteConfirmationText = intl.formatMessage(
        { id: 'settings.content.deleteConfirmation' },
        { registrationPoint: props.data.name }
      );
    }

    return (
      <Slide in={slidingIn} direction={'left'} timeout={slideDuration}>
        <CustomEditRow
          {...props}
          deleteConfirmationText={deleteConfirmationText}
          onCancelHandler={this.onCancelHandler}
          onSubmitHandler={this.onSubmitHandler}
        />
      </Slide>
    );
  };

  /**
   * Override the default MT table action with a custom one, and render it.
   *
   * @param { props }
   * */
  overrideAction = (props): JSX.Element => {
    const { intl } = this.props;
    const buttonTitleAdd = intl.formatMessage(
      { id: 'settings.content.add' },
      { contentType: (intl.messages['settings.guestType'] as any).one }
    );
    const { action, ...rest } = props;
    let customAction;

    // When clicking on the global "Add Registration Point" button, cancel any edit rows before adding a new row.
    if (action.isFreeAction) {
      customAction = Object.assign({}, action);

      customAction.onClick = () => {
        this.tableRef.current.onEditingCanceled('update');
        this.hideAddNewRow();

        this.tableRef.current.setState({
          ...this.tableRef.current.dataManager.getRenderState(),
          showAddRow: true
        });
      };
    }

    return (
      <CustomTableAction
        {...rest}
        action={customAction ? customAction : action}
        buttonTitleAdd={buttonTitleAdd}
      />
    );
  };

  /**
   * Whenever an Edit row has been canceled, this callback is called
   *
   ** */
  onCancelHandler = (): void => {
    this.resetHelperGlobals();
  };

  /**
   * Whenever an Edit row has been approved (by Enter or clicking on the Check icon), this callback is called
   *
   * @param { data }
   **/
  onSubmitHandler = (data: GuestType, mode?: string): void => {
    if (mode === 'delete') {
      this.deletedRow = data.id;
    } else {
      this.updatedRow = data.id;
    }
  };

  /*
   * Reset some helper variables. This gets called when we cancel an Edit row.
   *
   * */
  resetHelperGlobals = (): void => {
    this.deletedRow = undefined;
  };

  /**
   * Clicking on a row triggers the Edit mode on that specific row
   *
   * @param { event }
   * @param { rowData }
   * */
  onRowClick = async (event, rowData) => {
    if (
      !event.target.classList.contains('tooltip') &&
      !event.target.parentNode.classList.contains('tooltip')
    ) {
      this.tableRef.current.dataManager.changeRowEditing(rowData, 'update');
      this.hideAddNewRow();
      return;
    }
  };

  /**
   * Hides any existing edit rows which have the function of adding a new row
   *
   * */
  hideAddNewRow = () => {
    this.resetHelperGlobals();
    this.tableRef.current.setState({
      ...this.tableRef.current.dataManager.getRenderState(),
      showAddRow: false
    });
  };

  /**
   * Runs when an Edit row for a brand new row has been 'confirmed',
   * by pressing Enter or clicking on the Check icon.
   * Here we make the call to the endpoint with the data for the new row.
   *
   * @param { newData }
   * */
  onRowAdd = async (newData) => {
    const { tableData, ...guestType } = newData;
    this.props.onCreate(guestType);
    this.resetHelperGlobals();
    scrollToEl(NEW_OR_UPDATED_ROW);
    return;
  };

  /**
   * Runs when an Edit row for an existing row has been 'confirmed',
   * by pressing Enter or clicking on the Check icon.
   * Here we make the call to the endpoint with the new data for the existing row.
   *
   * @param { newData }
   * */
  onRowUpdate = async (newData, oldData) => {
    const { tableData, ...guestType } = newData;
    this.props.onUpdate({ ...guestType, id: oldData.id });
    scrollToEl(NEW_OR_UPDATED_ROW);
    this.resetHelperGlobals();
    return;
  };

  /**
   * Runs when we confirmed deletion on an existing row.
   * Here we make the call to the endpoint with the data for the row we want to delete.
   *
   * @param { newData }
   * */
  onRowDelete = async (oldData) => {
    await new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const { tableData, ...guestType } = oldData;
        this.props.onDelete(guestType);
        this.updatedRow = undefined;
        this.resetHelperGlobals();
        resolve();
      }, deleteTransitionDuration - 200);
    });
  };

  render() {
    const { guestTypes, intl } = this.props;

    return (
      <AlteredMaterialTable
        noContentMessage={intl.messages['settings.noGuestTypes']}
        tableRef={this.tableRef}
        // @ts-ignore
        columns={this.extractColumnsFromData()}
        data={guestTypes}
        actions={this.customActions}
        // @ts-ignore
        options={materialTableOptions}
        onRowClick={this.onRowClick}
        components={{
          Header: this.overrideTableHead,
          Body: this.overrideTableBody,
          Action: this.overrideAction,
          OverlayLoading: this.overrideOverlay,
          EditRow: this.overrideEditRow
        }}
        editable={{
          onRowAdd: this.onRowAdd,
          onRowUpdate: this.onRowUpdate,
          onRowDelete: this.onRowDelete
        }}
        style={{
          marginTop: '40px',
          width: '100%'
        }}
      />
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  showModal: (data) => dispatch(uiDispatch.showModal(data)),
  showNotification: (message, isError, icon) => {
    dispatch(showNotification(message, isError || false, icon ? icon : null));
  }
});

export default connect<{}, DispatchProps, OwnProps>(
  null,
  mapDispatchToProps
)(injectIntl(GuestTypeTable));
