import { InjectedIntlProps, injectIntl } from 'react-intl';
import * as registrationDispatch from 'redux/ducks/registration';
import { RegistrationActions } from 'redux/ducks/registration';
import StepInfo from './StepInfo';
import * as React from 'react';
import { connect } from 'react-redux';
import { Slide, Grid, InputAdornment } from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import moment from 'moment';
import classNames from 'classnames';
import { DatePicker } from '@material-ui/pickers';
import { Moment } from 'moment';
import EventIcon from '@material-ui/icons/Event';
import registrationPointPlaceholder from 'static/img/product_placeholder.png';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';
import TextAreaInput from 'TextAreaInput';
import { makeStyles } from '@material-ui/core/styles';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

interface OverviewProps extends StateProps, DispatchProps, InjectedIntlProps {}

const isAboveMobile = () => useMediaQuery('(min-width: 601px)');

const useStyles = makeStyles((theme) => ({
  comment: {
    marginTop: theme.spacing(2)
  },
  commentLabel: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: theme.palette.common.black
  }
}));

const Overview: React.FunctionComponent<OverviewProps> = (props) => {
  const classes = useStyles(props);
  const {
    enableRegistrationComments,
    comment,
    setComment,
    nodesHistory,
    updateStepper,
    intl,
    date,
    setDate
  } = props;

  const onDateChange = (newDate: Moment) => {
    const date = moment(newDate).toDate();
    date.setHours(0, 0, 0, 0);
    setDate(date);
  };

  const onCommentChange = (value: string) => {
    setComment(value);
  };

  return (
    <Grid container spacing={4} justify='center' className='overview'>
      <Grid item xs={12}>
        {nodesHistory.map((item, index) => {
          const name = Object.keys(item)[0];
          const registrationPoint = nodesHistory[index][name].filter((registrationPoint) => {
            return registrationPoint.name === name;
          });
          return (
            <Slide in={true} timeout={200} key={`${name}${index}`}>
              <StepInfo
                step={index}
                numOfSteps={nodesHistory.length - 1}
                className={classNames('step-info')}
                completed={true}
                onClick={() => updateStepper(index, name)}
                image={
                  registrationPoint[0].image
                    ? registrationPoint[0].image
                    : registrationPointPlaceholder
                }
                description={intl.messages[registrationPoint[0].label]}
                title={name ? name : intl.messages['registration.error.no_product']}
              />
            </Slide>
          );
        })}
      </Grid>
      {isAboveMobile() && (
        <Grid item xs={12}>
          <DatePicker
            fullWidth
            format='L'
            value={moment(date)}
            onChange={onDateChange}
            inputProps={{ style: { textAlign: 'right', fontSize: '1.8rem' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <EventIcon style={{ width: '1.8rem', height: '1.8rem' }} />
                </InputAdornment>
              )
            }}
          />
        </Grid>
      )}
      {enableRegistrationComments && (
        <Grid item xs={12}>
          <TextAreaInput
            className={classes.comment}
            name='comments'
            label={intl.messages['base.comments']}
            InputLabelProps={{ shrink: true, className: classes.commentLabel }}
            fullWidth
            multiline
            rows={5}
            rowsMax={50}
            value={comment}
            placeholder={intl.messages['base.comments.placeholder']}
            onChange={onCommentChange}
            maxLength={255}
          />
        </Grid>
      )}
    </Grid>
  );
};
const mapStateToProps = (state: RootState) => {
  const { step, nodesHistory, date, comment } = state.registration;
  const { enableRegistrationComments } = state.settings;
  return {
    step,
    nodesHistory,
    date,
    comment,
    enableRegistrationComments
  };
};
const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, void, RegistrationActions>) => ({
  updateStepper: (index, property) => {
    dispatch(registrationDispatch.updateStepper(index, property));
  },
  setDate: (date) => {
    dispatch(registrationDispatch.setDate(date));
  },
  setComment: (comment: string) => dispatch(registrationDispatch.setComment(comment))
});
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Overview));
