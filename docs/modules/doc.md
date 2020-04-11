---
layout: default
title: Документы и движения
parent: Модули
nav_order: 2
---

# AppDoc - документы и движения.

## Подключение
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

const AppClient = parent => class Client extends use(parent, AppDoc) {
  ...
````

Каждый документ имеет поля
  - number, date, title
  - title устанавливается при записи автоматически

Эти поля модуль добавит автоматически в каждую сущность, которая будет документом.
Одноименные поля в сущности следует удалить.

## Создание документов.

Для добавления функцональности документа в класс сущности должен иметь поле `doc` = `true`;

- `AppServer.js`
````
  this.entities.Payment.doc = true;
````
Или
- `entitied/Payment.js`
````
export default class Payment extends Entity {
  static doc = true;

  ...
}
````
- `AppClient.js`
````
    this.forms.PaymentList.doc = true;
    this.forms.PaymentItem.doc = true;
````

## Создание регистров

Модуль предоставляет возможность создания регистров учета. Регистры учета полезны, когда по какому либо разделу учета делают движения разные документы - единый регистр позволяет формировать расчетные отчеты не перебирая разные документы.

- Запись в регистр имеет следующие системные поля:
  - docUuid - иденитфикатор документа,
  - entity - имя сущности - документа, 
  - docTitle - представление документа.

## Объявление регистра 

`structure.js`
````
const DebtRecord = {
  fields: [
    fields.client,
  ],
  resources: [
    fields.sum,
  ],
};
````
`AppServer.js`
````
  this.entities.DebtRecord.record = true;
````

## Дижения в документе

В документе необходимо указать признак использования регистра для автоматического удаления движений
при обновлении/удалении документа.
````
export default class Payment extends Entity {
  static doc = true;
  static records = ['DebtRecord'];

  ...
}
````
Формирование движений

`entities/Payment.js`
````
  makeRecords(doc) {
    const records = [];
    (doc.clients || []).forEach((row) => {
      records.push({
        client: row.client,
        sum: -row.sum,
      });
    });
    return {
      DebtRecord: records.filter(item => !!item.sum),
    };
  }

````
## Контроль записи движений
У класса сущности регистра можно определить методы `beforeRecordsPut`,
`afterRecordsPut` 
которые будут вызываться перед и после записью данных в регистр
````
export default Entity => class MoneyRecord extends Entity {
  async beforeRecordsPut({ records, transaction. ctx }) {
    // do smthing with records
  }
};

````
## Выборка движений
Сущность регистра предоставляет два дополнительных метода обращения к данным, которые расширяют
стандаттный метод `query`
- `balance()` - формирует выборку с группировкой по полям регистра и суммированию ресурсов
- `turnover()` - формирует выборку по всем записям без пагинации.
В параметры методов можно передавать тоже самое, что и в стандартный метод `query()`
