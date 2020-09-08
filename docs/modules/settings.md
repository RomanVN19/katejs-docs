---
layout: default
title: Настройки
parent: Модули
nav_order: 3
---

# AppSettings - настройки системы.
Модуль предназначен для хранения различных настроек для системы в целом.

## Подключение
`AppServer`
````
import { AppSettings } from 'katejs-modules';

...
const AppServer = parent => class Server extends use(parent, AppSettings) {
  ...
````
`AppClient`
````
import { AppSettings } from 'katejs-modules/lib/client';

const AppClient = parent => class Client extends use(parent, AppSettings) {
  ...
````

## Настройка

Поля настроек задаются в приложении в параметре settingsParams:

`AppServer.js`
````
  this.settingsParams = {
    fields: [
      {
        name: 'companyName',
        type: Fields.STRING,
      },
    ],
  };
````

`AppClient.js`
````
  this.settingsParams = {
    fields: [
      {
        name: 'companyName',
        type: Fields.STRING,
      },
    ],
  };
````

Структура `settingsParams` общая и для клиента и для сервера, 
поэтому можно ее вынести в общий файл (например `structure.js`),
не добавляя в объект `structures`, и потом используя его в приложениях.
````
export const Settings = {
  fields: [
    {
      name: 'companyName',
      type: Fields.STRING,
    },
  ],
};
````


## Использование
На клиенте настройки запрашиваются при открытии системы и доступны
в поле приложения по ключу `settings`.
````
export default class TestForm extends Form {
  constructor(args) {
    super(args);
    this.elements = [
      {
        type: Elements.LABEL,
        title: `Company name settings ${this.app.settings.companyName}`,
      }
    ];
  }
}
````
