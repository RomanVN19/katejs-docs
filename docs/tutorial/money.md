---
layout: default
title: 5. Денежные средства
parent: Руководство
nav_order: 5
---

# 5. Денежные средства

Для подсчета остатков денежных средств нужно выбрать все поступления,
 вычесть из них все расходы и сгруппировать по кошелькам. Может это
 сделать и не сложно, но в общем случае может быть так, что денежные средства
 могут изменть более чем два документа. При этом при появлении каждого такого
 документа мы будем вынуждены менять код отчета. 
 
 Для решения этого вопроса мы будем использовать модуль [AppDoc](https://docs.katejs.ru/modules/doc.html) из стандартных модулей.
Модуль вводит два понятия - `Документ` и `Регистр`: 
мы сделаем регистр `Денежные средства` - именно в нем будут записываться все движения
денежных средств. Отчет будет формироваться по регистру, а документы просто делать в него
записи.

## Установка и подключение

Мы первый раз начали использовать стандартные модули, поэтому нам нужно добавить пакет
с ними себе в проект
````
npm install katejs-modules
````

Подключим модуль `AppDoc` как указано в [Документации](https://docs.katejs.ru/modules/doc.html)

`AppServer`
````
import { AppDoc } from 'katejs-modules';

...

const AppServer = parent => class Server extends use(parent, AppDoc) {
  ...
````
`AppClient`
````
import { AppDoc } from 'katejs-modules/lib/client';

... 
const AppClient = parent => class Client extends use(parent, AppDoc) {
  ...
````

Теперь необходимо обозначить, что наши сущности Поступления и Расхода являются документами,
а также создать регистр для движений по денежным средствам.

Модуль `AppDoc` автоматически добавляет в том числе поле `date` поэтому мы удалим это поле
из структуры наших документов.

`structure.js`
````

...

const Income = {
  fields: [
    {
      name: 'wallet',
      type: Fields.REFERENCE,
      entity: 'Wallet',
    },
    {
      name: 'article',
      type: Fields.REFERENCE,
      entity: 'IncomeArticle',
    },
    {
      name: 'sum',
      type: Fields.DECIMAL,
    },
  ],
};

const Expense = {
  fields: [
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

const MoneyRecord = {
  // skipForForm: true,
  fields: [
    {
      name: 'wallet',
      type: Fields.REFERENCE,
      entity: 'Wallet',
    },
  ],
  resources: [
    {
      name: 'sum',
      type: Fields.DECIMAL,
    },
  ],
};

export const title = 'Tutorial app';
export const packageName = 'tutorial_app';
export const structures = {
  MoneyRecord,
  ...
};

````

Далее нужно установить статическое свойство `doc = true` класса сущностей и классов форм.
У нас уже создан класс-миксин для расхода, создадим аналогичый для поступления и в обоих
установим нуный флаг

`./entities/IncomeMixin.js`
````
export default Entity => class Income extends Entity {
  static doc = true;
};
````
`./entities/ExpenseMixin.js`
````
export default Entity => class Expense extends Entity {
  static doc = true;

  ...
};
````
Новый класс-миксин необходимо подключить в `AppServer`. И отментить что наша сущность `MoneyRecord` является регистром


`AppServer.js`
````

...
import IncomeMixin from './entities/IncomeMixin';
...

const AppServer = parent => class Server extends use(parent, AppDoc) {

  constructor(params) {
    ...

    this.entities = {

      ...

      Income: IncomeMixin(this.entities.Income),
    };

    ...
    this.entities.MoneyRecord.record = true;
  }
};
````

Аналогично для каждой из форм документов - как элемента так и списка - нужно установить флаг.

`./forms/ExpenseItemMixin.js` и `IncomeItemMixin`
````

export default ItemForm => class ExpenseItem extends ItemForm {
  static doc = true;

  ...    
````
Классы форм списка мы не меняли - им флаги проставим прямо в `AppClient`
````
    this.forms = {
      ...
    };
    this.forms.IncomeList.doc = true;
    this.forms.ExpenseList.doc = true;
````

У нас изменилась структура БД, поэтому необходимо обновить таблицы в СУБД
````
npm run dev-dbsync
````

В результате, у каждого документа появилось в шапке два пола - номер и дата.
Номер автоматически заполняется при сохранении. Также автоматически 
формируется заголовок.

<p align="center">
  <img src="https://github.com/romannep/katejs-docs/raw/master/docs/assets/img/money_1.png">
</p>

Теперь сделаем формирование движений. Движения - всегда массив, но в нашем случае
каждый документ делает лишь одно движение.
`./entities/IncomeMixin.js`
````

export default Entity => class Income extends Entity {
  static doc = true;

  static records = ['MoneyRecord'];

  // eslint-disable-next-line class-methods-use-this
  makeRecords(doc) {
    return {
      MoneyRecord: [{
        wallet: doc.wallet,
        sum: doc.sum,
      }],
    };
  }
};

````
`./entities/ExpenseMixin.js`
````

export default Entity => class Expense extends Entity {
  static doc = true;

  static records = ['MoneyRecord'];

  ...

  // eslint-disable-next-line class-methods-use-this
  makeRecords(doc) {
    return {
      MoneyRecord: [{
        wallet: doc.wallet,
        sum: -doc.total,
      }],
    };
  }
};

````
Теперь сформируем отчет по остаткам денежных средств. Все что нам нужно для получения данных - 
обратиться к методу регистра `balance()`

`./forms/MoneyReport.js`
````
import { Elements, Form } from 'katejs/lib/client';

export default class IncomeReport extends Form {
  constructor(args) {
    super(args);
    this.elements = [
      {
        type: Elements.LABEL,
        tag: 'h2',
        title: 'Money balance report',
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
            title: 'Wallet',
            dataPath: 'wallet.title',
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
    const { response: data } = await this.app.MoneyRecord.balance();
    this.content.data.value = data;
  }
}
````

Движения создаются при записи документов, поэтому чтобы увидеть результат нам нужно
открыть каждый докмент и пересохранить его ("Нажать ОК").

<p align="center">
  <img src="https://github.com/romannep/katejs-docs/raw/master/docs/assets/img/money_1.png">
</p>

# Код

Изменения, внесенные на данном этапе: [5. Money](https://github.com/romannep/katejs-tutorial/commit/837c0961b431c18d1a97a80eb0c5dd39c7439dd4)

Код данного этапа можно посмотреть по тэгу `step-5`:
````
git checkout step-5
````
