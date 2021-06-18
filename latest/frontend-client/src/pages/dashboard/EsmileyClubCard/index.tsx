import * as React from 'react';
import MediaCard from 'dashboard/MediaCard';
import joinEsmileyClubImage from 'static/img/join-esmiley-club-cover.jpg';
import { makeStyles } from '@material-ui/core/styles';

// this will be replaced with embedded iframe eventually,
// for now we are simply hard coding english content.

const contents = {
  title: 'Join the eSmiley food waste club',
  body:
    'A new beginning, a new start. After difficult times with the corona behind us, it’s time to celebrate and start a club. Everyone is welcome to join. We share knowledge in many different fun ways, together.',
  joinUs: 'Join us today at ',
  linkText: 'esmiley.dk/foodwasteclub',
  linkHref: 'https://www.esmiley.dk/madspildsklubben?hsLang=en'
};

const useStyles = makeStyles((theme) => ({
  linkMargin: {
    marginTop: theme.spacing(2)
  },
  link: {
    display: 'inline-block',
    fontWeight: 'bold'
  }
}));

const EsmileyClubCard: React.FunctionComponent = (props) => {
  const classes = useStyles(props);

  return (
    <MediaCard title={contents.title} imageSrc={joinEsmileyClubImage} imageAlign='right'>
      <span>{contents.body}</span>
      <div className={classes.linkMargin}>
        {contents.joinUs}
        <a className={classes.link} href={contents.linkHref} target='_BLANK' rel='noreferrer'>
          {contents.linkText}
        </a>
      </div>
    </MediaCard>
  );
};

export default EsmileyClubCard;
