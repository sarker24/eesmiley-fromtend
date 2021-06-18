import parseWeightInKgs from './weight-parser';

export interface WeightResponse {
  isMessage: boolean;
  weight: number;
  unit: string;
  isStable: boolean;
  connectionType: string;
}

export default class BleMessageParser {
  callback: Function;

  constructor(callback: Function) {
    this.callback = callback;
  }

  /*
    Expected format:

    US,NT,     0.0 kg\r\n
    ST,GS,     0.0 kg\r\n
    OV,TR,     0.0 kg\r\n

    US: Unstable
    ST: Stable
    OV: Over load
    NT: Net Weight
    GS: Gross Weight
    TR: Tare Weight
  */
  append(value: string) {
    this.callback(this.parseMeasurement(value));
  }

  private parseMeasurement(measurement: string) {
    const unit = measurement.substring(15, 17).trim();
    const weight = parseWeightInKgs(measurement.substring(6, 14), unit);
    const isStable = measurement.substring(0, 2).indexOf('ST') !== -1;

    return {
      isMessage: false,
      weight,
      unit,
      isStable,
      connectionType: 'BLE'
    };
  }
}
