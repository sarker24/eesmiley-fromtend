import CheckIcon from '@material-ui/icons/Check';
import { GridListTile as MuiGridListTile, GridListTileBar, Tooltip, Fab } from '@material-ui/core';
import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import ImagePlaceholder from 'static/img/placeholder.png';

interface IComponentProps {
  classes?: { [name: string]: string };
  value: React.ReactNode;
  onClick: (event: React.MouseEvent, value: React.ReactNode) => void;
  name: string;
  image?: string;
  isSelected: boolean;
  disabled?: boolean;
  allowRegistrationsOnAnyPoint?: boolean;
  className?: string;
}

class GridListTile extends React.Component<IComponentProps & InjectedIntlProps> {
  render() {
    const {
      intl,
      classes,
      disabled,
      name,
      image,
      isSelected,
      value,
      onClick,
      allowRegistrationsOnAnyPoint,
      ...rest
    } = this.props;

    return (
      <MuiGridListTile
        classes={{
          tile: classNames(classes.tile, {
            [classes.selectedTile]: isSelected,
            [classes.disabled]: disabled
          })
        }}
        onClick={(event) => !disabled && onClick(event, value)}
        key={name}
        {...rest}
      >
        <img src={image || ImagePlaceholder} alt={name} />
        <GridListTileBar
          title={name}
          titlePosition='bottom'
          actionIcon={
            allowRegistrationsOnAnyPoint && (
              <Tooltip placement='top-end' title={intl.messages['registration.registerHere']}>
                <Fab color={'primary'} className={classes.fab}>
                  <CheckIcon />
                </Fab>
              </Tooltip>
            )
          }
        />
      </MuiGridListTile>
    );
  }
}

const styles = {
  tile: {
    cursor: 'pointer'
  },
  selectedTile: {
    transition: 'all 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
    // elevation: 8
    boxShadow: `0px 5px 5px -3px rgba(0, 0, 0, 0.2),
    0px 8px 10px 1px rgba(0, 0, 0, 0.14),
    0px 3px 14px 2px rgba(0, 0, 0, 0.12);`
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  fab: {
    marginRight: 16,
    height: 40,
    width: 40
  }
};

export default withStyles(styles)(injectIntl(GridListTile));
