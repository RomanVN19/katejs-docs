---
layout: default
title: 4. Расход
parent: Руководство
nav_order: 4
---

# 4. Расход

Для отражения расходов денежных средств создадим документ Расход.

Исходя из постановки задачи сущность будет иметь следующие поля
- Дату
- Статью расхода
- Кошелек - место хранения денежных средств
- Сумму

В отличии от Дохода здесь нам нужна возможность отражать по несколько расходов
в одном документе. Для этого мы создадим `табличную часть` в которой будет
указываться статья расхода и сумма.

Также, предусмотрим поле `total` для сохранения общей суммы расходов по документу.

`structure.js`
````

...

const Expense = {
  fields: [
    {
      name: 'date',
      type: Fields.DATE,
    },
    {
      name: 'wallet',
      type: Fields.REFERENCE,
      entity: 'Wallet',
    },
    {
      name: 'total',
      type: Fields.DECIMAL,
    },
  ],
  tables: [
    {
      name: 'expensesDetails',
      fields: [
        {
          name: 'article',
          type: Fields.REFERENCE,
          entity: 'ExpenseArticle',
        },
        {
          name: 'sum',
          type: Fields.DECIMAL,
        },
      ],
    },
  ],
};
...

export const structures = {
  ...
  Expense,
};

````
Обратите внимание - таблицу мы назвали `expensesDetails` - вахно чтобы названия таблиц
не совпадали с названием сущностей (сущность `Exnpense` создает таблицу `expenses`, если мы назовем табличную часть `expenses` - будет ошибка).

Теперь нужно обновить таблицы в БД (если сервер был запущен, его надо остановить):
````
npm run dev-dbsync
npm run dev-server
````
Если dev сервер для клиенской части был запущен, он обновит содержимое автоматически,
иначе его нужно запустить:
````
npm run dev-client
````

У нас получился документ для отражения расходов.
Теперь нам нужно реализовать логику подсчета суммы документа.

Мы можем это сделать в форме документа, чтобы сумма подсчитывалась при вводе раходов,
однако если в последствии документ будет создаваться на сервере, то логика подсчета
суммы в форме не сработает. Поэтому мы сделаем подсчет суммы и на сервере и на клиенте.

Для подсчета суммы на сервере воспользуемся методом `beforePut` у сущности, оформив
код класс-михином.

`./entities/ExpenseMixin.js`
````
export default Entity => class Expense extends Entity {
  beforePut({ savedEntity, body, transaction, ctx }) {
    if (super.beforePut) super.beforePut({ savedEntity, body, transaction, ctx });
    if (body && body.expensesDetails && body.expensesDetails.length) {
      // eslint-disable-next-line no-param-reassign
      body.total = body.expensesDetails.reduce((acc, val) => acc + (+val.sum), 0);
    }
  }
};
````
Некоторые модули, которые мы в последствии будем использовать, могут тоже определять
метод `beforePut` поэтому чтобы не нарушить функциональность во всех
обработчиках (в том числе и на клиенте) следует проверять и вызывать
родительский обработчик при его наличии (`super.beforePut`).

Числа, хоть и хранятся в базе как именно числа, но при пользовательском вводе приходят
как строки, поэтому их нужно при суммировании сконверитровать в число (`(+val.sum)`)

Наш класс-михин следует подключить в серверное приложение
````
...

import ExpenseMixin from './entities/ExpenseMixin';

const AppServer = parent => class Server extends use(parent) {
  static title = title;

  constructor(params) {
    ... 

    this.entities = {
      ...this.entities,
      Expense: ExpenseMixin(this.entities.Expense),
    };
  }
};

...

````

После перезапуска сервера при каждом сохранении документа будет подсчитваться сумма Итого.

Теперь реализуем визуальный подсчет Итого при измении/добавлении строк и сумм.

`./forms/ExpenseitemMixin.js`
````
export default ItemForm => class ExpenseItem extends ItemForm {
  constructor(args) {
    super(args);

    this.elements.get('total').disabled = true;
    const table = this.elements.get('expensesDetails');
    const sumCol = table.columns.find(col => col.id === 'sum');
    sumCol.onChange = () => this.calcTotal();
    table.onDelete = () => this.calcTotal();
  }

  calcTotal() {
    const expenses = this.content.expensesDetails.value;
    this.content.total.value = expenses.reduce((acc, val) => acc + (+val.sum), 0);
  }
};
````
Здесь мы аналогично реализовали подсчет суммы по строкам и установку значения в поле `total`.
Сделали недоступным это поле и поставили метод подсчета как обработчик собырий изменения
суммы и удаления строки.

Наша документ приобретает следующий вид:
<p align="center">
  <img src="https://github.com/romannep/katejs-docs/raw/master/docs/assets/img/expense.png">
</p>

Отчет по расходам практически идентичен отчету по доходам, за исключением
- группирока сделана по колонке табличной части
- использована опция `raw: true` чтобы ORM не группировала строки
- реализован фильр по периоду

`./forms/ExpenseReport`
````
import { Elements, Form } from 'katejs/lib/client';

export default class ExpenseReport extends Form {
  constructor(args) {
    super(args);
    this.elements = [
      {
        type: Elements.LABEL,
        tag: 'h2',
        title: 'Expense report',
      },
      {
        id: 'startDate',
        type: Elements.DATE,
        title: 'Start date',
      },
      {
        id: 'endDate',
        type: Elements.DATE,
        title: 'End date',
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
            dataPath: 'expensesDetails.article.title',
          },
          {
            title: 'Sum',
            dataPath: 'sum',
          },
        ],
      },
    ];
  }

  formReport = async () => {
    const { response: data } = await this.app.Expense.query({
      where: {
        date: {
          $gte: this.content.startDate.value,
          $lte: this.content.endDate.value,
        },
      },
      attributes: [
        [{ $func: { fn: 'SUM', col: 'sum' } }, 'sum'],
      ],
      group: [{ $col: 'expensesDetails->article.uuid' }],
      raw: true,
      limit: -1,
    });
    this.content.data.value = data;
  }
}
````

# Код

Изменения, внесенные на данном этапе: [4. Expense](https://github.com/romannep/katejs-tutorial/commit/b3064ae91cda3f365de9c6d6080adec779540b22)

Код данного этапа можно посмотреть по тэгу `step-4`:
````
git checkout step-4
````
