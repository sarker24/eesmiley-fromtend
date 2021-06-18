import parseWeightInKgs from './weight-parser';

export interface WeightResponse {
  isMessage: boolean;
  message?: string;
  weight?: number;
  unit: string;
  isStable: boolean;
  isLowVoltage: boolean;
  connectionType: string;
}

export default class UsbMessageParser {
  buffer: string;
  callback: Function;

  constructor(callback: Function) {
    this.buffer = '';
    this.callback = callback;
  }

  /*
    Expected format:

    :W-   0.0lbS \r
    :W-   0.0kg  \r
    :W    0.0lb  \r
    :M    0.0kgSL\r
  */
  append(value: string) {
    const startIndex = value.indexOf(':');

    if (startIndex !== -1) {
      this.buffer = '';
      this.buffer = this.buffer + value.substring(startIndex);
    } else {
      this.buffer = this.buffer + value;
    }

    if (this.buffer.length >= 14) {
      const measurement = this.buffer.substring(0, 14);
      this.callback(this.parseMeasurement(measurement));
    }
  }

  private parseMeasurement(measurement: string) {
    const isMessage = measurement.substring(1, 2).indexOf('M') !== -1;
    const message = measurement.substring(2, 9).trim();
    const unit = measurement.substring(9, 11).trim();
    const isStable = measurement.substring(11, 12).indexOf('S') !== -1;
    const isLowVoltage = measurement.substring(12, 13).indexOf('L') !== -1;
    const weight = parseWeightInKgs(message, unit);

    return {
      isMessage: isMessage,
      message: message,
      weight,
      unit,
      isStable,
      isLowVoltage,
      connectionType: 'USB'
    };
  }
}
