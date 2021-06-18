import { InjectedIntl } from 'react-intl';

function phraseLocalize(intl: InjectedIntl, key: string): string {
  const lastDot: number = key.lastIndexOf('.');

  if (lastDot < 0) {
    return intl.messages[key];
  }

  const lastKey: string = key.substring(lastDot + 1);
  const pluralKeys: string[] = ['zero', 'one', 'other'];

  if (!pluralKeys.includes(lastKey)) {
    return intl.messages[key];
  }

  const baseKey: string = key.substring(0, lastDot);
  return intl.messages[baseKey][lastKey] as string;
}

export default phraseLocalize;
