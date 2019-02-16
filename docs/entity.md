# KateJS - Сущность

- [Концепция](https://github.com/romannep/katejs/blob/master/docs/README.md)
- [Приложение](https://github.com/romannep/katejs/blob/master/docs/app.md)
- [Структура](https://github.com/romannep/katejs/blob/master/docs/structure.md)
- [Серверное приложение](https://github.com/romannep/katejs/blob/master/docs/server.md)
- Сушность
- [Клиентское приложение](https://github.com/romannep/katejs/blob/master/docs/client.md)
- [Форма](https://github.com/romannep/katejs/blob/master/docs/form.md)
- [Элементы](https://github.com/romannep/katejs/blob/master/docs/elements.md)


Сущность является структурной единицей серверного приложения
и представляет собой класс с набором методов, которые вызываются
через `API` клиентским приложением или из других сущностей.

Сущность оформляется классом в синтаксисе `ES6` для возможности
использования наследования для расширения фукнциональности.

## Работа с сущностью
В минимальном виде сущность может быть просто классом со своими методами.

````
export default class Test {
  test() {
    console.log('This is test method of entity Test');
  }
}
````

Данный метод может быть вызван, например, со стороны клиента из формы или из
другой сущности.
````
  this.app.Test.test();
````

При вызове через api в параметры метода передается объект содержащий контекст запроса 
и переденные со соторны клиента параметры
````
  test({ ctx, data }) {

  }
````
- `ctx` - контекст http запроса [koa ctx](https://koajs.com/#context)
- `data` - переданные со стороны клиента параметры

При создании метдов предназначенных для вызова как через api так и со стороны
сервера из других сущностей следует либо передавать `ctx` при вызове либо
учитывать что его может не быть.

При работе через api метод должен возращать объект с одним из полей `response` или `error`.
При наличии поля `response` оно будет возвращено с успешным статусом (200). 
При отсутствии поля `response` будет возвращено поле `error`.

В поле error можно передать объект с полем status значение которого будет использовано
в качестве http статуса. По умолчанию будет использован статус 500 (Internal server error)
````
  test({ ctx, data }) {
    if (data.uuid) {
      return { response: { uuid: data.uuid }};
    }
    return { error: { status: 404, message: 'no uuid' }};
  }
````

## Работа с СУБД

Сущность может быть связана с данными, хранимыми в субд. 

После создания экземпляра класса сущности `kate` смотрит на наличие поля
`structure` в созданном экземпляре и при их наличии создает `модель`
для работы с СУБД. 

При необходимости работы с СУБД необходимо установить в это поле
требуемый элемент структуры. 

В минимальном виде класс сущности предоставляющий методы работы с СУБД
выглядит так:
````
import { Entity } from 'katejs';
import { structures } from '../structure';


export default class Template extends Entity {
  constructor(params) {
    super(params);
    this.structure = structures.Template;
  }
}
````
В коде `серверного приложения`, при использовании вызова `makeEntitiesFromStructures`
классы сущностей создаются именно в таком виде.

### Методы класса Entity

При создании сущности с помощью метода `makeEntitiesFromStructures` или наследованием от `Entity`
класс получает следующие методы.

`async get({ data: { uuid } })` - получение данных о записи из СУБД
Параметры:
- `uuid` - идентификатор записи.

Возвращает: `{ response, error }`
- `response` - данные в JSON формате с разрешенными связями, включая таблицы
- `error` - ошибка


`async put({ data: { uuid, body } })` - запись данных в СУБД
Параметры:
- `uuid` - идентификатор записи данные которой надо обновить. При отсутствии будет создана новая запись.
- `body` - данные записи

Возвращает: `{ response, error }`
- `response` - обновленные или созданные данные записи в JSON формате с разрешенными связями, включая таблицы
- `error` - ошибка


`async delete({ data: { uuid } })` - удаление записи из СУБД
Параметры:
- `uuid` - идентификатор записи которую нужно удалить

Возвращает: `{ response, error }`
- `response` - объект `{ ok: true }`, если удаление прошло успешно
- `error` - ошибка

`async query({ data: { where, attributes } })` - получение списка записей из СУБД
Параметры:
- `where`, `attribures` - параметры выборки в формате [Sequelize](http://docs.sequelizejs.com/manual/tutorial/querying.html). 
Операторы записываются в виде строковых ключей в виде `$or`, `$and`, `$gt` и т.п.

Возвращает: `{ response, error }`
- `response` - массив записей из СУБД
- `error` - ошибка

`async transaction()` - старт транзакции
Возвращает
- `transaction` - объект транзации.

### Транзакции

В системе есть возможность использовать транзакции. Для этого необходимо создать транзакцию,
передать ее во все вызовы методом сущности, зафиксировать или отменить.

````
  async someAction({ ctx, data: { uuid } }) {
    const transaction = await this.transaction();
    try {
      const { response: item } = await this.get({ data: { uuid }, transaction });
      
      // ... do some stuff

      result = await this.put({ data: { uuid, body: item }, transaction });
      transaction.commit();
      return result;
    } catch (error) {
      transaction.rollback();
      return { error };
    }
  }
````
