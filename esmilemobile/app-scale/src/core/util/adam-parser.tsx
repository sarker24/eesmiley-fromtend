export default class AdamParser {
  buffer: number[];
  callback: Function;

  constructor(callback: Function) {
    this.buffer = [];
    this.callback = callback;
  }

  /*
      Expected format:

       SNG/W+  0.50  kg
       UNG/W+  0.00  xx
      ASNG/W+  0.00  xx
      AUNG/W+  0.00  xx
       SNG/W+  0.60  kg

      [ 32, 83, 78, 71, 47, 87, 43, 32, 32, 48, 46, 48, 48, 32, 32, 107, 103]

      A is communication address set by the user,
      S stands for stable,
      N for no error
      G/W for gross weight,
      xx for the chosen unit
  */
  append(value: number[]) {
    // [ 32, 48, 46, 55, 48, 32, 32, 107, 103, 32, 32, 13 ]

    // .05 [ 32, 234, 233, 2, 114, 170, 2, 22, 106 ]
    // .50 [ 32, 234, 233, 2, 114, 2, 90, 22, 106 ]
    // .55 [ 32, 234, 233, 2, 114, 2, 22, 106 ]
    // 1.0 [ 32, 234, 233, 2, 114, 130, 2, 22, 106 ]
    //1.05 [ 32, 234, 233, 2, 114, 170, 2, 22, 106 ]
    // 1.1 [ 32, 234, 233, 2, 114, 130, 2, 22, 106 ]

    const sIndex = value.indexOf(83);
    const uIndex = value.indexOf(85);

    // If S is not found, try for U
    const startIndex = sIndex !== -1 ? sIndex : uIndex;

    if (startIndex !== -1) {
      this.buffer = [];
      this.buffer.push(...value.slice(startIndex));
    } else {
      this.buffer.push(...value);
    }

    if (this.buffer.length >= 16) {
      const measurement = String.fromCharCode(...this.buffer.slice(0, 16));
      console.log('ADAM', 'measurement', measurement);
      this.callback(measurement);
    }
  }
}
