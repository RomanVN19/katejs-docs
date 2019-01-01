
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

import KateClient from 'kate-client';
import { Elements } from 'kate-form-material-kit-react';
import Form from './forms/Form';
import App from './forms/App';
import Fields from './fields';
import { ConfirmDialog } from './forms/Dialogs';
import makeItemForm from './forms/Item';
import makeListForm from './forms/List';
import translations from './translations';

export const capitalize = string => `${string.charAt(0).toUpperCase()}${string.slice(1)}`;

export const makeTitle = string => `${capitalize(string)}s`;

const elementsByFields = {
  [Fields.STRING]: Elements.INPUT,
  [Fields.REFERENCE]: Elements.SELECT,
  [Fields.DECIMAL]: Elements.INPUT,
  [Fields.BOOLEAN]: Elements.CHECKBOX,
  [Fields.TEXT]: Elements.INPUT,
  [Fields.DATE]: Elements.DATE,
};

export const getElement = (field, form) => {
  const element = {
    id: field.name,
    title: capitalize(field.name),
    type: elementsByFields[field.type],
  };
  if (field.type === Fields.REFERENCE) {
    const getFuncName = `getOptions${capitalize(field.entity)}`;
    if (!form[getFuncName]) {
      // eslint-disable-next-line no-param-reassign
      form[getFuncName] = async () => {
        const { response } = await form.app[field.entity].query();
        return response;
      };
    }
    element.getOptions = form[getFuncName];
  }
  if (field.type === Fields.DECIMAL) {
    const intLength = (field.length || 15) - (field.precision || 2);
    const re = new RegExp(`\\d{0,${intLength}}(\\.\\d{0,${field.precision || 2}})?`);
    element.format = (val) => {
      const res = re.exec(val);
      return res ? res[0] : 0;
    };
  }
  if (field.type === Fields.TEXT) {
    element.rows = 5;
  }
  if (field.type === Fields.DATE) {
    element.dateFormat = 'DD.MM.YYYY';
    element.timeFormat = 'HH:mm';
    element.closeOnSelect = true;
  }
  return element;
};

export const getTableElement = (table, form) => {
  const tableElement = {
    type: Elements.TABLE_EDITABLE,
    id: table.name,
    columns: [],
  };
  table.fields.filter(field => !field.skipForForm)
    .forEach((field) => {
      const element = getElement(field, form);
      element.dataPath = element.id;
      delete element.id;
      tableElement.columns.push(element);
    });
  const addButton = {
    type: Elements.BUTTON,
    title: 'Add',
    onClick: () => form.content[table.name].addRow({}),
  };

  const cardElement = {
    id: `${table.name}Card`,
    type: Elements.CARD,
    title: capitalize(table.name),
    elements: [
      {
        type: Elements.CARD_ACTIONS,
        elements: [
          addButton,
        ],
      },
      tableElement,
    ],
  };

  return cardElement;
};

const use = (parent, ...classes) => {
  let result = parent;
  result.packages = result.packages || [];
  (classes || []).forEach((Package) => {
    if (result.packages.indexOf(Package.package) === -1) {
      result.packages.push(Package.package);
      result = Package(result);
    }
  });
  return result;
};

const KateJSClient = ({ AppClient, translations: userTranslations }) => {
  KateClient({ app: AppClient(App), translations: userTranslations });
};

const ItemForm = (entity, { addActions = false, addElements = false } = {}) => {
  const name = Object.keys(entity)[0];
  return makeItemForm({ structure: entity[name], name, addActions, addElements });
};

const ListForm = (entity, { addActions = false, addElements = false } = {}) => {
  const name = Object.keys(entity)[0];
  return makeListForm({ structure: entity[name], name, addActions, addElements });
};


export {
  App,
  Form,
  Elements,
  makeItemForm,
  makeListForm,
  ItemForm,
  ListForm,
  use,
  ConfirmDialog,
  translations,
};


export default KateJSClient;
