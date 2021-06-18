import * as React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Grid, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { makeStyles } from '@material-ui/core/styles';
import { eSmileyBlue } from 'styles/palette';
import AddIcon from '@material-ui/icons/Add';
import { injectIntl, InjectedIntlProps, FormattedHTMLMessage, FormattedMessage } from 'react-intl';

const useStyles = makeStyles((theme) => ({
  paper: {
    '&:before': {
      display: 'none'
    },
    '&$expanded': {
      margin: 'auto'
    },
    boxShadow: 'none',
    width: '100%'
  },
  // without this expansion jiggles for some reason
  expanded: {},
  summary: {
    backgroundColor: eSmileyBlue,
    color: theme.palette.common.white,
    marginBottom: -1,
    minHeight: 56,
    '&$expanded': {
      minHeight: 56
    }
  },
  summaryContent: {
    '&$expanded': {
      margin: '12px 0'
    }
  },
  details: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  },
  helpIcon: {
    marginRight: '12px'
  },
  whiteText: {
    color: theme.palette.common.white
  },
  addIcon: {
    verticalAlign: 'middle',
    color: theme.palette.success.main
  }
}));

interface HowToBoxProps {
  title: React.ReactNode;
}

const HowToBox: React.FunctionComponent<HowToBoxProps> = ({ title, children }) => (
  <div>
    <Typography variant='h6' component='div'>
      {title}
    </Typography>
    <Typography variant='body2' component='div'>
      {children}
    </Typography>
  </div>
);

const HowToAccordion: React.FunctionComponent<InjectedIntlProps> = (props) => {
  const classes = useStyles(props);
  const { intl } = props;

  return (
    <Accordion
      square
      classes={{ root: classes.paper, expanded: classes.expanded }}
      TransitionProps={{ unmountOnExit: true }}
    >
      <AccordionSummary
        classes={{
          root: classes.summary,
          content: classes.summaryContent,
          expanded: classes.expanded,
          expandIcon: classes.whiteText
        }}
        expandIcon={<ExpandMoreIcon />}
        aria-controls='panel1a-content'
        id='panel1a-header'
      >
        <HelpOutlineIcon className={classes.helpIcon} />
        <Typography className={classes.whiteText}>
          {intl.messages['settings.registrationPoints.howTo.title']}
        </Typography>
      </AccordionSummary>
      <AccordionDetails className={classes.details}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <HowToBox title={intl.messages['settings.registrationPoints.howTo.hierarchy.title']}>
              <FormattedMessage
                id='settings.registrationPoints.howTo.hierarchy.content'
                values={{ addIcon: <AddIcon fontSize='small' className={classes.addIcon} /> }}
              />
            </HowToBox>
          </Grid>
          <Grid item xs={12} sm={4}>
            <HowToBox title={intl.messages['settings.registrationPoints.howTo.value.title']}>
              <FormattedMessage id='settings.registrationPoints.howTo.value.content' />
            </HowToBox>
          </Grid>
          <Grid item xs={12} sm={4}>
            <HowToBox
              title={<FormattedHTMLMessage id='settings.registrationPoints.howTo.co2.title' />}
            >
              <FormattedMessage id='settings.registrationPoints.howTo.co2.content' />{' '}
            </HowToBox>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default injectIntl(HowToAccordion);
