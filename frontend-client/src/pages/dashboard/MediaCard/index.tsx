import * as React from 'react';
import { Card, CardContent, CardMedia, Typography } from '@material-ui/core';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

export interface MediaCardProps {
  title: string;
  imageSrc: string;
  imageAtlText?: string;
  imageAlign?: 'left' | 'right';
  actions?: React.ReactNode;
  footer?: React.ReactNode;
}

type OwnProps = InjectedIntlProps & MediaCardProps;

const useStyles = makeStyles((theme) => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2)
  },
  headerTitle: {
    fontWeight: 800
  },
  card: {
    display: 'flex'
  },
  content: {
    display: 'flex',
    flexFlow: 'column nowrap'
  },
  contentToRight: {
    order: 1
  },
  contentBody: {
    flexGrow: 1
  },
  cover: {
    flex: '1 0 50%',
    minHeight: 220,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center'
  },
  footer: {
    color: '#7f7f7f'
  }
}));

const MediaCard: React.FunctionComponent<OwnProps> = (props) => {
  const classes = useStyles(props);
  const { title, footer, actions, imageSrc, imageAtlText, children, imageAlign = 'left' } = props;

  return (
    <Card>
      <div className={classes.card}>
        <CardContent
          className={classNames(classes.content, {
            [classes.contentToRight]: imageAlign === 'left'
          })}
        >
          <div className={classes.header}>
            <Typography className={classes.headerTitle} variant='body1' component='h3'>
              {title}
            </Typography>
            {actions && actions}
          </div>
          <Typography className={classes.contentBody} variant='body2' component='div'>
            {children}
          </Typography>
          <div className={classes.footer}>{footer}</div>
        </CardContent>
        <CardMedia className={classes.cover} image={imageSrc} title={imageAtlText || title} />
      </div>
    </Card>
  );
};

export default injectIntl(MediaCard);
