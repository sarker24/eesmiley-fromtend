import { createMuiTheme, Theme } from '@material-ui/core';

const baseFontSize = 16;
const pxToRem = (fontSize) => `${fontSize / baseFontSize}rem`;
import { fade } from '@material-ui/core/styles/colorManipulator';

const theme: Theme = createMuiTheme({
  typography: (palette) => ({
    pxToRem: pxToRem,
    htmlFontSize: baseFontSize,
    fontSize: 15,
    fontFamily: [
      '"Lato"',
      '"Roboto"',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Helvetica',
      'Arial',
      'sans-serif'
    ].join(','),
    body1: {
      fontSize: pxToRem(15),
      color: palette.text.secondary
    },
    h1: {
      fontSize: pxToRem(25),
      fontWeight: 800,
      color: palette.text.primary
    },
    h2: {
      fontSize: pxToRem(20),
      fontWeight: 800,
      color: palette.text.primary
    },
    h3: {
      fontSize: pxToRem(17),
      fontWeight: 800,
      color: palette.text.secondary
    },
    subtitle1: {
      color: palette.text.secondary,
      fontWeight: 800
    },
    button: {
      textTransform: 'none',
      fontWeight: 700
    }
  }),
  shape: {
    borderRadius: 2
  },
  spacing: 10,
  palette: {
    primary: {
      light: '#aad8d6',
      main: '#008b87'
    },
    secondary: {
      main: '#faa91f'
    },
    text: {
      primary: '#333333',
      secondary: '#595959'
    },
    grey: {
      500: '#999',
      400: '#8c8c8c',
      300: '#7f7f7f',
      A100: '#bfbfbf',
      A400: '#eee',
      A700: '#f0f0f0'
    },
    error: {
      main: '#ed8888',
      light: 'rgba(237, 136, 136, 0.3)'
    },
    success: {
      main: '#89c045',
      light: 'rgba(137, 192, 69, 0.3)'
    },
    action: {
      hover: '#e5e5e5'
    }
  }
});

theme.overrides = {
  MuiButton: {
    root: {
      background: theme.palette.common.white,
      borderRadius: 5,
      padding: '5px 15px 4px'
    },
    outlined: {
      padding: '5px 15px 4px'
    },
    endIcon: {
      marginLeft: 5,
      marginRight: -11
    }
  },
  MuiCard: {
    root: {
      boxShadow: '0 1px 6px 0 rgba(0, 0, 0, 0.12)',
      padding: theme.spacing(2),
      width: '100%',
      position: 'relative'
    }
  },
  MuiCardHeader: {
    root: {
      padding: theme.spacing(0, 0, 2),
      alignItems: 'normal'
    },
    title: {
      marginTop: 5,
      marginBottom: theme.spacing(1)
    },
    subheader: {
      padding: theme.spacing(0, 0, 1)
    },
    avatar: {
      marginRight: 12,
      marginTop: 7,

      '& svg': {
        width: 25
      },

      '& + .MuiCardHeader-content .MuiCardHeader-subheader': {
        marginLeft: -37
      }
    }
  },
  MuiCardContent: {
    root: {
      padding: theme.spacing(0, 0, 2),

      '&:last-child': {
        paddingBottom: theme.spacing(2)
      }
    }
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore, follow up https://github.com/mui-org/material-ui/issues/19427
  MuiToggleButton: {
    root: {
      borderThickness: 1,
      borderStyle: 'solid',
      borderColor: theme.palette.primary.light,
      height: 35,
      minWidth: 100,
      borderRadius: 5,
      flexGrow: 1,

      '&:hover': {
        backgroundColor: fade(theme.palette.primary.main, 0.04)
      },

      '&.Mui-selected': {
        backgroundColor: theme.palette.primary.main,

        '& span': {
          color: theme.palette.common.white
        },

        '&:hover': {
          backgroundColor: theme.palette.primary.main + ' !important'
        }
      }
    },
    label: {
      fontSize: theme.typography.fontSize,
      color: theme.palette.primary.main
    }
  },
  MuiSelect: {
    select: {
      '&:focus': {
        backgroundColor: 'transparent'
      }
    }
  },
  MuiListItem: {
    root: {
      '&.Mui-selected': {
        backgroundColor: 'initial'
      }
    }
  }
};

export default theme;
