const mongoose = require('mongoose');

const usuario = mongoose.Schema({
  nome_usuario: { type: String },
  cpf: { type: String },
  premium: { type: String },
  numero: { type: String },
  limit: { type: Number },
  cash: { type: Number },
  nivel: { type: Number },
  exp: { type: Number },
  madeira: { type: Number },
  pedra: { type: Number },
  ferro: { type: Number },
  lixo: { type: Number },
  totalreq: { type: Number },
  status: { type: String },
  bronze: { type: Number },
  prata: { type: Number },
  ouro: { type: Number },
  diamante: { type: Number }
}, { versionKey: false });
module.exports.usuario = mongoose.model('usuario', usuario);

const bot_inf = mongoose.Schema({
  totalcmd: { type: Number },
  conexao: { type: String },
  ayu: { type: String }
}, { versionKey: false });
module.exports.bot_inf = mongoose.model('bot_inf', bot_inf);