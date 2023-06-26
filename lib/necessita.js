const fs = require('fs-extra');
const crypto = require('crypto');
const Crypto = require("crypto")
const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ23456789'.split('');
const pool2 = '123456789'.split('');
const request = require('request')
const axios = require('axios')
const BodyForm = require('form-data')
const mimetype = require('mime-types')
const path = require("path")
const chalk = require('chalk')

const getExtension = async (type) => {
  return await mimetype.extension(type)
}

const getRandom = (ext) => {
  return `${Math.floor(Math.random() * 10000)}${ext}`
}

function TelegraPh(Path) {
  return new Promise(async (resolve, reject) => {
    if (!fs.existsSync(Path)) return reject(new Error("File not Found"))
    try {
      const form = new BodyForm();
      form.append("file", fs.createReadStream(Path))
      const data = await axios({
        url: "https://telegra.ph/upload",
        method: "POST",
        headers: {
          ...form.getHeaders()
        },
        data: form
      })
      return resolve("https://telegra.ph" + data.data[0].src)
    } catch (err) {
      return reject(new Error(String(err)))
    }
  })
}

const fetchJson = async (url, options) => {
  try {
    options ? options : {}
    const res = await axios({
      method: 'GET',
      url: url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
      },
      ...options
    })
    return res.data
  } catch (err) {
    return err
  }
}


const generateAuthToken = () => {
  return crypto.randomBytes(30).toString('hex');
}

function randomText(len) {
  const result = [];
  for (let i = 0; i < len; i++) result.push(pool[Math.floor(Math.random() * pool.length)]);
  return result.join('');
}

function randomNumber(len) {
  const result = [];
  for (let i = 0; i < len; i++) result.push(pool2[Math.floor(Math.random() * pool2.length)]);
  return result.join('');
}



function readFileTxt(file) {
  return new Promise((resolve, reject) => {
    const data = fs.readFileSync(file, 'utf8');
    const array = data.toString().split('\n');
    const random = array[Math.floor(Math.random() * array.length)];
    resolve(random.replace('\r', ''));
  })
}

function readFileJson(file) {
  return new Promise((resolve, reject) => {
    const jsonData = JSON.parse(fs.readFileSync(file));
    const index = Math.floor(Math.random() * jsonData.length);
    const random = jsonData[index];
    resolve(random);
  })
}

const getBuffer = async (url, options) => {
  try {
    options ? options : {}
    const res = await axios({
      method: "get",
      url,
      headers: {
        'DNT': 1,
        'Upgrade-Insecure-Request': 1
      },
      ...options,
      responseType: 'arraybuffer'
    })
    return res.data
  } catch (e) {
    console.log(`Error : ${e}`)
  }
}


function abreviar(num) {
  if (num >= 1000000000000000000000000000000000) {
    return (num / 1000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + ' d';
  }
  if (num >= 1000000000000000000000000000000) {
    return (num / 1000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + ' n';
  }
  if (num >= 1000000000000000000000000000) {
    return (num / 1000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + ' o';
  }
  if (num >= 1000000000000000000000000) {
    return (num / 1000000000000000000000000).toFixed(1).replace(/\.0$/, '') + ' sep';
  }

  if (num >= 1000000000000000000000) {
    return (num / 1000000000000000000000).toFixed(1).replace(/\.0$/, '') + ' sex';
  }
  if (num >= 1000000000000000000) {
    return (num / 1000000000000000000).toFixed(1).replace(/\.0$/, '') + ' qui';
  }
  if (num >= 1000000000000000) {
    return (num / 1000000000000000).toFixed(1).replace(/\.0$/, '') + ' qua';
  }
  if (num >= 1000000000000) {
    return (num / 1000000000000).toFixed(1).replace(/\.0$/, '') + ' tri';
  }

  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + ' bi';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + ' mi';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + ' mil';
  }
  return num;
}



const color = (text, color) => {
    return !color ? chalk.green(text) : chalk.keyword(color)(text)
}

const bgcolor = (text, bgcolor) => {
  return !bgcolor ? chalk.green(text) : chalk.bgKeyword(bgcolor)(text)
}

module.exports = {
  readFileTxt,
  readFileJson,
  generateAuthToken,
  randomText,
  getBuffer,
  TelegraPh,
  getRandom,
  abreviar,
  color,
  bgcolor,
  getExtension,
  fetchJson,
  randomNumber
};