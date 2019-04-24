import { use, Elements } from 'katejs/lib/client';
import AppUser from 'katejs-user/lib/AppClient';

import { structures, title, packageName } from './structure';

import env from './front.env.json';

const AppClient = parent => class Client extends use(parent, AppUser) {
  static title = title;
  
  static primaryColor = '#5F77D8';

  constructor(params) {
    super(params);

    this.baseUrl = env.apiUrl || '/api';

    this.userRegistration = {
      passwordTitle: 'Password (at least 8 symbols)',
      passwordValid: val => val && val.length > 7,
    };
    this.userAuthorization = {
      usernameTitle: 'E-mail',
    };

    this.init({ structures, addToMenu: true });

    this.menu.forEach((menuItem) => {
      if (this.forms[menuItem.form].entity && !menuItem.rule) {
        // eslint-disable-next-line no-param-reassign
        menuItem.rule = {
          entity: this.forms[menuItem.form].entity,
          method: 'put',
        };
      }
    });

    this.menu = [
      ...this.menu,
      {
        title: 'SubMenu',
        onClick: () => {},
        submenu: [
          {
            title: 'Users',
            form: 'UserList',
          },
          {
            title: 'Tasks',
            form: 'TaskList',
          },
        ],
      },
    ];

    this.saveAuth = true;
  }
};
AppClient.package = packageName;
export default AppClient;
