import { Elements, Form } from 'kate-client';
import { makeTitle } from '../client';

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
      this.app.open(`${name}Item`, { id: 'new' });
    }
    editRow = (row) => {
      this.app.open(`${name}Item`, { id: row.uuid });
    }
  };

export default makeListForm;
