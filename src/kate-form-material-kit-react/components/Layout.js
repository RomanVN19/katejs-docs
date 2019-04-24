
/*
Copyright © 2018 Roman Nep <neproman@gmail.com>

This file is part of kate-form-material-kit-react library.

Library kate-form-material-kit-react is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Library kate-form-material-kit-react is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Library kate-form-material-kit-react.
If not, see <https://www.gnu.org/licenses/>.
*/

import React, { Component } from 'react';

import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { defaultFont, theme as kitTheme, getThemeColors } from 'material-kit-react-package/dist/assets/jss/material-kit-react';
import tooltipStyle from 'material-kit-react-package/dist/assets/jss/material-kit-react/tooltipsStyle';

const defaultTheme = createMuiTheme(kitTheme);

const drawerWidth = 250;
const collapsedDrawerWidth = 56;
const styles = theme => ({
  root: {
    display: 'flex',
  },
  main: {
    padding: 20,
    flex: 1,
    maxWidth: 'calc(100vw - 270px)',
    margin: 'auto',
  },
  mainDrawerClose: {
    padding: 20,
    flex: 1,
    maxWidth: 'calc(100vw - 60px)',
    margin: 'auto',
  },
  drawerPaper: {
    width: collapsedDrawerWidth,
    backgroundColor: '#222222',
    transition: 'all 100ms linear',
  },
  drawerOpen: {
    width: drawerWidth,
  },
  list: {
    '& svg path': {
      color: '#fff',
    },
    '& span': {
      color: '#fff',
    },
    '& div': {
      paddingLeft: 16,
      paddingRight: 16,
    },
  },
  currentItem: {
    backgroundColor: theme.palette.primary.main,
    boxShadow: `0 12px 20px -10px ${theme.palette.primary.shadow}, 0 4px 20px 0px rgba(0, 0, 0, 0.12), 0 7px 8px -5px ${theme.palette.primary.shadow}`,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      boxShadow: `0 12px 20px -10px ${theme.palette.primary.shadow}, 0 4px 20px 0px rgba(0, 0, 0, 0.12), 0 7px 8px -5px ${theme.palette.primary.shadow}`,
    },
  },
  listItem: {
    width: 'auto',
    transition: 'all 300ms linear',
    margin: '10px 15px 0',
    borderRadius: '3px',
    position: 'relative',
    ...defaultFont,
    '&:hover': {
      backgroundColor: '#666666',
    },
  },
  icon: {
    margin: 0,
    width: 24,
    height: 24,
  },
  iconLogo: {
    margin: 0,
    width: 48,
    height: 48,
  },
  listItemCollapsed: {
    margin: '10px 0 0',
  },
  snackbar: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    zIndex: 1300,
  },
  tooltip: {
    ...(Object.keys(tooltipStyle.tooltip).reduce((acc, key) => ({ ...acc, [key]: `${tooltipStyle.tooltip[key]}!important` }), {})),
    padding: '16px 15px!important',
    marginLeft: '16px!important',
  },
  listItemNested: {
    width: '100%',
    marginLeft: '0',
    marginRight: '0',
  },
});


export const renderThumb = ({ style, ...props }) => {
  const thumbStyle = {
    backgroundColor: '#bbbbbb',
    borderRadius: 3,
  };
  return (
    <div
      style={{ ...style, ...thumbStyle }}
      {...props}
    />
  );
};

class MainLayout extends Component {
  constructor(props) {
    super(props);
    this.props.app.layoutClasses = this.props.classes;
    this.props.app.layoutComponent = this;
  }
  render() {
    const {
      classes, content, app,
    } = this.props;

    return (
      <div className={classes.root}>
        {content.leftMenu}
        <div className={app.drawerOpen ? classes.main : classes.mainDrawerClose}>
          {content.main}
        </div>
        <div className={classes.snackbar}>
          {content.alerts}
        </div>
      </div>
    );
  }
}

const Layout = withStyles(styles)(MainLayout);

let userColorTheme;
const StyledLayout = (props) => {
  const color = props.app.constructor.primaryColor;
  if (color && !userColorTheme) {
    userColorTheme = createMuiTheme({
      palette: {
        primary: getThemeColors(color),
      },
    });
  }
  return (
    <MuiThemeProvider theme={userColorTheme || defaultTheme}>
      <Layout {...props} />
    </MuiThemeProvider >
  );
};

export default StyledLayout;
