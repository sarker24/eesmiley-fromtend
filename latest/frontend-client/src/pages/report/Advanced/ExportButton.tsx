import * as React from 'react';
import { IconButton, Menu, MenuItem, Tooltip } from '@material-ui/core';
import { Action } from 'material-table';
import { ExportExtension } from 'report/Advanced/utils/tableExport';
import { injectIntl, InjectedIntlProps } from 'react-intl';

// eslint-disable-next-line @typescript-eslint/ban-types
interface OwnProps<T extends object> {
  data: T[];
  action: Action<T>;
}

// eslint-disable-next-line @typescript-eslint/ban-types
type ExportButtonProps<T extends object> = InjectedIntlProps & OwnProps<T>;

// eslint-disable-next-line @typescript-eslint/ban-types
const ExportButton = <T extends object>(
  props: ExportButtonProps<T>,
  ref: React.Ref<React.ReactNode>
) => {
  const {
    intl,
    data,
    action: { icon: Icon, onClick, tooltip }
  } = props;

  const [anchorEl, setAnchor] = React.useState<HTMLButtonElement>(undefined);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setAnchor(e.currentTarget);
  };

  const handleClose = (e: React.ChangeEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAnchor(undefined);
  };

  const handleSelect = (e: React.MouseEvent<HTMLLIElement>, ext: ExportExtension) => {
    e.preventDefault();
    e.stopPropagation();
    setAnchor(undefined);
    onClick(ext, data);
  };

  return (
    <>
      <Tooltip title={tooltip} ref={ref}>
        <IconButton onClick={handleClick} color='primary'>
          <Icon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={(e) => handleSelect(e, 'csv')}>
          {intl.formatMessage({ id: 'exportAs' }, { fileExtension: 'CSV' })}
        </MenuItem>
        <MenuItem onClick={(e) => handleSelect(e, 'xlsx')}>
          {intl.formatMessage({ id: 'exportAs' }, { fileExtension: 'XLSX' })}
        </MenuItem>
      </Menu>
    </>
  );
};

export default injectIntl(React.forwardRef(ExportButton));
