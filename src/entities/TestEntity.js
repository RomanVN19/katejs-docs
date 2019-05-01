import fs from 'fs';
import { promisify } from 'util';

const fsStat = promisify(fs.stat);

export default class TestEntity {
  constructor(args) {
    Object.assign(this, args);
  }

  // eslint-disable-next-line class-methods-use-this
  async download() {
    const stat = await fsStat('./src/entities/test_big_image.png');
    const stream = fs.createReadStream('./src/entities/test_big_image.png');
    return {
      response: stream,
      headers: {
        'Content-Length': stat.size,
      },
    };
  }
}
