
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

import { makeItemForm, makeListForm } from './client';

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

  // constructor(params){
  //   super(params);
  //   console.log('platform app constructor');
  // }
  init({ structures, addToMenu }) {
    this.menu = this.menu || [];
    this.forms = this.forms || {};
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
