
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

import KateClient, { Elements, Form } from 'kate-client';
import App from './App';
import Fields from './fields';
import { ConfirmDialog } from './forms/Dialogs';
import translations from './translations';

const capitalize = string => `${string.charAt(0).toUpperCase()}${string.slice(1)}`;

const makeTitle = string => `${capitalize(string)}s`;

const elementsByFields = {
  [Fields.STRING]: Elements.INPUT,
  [Fields.REFERENCE]: Elements.SELECT,
  [Fields.DECIMAL]: Elements.INPUT,
  [Fields.BOOLEAN]: Elements.CHECKBOX,
  [Fields.TEXT]: Elements.INPUT,
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

const makeItemForm = ({ structure: entity, name }) =>
  class ItemForm extends Form {
    static title = capitalize(entity.name)
    static path = `/${entity.name}/:id`;
    constructor(args) {
      super(args);
      const { params } = args;
      const elements = (entity.fields || [])
        .filter(field => !field.skipForForm)
        .map(field => getElement(field, this));
      (entity.tables || []).forEach(table => elements.push(getTableElement(table, this)));
      this.actions = [
        {
          id: '__OK',
          type: Elements.BUTTON,
          title: 'OK',
          onClick: this.ok,
        },
        {
          id: '__Save',
          type: Elements.BUTTON,
          title: 'Save',
          onClick: this.save,
        },
        {
          id: '__Load',
          type: Elements.BUTTON,
          title: 'Load',
          onClick: this.load,
        },
        {
          id: '__Delete',
          type: Elements.BUTTON,
          title: 'Delete',
          onClick: this.delete,
        },
        {
          id: '__Close',
          type: Elements.BUTTON,
          title: 'Close',
          onClick: this.close,
        },
      ];
      this.elements = elements;

      if (params.id && params.id !== 'new') {
        this.uuid = params.id;
        this.load();
      }
      this.elements.push(ConfirmDialog({ form: this, id: 'confirmDialog' }));
    }
    load = async () => {
      const result = await this.app[name].get({ uuid: this.uuid });
      if (result.response) {
        this.setValues(result.response);
      }
    }
    save = async () => {
      const data = this.getValues();

      const result = await this.app[name].put({ body: data, uuid: this.uuid });

      if (result.response) {
        this.uuid = result.response.uuid;
        this.app.showAlert({ type: 'success', title: 'Saved!' });
      }
      if (result.error) {
        this.app.showAlert({ type: 'warning', title: result.error.message });
      }
    }
    close = () => {
      this.app.open(this.app.forms[`${name}List`]);
    }
    delete = async () => {
      if (!await this.content.confirmDialog.confirm({ title: 'Are you shure?' })) return;
      const result = await this.app[name].delete({ uuid: this.uuid });
      if (result.response) {
        this.close();
        this.app.showAlert({ type: 'success', title: 'Deleted!' });
      }
      if (result.error) {
        this.app.showAlert({ type: 'warning', title: result.error.message });
      }
    }
    ok = async () => {
      await this.save();
      this.close();
    }
  };

const makeListForm = ({ structure: entity, name }) =>
  class ListForm extends Form {
    static title = makeTitle(entity.name)
    static path = `/${entity.name}`;
    constructor(args) {
      super(args);

      this.entity = entity.name;

      this.actions = [
        {
          id: '__Add',
          type: Elements.BUTTON,
          title: 'Add',
          onClick: this.newItem,
        },
      ];

      this.elements = [
        {
          id: 'list',
          type: Elements.TABLE,
          rowClick: this.editRow,
          columns: [
            { title: 'Title', dataPath: 'title' },
          ],
          value: [],
        },
      ];
      setTimeout(this.load, 0);
    }
    load = async () => {
      const result = await this.app[name].query({ where: this.filters });
      this.content.list.value = result.response;
      if (result.error) {
        this.app.showAlert({ type: 'warning', title: result.error.message });
      }
    }
    newItem = () => {
      this.app.open(this.app.forms[`${name}Item`], { id: 'new' });
    }
    editRow = (row) => {
      this.app.open(this.app.forms[`${name}Item`], { id: row.uuid });
    }
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


export {
  App,
  Form,
  Elements,
  makeItemForm,
  makeListForm,
  use,
  ConfirmDialog,
  translations,
};


export default KateJSClient;
