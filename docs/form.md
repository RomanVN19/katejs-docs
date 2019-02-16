---
layout: default
title: Форма
nav_order: 8
---

# KateJS - Форма

Форма представляет собой набор элементов и кода, описывающего их поведение.
Форма состоит из заголовка, набора действий (кнопок) и основных элементов.
Форма описывается классом, с наследованием от базового

Элементы задаются константами объекта `Elements`. Полный набор типов элементов
и их атрибутов указан в разделе [Элементы](https://github.com/romannep/katejs/blob/master/docs/elements.md).

````
import { Elements, Form } from 'katejs/lib/client';

class Auth extends Form {
  static title = 'Auth'; // заголовок формы

  constructor(sys, params) {
    super(sys);

    this.elements = [ // элементы формы
      {
        id: 'caption',
        type: Elements.LABEL,
        tag: 'h2',
        title: 'Auth',
        style: { textAlign: 'center' },
      },
      {
        id: 'username',
        type: Elements.INPUT,
        title: 'Username',
        onChange: this.clearErrors,
        error: false,
        value: '',
      },
      {
        id: 'password',
        type: Elements.INPUT,
        title: 'Password',
        inputType: 'password',
        onChange: this.clearErrors,
        error: false,
        value: '',
      },
    ];

    this.actions = [ // действия формы (командная панель)
      {
        id: 'login',
        type: Elements.BUTTON,
        title: 'Login',
        fullWidth: true,
        onClick: this.login,
      },
    ];
  }
  clearErrors = () => {
    this.content.username.error = false;
    this.content.password.error = false;
  }
  login = async () => {
    const result = await this.app.User.auth({
      username: this.content.username.value,
      password: this.content.password.value,
    });
    if (result.error) {
      this.content.username.error = true;
      this.content.password.error = true;
    }
  }
}

export default Auth;
````
## Класс формы

### Конструктор
В конструкторе определяется внешний вид формы - набор действий в панели в шапке
и набор элементов.
- `this.actions` - набор действий (кнопок) командной панели
- `this.elements` - набор элементов формы

Оба поля являются обычными массивами. Для удобства доступа к элементам
у поля - массива `elements` есть метод `get(id)` 
выполняющий рекурсивный поиск и возвращающий элемент по его `id`.

````
const button = this.elements.get('button');
````
Оба поля предназначены для использования в конструкторе и только там: после создания
экземпляра формы изменения в этих полях не будут отражены на форме. 
После создания формы для изменения элементов формы следует использовать объект `content`.

### Жизненный цикл формы
У формы могут быть определены дополнительные методы, которые буду вызваны
в соответствующей ситуации.
- `afterInit` - вызывается после создания формы и поля `content`.
- `beforeUnmount` - вызывается непосредственно перед закрытием формы.

### Важно
Обработчики событий важно определять как свойства класса, чтобы
сохранить контекст `this`. 
````
click = () => {
  this.content.title.value = 'test value';
}
````

Функциональные методы могут быть переопределены (дополнены), 
поэтому имеет смысл их оформлять как методы класса, 
а для вызова создать дополнительный обработчик:
````
const click = Symbol('click');

...

  load() {
    // ...
  }
  [click] = () => {
    this.load();
  }
````
### `app`
В классе формы можно обратиться к экземпляру приложения через поле `app`
````
this.app.open('ItemForm');
````

## `content`
При инициализации формы создается служебное поле `content` которое можно использовать
в событиях элементов формы для изменения их поведения. С помощью этого поля
можно в простом виде прочитать или задать любое поле любого элемента формы по его `id`.
В общем случае это делается как `this.content.someElementId.somePropertyId`.
````
  constructor() {
    this.elements = [
      {
        id: 'username',
        type: Elements.INPUT,
      },
      ....
      {
        type: Elements.BUTTON,
        onClick: this.checkInput,
        title: 'Check input',
      }
    ];
  }
  
  checkInput = () => {
    if (!this.content.username.value) {
      this.content.username.error = true;
    }
  }
````

## Работа с API

В форме работа с api осуществляется простым вызовом в формате `this.app.Entity.method(params)`. В ответ приходит объект с одним из полей `{ response, error }` в зависимости
от результата вызова.
Пример: вызов метода `get` у сущности `Task` с параметрами `{ uuid: 123 }`:
````
async test() {
  const { response, error } = await this.app.Task.get({ uuid: 123 });
  console.log(response, error);
}
````

## Поддержка IE и браузеров без объекта Proxy
Для браузеров без Proxy использование `this.content` ограничено теми элементами 
и теми их свойствами, которые были определены при создании в `this.elements`.

## Наследование форм
Классы форм могут быть унаследованы от других форм используя штатный механизм
наследования классов ES6.
В конструкторе можно повлиять на вид формы модифицируя `elements` и `actions`.

Форма может быть наследована напрямую
````
import ItemForm from './ItemForm';

export default class BuildingItem extends ItemForm {
  constructor(args) {
    super(args);
    ....
  }
}
````

Или оформлена в виде композиции класса и миксина для использования в приложении,
когда родительский класс будет определен в процессе работы программа.


`forms/UserListMixin.js`
````
export default ListForm => class UsersList extends ListForm {
  constructor(args) {
    super(args);

    const list = this.elements.get('list');
    list.columns.push(
      {
        title: 'Role',
        dataPath: 'roles',
        format: val => val && val[0] && val[0].role && val[0].role.title,
      },
    )
  }
}
````
`AppClient.js`
````
import AppUser from 'katejs-user/lib/AppClient';
import UsersListMixin from './forms/UsersListMixin';

const AppClient = parent => class Client extends use(parent, AppUser) {
  static title = title;
  static logo = logo;
  static components = { ...parent.components, ...components };
  constructor(params) {
    super(params);
    ...
    this.forms.UserList = UsersListMixin(this.forms.UserList);
    ...
  }
}
````

При переопределении методов при наследовании следует позаботиться о вызове
родительского метода.
````
  afterInit() {
    if (super.afterInit) {
      super.afterInit();
    }
    // your code
  }
````
## Методы создания элементов формы по структуре
Фреймворк предоставляет два метода для создания элементов формы на основании структуры.


`getElement(structureField, form)` - создает элемент формы на основании структуры. 
вторым параметром передается сама форма, для создания метода выборки элементов
в том случае когда поле структуры является ссылкой.
````
import { Form } from 'katejs/lib/client;
import Fields from 'katejs/lib/fields';

class TestForm extends Form {
  constructor(args) {
    super(args);

    const cityFilter = getElement({
      name: 'city',
      type: Fields.REFERENCE,
      entity: 'City',
    }, this);
    this.elements.push(cityFilter);
    ...
  }
}
````

`getTableElement(structureTable, form)` - создает редактируемую таблицу с командной
панелью с кнопкой добавления строк. Второй параметр актуален для таблиц, среди полей
которых есть поля ссылочного типа.

## ListForm
Фреймворк предоставляет возможность быстрого создания формы списка элементов
с целью последующей модификации с помощью наследования от  функции класса `ListForm`.

````
import { ListForm } from 'katejs/lib/client';
import Fields from 'katejs/lib/fields';
import { structures } from '../structure';

const { Building } = structures;

export default class BuildingList extends ListForm({ Building }, { addActions: true, addElements: true }) {
  constructor(params) {
    super(params);

    const cityFilter = getElement({
      name: 'city',
      type: Fields.REFERENCE,
      entity: 'City',
    }, this);
    cityFilter.onChange = this.cityChange;
    this.elements.unshift(cityFilter); // to display above table

    this.filters = {};
  }
  cityChange() {
    const cityValue = this.content.city.value;
    const cityUuid = (cityValue && cityValue.uuid) || undefined;
    if (this.filters.cityUuid !== cityUuid) {
      this.filters.cityUuid = cityUuid;
      this.load();
    }
  }
}
````

Функция `ListForm` возвращает класс формы списка на основании параметров:
- Элемент структуры - первый параметр должен быть объектом с единственным полем,
ключом которого равен названием элемента структуры
- Параметры - второй параметр - объект с двумя полями
  - `addActions` - нужно ли заполнять командную панель формы
  - `addElements` - нужно ли создавать сами элементы формы

В создаваемом классе создается метод `load` который при наличии поля `filters` передает
его как параметр `where` при вызове метода api `query`.

Подробней о создаваемом классе можно узнать в исходном коде [ListForm](https://github.com/romannep/katejs/blob/master/src/forms/List.js)

## ItemForm
Фреймворк предоставляет возможность быстрого создания формы редактирования
с целью последующей модификации с помощью наследования от  функции класса `ItemForm`.

````
import { ItemForm, Elements, getElement } from 'katejs/lib/client';
import { structures } from '../structure';

const { Building } = structures;

export default class BuildingItem extends ItemForm({ Building }, { addActions: true, addElements: false }) {
  constructor(params) {
    super(params);

    const [title, city] = Building.fields;
    this.elements.push(
      {
        type: Elements.GRID,
        id: 'grid',
        elements: [
          {
            ...getElement(title),
            cols: 8,
          },
          {
            ...getElement(city, this),
            cols: 4,
          },
        ],
      },
    );
  }
}
````
Функция `ItemForm` возвращает класс формы редактирования на основании параметров:
- Элемент структуры - первый параметр должен быть объектом с единственным полем,
ключом которого равен названием элемента структуры
- Параметры - второй параметр - объект с двумя полями
  - `addActions` - нужно ли заполнять командную панель формы
  - `addElements` - нужно ли создавать сами элементы формы

При нажатии на кнопку удаления используется модальный диалог, который тоже
является элементом формы. Этот элемент добавляется даже если параметр
`addElements` == `false`. Для того чтобы не потерять этот элемент, 
следует его либо сохранить либо не переопределять массив `elements`
````
constructor() {
  ...
  this.elements = [...]; // wrong - confirmDialog lost

  this.elements.push(...); // confirmDialog saved
  ...
}
````
Подробней о создаваемом классе можно узнать в исходном коде [ItemForm](https://github.com/romannep/katejs/blob/master/src/forms/Item.js)
