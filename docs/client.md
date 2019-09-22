---
layout: default
title: Клиентское приложение
nav_order: 7
---

# KateJS - Клиентское приложение

Клиентское приложение определяет набор форм, меню и методов
вызова api.
Оформляется в виде функции, возвращающей класс, для возможности
наследования функциональности других приложений.

## Пример
````
import { use } from 'katejs/lib/client';
import { structures, title, packageName } from './structure';

import AppUser from 'katejs-user/lib/AppClient'; // пример наследования

const AppClient = parent => class Client extends use(parent, AppUser) {
  static title = title; // название приложения
  constructor(params) {
    super(params);
    this.init({ structures, addToMenu: true }); 
    //your code
  }
};
AppClient.package = packageName;
export default AppClient;
````
## Работа с API

В приложении работа с api осуществляется простым вызовом в формате `this.Entity.method(params)`. В ответ приходит объект с одним из полей `{ response, error }` в зависимости
от результата вызова.
Пример: вызов метода `get` у сущности `Task` с параметрами `{ uuid: 123 }`:
````
async test() {
  const { response, error } = await this.Task.get({ uuid: 123 });
  console.log(response, error);
}
````

## `init`

Метод `init` формирует все части клиентского приложения на основании набора структур:
- `this.forms` - объект коллекция форм приложения. 
На каждый элемент структуры создается форма списка и форма элемента по принципу `EntityList`, `EntityItem`, где Entity - имя сущности.
- `this.menu` - массив элементов меню. 
При передаче в параметре ключа `addToMenu: true` в массив добавляется каждая форма списка.
- `this[Entity][method]` - набор методов вызова api - возможность вызвать метод сущности со стороны клиента как `app.Entity.method(params)`

При самостоятельном определении форм без вызова метода `init` заполнение меню и методов api нужно также выполнить самостоятельно:

````
import { use } from 'katejs/lib/client';

import ActionLogList from './forms/ActionLogList';
import ActionLogItem from './forms/ActionLogItem';
import { structures, title, packageName } from './structure';

const AppClient = parent => class Client extends use(parent) {
  static title = title;
  constructor(params) {
    super(params);

    this.forms.ActionLogList = ActionLogList;
    this.forms.ActionLogItem = ActionLogItem;

    this.menu.push({
      title: 'Logs',
      form: 'ActionLogList',
    });
    this.makeApiLinks({ entities: ['ActionLog'] });

  }
};
AppClient.package = packageName;
export default AppClient;
````

## `afterInit`
`afterInit()` - метод вызывается после инициализации приложения, при его наличии.
Следует предусмотреть возможность существования родительского метода, выполнив его вызов.
````
afterInit() {
  if (super.afterInit) super.afterInit();
  // ...
}
````
## Menu

Меню определяется в конструкторе приложения в поле `this.menu` как массив элементов, 
каждый из которых должен быть объектом с полями `title`, `form` или `onClick`;

Можно задавать подменю, в поле элемента меню `submenu`.

Можно задать бэйдж у элемента меню в поле `badge`.
````
  this.menu = [
    {
      title: 'Menu item',
      form: 'Test form',
    },
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
    {
      title: 'Item with badge',
      form: 'TestForm',
      badge: '123',
    }
  ];
````

При работе с родительскими приложениями, которые тоже добавляют пункты в меню
логично не заменять меню целиком, а добавлять в него элементы (`this.menu.push(...)`).

`setMenu([...])` - метод, с помощью которого можно установить/изменить меню в процессе
работы приложения. В качестве параметра передается массив пунктов меню.



## `open`
`open(form, params, area)` - метод открытия формы.
- `form` - название формы, которую нужно открыть (отобразить)
- `params` - параметры, которые будут переданы в форму. Допускаются только примитивные типы.
- `area`- название области, в которой открывать форму. По умолчанию - основная область `main`.
Программа имеет 3 области 
- `alerts` - служебная область для отображения всплывающих уведомлений
- `leftMenu` - область, в которой отбражается меню
- `main` - основная область в которой отображаются формы

Для скрытия меню можно "открыть" в области меню несуществующую форму
````
  hideMenu() {
    this.open('none', null, 'leftMenu');
  }
````
В форме метод доступен через `this.app`.
Открытие формы элемента из списка может выглядеть так
````
    rowClick = (row) => {
      this.app.open(`DocumentItem`, { id: row.uuid });
    }
````
## `showAlert`
Метод для отображает уведомлений.

`showAlert({ type, title, description, timeout })`
- `type` - Тип уведомления. Влияет на цвет фона и иконку. 
Может быть одним из: `success || info || warning`.
- `title` - текст заголовка уведомления
- `description` - текст уведомления
- `timeout` - время отображения уведомления в секундах. По умолчанию - 2.
````
this.showAlert({ type: 'info', title: 'Loaded!' });
````
Из класса формы
````
this.app.showAlert({ type: 'success', title: 'Saved!', timeout: 5 });
````

## `loaderOn`, `loaderOff`
Методы для отображения полосы загрузки:

Примеры вызовов из класса формы.

Отображение полосы загрузки
````
this.app.loaderOn();
````
Скрытие полосы индикатора загрузки
````
this.app.loaderOff();
````


## Использование собственных React компонентов

Элементы формы подключаются по идентификатору (строковому, `Symbol`) из поля `type`,
передавая все поля элемента как `props`.
При необходимости можно дополнить их собственными.

`components.js`
````
import React from 'react';
import BigCalendar from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

const calendarWrapperStyle = { height: 800 };
const localizer = BigCalendar.momentLocalizer(moment);

export const CalendarWrapper = props => (
  <div style={calendarWrapperStyle}>
    <BigCalendar localizer={localizer} {...props} />
  </div>
);

````

`AppClient.js`
````
import { CalendarWrapper } from './components';

const components = { BigCalendar: CalendarWrapper };

const AppClient = parent => class Client extends use(parent) {
  static title = title;
  static logo = logo;
  constructor(params) {
    super(params);
    this.constructor.components = { ...this.constructor.components, ...components };

    ...

  }
}
````
`CalendarForm.js`
````
import { Elements, Form } from 'katejs/lib/client';

class Calendar extends Form {
  static title = 'Calendar'; // заголовок формы

  constructor(sys, params) {
    super(sys);

    this.elements = [
      {
        type: 'BigCalendar',
        events: [],
      },
    ];
    
    ....
    
  }
}

````

## Поддержка IE и браузеров без объекта Proxy
Для возможности вызова методов api как `app.Entity.method(params)` необходимо
в явном виде описать все эти методы (кроме стандартных `get`, `put`, `query`, `delete`) 
в свойстве приложения `entityMethods` перед вызовом `init` или `makeApiLinksa`
````
    this.entityMethods.User = ['needAuthorization', 'auth'];
````

## Стилизация
Можно задать лого, основной цвет (панели, кнопки) и цвета меню.
При необходимости установки лого во всю ширину меню, нужно установить пустой заголовок
и атрибут `fullLogo = true`.
````
import logo from './logo.png';

const AppClient = parent => class Client extends use(parent) {
  static title = '';
  static fullLogo = true;
  static logo = logo;
  static primaryColor = '#1d1060';
  static drawerPalette = {
    main: '#222222',
    background: '#eeeeee',
  };

...

}
````
