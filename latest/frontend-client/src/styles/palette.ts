export default {
  primary: {
    main: '#009688'
  },
  secondary: {
    main: '#faa91f'
  },
  primary1Color: '#009688',
  primary2Color: '#faa91f',
  primary3Color: '#008B87',
  accent1Color: '#ff8900'
};

// TODO: merge with 'default' palette
export const eSmileyBlue = '#2196f3';

export const charts = {
  blue: {
    main: '#2196f4',
    light: '#90cbfc'
  },
  default: ['#f99f1d', '#a7cacc'], //  '#ffe2ab','#e4efef'
  primary: [
    '#fcf7b6',
    '#fbc6b4',
    '#f7b1cb',
    '#cfb4d6',
    '#b8b8dd',
    '#ffe6b4',
    // extra from secondary
    '#b3dfff',
    '#8ad7f9',
    '#d4fcf7',
    '#c6ffb3',
    '#b3ffed'
  ],
  secondary: [
    '#b3dfff',
    '#8ad7f9',
    '#d4fcf7',
    '#fbffa9',
    '#c6ffb3',
    '#b3ffed',
    // extra from primary
    '#fbc6b4',
    '#f7b1cb',
    '#cfb4d6',
    '#b8b8dd',
    '#ffe6b4'
  ],
  terciary: [
    '#4DB6AC',
    '#AED581',
    '#9575CD',
    '#4FC3F7',
    // extra from primary
    '#BA68C8',
    '#AED581',
    '#4DD0E1',
    '#E57373',
    '#7986CB',
    '#FFF176',
    '#81C784'
  ]
} as const;
