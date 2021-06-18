import * as React from 'react';
import { ITip } from 'redux/ducks/tips';
import { IconButton, Typography } from '@material-ui/core';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import MediaCard from 'dashboard/MediaCard';

export interface TipCardProps {
  tips: ITip[];
}

type OwnProps = InjectedIntlProps & TipCardProps;

const useStyles = makeStyles({
  buttonGroup: {
    display: 'flex',
    alignItems: 'center',
    '& button': {
      padding: '4px'
    }
  },
  iconButton: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: '4px'
  },
  xsSmallIcon: {
    fontSize: '1rem'
  },
  buttonGap: {
    width: '10px'
  },
  footnote: {
    width: '100%',
    display: 'inline-flex',
    justifyContent: 'space-between'
  },
  captionBold: {
    fontWeight: 800
  }
});

const TipCard: React.FunctionComponent<OwnProps> = (props) => {
  const classes = useStyles(props);
  const { tips, intl } = props;
  const [index, setIndex] = React.useState(0);

  const handlePrevious = () => {
    setIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    setIndex((prev) => prev + 1);
  };

  const locale = intl.locale === 'da' ? 'DK' : intl.locale.toUpperCase();
  const tip = tips[index];
  const tipLocale = tip && tip.title.hasOwnProperty(locale) ? locale : 'EN';

  return (
    tips.length > 0 && (
      <MediaCard
        title={intl.messages['dashboard.tip']}
        imageSrc={tip.imageUrl}
        actions={
          <div className={classes.buttonGroup}>
            <IconButton
              className={classes.iconButton}
              disableRipple
              color='primary'
              size='small'
              onClick={handlePrevious}
              disabled={index === 0}
            >
              <ChevronLeftIcon className={classes.xsSmallIcon} />
            </IconButton>
            <div className={classes.buttonGap} />
            <IconButton
              className={classes.iconButton}
              disableRipple
              color='primary'
              size='small'
              onClick={handleNext}
              disabled={index === tips.length - 1}
            >
              <ChevronRightIcon className={classes.xsSmallIcon} />
            </IconButton>
          </div>
        }
        footer={
          <div className={classes.footnote}>
            <Typography variant='caption'>{tip.title[tipLocale]}</Typography>
            <Typography className={classes.captionBold} variant='caption'>
              {`${intl.messages['week']} ${index + 1}`}
            </Typography>
          </div>
        }
      >
        <Typography variant='body2'>{tip.content[tipLocale]}</Typography>
      </MediaCard>
    )
  );
};

export default injectIntl(TipCard);
