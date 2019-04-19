---
layout: default
title: katejs-user
nav_order: 10
---

# KateJS - модуль katejs-user

Модуль добавляющий функционал пользователей, ролей доступа, token based авторизации.

## Подключение
````
npm isntall katejs-user --save
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
    
    // You can add custom access rules to fill it in role methods table
    this.accessRules.push(
      {
        entity: 'Schedule',
        method: 'AccessAllEvents',
      },
    );

    // You can add additional fields to token
    this.userTokenFields.push(
      { field: 'school', value: user => user.school && user.school.uuid },
    );

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

### Роли
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

## Добавление дополнительных полей в User

`./entities/UserMixin.js`
````
import Fields from 'katejs/lib/fields';

export User = {
  fields: [
    {
      name: 'school',
      type: Fields.REFERENCE,
      entity: 'School',
    },
  ],
};

export default Entity => class UserMixin extends Entity {
  constructor(args) {
    super(args);
    this.structure.fields.push(...User.fields);
  }
};
````
`AppServer.js`
````
...
    this.entities = {
      ...this.entities,
      User: UserMixin(this.entities.User),
    };

    // You can add additional fields to token, if need
    this.userTokenFields.push(
      { field: 'school', value: user => user.school && user.school.uuid },
    );

...
````
`./forms/UserItemMixin.js`
````
import { getElement } from 'katejs/lib/client';
import Fields from 'katejs/lib/fields';

export User = {
  fields: [
    {
      name: 'school',
      type: Fields.REFERENCE,
      entity: 'School',
    },
  ],
};

export default ItemForm => class UserItem extends ItemForm {
  constructor(args) {
    super(args);
    User.fields.forEach(field => this.elements.push(getElement(field, this)));
  }
};

````
`AppClient.js`
````
...
    this.forms = {
      ...this.forms,
      UserItem: UserItemMixin(this.forms.UserItem),
    };
...
````

## Описание API для внешних приложений

Все запросы выполняются методом `POST` с параметрами в `JSON` формате
````
content-type: application/json
````
При попытке доступа к ресурсу на который у пользователя нет прав система вернет ответ
````
Status Code: 403 Forbidden
````
### Аутентификация
Аутентификация осуществляется с помощью токенов JWT

В каждый запрос к системе необходимо включать токен в заголоке http запроса `Authorization`:
````
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiNmZlM2JiYjktMWZjNy00ZDdiLTliY
````
Токен получается в начале работы приложения с помощью авторизации

Время жизни токена - 30 минут. По его истечении, запрос к api выдаст ошибку
````
Status Code: 401 Unauthorized
````
после чего необходимо обновить токен и выполнить требуемый запрос еще раз.

### Авторизация
````
Request URL: /api/User/auth
Request Method: POST
Body: {"username":"user@user.com","password":"user","device":"device-580539"}
````
- username - имя пользователя, обычно e-mail.
- password - пароль пользователя.
- device - идентификатор устройства. Любая строка, которая будет постоянной для устройства
с которого происходит логин.

`Response`
````
{
  "message":"OK",
  "token":"eyJhbGciOiJI...vyyAwGxU",
  "user":{
    "uuid":"6fe3bbb9-1fc7-4d7b-9bc9-bfde761bee8f",
    "title":"John Smith",
    "username":"user@user.com",
    "roles":["5fb97124-16d9-4acd-8593-711a279cd05c"],
  },
 "device":"device-580539"
}
````
- `user` - Информация о пользователе. Необходимо сохранить ее (uuid пользователя требуется для обновления токена)
  - `facilities` - Доступные пользователю объекты
- `token` - Авторизационный токен для использования в запросах

### Обновление токена

Для обновления токена следует выполнить запрос к api с передачей сущшествующего токена
````
Request URL: /api/User/renew
Request Method: POST
Body: 
{
	"uuid": "6fe3bbb9-1fc7-4d7b-9bc9-bfde761bee8f",
	"token":"eyJhbGciOiJ ... PKtAmU0",
	"device":"test-device"
}
````
- `uuid` - идентификатор пользователя
- `token` - имеющийся просроченный токен
- `device` - строка - идентификатор устройства

`Response` - такой же, как и при авторизации, включая обновленный токен
````
{
  "message":"OK",
  "token":"eyJhbGciOiJI...vyyAwGxU",
  "user":{ ... }
}
````
