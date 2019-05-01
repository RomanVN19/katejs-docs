import { use } from 'katejs/lib/client';
import AppUser from 'katejs-user/lib/AppClient';

import TestForm from './forms/TestForm';

import { structures, title, packageName } from './structure';

import env from './front.env.json';

const AppClient = parent => class Client extends use(parent, AppUser) {
  static title = title;
  
  static primaryColor = '#5F77D8';

  constructor(params) {
    super(params);

    this.baseUrl = env.apiUrl || '/api';

    this.init({ structures, addToMenu: true });

    this.makeApiLinks({ entities: ['TestEntity'] });

    this.forms = {
      ...this.forms,
      TestForm,
    };

    this.menu = [
      ...this.menu,
      {
        title: 'SubMenu',
        // form: 'UserList',
        submenu: [
          {
            title: 'Test form',
            form: 'TestForm',
          },
        ],
      },
    ];

    this.menu.forEach((menuItem) => {
      if (menuItem.form && this.forms[menuItem.form].entity && !menuItem.rule) {
        // eslint-disable-next-line no-param-reassign
        menuItem.rule = {
          entity: this.forms[menuItem.form].entity,
          method: 'put',
        };
      }
    });


    // katejs-user params
    this.userRegistration = {
      passwordTitle: 'Password (at least 8 symbols)',
      passwordValid: val => val && val.length > 7,
    };
    this.userAuthorization = {
      usernameTitle: 'E-mail',
    };
    this.saveAuth = true;
  }
};
AppClient.package = packageName;
export default AppClient;
