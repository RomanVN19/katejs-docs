import React from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// nodejs library to set properties for components
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";

// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

// core components
import GridContainer from "components/Grid/GridContainer.jsx";
import GridItem from "components/Grid/GridItem.jsx";

import navPillsStyle from "assets/jss/material-kit-react/components/navPillsStyle.jsx";

class NavPills extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: props.active || 0,
    };
  }
  handleChange = (event, active) => {
    this.setState({ active });
    if (this.props.setActiveTab) {
      this.props.setActiveTab(active);
    }
  };
  handleChangeIndex = index => {
    this.setState({ active: index });
    if (this.props.setActiveTab) {
      this.props.setActiveTab(index);
    }
  };
  render() {
    const {
      classes,
      tabs,
      direction,
      color,
      horizontal,
      alignCenter,
      activeTab
    } = this.props;
    const activeIndex = activeTab === undefined ? this.state.active : activeTab;
    const flexContainerClasses = classNames({
      [classes.flexContainer]: true,
      [classes.horizontalDisplay]: horizontal !== undefined
    });
    const tabButtons = (
      <Tabs
        classes={{
          root: classes.root,
          fixed: classes.fixed,
          flexContainer: flexContainerClasses,
          indicator: classes.displayNone
        }}
        value={activeIndex}
        onChange={this.handleChange}
        centered={alignCenter}
      >
        {tabs.map((prop, key) => {
          var icon = {};
          if (prop.tabIcon !== undefined) {
            icon["icon"] = <prop.tabIcon className={classes.tabIcon} />;
          }
          const pillsClasses = classNames({
            [classes.pills]: true,
            [classes.horizontalPills]: horizontal !== undefined,
            [classes.pillsWithIcons]: prop.tabIcon !== undefined
          });
          return (
            <Tab
              label={prop.tabButton}
              key={key}
              {...icon}
              classes={{
                root: pillsClasses,
                labelContainer: classes.labelContainer,
                label: classes.label,
                selected: classes[color]
              }}
            />
          );
        })}
      </Tabs>
    );
    const tabContent = (
      <div className={classes.contentWrapper}>
        <SwipeableViews
          axis={direction === "rtl" ? "x-reverse" : "x"}
          index={activeIndex}
          onChangeIndex={this.handleChangeIndex}
        >
          {tabs.map((prop, key) => {
            return (
              <div className={classes.tabContent} key={key}>
                {prop.tabContent}
              </div>
            );
          })}
        </SwipeableViews>
      </div>
    );
    return horizontal !== undefined ? (
      <GridContainer>
        <GridItem {...horizontal.tabsGrid}>{tabButtons}</GridItem>
        <GridItem {...horizontal.contentGrid}>{tabContent}</GridItem>
      </GridContainer>
    ) : (
      <div>
        {tabButtons}
        {tabContent}
      </div>
    );
  }
}

NavPills.defaultProps = {
  color: "primary",
  initialActive: 0
};

NavPills.propTypes = {
  classes: PropTypes.object.isRequired,
  // index of the default active pill
  active: PropTypes.number,
  // index of the active pill and change func for controlled mode
  activeTab: PropTypes.number,
  setActive: PropTypes.func,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      tabButton: PropTypes.string,
      tabIcon: PropTypes.func,
      tabContent: PropTypes.node
    })
  ).isRequired,
  color: PropTypes.oneOf([
    "primary",
    "warning",
    "danger",
    "success",
    "info",
    "rose"
  ]),
  direction: PropTypes.string,
  horizontal: PropTypes.shape({
    tabsGrid: PropTypes.object,
    contentGrid: PropTypes.object
  }),
  alignCenter: PropTypes.bool
};

export default withStyles(navPillsStyle)(NavPills);
