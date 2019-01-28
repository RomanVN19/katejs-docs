# Черновик

````
import { Form, Elements } from 'kate-client';

export default class Item extends Form {
  static path = '/task/:id';
  static title = 'Task';

  constructor(sys, params) {
    super(sys);

    this.actions = [
      {
        id: '0',
        type: Elements.BUTTON,
        title: 'OK',
        onClick: this.click
      },
    ];

    this.elements = [
      {
        id: 'title',
        type: Elements.INPUT,
        title: 'Title',
        value: '',
      },
    ];
  }
  afterInit() {
    console.log('form initialized');
  }
  afterUpdate() {
    console.log('form updated')
  }
  click = () => {
    this.content.title.value = 'test value';
  }
}
````
- `path` - адрес открытия формы. При наличии параметров (пример: `/task/:id`) в конструкторе
формы они будут доступны в объекте `params`
- `actions` - набор кнопок в шапке формы.
- `content` - состав самой формы


## Работа с формой
В конструкторе для изменений состава формы и/или свойств элементов
необходимо использовать `this.actions` и `this.elements` - простые массивы.
Во всех остальных местах (обработчиках событий и жизненного цикла) следует использовать
поле `content`.

### Важно
Поле `content` недоступно в конструкторе!
Изменения в `this.action` `this.elements` где либо помимо конструктора не приведут
к визуальному изменению формы и/или элементов.

### Важно
Обработчики событий важно определять как свойства класса, чтобы
сохранить `this`:
````
click = () => {
  this.content.title.value = 'test value';
}
````


# Жизненный цикл формы
- `constructor`
- `afterInit`
- `afterUpdate`

# content
При инициализации формы создается служебное поле `content` которое можно использовать
в событиях элементов формы для изменения их поведения. С помощью этого поля
можно в простом виде прочитать или переопределить любое поле любого элемента формы по его `id`.
В общем случае это делается как `this.content.someElementId.somePropertyId`.
