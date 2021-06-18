/* eslint-disable */

import * as React from 'react';
import { connect } from 'react-redux';
import { InjectedIntlProps, injectIntl, FormattedHTMLMessage } from 'react-intl';
import * as contentDispatch from 'redux/ducks/content';
import * as uiDispatch from 'redux/ducks/ui';
// MATERIAL TABLE
import { Column, MTableBody } from 'material-table';
import AlteredMaterialTable from 'components/MaterialTable';

// ICONS
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityIcon from '@material-ui/icons/Visibility';
import AddPhotoIcon from '@material-ui/icons/AddAPhoto';

// OVERWRITTEN MATERIAL TABLE COMPONENTS
import CustomTableBody from 'components/MaterialTable/components/customTableBody';
import CustomTableRow from 'components/MaterialTable/components/customTableRow';
import CustomTableHead from 'components/MaterialTable/components/customTableHead';
import CustomEditRow from 'components/MaterialTable/components/customEditRow';
import CustomTableAction from 'components/MaterialTable/components/customTableAction';

// MISC
import {
  colors,
  IconButton,
  Slide,
  Tooltip,
  withWidth,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem
} from '@material-ui/core';
import { WithWidth } from '@material-ui/core/withWidth';
import palette from 'styles/palette';
import ImageGallery from 'modalContent/image-gallery';
import Input from 'components/input';
import NumberInput from 'input/number';
import { formatMass, unformatMass } from 'formatted-mass';
import { formatMoney, formatNumber, formatWeight, unformat } from 'utils/number-format';
import { validate } from 'validator';
import { showNotification } from 'redux/ducks/notification';
import * as registrationPointsDispatch from 'redux/ducks/data/registrationPoints';
import { RegistrationPoint } from 'redux/ducks/data/registrationPoints';
import * as settingsDispatch from 'redux/ducks/settings';
import { getNonDeletedRegistrationPointsDepthFirst } from 'redux/ducks/data/registrationPoints/selectors';
import HelpText from 'components/helpText';
import { AREA, getAllowedLabels, getParentLabels, LABELS, Labels, PRODUCT } from 'utils/labels';
import { scrollToEl } from 'utils/helpers';
import { isIE11 } from 'utils/browsers';
import { NumberFormatValues } from 'react-number-format';
import HowToAccordion from 'settings/components/settings/registrations/HowToAccordion';

