---
layout: default
title: 2. Доход
parent: Руководство
nav_order: 2
---

# 2. Доход

Для отражения доходов - поступлений денежных средств создадим документ Доход.

Исходя из постановки задачи сущность будет иметь следующие поля
- Дату
- Статью дохода
- Кошелек - место хранения денежных средств
- Сумму

`structure.js`
````

...

const Income = {
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

...

export const structures = {
  ...
  Income,
};

````

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

У нас уже получился готовый документ для отражения доходов
<p align="center">
  <img src="https://github.com/romannep/katejs/raw/master/docs/assets/img/income_1.png">
</p>

Давайте немного улучшим документ - расположим поля выбора кошелька и статьи в одной строке.

Для этого модифицируем класс формы элемента через миксин.

`forms/IncomeItemMixin.js`
````
import { Elements } from 'katejs/lib/client';

export default ItemForm => class IncomeItem extends ItemForm {
  constructor(args) {
    super(args);
    this.elements.splice(1, 2, {
      type: Elements.GRID,
      elements: [
        { ...this.elements.get('wallet'), cols: 6 },
        { ...this.elements.get('article'), cols: 6 },
      ],
    });
  }
};
````
В конструкторе `this.elements` - массив элементов формы - обычный массив 
с двумя дополнительными методами - `get` `set` для работы с элементами по `id`.
Мы добавляем в него после поля даты
элемент `GRID` с двумя элементами - кошельком и статьей, 
устанавливая их ширину в 6 колонок и удаляем эти два элемента из основного списка.

Теперь наш класс-миксин надо подключить в клиентском приложении
````

...
import IncomeFormMixin from './forms/IncomeItemMixin';
...

const AppClient = parent => class Client extends use(parent) {
  static title = title;

  constructor(params) {
    
    ...

    this.forms = {
      ...this.forms,
      IncomeItem: IncomeFormMixin(this.forms.IncomeItem),
    };

  }
};
````

Наша форма приобретает следующий вид:
<p align="center">
  <img src="https://github.com/romannep/katejs/raw/master/docs/assets/img/income_2.png">
</p>

Модификация форм с помощью класс-миксинов позволяет не создавать форму целиком,
а также позволяет не менять код, при последующих изменений в структуре 
(например при добавлении полей).

# Код

Изменения, внесенные на данном этапе: [2. Income](https://github.com/romannep/katejs-tutorial/commit/265dd44bbe34aa59780d4756346e38dc88a00f35)

Код данного этапа можно посмотреть по тэгу `step-2`:
````
git checkout step-2
````
