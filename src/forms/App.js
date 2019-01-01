
/*
Copyright © 2018 Roman Nep <neproman@gmail.com>

This file is part of KateJS.

KateJS is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

KateJS is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with KateJS.  If not, see <https://www.gnu.org/licenses/>.
*/

import { App } from 'kate-client';
import { Layout, components } from 'kate-form-material-kit-react';

import { makeItemForm, makeListForm } from '../client';
import Menu, { setMenu } from './Menu';
import Alerts, { showAlert } from './Alerts';

const makeFormsFromStructure = ({ structures, menu, forms: allForms, addToMenu }) => {
  Object.keys(structures).forEach((key) => {
    // eslint-disable-next-line no-param-reassign
    allForms[`${key}Item`] = makeItemForm({ structure: structures[key], name: key });
    // eslint-disable-next-line no-param-reassign
    allForms[`${key}List`] = makeListForm({ structure: structures[key], name: key });
    if (menu && addToMenu) {
      menu.unshift({ // add last app forms to top
        title: allForms[`${key}List`].title,
        form: `${key}List`,
      });
    }
  });
  return allForms;
};


export default class PlatformApp extends App {
  static package = 'katejs';
  static packages = ['katejs'];
  static path = '/';
  static title = 'KateJS';
  static components = components;
  constructor(params) {
    super(params);
    this.layouts = {
      main: {
        component: Layout,
        areas: {
          main: { default: true },
          leftMenu: {},
          alerts: {},
        },
      },
    };
    this.defaultLayout = {
      layout: 'main',
      areas: {
        leftMenu: 'M',
        alerts: 'A',
      },
    };
  }
  setMenu(menu) {
    if (this[setMenu]) {
      this[setMenu](menu);
    }
  }
  showAlert(params) {
    if (this[showAlert]) {
      this[showAlert](params);
    }
  }
  init({ structures, addToMenu }) {
    this.menu = this.menu || [];
    this.forms = this.forms || { M: Menu, A: Alerts };
    makeFormsFromStructure({
      structures,
      menu: this.menu,
      forms: this.forms,
      addToMenu,
    });
    this.baseUrl = '/api';
    this.makeApiLinks({ entities: Object.keys(structures) });
  }
  makeApiLinks({ entities }) {
    const app = this;
    entities.forEach((entity) => {
      this[entity] = new Proxy({}, {
        get(target, prop) {
          return data => app.request(app.baseUrl, {
            method: 'post',
            body: JSON.stringify({
              entity,
              method: prop,
              data,
            }),
          });
        },
        set() {
          return true;
        },
      });
    });
  }
}
