import { formatMoney, setFormatting } from './number-format';

describe('formatMoney', () => {
  it('should format money with defaults', () => {
    const costInMinorUnits = 120000;
    const money = formatMoney(costInMinorUnits);
    expect(money.value).toEqual(1200.0);
    expect(money.symbol).toEqual('DKK');
    expect(money.precision).toEqual(2);
    expect(money.inMinorUnits).toEqual(costInMinorUnits);
    expect(money.formattedValue).toBe('1,200.00');
    expect(money.toString()).toBe('DKK\xa01,200.00');
  });

  it('should apply different format by changing format settings', () => {
    const costInMinorUnits = 120000;
    setFormatting('fi', { currency: 'EUR', unit: 'kg' });
    const money = formatMoney(costInMinorUnits);
    expect(money.value).toEqual(1200.0);
    expect(money.symbol).toEqual('€');
    expect(money.precision).toEqual(2);
    expect(money.inMinorUnits).toEqual(costInMinorUnits);
    expect(money.formattedValue).toBe('1\xa0200,00');
    expect(money.toString()).toEqual('1\xa0200,00\xa0€');
  });

  it('should apply different format by using formatMoney options', () => {
    const costInMinorUnits = 120000;
    const money = formatMoney(costInMinorUnits, { locale: 'da', currency: 'SEK' });
    expect(money.value).toEqual(1200.0);
    expect(money.symbol).toEqual('SEK');
    expect(money.precision).toEqual(2);
    expect(money.inMinorUnits).toEqual(costInMinorUnits);
    expect(money.formattedValue).toBe('1.200,00');
    expect(money.toString()).toEqual('1.200,00\xa0SEK');
  });

  it('should format money given in major units', () => {
    const costInMajorUnit = 1200.5;
    const money = formatMoney(costInMajorUnit, {
      inMajorUnit: true,
      locale: 'da',
      currency: 'DKK'
    });
    expect(money.value).toEqual(costInMajorUnit);
    expect(money.symbol).toEqual('kr.');
    expect(money.precision).toEqual(2);
    expect(money.inMinorUnits).toEqual(120050);
    expect(money.formattedValue).toBe('1.200,50');
    expect(money.toString()).toEqual('1.200,50\xa0kr.');
  });

  it('should handle currencies with no minor units', () => {
    const costInMajorUnits = 1200;
    const money = formatMoney(costInMajorUnits, { locale: 'en', currency: 'ISK' });
    expect(money.value).toEqual(1200);
    expect(money.symbol).toEqual('ISK');
    expect(money.precision).toEqual(0);
    expect(money.inMinorUnits).toEqual(costInMajorUnits);
    expect(money.formattedValue).toBe('1,200');
    expect(money.toString()).toEqual('ISK\xa01,200');
  });
});
