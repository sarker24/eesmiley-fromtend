// todo: reimplement and move to core
import * as Highcharts from 'highcharts';
import { getCorrectFloatValue } from 'utils/math';
import { escapeRegExp } from 'utils/regexp';

export type MassUnit = 'ton' | 'kg' | 'g' | 'lt';
export type DecimalSeparator = '.' | ',';
export type ThousandSeparator = DecimalSeparator | ' ';
export type Currency = { unit: string; symbol: string; subUnitPrecision: number };

type RoundingOption = 'floor' | 'ceil' | 'round' | 'trunc';

export interface TransformAmountOptions {
  unit: MassUnit | '%';
  as: MassUnit;
}

// todo: proper initialization
type FormatSettings = {
  locale: string;
  currency: Currency;
  massUnit: MassUnit;
  separator: {
    decimal: DecimalSeparator;
    thousand: ThousandSeparator;
  };
};

export type FormatNumberOptions = {
  precision?: number;
  unit?: string;
  unitSpace?: boolean;
  rounding?: RoundingOption;
  signDisplay?: 'always' | 'never' | 'auto';
  displayUnit?: boolean;
};

export type FormatMoneyOptions = {
  inMajorUnit?: boolean;
  currency?: CurrencyType;
  locale?: string;
};

type MoneyFormatter = {
  symbol: string;
  precision: number;
  toMajorUnits: (value: number) => number;
  toMinorUnits: (value: number) => number;
  toFormattedValue: (value: number) => string;
  toString: (value: number) => string;
};

type Money = {
  symbol: string;
  precision: number;
  value: number;
  inMinorUnits: number;
  formattedValue: string;
  toString: () => string;
};

const MoneyFormatters: { [localeCurrency: string]: MoneyFormatter } = {};

const FormatSettings: FormatSettings = {
  locale: 'en',
  currency: {
    unit: 'DKK',
    symbol: 'DKK',
    subUnitPrecision: 2
  },
  massUnit: 'kg',
  separator: {
    decimal: '.',
    thousand: ','
  }
};

const CurrencyDigitRegex = /\d+([,. ](\d+)[,. ]?)?/g;
const isSeparatorRegex = /[.,]/;
const DigitOnlyRegex = /\d+([,.\s]?\d)+/g;

enum SupportedCurrency {
  DKK = 'DKK',
  SEK = 'SEK',
  NOK = 'NOK',
  ISK = 'ISK',
  EUR = 'EUR',
  USD = 'USD',
  GBD = 'GBD'
}

export const CURRENCIES = Object.values(SupportedCurrency);
export type CurrencyType = keyof typeof SupportedCurrency;

export function isSeparator(char: string): boolean {
  return isSeparatorRegex.test(char);
}

export function getSettings(): FormatSettings {
  const { currency, separator, ...rest } = FormatSettings;
  // since we share one instance, we dont want these settings be modified
  // without using the apis below
  return Object.freeze({
    ...rest,
    currency: Object.freeze(currency),
    separator: Object.freeze(separator)
  });
}

export function unformat(value: string | number): number {
  // Return the value as-is if it's already a number:
  if (typeof value === 'number') {
    return value;
  }

  if (!value) {
    return NaN;
  }

  // Build regex to strip out everything except digits, decimal point and minus sign:
  const nonNumberRegex = new RegExp(
    '[^\\d-' + escapeRegExp(FormatSettings.separator.decimal) + ']',
    'g'
  );
  return getCorrectFloatValue(
    parseFloat(
      value
        .replace(nonNumberRegex, '') // strip out any cruft
        .replace(FormatSettings.separator.decimal, '.') // make sure decimal point is standard
        .trim()
    )
  );
}

export function formatWeight(
  rawValue: number | string,
  doNotDivide?: boolean,
  unit?: string
): string {
  const unFormatted = unformat(rawValue);
  const value = doNotDivide ? unFormatted : unFormatted / 1000;
  // TODO: for perfomance its better to share numberFormat instance
  return (
    new Intl.NumberFormat(FormatSettings.locale, { maximumFractionDigits: 2 }).format(value) +
    (unit ? unit : FormatSettings.massUnit || 'kg')
  );
}

function roundNumber(value: number, roundFn: RoundingOption = 'round'): number {
  switch (roundFn) {
    case 'ceil':
      return Math.ceil(value);
    case 'floor':
      return Math.floor(value);
    case 'trunc':
      // drops decimal without any rounding
      return Math.trunc(value);
    case 'round':
    default:
      return Math.round(value);
  }
}

function formatSign(value: string, signDisplay?: 'never' | 'always' | 'auto'): string {
  if (value.length === 0 || value === '0') {
    return value;
  }

  const sign = value[0];

  switch (signDisplay) {
    case 'never': {
      return ['-', '+'].includes(sign) ? value.slice(1) : value;
    }
    case 'always': {
      return sign === '-' ? value : `+${value}`;
    }
    case 'auto':
    default:
      return value;
  }
}

