# KateJS - Форма



## Работа с API

В форме работа с api осуществляется простым вызовом в формате `this.Entity.method(params)`. В ответ приходит объект с одним из полей `{ response, error }` в зависимости
от результата вызова.
Пример: вызов метода `get` у сущности `Task` с параметрами `{ uuid: 123 }`:
````
async test() {
  const { response, error } = await this.Task.get({ uuid: 123 });
  console.log(response, error);
}
````

## Поддержка IE и браузеров без объекта Proxy
Для браузеров без Proxy использование `this.content` ограничено теми элементами 
и теми их свойствами, которые были определены при создании в `this.elements`.
