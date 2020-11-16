---
layout: default
title: Структура
nav_order: 4
---

# KateJS - Структура


Набор структур определяет хранение данных в СУБД.

Структура имеет следующие особенности:
- каждая запись может иметь одно или несколько полей с различными типами данных.
- каждая запись может иметь несколько "табличных частей" - подчиненных один-ко-многим
записей, каждая из которых может состоять из одного или более полей с различными типами данных
 
Структура определяются объектом с полями `fields` и `tables` где указываются требуемые поля и
таблицы.

Структуры используются как на сервере - для создания
и работы с таблицами СУБД, так и на клиенте - для автогенерации форм.
Они задаются в файле `structures.js`.

Также, в этом файле определяются другие общие значения для клиента и сервера,
такие как название приложения и имя пакета.

Файл `structure.js`:
````
import Fields from 'katejs/lib/fields';

const Task = { // Имя сущности
  fields: [ // Массив полей
    {
      name: 'title',
      type: Fields.STRING,
    },
    {
      name: 'private',
      type: Fields.STRING,
      skipForForm: true,
      skipForList: true,
    },
  ],
  tables: [ // Массив таблиц
    {
      name: 'users', // имя таблицы
      fields: [ // массив полей таблицы
        {
          name: 'title',
          type: Fields.STRING,
        },
      ],
    },
  ],
};

export const title = 'Task manager'; // Заголовок приложения
export const packageName = 'task-manager'; // Имя пакета
export const structures = { // Объект с сущностями
  Task, // где ключ - имя сущности
};
````


## Именования сущностей и таблиц
Важно чтобы названия таблиц не совпадали с названием сущностей.
(сущность `Exnpense` создает таблицу `expenses`, если мы назовем таблицу `expenses` - будет ошибка).

## Типы полей

У каждого поля могут быть определены два дополнительных свойства
- `skipForForm` - при автогенерации формы элемента данное поле будет пропущено
- `skipForList` - при автогенерации формы списка данное поле не будет добавлено в колонки

### Строка
Строка переменной длины
````
{
  name: 'title',
  type: Fields.STRING,
},
````
Многострочный текст
````
{
  name: 'description',
  type: Fields.TEXT,
},
````

### Число
Возможно определение как целых чисел, так и десятичных

````
{
  name: 'shopCount',
  type: Fields.INTEGER,
},
````

````
{
  name: 'salary',
  type: Fields.DECIMAL,
  length: 5,
  precision: 2,
},
````

### Дата
Дата и время
````
{
  name: 'deliveryAt',
  type: Fields.DATE,
},
````
Дата - только дата
````
{
  name: 'deliveryAt',
  type: Fields.DATEONLY,
},
````

### Ссылка (связь с элементом другой таблицы)

````
{
  name: 'project',
  type: Fields.REFERENCE,
  entity: 'Project',
},
````
При выборке данных ссылочное поле приходит как `{ uuid, title }`. 
При необходимости можно явным образом указать перечень выбираемых полей:
````
{
  name: 'project',
  type: Fields.REFERENCE,
  entity: 'Project',
  attributes: ['title', 'uuid', 'startDate'],
},
````

## Индексирование
Для индексирования полей сущности или ее таблицы служит свойство `indexes`
````
const Deal = {
  fields: [
    {
      name: 'title',
      type: Fields.STRING,
    },
    {
      name: 'step',
      type: Fields.STRING,
    },
  ],
  indexes: [
    { fields: ['step'] },
  ],
  tables: [
    {
      name: 'comments',
      indexes: [
        { fields: ['date'] },
      ],
      fields: [
        {
          name: 'date',
          type: Fields.DATE,
        },
        {
          name: 'comment',
          type: Fields.STRING,
        },
      ],
    },
  ],
};
````
Правила составления сложных индексов идентичны документации [Sequelize](https://sequelize.org/master/manual/indexes.html).
