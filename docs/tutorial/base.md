---
layout: default
title: Основа системы
parent: Руководство
nav_order: 1
---

Для начала необходимо развернуть шаблон и установить зависимости как указано в [руководстве](https://docs.katejs.ru/app.html)

После установки шаблона изменим файл `structure.js` добавив сущности справочников - Статьи доходов, Статьи расходов и Места хранения.

В нашем примере у справочников дополнительных атрибутов нет, 
поэтому каждый справочник будет иметь только заголовок.
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
const ExpenceArticle = {
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
  ExpenceArticle,
};
````
