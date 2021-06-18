import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Link } from 'react-router';
import { Location } from 'history';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import getReportPages from 'report/utils/getReportPages';
import Select from 'report/components/Select';
import SelectItem from 'report/components/Select/components/SelectItem';
import { Typography } from '@material-ui/core';

interface ComponentProps extends InjectedIntlProps {
  location: Location;
}

const Navigation: React.FunctionComponent<ComponentProps> = (props) => {
  const { location, intl } = props;
  const classes = useStyles(props);

  const renderValue = () => intl.messages['report.navigation.title'];

  return (
    <Select
      closeOnSelect
      renderValue={renderValue}
      buttonProps={{
        classes: {
          outlinedPrimary: classes.outlinedPrimary,
          iconSizeMedium: classes.iconSizeMedium
        }
      }}
      menuProps={{
        MenuListProps: { disablePadding: true }
      }}
    >
      {getReportPages(intl).map((page, i) => (
        <SelectItem
          key={`${page.title}${i}`}
          component={Link}
          to={{ pathname: page.link, search: !page.isStartPage && location.search }}
          divider={page.divider}
          disabled={page.disabled}
        >
          <Typography>{page.title}</Typography>
        </SelectItem>
      ))}
    </Select>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex'
    },
    paper: {
      marginTop: 2
    },
    roundedPaper: {
      borderRadius: 5
    },
    outlinedPrimary: {
      borderColor: theme.palette.grey.A700,

      '& .MuiButton-endIcon': {
        color: theme.palette.primary.light
      },

      '&:hover': {
        borderColor: theme.palette.primary.light,

        '& .MuiButton-endIcon': {
          color: theme.palette.primary.main
        }
      }
    },
    iconSizeMedium: {
      '& > *:first-child': {
        fontSize: 22
      }
    }
  })
);

export default injectIntl(Navigation);