// MT options (https://material-table.com/#/docs/all-props)
const materialTableOptions: any = {
  actionsColumnIndex: -1,
  showTitle: false,
  search: false,
  searchFieldAlignment: 'left',
  emptyRowsWhenPaging: false,
  paginationType: 'stepped',
  toolbarButtonAlignment: 'right',
  headerStyle: {
    backgroundColor: colors.grey['50']
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

type CreateResult = {
  payload: RegistrationPoint;
};

type DeleteResult = {
  payload: string;
};

interface OwnProps {
  contentType: string;
}

interface StoreProps {
  registrationPoints: RegistrationPoint[];
  currency: string;
  unit: string;
  allowRegistrationsOnAnyPoint: boolean;
  registrationPointsMap: Map<Number, RegistrationPoint>;
}

interface DispatchProps {
  getRegistrationPoints: () => void;
  showModal: (data) => void;
  showNotification: (message: string, isError?: boolean, icon?: JSX.Element) => void;
  createRegistrationPoint: (data) => Promise<CreateResult>;
  updateRegistrationPoint: (id, diff) => Promise<void>;
  deleteRegistrationPoint: (id) => Promise<DeleteResult>;
  updateSettings: (data) => void;
}

interface ComponentProps
  extends OwnProps,
    StoreProps,
    DispatchProps,
    InjectedIntlProps,
    WithWidth {}

const NO_ID = 'no-id';
const NEW_OR_UPDATED_ROW = 'new-or-updated-row';
const deleteTransitionDuration = 1000;

class RegistrationSettings extends React.Component<ComponentProps, {}> {
  deletedRow: any;
  tableRef = React.createRef<any>();

  // customActions: Custom actions to be added besides the default ones 'Edit' & 'Delete', on each table row
  private customActions: {
    onClick: (event, rowData) => void;
    icon: () => any;
    tooltip: string;
  }[];
  // parentId: Used to know under which element we need to render an Edit row, and we also pass it to the endpoint
  private parentId: number;
  // expandedTrees: Used to keep track of which rows are expanded, so that when MT re-renders and collapses all trees, we can re-expand them
  private expandedTrees: number[];
  // whitelistedKeys: Array including properties that we want to work with. Taken from old solution.
  private whitelistedKeys: string[];
  // newRow: Variable which we can use to determine if the row we're rendering is a newly added one. (Styling purposes)
  private newRow: number | string;
  // updatedRow: Just like newRow, this is used to determine if the row we're rendering has just been updated. (Styling purposes)
  private updatedRow: number | string;
  // path: Used in the CustomEditRow to calculate indentation, depending on how many levels in we are
  private path: string;
  // parentLabel: Used to figure out the possible labels a new or existing registration point can have
  private parentLabel: Labels;

  constructor(props: ComponentProps) {
    super(props);

    // Custom actions to be added besides the default ones Edit & Delete
    this.customActions = [
      {
        icon: () => <AddIcon color={'primary'} />,
        tooltip: props.intl.formatMessage(
          { id: 'settings.content.add' },
          { contentType: props.intl.messages[props.contentType] }
        ),
        onClick: (event, rowData) => {
          this.tableRef.current.onEditingCanceled('update');
          this.hideAddNewRow();
          this.parentId = rowData.id;
          this.parentLabel = rowData.label;

          if (!rowData.tableData.isTreeExpanded) {
            this.tableRef.current.dataManager.changeTreeExpand(rowData.tableData.path);
          }

          if (this.expandedTrees.indexOf(rowData.id) === -1) {
            this.expandedTrees.push(rowData.id);
          }

          this.path = rowData.path;
          this.tableRef.current.setState({
            ...this.tableRef.current.dataManager.getRenderState(),
            showAddRow: true
          });
        }
      },
      {
        icon: () => <VisibilityIcon color='primary' />,
        tooltip: props.intl.messages['base.deactivate'],
        onClick: (event, rowData) => {
          const newData = Object.assign({}, rowData);
          newData.active = !newData.active;
          this.onRowUpdate(newData, rowData);
        }
      }
    ];

    this.expandedTrees = [];

    this.whitelistedKeys = [
      'image',
      'name',
      'cost',
      'amount',
      'costPerkg',
      'co2Perkg',
      'active',
      'label',
      'parentId'
    ];
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
  extractColumnsFromData = (): Column<RegistrationPoint>[] => {
    const disabledColumns = ['active', 'amount', 'costPerkg'];
    const enabledColumns = this.whitelistedKeys.filter(
      (key) => disabledColumns.indexOf(key) === -1
    );

    return enabledColumns.map((key) => {
      switch (key) {
        case 'name':
          return this.setupNameColumn(key);
          break;

        case 'image':
          return this.setupImageColumn(key);
          break;

        case 'cost':
          return this.setupCostColumn(key);
          break;

        case 'amount':
          return this.setupAmountColumn(key);
          break;

        case 'co2Perkg':
          return this.setupCO2PerKgColumn(key);
          break;

        case 'costPerkg':
          return this.setupCostPerKgColumn(key);
          break;

        case 'label':
          return this.setupLabelColumn(key);
          break;

        case 'parentId':
          return this.setupParentColumn(key);
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
  setupDefaultColumn = (key): Column<RegistrationPoint> => {
    const { intl } = this.props;

    return {
      title: intl.messages[key],
      field: key
    };
  };

  /**
   * Returns an object with needed data for custom-rendering
   * @returns { Column } - object including properties needed to custom-render the field in the table
   * */
  setupLabelColumn = (key): Column<RegistrationPoint> => {
    const { intl, width } = this.props;

    return {
      title: intl.messages[key],
      field: key,
      headerStyle: {
        width: '12%'
      },
      cellStyle: {
        width: '12%'
      },
      hidden: width === 'xs' || width === 'sm',
      render: this.renderLabelColumn,
      editComponent: (props) => this.renderLabelEditMode(props, key)
    };
  };

  /**
   * Returns an object with needed data for custom-rendering
   * @returns { Column } - object including properties needed to custom-render the field in the table
   * */
  setupParentColumn = (key): Column<RegistrationPoint> => {
    const { width } = this.props;

    return {
      title: '',
      field: key,
      headerStyle: {
        width: '16%'
      },
      cellStyle: {
        width: '16%'
      },
      hidden: width === 'xs' || width === 'sm',
      sorting: false,
      render: () => <span />,
      editComponent: (props) => this.renderParentEditMode(props, key)
    };
  };

  /**
   * Renders the data for the 'Label' column
   * @param { rowData } - row data
   * @returns { string | JSX.Element } - returns the value needed to be rendered, or the value together with an icon if it's a newly added row
   * */
  renderLabelColumn = (rowData): string | JSX.Element => {
    const { intl } = this.props;

    return <span>{intl.messages[rowData.label]}</span>;
  };

  /**
   * Renders the custom edit component for the 'Label' column
   * @param { props } - props
   * @param { key } - the key
   * @returns { JSX.Element } - the element that should be rendered instead of the default edit component provided by MT
   * */
  renderLabelEditMode = (props, key): JSX.Element => {
    const { intl } = this.props;
    const { children: childrenRows } = props.rowData;
    const { value = AREA } = props;
    const uniqueChildrenLabels = (childrenRows
      ? [...new Set(childrenRows.map((row) => row.label))]
      : []) as Labels[];
    const allowedLabels = getAllowedLabels(this.parentLabel, uniqueChildrenLabels);

    return (
      <Select
        required={true}
        value={value}
        name='regPointLabel'
        style={{
          width: 'auto',
          marginTop: -6,
          verticalAlign: 'bottom',
          marginRight: -5,
          minWidth: '80px',
          height: '48px'
        }}
        autoWidth={true}
        label={intl.messages[key]}
        onChange={(e, child: React.ReactNode) => {
          props.onChange(e.target.value);
        }}
      >
        {LABELS.map((element: string, index: number) => (
          <MenuItem
            disabled={allowedLabels.indexOf(element as Labels) === -1}
            value={element}
            key={`label_${index}`}
            selected={element === value}
          >
            {intl.messages[element]}
          </MenuItem>
        ))}
      </Select>
    );
  };

  /**
   * Renders the custom edit component for the 'Parent' column
   * @param { props } - props
   * @param { key } - the key
   * @returns { JSX.Element } - the element that should be rendered instead of the default edit component provided by MT
   * */
  renderParentEditMode = (props, key): JSX.Element => {
    const isNewRow = !props.rowData.id;
    const { intl, registrationPoints, registrationPointsMap } = this.props;
    const {
      label = PRODUCT,
      id = null,
      parentId: changedParentId = this.parentId ? this.parentId : null
    } = props.rowData;
    const { parentId: originalParentId = null } = !isNewRow ? registrationPointsMap.get(id) : {};
    const possibleParentLabels = [...getParentLabels(label), label];
    const possibleParents = [
      {
        id: NO_ID,
        name: intl.messages['topLevel']
      },
      ...registrationPoints.filter(
        (regPoint) => possibleParentLabels.indexOf(regPoint.label) !== -1 && regPoint.id !== id
      )
    ];

    return (
      <div style={{ display: 'flex', minWidth: '160px' }}>
        <Select
          required={true}
          value={changedParentId ? changedParentId : possibleParents[0].id}
          name='regPointParent'
          style={{
            width: 'auto',
            marginTop: -6,
            verticalAlign: 'bottom',
            marginRight: -5,
            height: '48px'
          }}
          autoWidth={true}
          label={intl.messages[key]}
          onChange={this.onSelectParentChange(props)}
        >
          {possibleParents.map((element: RegistrationPoint, index: number) => {
            const isChecked = changedParentId ? element.id === changedParentId : index === 0;
            const isOriginalValue = originalParentId
              ? element.id === originalParentId
              : !isNewRow && index === 0;
            const indentation = 60 + (element.path ? 25 * element.path.split('.').length : 0);

            return (
              <MenuItem
                style={{ fontWeight: index === 0 ? 'bold' : 'normal', paddingLeft: indentation }}
                disabled={isOriginalValue}
                value={element.id}
                key={`parent_${element.id}`}
                selected={isChecked}
              >
                {element.name}
              </MenuItem>
            );
          })}
        </Select>
        <HelpText size='small' helpText={intl.messages['help.settings.parent']} />
      </div>
    );
  };

  onSelectParentChange = (props) => (e, child: React.ReactNode) => {
    const { registrationPointsMap } = this.props;
    const regPointId = e.target.value;
    const { label: newParentLabel } =
      regPointId !== NO_ID ? registrationPointsMap.get(regPointId) : { label: AREA };
    this.parentLabel = newParentLabel as Labels;

    props.onChange(regPointId === NO_ID ? null : regPointId);
  };

  /**
   * Returns an object with needed data for custom-rendering
   * @param { key }
   * @returns { Column } - object including properties needed to custom-render the field in the table
   * */
  setupNameColumn = (key): Column<RegistrationPoint> => {
    const { intl } = this.props;

    return {
      title: intl.messages[key],
      field: key,
      cellStyle: {
        position: 'relative',
        width: '40%',
        whiteSpace: 'pre'
      },
      headerStyle: {
        paddingLeft: 28,
        width: '40%'
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
              title={intl.messages['help.settings.content.registrationPoints']}
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
        style={{ minWidth: '120px', width: '50%', marginTop: '-6px', height: '48px' }}
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
  isValidData = (rowData, key) => {
    const validation = validate('registration-point-create-request', rowData);
    return !(validation.hasOwnProperty(key) && validation[key]);
  };

  /**
   * Returns an object with needed data for custom-rendering
   * @param { key }
   * @returns { Column } - returns the value needed to be rendered, or the value together with an icon if it's a newly added row
   * */
  setupCostColumn = (key): Column<RegistrationPoint> => {
    const { intl, currency, unit } = this.props;

    return {
      title: `${intl.messages[key]} (${currency}/${unit})`,
      field: key,
      headerStyle: {
        width: '15%'
      },
      cellStyle: {
        width: '15%'
      },
      editComponent: (props) => this.renderCostEditMode(props, key),
      render: (rowData) => {
        return formatMoney(rowData[key]).toString();
      }
    };
  };

  /**
   * Renders the custom edit component for the 'Cost' column
   * @param { props } - props
   * @param { key } - the key
   * @returns { JSX.Element } - the element that should be rendered instead of the default edit component provided by MT
   * */
  renderCostEditMode = (props, key): JSX.Element => {
    const { intl, currency, unit } = this.props;
    let costValue = props.value;
    let floatValue = formatMoney(costValue).value;

    return (
      <NumberInput
        value={props.value ? floatValue : props.value}
        type={'text'}
        shouldValidate={() => {
          return this.isValidData(props.rowData, key);
        }}
        component={TextField}
        allowNegative={false}
        name={`${key}_field`}
        style={{ minWidth: '120px', marginTop: '-6px', height: '48px' }}
        inputMode={'decimal'}
        onValueChange={this.onCostValueChange(props)}
        label={`${intl.messages[`${key}`]} (${currency}/${unit})`}
        onKeyDown={(event) => this.onInputKeyDown(event, props)}
      />
    );
  };

  onCostValueChange = (props) => (values: NumberFormatValues) => {
    const floatValue = values.floatValue;

    props.onChange(formatMoney(floatValue, { inMajorUnit: true }).inMinorUnits);
  };

  /**
   * Returns an object with needed data for custom-rendering
   * @param { key }
   * @returns { Column } - returns the value needed to be rendered, or the value together with an icon if it's a newly added row
   * */
  setupAmountColumn = (key): Column<RegistrationPoint> => {
    const { intl } = this.props;

    return {
      title: intl.messages[key],
      field: key,
      headerStyle: {
        width: '11%'
      },
      cellStyle: {
        width: '11%'
      },
      editComponent: (props) => this.renderAmountEditMode(props, key),
      render: (rowData) => {
        return formatWeight(rowData[key]);
      }
    };
  };

  /**
   * Renders the custom edit component for the 'Amount' column
   * @param { props } - props
   * @param { key } - the key
   * @returns { JSX.Element } - the element that should be rendered instead of the default edit component provided by MT
   * */
  renderAmountEditMode = (props, key) => {
    const { intl } = this.props;
    let massFloat = formatMass(props.value);

    return (
      <NumberInput
        required
        value={props.value ? massFloat : props.value}
        type={'text'}
        shouldValidate={() => {
          return this.isValidData(props.rowData, key);
        }}
        component={TextField}
        allowNegative={false}
        inputMode={'decimal'}
        name={`${key}_field`}
        style={{ width: '50%', marginTop: '-6px', height: '48px' }}
        label={`${intl.messages[`${key}`]}`}
        onValueChange={this.onAmountValueChange(props)}
        onKeyDown={(event) => this.onInputKeyDown(event, props)}
      />
    );
  };

  onAmountValueChange = (props) => (values: NumberFormatValues) => {
    const massFloat = values.floatValue;

    props.onChange(unformatMass(massFloat));
  };

  /**
   * Returns an object with needed data for custom-rendering
   * @param { key }
   * @returns { Column } - returns the value needed to be rendered, or the value together with an icon if it's a newly added row
   * */
  setupImageColumn = (key): Column<RegistrationPoint> => {
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

  setupCO2PerKgColumn = (key): Column<RegistrationPoint> => {
    const { intl } = this.props;

    return {
      title: <FormattedHTMLMessage id={key} />,
      field: key,
      headerStyle: {
        width: '15%'
      },
      cellStyle: {
        width: '15%'
      },
      editComponent: (props) => {
        let costValue = props.value;
        let floatValue = formatWeight(costValue);

        return (
          <NumberInput
            required
            value={floatValue}
            type={'text'}
            style={{ minWidth: '120px', marginTop: '-6px' }}
            component={TextField}
            onChange={(e) => {
              props.onChange(unformat(e.target.value) * 1000);
            }}
            inputMode={'decimal'}
            allowNegative={false}
            min={1}
            name={`${key}_field`}
            label={<FormattedHTMLMessage id={intl.messages[key]} />}
          />
        );
      },
      render: (rowData) => {
        return rowData[key] ? formatWeight(rowData[key]) : '-';
      }
    };
  };

  /**
   * Returns an object with needed data for custom-rendering
   * @param { key }
   * @returns { Column } - returns the value needed to be rendered, or the value together with an icon if it's a newly added row
   * */
  setupCostPerKgColumn = (key): Column<RegistrationPoint> => {
    const { intl } = this.props;

    return {
      title: intl.messages[key],
      field: key,
      headerStyle: {
        width: '10%'
      },
      cellStyle: {
        color: '#CCC',
        width: '10%'
      },
      editComponent: (props) => {
        let costValue = props.value;
        let floatValue = formatNumber(costValue);

        return (
          <NumberInput
            required
            value={floatValue}
            type={'text'}
            disabled
            style={{ marginTop: '-6px' }}
            component={TextField}
            inputMode={'decimal'}
            allowNegative={false}
            min={1}
            name={`${key}_field`}
            label={`${intl.messages[`${key}`]}`}
          />
        );
      },
      render: (rowData) => {
        return formatMoney(rowData[key]).toString();
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
  onImageClickHandler(
    rowData: RegistrationPoint,
    callBack: (data: RegistrationPoint) => void
  ): void {
    this.props.showModal({
      title: null,
      fullBleed: true,
      className: 'imageGallery',
      size: 'md',
      fullWidth: true,
      disablePadding: true,
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
   *
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
   * Sets the correct VisibilityIcon icon depending on the 'active' property
   *
   * @param { props }
   * */
  setCorrectVisibilityIcon = (props) => {
    const { intl } = this.props;

    if (!props.data.active) {
      props.actions[1].icon = () => <VisibilityOffIcon style={{ color: colors.grey['400'] }} />;
      props.actions[1].tooltip = intl.messages['base.activate'];
    } else {
      props.actions[1].icon = () => <VisibilityIcon color={'primary'} />;
      props.actions[1].tooltip = intl.messages['base.deactivate'];
    }
  };

  /**
   * Override the default MT table row with a custom one, and render it.
   * The custom row is a copy of the original, with some small code adjustments.
   *
   * @param { props }
   * */
  overrideTableRow = (props): JSX.Element => {
    const rowData = props.data;
    const isTreeExpanded = this.expandedTrees.includes(rowData.id)
      ? true
      : rowData.tableData.isTreeExpanded;
    const hasEditRow =
      this.tableRef.current &&
      this.tableRef.current.state.showAddRow &&
      this.parentId === props.data.id;
    const isRowUpdatedOrNew = this.updatedRow === props.data.id || this.newRow === props.data.id;

    // CRAS: This is an MT bug. (https://github.com/mbrn/material-table/issues/1442)
    // The path stored in rowData.tableData.path is incorrect when sorting the table, while props.path is correct.
    // As a quick fix, I'm overwriting the wrong path with the correct one.
    rowData.tableData.path = props.path;

    this.setCorrectVisibilityIcon(props);
    this.updatedRow = this.updatedRow === props.data.id ? undefined : this.updatedRow;

    if (isTreeExpanded !== rowData.tableData.isTreeExpanded) {
      this.tableRef.current.dataManager.changeTreeExpand(rowData.tableData.path);
    }

    return (
      <>
        <CustomTableRow
          {...props}
          onTreeExpandClick={this.onTreeExpandClick}
          id={isRowUpdatedOrNew ? NEW_OR_UPDATED_ROW : null}
        />
        {hasEditRow && this.renderEditRow(props)}
      </>
    );
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
    return <CustomTableBody {...props} parentId={this.parentId} />;
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
    const { data: rowData } = props;
    const isNewRow = !rowData;

    const { registrationPointsMap } = this.props;
    const parentId = rowData && rowData.parentId ? rowData.parentId : this.parentId;
    const parentRow = registrationPointsMap.get(parentId);
    const slidingIn =
      props.data && props.data.id && props.data.id === this.deletedRow ? false : true;
    const slideDuration =
      props.data && props.data.id && props.data.id === this.deletedRow
        ? deleteTransitionDuration
        : 0;
    this.parentLabel = (parentRow && parentRow.label) as Labels;

    if (props.mode === 'delete') {
      const { intl } = this.props;

      deleteConfirmationText = intl.formatMessage(
        { id: 'settings.content.deleteConfirmation' },
        { registrationPoint: props.data.name }
      );
    }

    const proxyProps = { ...props, data: isNewRow ? { label: 'area' } : rowData };

    return (
      <Slide in={slidingIn} direction={'left'} timeout={slideDuration}>
        <CustomEditRow
          {...proxyProps}
          parentId={this.parentId}
          path={this.path}
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
    const { intl, contentType } = this.props;
    const buttonTitleAdd = intl.formatMessage(
      { id: 'settings.content.add' },
      { contentType: intl.messages[contentType] }
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
   * Whenever an Edit row has been approved (by Enter or clicking on the CheckIcon icon), this callback is called
   *
   * @param { data }
   **/
  onSubmitHandler = (data: RegistrationPoint, mode?: string): void => {
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
    this.parentId = undefined;
    this.path = undefined;
    this.parentLabel = undefined;
    this.deletedRow = undefined;
  };

  /**
   * Clicking on a row triggers the Edit mode on that specific row
   *
   * @param { event }
   * @param { rowData }
   * */
  onRowClick = (event, rowData) => {
    if (
      !event.target.classList.contains('tooltip') &&
      !event.target.parentNode.classList.contains('tooltip')
    ) {
      this.tableRef.current.dataManager.changeRowEditing(rowData, 'update');
      this.hideAddNewRow();
    }
  };

  /**
   * Clicking on an arrow that expands/collapses the row to show/hide its children rows will trigger this callback
   *
   * @param { data }
   * @param { isTreeExpanded }
   * */
  onTreeExpandClick = (data, isTreeExpanded: boolean) => {
    this.hideAddNewRow();
    this.tableRef.current.onEditingCanceled('update');

    if (!isTreeExpanded && this.expandedTrees.indexOf(data.id) === -1) {
      this.expandedTrees.push(data.id);
    } else if (isTreeExpanded && this.expandedTrees.indexOf(data.id) !== -1) {
      this.expandedTrees.splice(this.expandedTrees.indexOf(data.id), 1);
      if (data.tableData.childRows && data.tableData.childRows.length) {
        this.collapseChildrenRows(data.tableData.childRows);
      }
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
   * Collapse the children rows found under a specific row that has just been closed.
   * This is a 'nice to have', so that it resets the view when you, for example,
   * close the root node, after expanding all its child nodes.
   *
   * @param { data }
   * */
  collapseChildrenRows(data) {
    data.map((child) => {
      this.expandedTrees.indexOf(child.id) !== -1 &&
        this.expandedTrees.splice(this.expandedTrees.indexOf(child.id), 1);

      if (child.tableData.isTreeExpanded) {
        this.tableRef.current.dataManager.changeTreeExpand(child.tableData.path);
      }

      if (child.tableData.childRows && child.tableData.childRows.length) {
        this.collapseChildrenRows(child.tableData.childRows);
      }
    });
  }

  /**
   * Expand the parent rows of an element with a specific parentId. Recursive.
   *
   * @param { parentId }
   * */
  expandParentRows = (parentId) => {
    if (parentId && this.expandedTrees.indexOf(parentId) === -1) {
      const { registrationPointsMap } = this.props;
      const parent = registrationPointsMap.get(parentId);

      this.expandedTrees.push(parentId);

      this.expandParentRows(parent.parentId);
    }
  };

  /**
   * Runs when an Edit row for a brand new row has been 'confirmed',
   * by pressing Enter or clicking on the CheckIcon icon.
   * Here we make the call to the endpoint with the data for the new row.
   *
   * @param { newData }
   * */
  onRowAdd = (newData) => {
    return new Promise<void>(async (resolve, reject) => {
      const { registrationPointsMap } = this.props;
      const parentId =
        newData.parentId !== undefined ? newData.parentId : this.parentId ? this.parentId : null;
      const parent = parentId && registrationPointsMap.get(parentId);

      newData.active = parent ? parent.active : newData.active;
      newData.parentId = parentId;

      await this.props
        .createRegistrationPoint(newData)
        .then((res) => (this.newRow = res.payload.id));
      this.expandParentRows(newData.parentId);
      await this.props.getRegistrationPoints();
      this.resetHelperGlobals();
      scrollToEl(NEW_OR_UPDATED_ROW);
      resolve();
    });
  };

  /**
   * Runs when an Edit row for an existing row has been 'confirmed',
   * by pressing Enter or clicking on the CheckIcon icon.
   * Here we make the call to the endpoint with the new data for the existing row.
   *
   * @param { newData }
   * */
  onRowUpdate = (newData, oldData) => {
    return new Promise<void>(async (resolve, reject) => {
      const patch = this.getPatchObject(newData, oldData);

      if (patch.length) {
        await this.props.updateRegistrationPoint(newData.id, patch);
        this.expandParentRows(newData.parentId);
        await this.props.getRegistrationPoints();
        scrollToEl(NEW_OR_UPDATED_ROW);
      } else {
        this.updatedRow = undefined;
      }
      this.resetHelperGlobals();
      resolve();
    });
  };

  /**
   * Returns the patch object based on the newData and oldData params
   *
   * @param { newData }
   * @param { oldData }
   * */
  getPatchObject = (newData, oldData) => {
    return this.whitelistedKeys.reduce((ops, key) => {
      if (oldData[key] !== newData[key]) {
        ops.push({ op: 'replace', path: `/${key}`, value: newData[key] });

        if (key === 'parentId') {
          // If the new parent is inactive, deactivate this point as well
          const { registrationPointsMap } = this.props;
          const { active: isParentActive } = registrationPointsMap.get(newData[key]) || {
            active: true
          };

          if (!isParentActive && newData['active']) {
            ops.push({ op: 'replace', path: '/active', value: isParentActive });
          }
        }
      }

      return ops;
    }, []);
  };

  /**
   * Runs when we confirmed deletion on an existing row.
   * Here we make the call to the endpoint with the data for the row we want to delete.
   *
   * @param { newData }
   * */
  onRowDelete = (oldData): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
      await this.props.deleteRegistrationPoint(oldData.id).then((result) => {
        this.updatedRow = undefined;

        if (result.payload === oldData.name) {
          setTimeout(async () => {
            await this.props.getRegistrationPoints();
            this.resetHelperGlobals();
            resolve();
          }, deleteTransitionDuration - 200);
        } else {
          this.deletedRow = undefined;
          reject();
        }
      });
    });
  };

  render() {
    const { updateSettings, allowRegistrationsOnAnyPoint, registrationPoints, intl } = this.props;

    return (
      <>
        <div className='setting setting--borderless'>
          <HelpText helpText={intl.messages['help.settings.allowRegistrationsOnAnyPoint']}>
            &nbsp;
          </HelpText>
          <FormControlLabel
            control={
              <Switch
                color={'primary'}
                checked={allowRegistrationsOnAnyPoint}
                onChange={(e, isInputChecked) => {
                  updateSettings({ allowRegistrationsOnAnyPoint: isInputChecked });
                }}
              />
            }
            label={intl.messages['settings.registrationPoints.allowRegistrationsOnAnyPoint']}
          />
          <HowToAccordion />
        </div>
        <AlteredMaterialTable
          tableRef={this.tableRef}
          // @ts-ignore
          columns={this.extractColumnsFromData()}
          data={registrationPoints}
          components={{
            Header: this.overrideTableHead,
            Body: this.overrideTableBody,
            Row: this.overrideTableRow,
            OverlayLoading: this.overrideOverlay,
            EditRow: this.overrideEditRow,
            Action: this.overrideAction
          }}
          onTreeExpandClick={this.onTreeExpandClick}
          actions={this.customActions}
          options={{
            ...materialTableOptions
          }}
          onRowClick={this.onRowClick}
          editable={{
            onRowAdd: this.onRowAdd,
            onRowUpdate: this.onRowUpdate,
            onRowDelete: this.onRowDelete
          }}
          style={{
            marginTop: '40px'
          }}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  registrationPoints: getNonDeletedRegistrationPointsDepthFirst(state),
  registrationPointsMap: state.data.registrationPoints.registrationPointsMap,
  currency: state.settings.currency,
  unit: state.settings.unit,
  allowRegistrationsOnAnyPoint: state.settings.allowRegistrationsOnAnyPoint
});

const mapDispatchToProps = (dispatch) => ({
  getRegistrationPoints: () => dispatch(registrationPointsDispatch.findTree()),
  showModal: (data) => dispatch(uiDispatch.showModal(data)),
  showNotification: (message, isError, icon) => {
    dispatch(showNotification(message, isError || false, icon ? icon : null));
  },
  createRegistrationPoint: (data) => dispatch(contentDispatch.createRegistrationPoint(data)),
  updateRegistrationPoint: (id, diff) =>
    dispatch(contentDispatch.updateRegistrationPoint(id, diff)),
  deleteRegistrationPoint: (id) => dispatch(contentDispatch.deleteRegistrationPoint(id)),
  updateSettings: (data) => dispatch(settingsDispatch.update(data))
});

export default withWidth()(
  connect<StoreProps, DispatchProps, OwnProps>(
    mapStateToProps,
    mapDispatchToProps
  )(injectIntl(RegistrationSettings))
);
