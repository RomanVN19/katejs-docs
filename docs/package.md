# KateJS - Приложение

## Требования

- Git
- Node.JS
- MySQL

## Разработка
Разработка начинается с шаблона приложения, доступного в репозитории [katejs-boilerplate](https://github.com/romannep/katejs-boilerplate).

Для разворачивания шаблона в текущую папку:
````
git clone https://github.com/romannep/katejs-boilerplate.git .
npm install
````
Поправьте в файле package.json как минимум поля `name`, `author`.

Для работы с git с удаленным репозиторием вашего приложения
````
git remote remove origin
git remote add origin <your repository url>
````

Для первого запуска раскомментируйте в `index.js` строчку 
````
// platform.syncDatabase();
````
и отредактируйте параметры соединения с СУБД в `AppServer.js`.


Запуск приложения в режиме разработки:
````
npm run dev
````

##  Структура файлов

Приложение в общем случае состоит из следующего минимального набора файлов
располагаемых, обычно, в подпапке `src/`:

- index.js - файл для запуска всего приложения.
- client.js - точка входа клиенского приложнения.
- structure.js - структура - общий список сущностей со списком полей.
- AppClient.js - клиентское приложение.
- AppServer.js - серверное приложение.

Файлы index.js и client.js являются служебными и остаются без изменений.
