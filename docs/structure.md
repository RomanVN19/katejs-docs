# KateJS - Структура

Структура - набор сущностей и их полей - используется как на сервере - для создания
и работы с таблицами СУБД, так и на клиенте - для автогенерации форм.
Поэтому она вынесена в отдельный файл. Также, в этот файл вынесены
другие общие значения для клиента и сервера,
такие как название приложения и имя пакета.

Файл `structure.js`:
````
import Fields from 'katejs/fields';

const Task = { // Имя сущности
  name: 'task', // служебное имя сущности для работы с БД
  fields: [ // Массив полей
    {
      name: 'title',
      type: Fields.STRING,
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

export const title = 'Task manager'; // Имя приложения
export const packageName = 'task-manager'; // Имя пакета
export const structures = { // Объект с сущностями
  Task, // где ключ - имя сущности
};
````

## Типы полей

### Строка

````
{
  name: 'title',
  type: Fields.STRING,
},
````

### Число

````
{
  name: 'salary',
  type: Fields.DECIMAL,
  length: 5,
  precision: 2,
},
````

### Ссылка

````
{
  name: 'project',
  type: Fields.REFERENCE,
  entity: 'Project',
},
````
