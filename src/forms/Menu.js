import { Form } from 'kate-client';
import { Elements } from 'kate-form-material-kit-react';

export const setMenu = Symbol('setMenu');
export const setTopElements = Symbol('setTopElements');

export default class Menu extends Form {
  constructor(params) {
    super(params);
    this.elements = [{
      id: 'menu',
      type: Elements.LayoutMenu,
      elements: this.getMenuElements(this.app.menu),
      classes: this.app.layoutClasses,
      drawerOpen: true,
      switchDrawer: this.switchDrawer,
      title: this.app.constructor.title,
      logo: this.app.constructor.logo,
      topElements: [],
    }];
    this.app[setMenu] = this.setMenu;
    this.app[setTopElements] = this.setTopElements;
  }
  switchDrawer = () => {
    this.content.menu.drawerOpen = !this.content.menu.drawerOpen;
  }
  onClick = (item) => {
    if (item.onClick) {
      item.onClick();
      return;
    }
    this.app.open(item.form);
    this.content.menu.elements = this.content.menu.elements
      .map(menuItem => ({ ...menuItem, current: menuItem.key === (item.form || item.onClick) }));
  }
  getMenuElements(menu) {
    return menu.map(item => ({
      title: item.title,
      key: item.form || item.onClick,
      icon: item.icon,
      onClick: () => this.onClick(item),
    }));
  }
  setMenu = (menu) => {
    this.content.menu.elements = this.getMenuElements(menu);
  }
  setTopElements = (elements) => {
    this.content.menu.topElements = elements;
  }
}
