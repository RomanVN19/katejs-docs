# KateJS - Серверное приложение

Серверное приложение определяет набор сущностей и
является разделяемым контекстом для них.

Оформляется в виде функции, возвращающей класс, для возможности
наследования функциональности других приложений.

````
import { makeEntitiesFromStructures, use } from 'katejs';
import { structures, title, packageName } from './structure';

const AppServer = parent => class Server extends use(parent) {
  constructor(params) {
    super(params);

    makeEntitiesFromStructures(this.entities, structures);
    //your code
  }
};
AppServer.package = packageName;
export default AppServer;
````

## `makeEntitiesFromStructures`
Функция создает стандартные сущности c методами работы с БД на каждый элемент структуры. 

## Переопределение сущностей
Все сущности (классы) содержатся в свойстве `entities` приложения.

Можно переопределить класс полностью:
````
import Document from './entities/Document';

const AppServer = parent => class Server extends use(parent) {
  constructor(params) {
    super(params);
    makeEntitiesFromStructures(this.entities, structures);

    ...

    this.entities.Document = Document;    
  }
};

````

Можно расширить существующий класс сущности новой функциональностью
````
const UserMixin = Entity => class UserMixinClass extends Entity {
  constructor(args) {
    super(args);
    this.structure.fields.push(someField);
  }
};

const AppServer = parent => class Server extends use(parent) {
  constructor(params) {
    super(params);
    makeEntitiesFromStructures(this.entities, structures);

    ...

    this.entities.User = UserMixin(this.entities.User);    
  }
};
````

## Вызов методов сущностей
После создания экземляра приложения создаются экземпляры классов сущностей и записываются
по своим названиям в поля приложения.

Таким образом из приложения обратиться, к примеру, методу `get` сущности `User` можно как
````
  this.User.get()
````
Экземпляр приложения передается экземплярам сущностей в поле `app`, следовательно аналогичный
вызов в методах сущности будет выглядеть как
````
  this.app.User.get()
````

## `afterInit`
`afterInit()` - метод вызывается после инициализации приложения, при его наличии.
Следует предусмотреть возможность существования родительского метода, выполнив его вызов.
````
afterInit() {
  if (super.afterInit) super.afterInit();
  // ...
}
````

## `httpMidlewares`
В поле `httpMidlewares` содержится массив обработчиков запросов http сервера koa.
При необходимости, в него можно добавить свой.
Для перехвата запросов к `api` можно воспользоваться нужным шаблоном.
````
import { apiUrl } from 'katejs/lib/http';
import Router from 'koa-router';

const AppServer = parent => class Server extends use(parent) {
  constructor(params) {
    .... 
    this.router = new Router();
    this.router.post(apiUrl, this.apiLog);
    this.httpMidlewares.push(this.router.routes());
    ....
  }
  apiLog = async (ctx, next) => {
    const { entity, method } = ctx.params;
    ....

  }
};

````