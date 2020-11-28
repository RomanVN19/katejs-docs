---
layout: default
title: Файлы
parent: Модули
nav_order: 4
---

# AppFiles - работа с файлами.
Модуль предназначен для организации хранения файлов. 
В случае хранения картинок в модуле предусмотрены
элементы формы для их отображения. 

## Подключение
`AppServer`
````
import { AppFiles } from 'katejs-modules';

...
const AppServer = parent => class Server extends use(parent, AppFiles) {
  ...
````
`AppClient`
````
import { AppFiles } from 'katejs-modules/lib/client';

const AppClient = parent => class Client extends use(parent, AppFiles) {
  ...
````

## Использование
Модуль добавляет сущность Файл. В форме сущности есть возможность загрузить файл.

После загрузки, файл становится доступен по URL  вида `/api/files/{file uuid}/{file name}`
который следует получать через метод приложения `getFileUrl(uuid, fileName)`

В случае, когда файл явяется картинкой, на форму можно добавить элемент
ее отображения.
Для этого, при определении структуры необходимо, добавить поле ссылку
на сущность Файл и указать дополнительный атрибут - `fileName`
````
const Expense = {
  fields: [
    ...
    {
      name: 'image1',
      type: Fields.REFERENCE,
      entity: 'File',
      attributes: ['title', 'uuid', 'fileName'],
    },
  ],
  tables: [
    {
      name: 'images',
      fields: [
        {
          name: 'image',
          type: Fields.REFERENCE,
          entity: 'File',
          attributes: ['title', 'uuid', 'fileName'],
        },
      ],
    },
  ],
};

````

В форме для создания элемента автоматического отображения выбранного
файла картинки следует воспользоваться методом:
`AppFiles.getImageElement('fieldId', form)`
Также можно добавить элемент превью картинки в табличную часть, добавив
колонку методом:
`AppFiles.getImageTableElement('image', 'images', form)`

Метод автоматически устанавливает картинку при загрузке и при
изменении ссылки. Метод предполагает, что форма основана 
на автоматически сгенерированной, поэтому модифицированную форму
следует делать класс-микином.
````
import { AppFiles } from 'katejs-modules/lib/client';

export default ItemForm => class ExpenseItem extends ItemForm {
  static doc = true;

  constructor(args) {
    super(args);

    ...

    this.elements.push(AppFiles.getImageElement('image1', this));

    ...

    const imagesTable = this.elements.get('images');
    imagesTable.columns.push({
      ...AppFiles.getImageTableElement('image', 'images', this),
      width: `15%`,
    });

  }
}
````
