
/*
Copyright © 2018 Roman Nep <neproman@gmail.com>

This file is part of KateJS.

KateJS is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

KateJS is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with KateJS.  If not, see <https://www.gnu.org/licenses/>.
*/

import webpack from 'webpack';
import fs from 'fs';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import KateServer from './KateServer';

import Fields from './fields';
import { makeEntitiesFromStructures, trivialLogger } from './server';
import Entity from './Entity';

export default class KateJS {
  constructor({ AppServer, logger, database, http }) {
    this.logger = logger || trivialLogger;
    this.AppServer = AppServer;
    this.database = database;
    this.http = http;
  }
  createServer() {
    this.server = new KateServer(this);
  }
  syncDatabase() {
    this.createServer();
    this.server.syncDatabase();
  }
  startServer() {
    this.createServer();
    this.server.run();
  }
  compileClient() {
    this.logger.info('Compiling client...');
    webpack({
      entry: './src/index.js',
      output: {
        path: `${process.cwd()}/build`,
        filename: './bundle/bundle.js',
      },
      plugins: [
        new ExtractTextPlugin('./bundle/bundle.css'),
      ],
      module: {
        rules: [{
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel-loader',
        },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: 'css-loader',
          }),
        },
        {
          test: /\.svg$/,
          use: ['@svgr/webpack', 'url-loader'],
        }],
      },
      devtool: 'source-map',
    }, (err, stats) => {
      if (err || stats.hasErrors()) {
        const info = stats.toJson();
        this.logger.info('Client compiling error!', info.errors);
      } else {
        this.makeIndex();
        this.logger.info('...client compiling done!');
      }
    });
  }
  makeIndex() {
    const index = fs.readFileSync(`${__dirname}/index.html`, { encoding: 'utf8' });
    fs.writeFileSync(`${process.cwd()}/build/index.html`, index.replace('%app_title%', this.server.app.constructor.title), { encoding: 'utf8' });
  }
}

const use = (parent, ...classes) => {
  let result = parent;
  result.packages = result.packages || [];
  (classes || []).forEach((Package) => {
    if (result.packages.indexOf(Package.package) === -1) {
      result.packages.push(Package.package);
      result = Package(result);
    }
  });
  return result;
};

export {
  Fields,
  Entity,
  makeEntitiesFromStructures,
  use,
};
