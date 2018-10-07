# KateJS - Клиентское приложение

````
import { use } from 'katejs/lib/client';
import { structures, title, packageName } from './structure';

import App2 from './AppClient2'; // пример наследования
import App3 from './AppClient3'; // пример наследования

// Минимальный класс без наследования
// const AppClient = parent => class Client extends use(parent) {
// }

const AppClient = parent => class Client extends use(parent, App2, App3) {
  static title = title; // название приложения
  constructor(params) {
    super(params);
    this.init({ structures });
    // this.allForms == {
    //   ProjectList,
    //   ProjectItem,
    //   ..
    // }
    // теперь можно модифицировать классы форм
    // через this.allForms[_form_name_]
  }
};
AppClient.package = packageName;
export default AppClient;
````
