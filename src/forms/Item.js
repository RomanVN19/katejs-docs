import { Elements } from 'kate-form-material-kit-react';
import Form from './Form';
import { ConfirmDialog } from './Dialogs';
import { getElement, getTableElement } from '../client';

const makeItemForm = ({ structure, name, addActions = true, addElements = true }) =>
  class ItemForm extends Form {
    static title = name;
    static path = `/${name}/:id`;
    static structure = structure
    constructor(args) {
      super(args);
      const { params } = args;

      if (addElements) {
        const elements = (structure.fields || [])
          .filter(field => !field.skipForForm)
          .map(field => getElement(field, this));
        (structure.tables || []).forEach(table => elements.push(getTableElement(table, this)));
        this.elements = elements;
      } else {
        this.elements = [];
      }
      this.elements.push(ConfirmDialog({ form: this, id: 'confirmDialog' }));

      if (addActions) {
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
      }

      if (params.id && params.id !== 'new') {
        this.uuid = params.id;
        this.load();
      }
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
      this.app.open(`${name}List`);
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

export default makeItemForm;