// get rid of string type, not used with string anywhere,
// double check settings/registrations costValue type
export function formatNumber(rawValue: string | number, options: FormatNumberOptions = {}): string {
  const { displayUnit, unit, unitSpace = false, precision = 2, rounding, signDisplay } = options;
  const value: number = rounding ? roundNumber(unformat(rawValue), rounding) : unformat(rawValue);
  // NumberFormat would support signDisplay option, but not supported by ie,
  // but could make it work with polyfills in future
  const formatted = new Intl.NumberFormat(FormatSettings.locale, {
    maximumFractionDigits: precision,
    minimumFractionDigits: precision
  }).format(value);

  const formattedWithSign = formatSign(formatted, signDisplay);
  return displayUnit && unit
    ? `${formattedWithSign}${unitSpace ? ' ' : ''}${unit}`
    : formattedWithSign;
}

function createMoneyFormatter(locale: string, currency: string): MoneyFormatter {
  const key = locale + currency;

  if (MoneyFormatters[key]) {
    return MoneyFormatters[key];
  }

  const benchmarkValue = 1000.1;
  const formattedCurrency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(benchmarkValue);
  const digitOnly = formattedCurrency.match(DigitOnlyRegex)[0];
  const symbol = formattedCurrency.replace(CurrencyDigitRegex, '').trim();
  const precision = digitOnly[5] ? digitOnly.length - 6 : 0;

  MoneyFormatters[key] = {
    symbol,
    precision,
    toMajorUnits: (value: number) => value / Math.pow(10, precision),
    toMinorUnits: (value: number) => value * Math.pow(10, precision),
    // eslint-disable-next-line @typescript-eslint/unbound-method
    toFormattedValue: new Intl.NumberFormat(locale, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    }).format,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    toString: new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format
  };

  return MoneyFormatters[key];
}

export function formatMoney(rawValue: string | number, options: FormatMoneyOptions = {}): Money {
  const {
    inMajorUnit = false,
    locale = FormatSettings.locale,
    currency = FormatSettings.currency.unit
  } = options;
  const moneyFormatter = createMoneyFormatter(locale, currency);
  const unFormatted = unformat(rawValue);
  const inMajorUnits = inMajorUnit ? unFormatted : moneyFormatter.toMajorUnits(unFormatted);
  const inMinorUnits = inMajorUnit ? moneyFormatter.toMinorUnits(unFormatted) : unFormatted;

  return {
    symbol: moneyFormatter.symbol,
    precision: moneyFormatter.precision,
    value: inMajorUnits,
    inMinorUnits,
    formattedValue: moneyFormatter.toFormattedValue(inMajorUnits),
    toString: () => moneyFormatter.toString(inMajorUnits)
  };
}

export function setFormatting(
  locale: string,
  settings: { currency: string; unit: MassUnit }
): void {
  const benchmarkValue = 1000.1;
  const formattedNumber = new Intl.NumberFormat(locale).format(benchmarkValue);
  const formattedCurrency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: settings.currency
  }).format(benchmarkValue);

  const digitOnly = formattedCurrency.match(DigitOnlyRegex)[0];
  const symbol = formattedCurrency.replace(CurrencyDigitRegex, '').trim();
  const subUnitPrecision = digitOnly[5] ? digitOnly.length - 6 : 0;

  FormatSettings.locale = locale;
  FormatSettings.currency = {
    unit: settings.currency,
    subUnitPrecision,
    symbol
  };

  FormatSettings.massUnit = settings.unit;
  FormatSettings.separator = {
    thousand: formattedNumber[1] as ThousandSeparator,
    decimal: formattedNumber[5] as DecimalSeparator
  };

  // move out
  Highcharts.setOptions({
    lang: {
      thousandsSep: FormatSettings.separator.thousand,
      decimalPoint: FormatSettings.separator.decimal,
      numericSymbols: [' K', ' M', ' G', ' T', ' P', ' E']
    }
  });
}

export const convertMassToViewValue = (value: number): number => {
  return isNaN(value) ? 0 : Number(value) / 1000;
};

export const convertViewValueToMass = (value: number): number => {
  return Number(value) * 1000;
};

export const getPercentageOf = (value: number, percentageOfValue: number): number => {
  return !percentageOfValue ? 0 : (value / percentageOfValue) * 100;
};

function toTons(amountInGrams: number): number {
  return getCorrectFloatValue(amountInGrams / (1000 * 1000));
}

function toKilos(amountInGrams: number): number {
  return getCorrectFloatValue(amountInGrams / 1000);
}

function toGrams(amount: number, unit: MassUnit): number {
  switch (unit) {
    case 'g': {
      return amount;
    }
    case 'kg': {
      return amount * 1000;
    }
    case 'ton': {
      return amount * 1000 * 1000;
    }
    default: {
      console.error(`Invalid target unit ${unit}`);
      return amount;
    }
  }
}

// rename changeUnit
export function transformAmount(value: number, options?: TransformAmountOptions): number {
  const { unit, as } = options || {};

  if (unit === as) {
    return value;
  }

  if ([unit, as].includes('%')) {
    return value;
  }

  if ([unit, as].includes('lt')) {
    // todo later
    return value;
  }

  const amountAsGrams = toGrams(value, unit as MassUnit);

  switch (as) {
    case 'g': {
      return amountAsGrams;
    }
    case 'kg': {
      return toKilos(amountAsGrams);
    }
    case 'ton': {
      return toTons(amountAsGrams);
    }
    default: {
      console.error(`Invalid target unit ${as}`);
      return value;
    }
  }
}
