'use strict';

const fs = require('fs');
const path = require('path');
const request = require('request');

function getSource(tag, dir, setting) {


  const isRemotePath = /https?\:\/\//g.test(dir);
  const remoteBasePath = setting.remoteBasePath;
  const context = setting.localBaseDir;
  const publicPath = setting.publicPath.trim();
  const proxy = setting.proxy;
  if (publicPath !== '') {
    return Promise.resolve(`<!--#include file="${publicPath}/${path.basename(dir)}"-->`);
  }
  if (isRemotePath || remoteBasePath) {
    var _url = remoteBasePath ? (remoteBasePath + dir) : dir;
    return new Promise((resolve, reject) => {
      let requestParams = {
        url: _url,
        gzip: true,
        timeout: 5000,
        headers: {
          'Cache-Control': 'no-cache',
        },
      };
      if (proxy) {
        requestParams.proxy = proxy;
      }
      request(requestParams, (err, res, body) => {

        if (err || res.statusCode !== 200) {
          console.error(err);
          console.error('statusCode', res && res.statusCode);
          resolve('');
        } else {
          resolve(body);
        }

      });
    });

  } else {

    return new Promise((resolve, reject) => {

      try {

        const absolutePath = path.normalize(context ? path.join(context, dir) : dir);

        console.log(`replace ssi file ${dir} [tag=${tag} ctx=${context}] => path=${absolutePath}`);

        const body = fs.readFileSync(absolutePath).toString();

        resolve(body);

      } catch (e) {
        reject(e);
      }

    });

  }

}

module.exports = getSource;