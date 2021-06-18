import { createMuiTheme } from '@material-ui/core';

// todo merge properly
export const SidebarMenu = {
  collapsedWith: '72px',
  desktopWidth: '260px',
  mobileWidth: '100%'
};

export const TopbarMenu = {
  height: '64px'
};

const baseFontSize = 16;
const pxToRem = (fontSize) => `${fontSize / baseFontSize}rem`;

export default createMuiTheme({
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
    }
  }),
  palette: {
    primary: {
      light: 'rgb(0,139,135)',
      main: '#009688'
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
  },
  props: {
    MuiList: {
      disablePadding: true
    },
    MuiCardHeader: {
      titleTypographyProps: {
        variant: 'h2'
      },
      subheaderTypographyProps: {
        variant: 'body1'
      }
    }
  },
  overrides: {
    MuiCard: {
      root: {
        boxShadow: '0 1px 6px 0 rgba(0, 0, 0, 0.12)',
        width: '100%',
        position: 'relative'
      }
    }
  }
});
