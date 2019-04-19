---
layout: default
title: Элементы формы
nav_order: 9
---

# KateJS - Элементы формы

## Общие атрибуты
Указаные атрибуты могут быть указаны в любом элементе
````
{
  id: 'someId',
  hidden: false || true,
  elements : []
}
````
- `id` - идентификатор для доступа к элементу через поле `content` (пример: `this.content.someId.value = 123`)
- `hidden` - при установке атрибута в значение `true` элемент не отображается
- `elements` - для групп и прочих элементов в этом поле записываются дочерние элементы.

## LABEL - Текст
````
{
  type: Elements.LABEL,
  title: 'Label content',
  tag: 'p'(default) || 'quote' || 'h1' || 'h2' || ... || 'h6',
  style: { textAlign: 'center' },
}
````
- `tag` - вариант рендера.
- `style` - возможно установить CSS стиль текстовой метки (в формате Inline CSS).

## INPUT - Поле ввода
````
{
  type: Elements.INPUT,
  title: 'Input placeholder',
  success: false || true,
  error: false || true,
  value: 'some value',
  format: (val) => (val),
  onChange: (value, allProps) => (),
  rows: 0,
  rowsMax: 0,  
  type: 'password' || 'file' || '',
  accept: '.pdf' || '',
}
````
- `success` - Подчеркивает зеленым и отображает "галочку" в конце
- `error` - Подчеркивает красным и отображает "крестик" в конце
- `onChange` - Срабатывает при каждом изменении, `value` - текущее значение, `allProps` - все атрибуты элемента формы.
- `format` - Вызывается при каждом изменении и записывает в значение результат
- `type` - установка атрибута `type` у тэга `<input>`
- `accept` - установка атрибута `accept` у тэга `<input>`, применяется когда `type == 'file'`
- `rows`, `rowsMax` - при указании делает поле ввода многострочным с начальным кол-вом строк `rows` и 
максимальным (отображаемый размер) `rowsMax`


## SWITCH - переключатель
````
{
  id: '0',
  type: Elements.SWITCH,
  title: 'Label',
  value: false || true,
  onChange: (value, allProps) => (),
},
````

## CHECKBOX - флажок
````
{
  id: '0',
  type: Elements.CHECKBOX,
  title: 'Label',
  value: false || true,
  onChange: (value, allProps) => (),
},
````

## DATE - поле ввода даты
````
{
  id: '0',
  type: Elements.DATE,
  title: 'Label',
  value: '',
  onChange: (value, allProps) => (),
},
````

## SELECT - поле выбора, поле автокомплита
````
{
  id: '0',
  type: Elements.SELECT,
  title: 'Label',
  value: {},
  options: [
    { 
      title: 'option 1'
    },
    { 
      title: 'option 2'
    },
  ],
  noClear: false | true,
  getOptions: async (queryText) => ([{}, {}]),
  onChange: (value, allProps) => (),
  selectValue: false || true,
  optionStyle: (option) => ({}),
},
````
Поле выбора значений, заданных в поле `options`. Каждое значение должно быть объектом с полем `title`, 
которое используется для отобажения опции. При выборе в `value` устанавливается сам объект опции.
- `noClear` - скрывает кнопку очистки поля
- `selectValue` - при указании значения `true` подразумевается, 
что будет задан массив `option` объектами вида `{ title, value }` 
и при выборе элемента в значение будет передано значение поля `value`.
Может быть использовано для перечисляемых полей 
(тип поля `Fields.INTEGER`, а массив `options` `[{ title: 'Enum 1', value: 1}, { title: 'Enum 2', value: 2}]`).
- `optionStyle(option)` - функция, которая используется для задания стиля опций в зависимости от данных. 
Функция должна возврашать объект с CSS стилем (в формате Inline CSS).

При указании асинхронного метода getOptions список опций для выбора формируется из возвращаемого массива.

## BUTTON - Кнопка
````
{
  id: '0',
  type: Elements.BUTTON,
  title: 'OK',
  disabled: false || true,
  fullWidth: false || true
},
````
`fullWidth` - при установке в `true` установит размер кнопки по полной ширине.

## TABLE - таблица
````
{
  type: Elements.TABLE,
  columns: [
    {
      title: 'column title',
      dataPath: 'someProperty',
      format: val => val,
    }
  ],
  value: [
    {
      someProperty: 'row1'
    },
    {
      someProperty: 'row2'
    },
  ],
  rowClick: (row, index) => (),
  cellStyle: (row, column) => ({}),
}
````
Отображает таблицу с колонками заданными в `columns` и строками, заданными в `value`.
- `cellStyle(row, column)` - функция, которая используется для задания стиля ячеек в зависимости от данных. 
Функция должна возврашать объект с CSS стилем (в формате Inline CSS).

