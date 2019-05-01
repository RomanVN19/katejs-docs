import { Elements, Form } from 'katejs/lib/client';

class TestForm extends Form {
  static title = 'Test form'; // заголовок формы

  constructor(sys) {
    super(sys);

    this.elements = [ // элементы формы
      {
        id: 'caption',
        type: Elements.LABEL,
        tag: 'h2',
        title: 'Test',
        style: { textAlign: 'center' },
      },
      {
        type: Elements.BUTTON,
        title: 'Test app progress',
        onClick: this.testAppProgress,
      },
      {
        type: Elements.BUTTON,
        title: 'Test download with progress',
        onClick: this.testDownload,
      },
      {
        id: 'progress',
        type: Elements.PROGRESS,
        // variant: 'determinate',
      },
    ];
  }
  testAppProgress = () => {
    this.app.loaderOn();
    setTimeout(() => {
      this.app.loaderOff();
    }, 2000);
  }
  testDownload = async () => {
    // let progress = 0;
    this.content.progress.variant = 'determinate';
    this.content.progress.value = 0;
    let total;
    const data = await this.app.TestEntity.download({}, {
      response: (response) => {
        total = response.headers.get('Content-Length');
      },
      chunk: (chunk, received) => {
        // console.log('got bytes', chunk.length, ' total', received);
        this.content.progress.value = (received / total) * 100;
      },
    });
    console.log('got data', data);
  }
}

export default TestForm;
