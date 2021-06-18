import * as React from 'react';
import { Avatar as AvatarMui } from '@material-ui/core';
import classNames from 'classnames';
import md5 from 'md5';

export interface AvatarProps {
  email?: string;
  className?: string;
}

function getAvatarImgSrc(email?: string): string {
  return email
    ? // eslint-disable-next-line
      `https://gravatar.com/avatar/${md5(email.toLowerCase().replace(/\s/g, ''))}`
    : 'https://gravatar.com/avatar';
}

const Avatar: React.FunctionComponent<AvatarProps> = (props) => {
  const { email, className } = props;
  const imgSrc = getAvatarImgSrc(email);

  return <AvatarMui className={classNames(className)} src={imgSrc} />;
};

export default Avatar;
