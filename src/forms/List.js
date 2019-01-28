import { Elements } from 'kate-form-material-kit-react';
import Form from './Form';
import { makeTitle, makeTitlePlural } from '../client';

const add = Symbol('add');
const open = Symbol('open');
const pageChange = Symbol('loadPage');

const makeListForm = ({ structure, name, addActions = true, addElements = true }) =>
  class ListForm extends Form {
    static title = makeTitlePlural(name)
    static path = `/${name}`;
    static entity = name;

    constructor(args) {
      super(args);

      this.entity = name;
      if (addActions) {
        this.actions = [
          {
            id: '__Add',
            type: Elements.BUTTON,
            title: 'Add',
            onClick: this[add],
          },
        ];
      }

      if (addElements) {
        this.elements = [
          {
            id: 'list',
            type: Elements.TABLE,
            rowClick: this[open],
            columns: structure.fields.filter(item => !item.skipForList).map(item => ({
              title: makeTitle(item.name),
              dataPath: item.name,
              format: value => (typeof value === 'object' && value ? value.title : (value || '')),
            })),
            //  [
            //   { title: 'Title', dataPath: 'title' },
            // ],
            value: [],
          },
          {
            id: 'pagination',
            type: Elements.PAGINATION,
            hidden: true,
            pageChange: this[pageChange],
          },
        ];
      }
      setTimeout(() => this.load(), 0); // to process filter from childs
    }
    async load({ page = 1 } = {}) {
      const result = await this.app[name].query({ where: this.filters, order: this.order, page });
      this.content.list.value = result.response;
      if (this.app.paginationLimit && result.response) {
        this.content.pagination.page = page;
        if (this.app.paginationLimit <= result.response.length) {
          if (this.content.pagination.hidden) {
            this.content.pagination.hidden = false;
          }
        } else {
          this.content.pagination.max = page;
        }
      }
      if (result.error) {
        this.app.showAlert({ type: 'warning', title: result.error.message });
      }
    }
    [pageChange] = (page) => {
      this.load({ page });
    }
    [add] = () => {
      this.app.open(`${name}Item`, { id: 'new' });
    }
    [open] = (row) => {
      this.app.open(`${name}Item`, { id: row.uuid });
    }
  };

export default makeListForm;