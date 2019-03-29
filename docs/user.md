---
layout: default
title: katejs-user
nav_order: 10
---

# KateJS - модуль katejs-user

Модуль добавляющий функционал пользователей, ролей доступа, token based авторизации.

## Подключение
````
npm isntall katejs-user
````
`AppServer`
````
import AppUser from 'katejs-user/lib/AppServer';

...

const AppServer = parent => class Server extends use(parent, AppUser) {
  constructor(params) {
    super(params);
    
    ...
    this.setAuthParams({ jwtSecret: this.env.jwtSecret || 'default' });
    
    // You can add rules for methods allowed to any user
    this.publicAccessRules.push({
      entity: 'Task',
      method: 'query',
      access: true,
    });
  }
};
````
`AppClient`
````
import AppUser from 'katejs-user/lib/AppClient';

const AppClient = parent => class Client extends use(parent, AppUser) {
  static title = title;
  static logo = logo;
  static primaryColor = '#5F77D8';

  constructor(params) {
    super(params);

    ...

    this.saveAuth = true; // if not defined user needs to login on each page reload

    // code below will strict menu items to allowed put
    // for form classes with defined `entity` static property
    // (all list forms created from structure with ListForm paren has one)

    this.menu.forEach((menuItem) => {
      if (this.forms[menuItem.form].entity) {
        // eslint-disable-next-line no-param-reassign
        menuItem.rule = {
          entity: this.forms[menuItem.form].entity,
          method: 'put',
        };
      }
    });
  }
};
````
При запуске с пустой таблицей пользователей система никак не будет ограничивать
доступ к данным. При первом запуске следует создать роль с полными правами
(нажать кнопку "Заполнить" в ОБЕИХ таблицах) и пользователя с этой ролью.

## Описание
Модуль предоставляет возможность создания и описания ролей доступа и пользователей.

Внимание! Модуль контролирует права доступа к методам сущностей при обращении к ним
через api. При вызове метода сущности со стороны сервера (из метода другой сущности)
контроль остается за разработчиком (можно использовать, например, `this.app.allow`).

Система основана на сущностях и обращении к их методам. Модуль ограничивает доступ
к вызову методов сущностей через api по принципу "запрещено все что не разрешено".

##№ Роли
Разрешенные методы определяются в Роли с помощью двух таблиц
- Типовые методы
В таблице указывается название сущности и флажками отмечаются один и более типовых
методов - `get`, `put`, `query`, `delete`.
- Кастомные методы
В таблице в строке указывается название и сущности и метода и флаг разрешения.

В обеих таблицах предусмотрена кнопка "Заполнить", которая заполняет таблицы
на основании созданных классов и их методов.

Также таблицу можно использовать для хранения абстрактных прав доступа.

### Пользователи 

Каждому пользователю указывается одна или несколько ролей, на основании которых
осуществляется контроль доступа.

Роль указанная перой отображается в левой панели под именем пользователя.

Роли пользователя "суммируются" - пользователю разрешено действие если оно разрешено
хотя бы в одной из его ролей.
Возможность указания несколько ролей имеет смысл использовать для разделения на
"базовую роль" - в которой разрешено все то что доступно любому пользователю
и "специфические" - особенные для разных категорий и назначать каждому
пользователю базову роль и специфическую. Такое разделение позволит обновлять
роли в процессе разработки "в одном месте".

## Описание API
