---
layout: default
title: Пользователи и локализация
parent: Руководство
nav_order: 6
---

# 6. Пользователи и локализация

## Пользователи

Функционал пользователей и ролей доступа в нашем приложении мы поручим
стандартному модулю [AppUser](https://docs.katejs.ru/modules/user.html)

Подключим модуль как указано в документации:

`AppServer`
````
import { AppDoc, AppUser } from 'katejs-modules';

...

const AppServer = parent => class Server extends use(parent, AppDoc, AppUser) {
  ...
  constructor(params) {
    ...

    this.setAuthParams({ jwtSecret: this.env.jwtSecret || 'default' });

    ...
  }

````
`AppClient`
````
import { AppDoc, AppUser } from 'katejs-modules/lib/client';

...

const AppClient = parent => class Client extends use(parent, AppDoc, AppUser) {
  ...
````
Мы сразу получаем готовый фукнционал.
Пока ни одного пользователя нет - система не запрашивает логин/пароль.

Создадим роль с полными правами, пользователя `admin` и перезапустим сервер.

Создавая роль без доступа к сущности `Доход`, мы тем самым ограничиваем пользователя
с такой ролью смотреть и создавать документы `Доход`. Таким образом модуль `AppUser`
полностю закрывает требования к работе с пользователями нашей системы.

<p align="center">
  <img src="https://github.com/romannep/katejs/raw/master/docs/assets/img/user_1.png">
</p>


## Локализация

Для локализации нашего приложения используем штатный в фреймворке механизм.

Для этого модифицируем файл переводов:

`translations.js`
````
import { translations } from 'katejs/lib/client';

/* eslint-disable quote-props */
const translate = {
  languages: ['ru'],
  ru: {
    ...translations.ru,
    'Expenses': 'Расходы',
  },
};

export default translate;
````
Фреймворк заменяет строки по ключу в объекте `translate`.

Часть переводов уже содержится в `katejs/lib/client`, нам останется только ввести переводы
созданных нами сущностей.
<p align="center">
  <img src="https://github.com/romannep/katejs/raw/master/docs/assets/img/user_2.png">
</p>

# Код

Изменения, внесенные на данном этапе: [6. Users & translate]()

Код данного этапа можно посмотреть по тэгу `step-6`:
````
git checkout step-6
````
