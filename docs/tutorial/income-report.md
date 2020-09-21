---
layout: default
title: 3. Отчет по доходам
parent: Руководство
nav_order: 3
---

# 3. Отчет по доходам

Для создания отчета по доходам нам будет достаточно изменить только клиентское приложение.

Отчет будет отражать все доходы сгруппированные по статьям доходоа.
Визуализировать данные будем с помощью таблицы.

Создадим форму отчета, добавим класс в клиентское приложение и пункт в меню.

`forms/IncomeReport.js`
````
import { Elements, Form } from 'katejs/lib/client';

export default class IncomeReport extends Form {
  constructor(args) {
    super(args);
    this.elements = [
      {
        type: Elements.LABEL,
        tag: 'h2',
        title: 'Income report',
      },
    ];
  }
}
````
`AppClient.js`
````

....
import IncomeReport from './forms/IncomeReport';

const AppClient = parent => class Client extends use(parent) {
  static title = title;

  constructor(params) {

    ...

    this.forms = {
      ...
      IncomeReport,
    };
    this.menu.push({
      form: 'IncomeReport',
      title: 'Income report',
    });
  }
};

````

Сейчас форма нашего отчета отображает только заголовок.
Добавим в элементы кнопку для формирования отчета 
и таблицу, в которой будут выводится данные
````
import { Elements, Form } from 'katejs/lib/client';

export default class IncomeReport extends Form {
  constructor(args) {
    super(args);
    this.elements = [
      {
        type: Elements.LABEL,
        tag: 'h2',
        title: 'Income report',
      },
      {
        type: Elements.BUTTON,
        title: 'Form report',
        onClick: this.formReport,
      },
      {
        id: 'data',
        type: Elements.TABLE,
        columns: [
          {
            title: 'Article',
            dataPath: 'article',
          },
          {
            title: 'Sum',
            dataPath: 'sum',
          },
        ],
      },
    ];
  }

  formReport = () => {
    console.log('form report');
  }
}
````
Обратите внимание, что обработчик кнопки мы оформили как свойство экземпляра формы, а не 
как метод класса. Так нужно для того, чтобы сохранился контекст `this` т.к. функция
будет вызвана как обработчик нажатия кнопки.

Для получения данных сделаем запрос - выборку - к сущности `Article`.
В нашем отчете нам нужно сгруппировать по статье и получить сумму.
````
  formReport = async () => {
    const { response: data } = await this.app.Income.query({
      attributes: [
        [{ $func: { fn: 'SUM', col: 'sum' } }, 'sum'],
      ],
      group: [{ $col: 'article.uuid' }],
      limit: -1,
    });
    this.content.data.value = data;
  }
````
Мы добавили ключевое слово `async` чтоб можно было воспользоваться асинхронными вызовами.
Полученные данные мы устанавливаем в значение таблицы.

Синтаксис атрибутов метода `query` практически идентичен синтаксису 
выборок элементов ORM `Sequelize`.

Параметр `limit` нужен для отключения автоматической пагинации.

При таком запросе мы получим массив объектов, где `article` это объект - ссылка на статью
с полями `uuid` и`title`. Нас интересвет именно `title` поэтому нам надо поправить
атрибут `dataPath` у первой колонки таблицы
````
      {
        id: 'data',
        type: Elements.TABLE,
        columns: [
          {
            title: 'Article',
            dataPath: 'article.title',
          },
````

Отчет готов!
<p align="center">
  <img src="https://github.com/romannep/katejs-docs/raw/master/docs/assets/img/income_report.png">
</p>

Разумеется, отчет должен формироваться по периоду. Его лего доделать, добавив на форму
элементы типа `DATE` для начала и окончания периода и передать их в запрос `query` 
в атрибуте `where`.

# Код

Изменения, внесенные на данном этапе: [3. Income report](https://github.com/romannep/katejs-tutorial/commit/d4656260f54c24b723e76771602ff0629adf44ab)

Код данного этапа можно посмотреть по тэгу `step-3`:
````
git checkout step-3
````
