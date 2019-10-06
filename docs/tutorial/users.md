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
  <img width="200" height="200" src="https://github.com/romannep/katejs/raw/master/docs/assets/img/user_1.png">
</p>


## Локализация




# Код

Изменения, внесенные на данном этапе: [6. Users]()

Код данного этапа можно посмотреть по тэгу `step-6`:
````
git checkout step-6
````