## TABLE_EDITABLE - редактируемая таблица
````
{
  type: Elements.TABLE_EDITABLE,
  hideRowActions: false || true,
  columns: [
    {
      title: 'column title',
      dataPath: 'title',
      id: 'input',
      type: Elements.INPUT,
      width: 100,
      onChange: row => (),
      onClick: row => (),
      getElement: value => {},
    }
  ],
  value: [
    { title: 'row1' },
    { title: 'row2' },
  ],
  onDelete: (deletedRow) => (),
}
````
Отображает таблицу с возможностью редактирования значений в ячейках. 

- `hideRowActions` - скрыть кнопки удаления и перемещения строк
- `onDelete` - вызывается при интерактивном удалении строки таблицы

Тип элемента и его опции
указывается дополнительно в массиве колонок.

- `width` - явным образом указанная ширина колонки

После создания и отображения таблицы можно добавить строку воспользовавшись методом `addRow`.
````
this.content.tableId.addRow({ title: 'row3' });
````
События `onChange` в создаваемых элементах перехватываются таблицей и имеют синтаксис
`cellChange(rowContent, colIndex)` для возможности установки значений в различные колонки строки. 
Поле `rowContent` аналогично полю `content` у формы - для установки данных в ячейки
у колонок должно быть задано поле `id`.
События `onClick` в создаваемых элементах перехватываются таблицей и имеют синтаксис
`cellClick(rowContent, rowData)`.
````
...
{
  ...
  columns: [
    { id: 'amount', ...}
    { id: 'price', onChange: this.priceChange, ...}
    { id: 'summ', ...}
  ]
}
...
  priceChange(row) {
    row.summ.value = row.amount.value * row.price.value;
  }
````
Также возможно получить строку по индексу используя метод `getRow` у созданной таблицы:
````
...
    const row = this.content.tableId.getRow(0);
    row.summ.value = row.amount.value * row.price.value;
...
````
Для динамического формирования элемента ячейки используется поле `getElement` которое
получает на входе значение по `dataPath` и должно вернуть элемент.
````
...
          {
            title: 'Accept',
            dataPath: '',
            getElement: row => (row.inactive ? {
              type: Elements.BUTTON,
              title: 'Accept user',
              onClick: this.accept,
            } : {
              type: Elements.LABEL,
              title: '✔',
            }),
          },
...
````

## CARD - "Карточка" - область с коммандной панелью
````
{
  type: Elements.CARD,
  title: 'Card title',
  elements: [
    {
      type: Elements.LABEL,
      title: 'card element'
    },
    {
      type: Elements.CARD_ACTIONS,
      elements: [
        {
          type: Elements.BUTTON,
          title: 'Command button',
        },
      ],
    },
  ],
}
````
Создает визуально выделенную группу элементов. 
При необходимости можно добавить коммандную панель, для этого надо в список элементов
добавить элемент с типом `Elements.CARD_ACTIONS`.

## GRID - "Сетка"
````
{
  id: '0',
  type: Elements.GRID,
  elements: [{ id: '1', cols: 4 }]
},
````
Элемент используется для визуального расположения других элементов по сетке из 12 колонок.
Каждый дочерний элемент располагается по умолчанию в 3 колонки (4 элемента в строке).
У дочернего элемента можно указать атрибут `cols`
для явного указания количества колонок которые он должен занять.
Для позиционирования нескольких элементов в колонке можно изспользовать в качестве
вложенного - элемент Группу (GROUP).

## GROUP - группа
````
{
  id: '0',
  type: Elements.GROUP,
  elements: []
},
````
Элемент используется для визуальной группировки дочерних элементов.
Дочерние элементы группируются по вертикали.
Ипользуется в композиции с `Сеткой` (GRID)

## MODAL - Модальный диалог.
````
{
  type: Elements.MODAL,
  title: 'Modal title',
  maxWidth: 'xs' || 'sm' || 'md' || 'lg' || 'xl' || false,
  fullWidth: false || true,
  open: false,
  handleClose: () => (),
  elements: [
    {
      type: Elements.LABEL,
      title: 'This is modal content',
    },
    {
      type: Elements.MODAL_ACTIONS,
      elements: [
        {
          type: Elements.BUTTON,
          title: 'Ok',
        },
      ],
    },
  ],
}
````
Отображает модальное окно с опциональным заголовком (поле `title`) 
и кнопками действий (вложенный элемент с типом `Elements.MODAL_ACTIONS`). 
Диалог должен быть создан в конструторе формы. Для отображения нужно установить поле `open`:
````
  this.content.dialogId.open = true;
````

## IMAGE - Изображение.
````
{
  type: Elements.IMAGE,
  title: 'Image alt text',
  src: '/path/to/image.jpf',
}
````

## LOADING - Спиннер загрузки.
````
{
  type: Elements.LOADING,
  alt: 'Spinner alt text' || 'Loading...',
}
````

## PAGINATION - Страницы пагинации
````
{
  type: Elements.PAGINATION,
  page: 1, // current page
  pageChange: (a => a), // page change handler
  length: 5, // pages count
  max: 0, // max page
}
````
