import { Elements } from 'kate-form-material-kit-react';
import Form from './Form';
import { makeTitle } from '../client';

const makeListForm = ({ name, addActions = true, addElements = true }) =>
  class ListForm extends Form {
    static title = makeTitle(name)
    static path = `/${name}`;
    constructor(args) {
      super(args);

      this.entity = name;
      if (addActions) {
        this.actions = [
          {
            id: '__Add',
            type: Elements.BUTTON,
            title: 'Add',
            onClick: this.newItem,
          },
        ];
      }

      if (addElements) {
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
      }
      setTimeout(this.load, 0); // to process filter from childs
    }
    load = async () => {
      const result = await this.app[name].query({ where: this.filters });
      this.content.list.value = result.response;
      if (result.error) {
        this.app.showAlert({ type: 'warning', title: result.error.message });
      }
    }
    newItem = () => {
      this.app.open(`${name}Item`, { id: 'new' });
    }
    editRow = (row) => {
      this.app.open(`${name}Item`, { id: row.uuid });
    }
  };

export default makeListForm;
