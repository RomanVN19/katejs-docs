---
layout: default
title: Основа системы
parent: Руководство
nav_order: 1
---

Для начала необходимо развернуть шаблон и установить зависимости как указано в [руководстве](https://docs.katejs.ru/app.html)

После установки шаблона изменим файл `structure.js` добавив сущности справочников - Статьи доходов, Статьи расходов и Места хранения.

В нашем примере у справочников дополнительных атрибутов нет, 
поэтому каждый справочник будет иметь только одно поле - "Наименование".
````
import Fields from 'katejs/lib/fields';

const Wallet = {
  fields: [
    {
      name: 'title',
      type: Fields.STRING,
    },
  ],
};

const IncomeArticle = {
  fields: [
    {
      name: 'title',
      type: Fields.STRING,
    },
  ],
};
const ExpenseArticle = {
  fields: [
    {
      name: 'title',
      type: Fields.STRING,
    },
  ],
};


export const title = 'Tutorial app';
export const packageName = 'tutorial_app';
export const structures = {
  Wallet,
  IncomeArticle,
  ExpenseArticle,
};
````

Теперь нужно создать таблицы в БД и можно смотреть результат.
````
npm run dev-dbsync
npm run dev-server
````
И в отдельном окне dev сервер для клиенской части
````
npm run dev-client
````

У нас получилось приложение в котором можно создавать, редактировать списки
статей расходов, доходов и кошельки - места хранения денежных средств.

<p align="center">
  <img width="200" height="200" src="https://github.com/romannep/katejs/raw/master/docs/assets/img/base.png">
</p>
