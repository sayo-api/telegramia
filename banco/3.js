require('../config');
const { usuario } = require('./2');
const toMs = require('ms');

async function gerarUsuario(nome_usuario, numero, cpfgerado) {
  let obj = { nome_usuario, cpf: cpfgerado, premium: null, numero, limit: limitfree, cash: 0, nivel: 1, exp: 0, madeira: 0, pedra: 0, ferro: 0, lixo: 0, totalreq: 0, status: null, bronze: 0, prata: 0, ouro: 0, diamante: 0 };
  usuario.create(obj);
}
module.exports.gerarUsuario = gerarUsuario

async function veriNumero(sender) {
  let users = await usuario.findOne({ numero: sender });
  if (users !== null) {
    return true;
  } else {
    return false;
  }
}
module.exports.veriNumero = veriNumero;

async function veriCpf(sender) {
  let users = await usuario.findOne({ cpf: sender });
  if (users !== null) {
    return true;
  } else {
    return false;
  }
}
module.exports.veriCpf = veriCpf;

async function verificaNome(nome_usuario) {
  let users = await usuario.findOne({ nome_usuario: nome_usuario });
  if (users !== null) {
    return users.nome_usuario;
  } else {
    return false;
  }
}
module.exports.verificaNome = verificaNome;

async function verificaAll(numero) {
  let users = await usuario.findOne({ numero: numero });
  if (users !== null) {
    return users;
  } else {
    return false;
  }
}
module.exports.verificaAll = verificaAll;

async function verificaAllcpf(numero) {
  let users = await usuario.findOne({ cpf: numero });
  if (users !== null) {
    return users;
  } else {
    return false;
  }
}
module.exports.verificaAllcpf = verificaAllcpf;


async function semlimit(nmr) {
  let key = await usuario.findOne({ numero: nmr });
  if (key.limit <= 0) {
    return true;
  } else {
    return false;
  }
}
module.exports.semlimit = semlimit

async function darlimit(numero, quantia) {
  let key = await usuario.findOne({ numero: numero });
  let valor = key.limit + quantia;
  usuario.updateOne({ numero: numero }, { limit: valor }, function(err, res) {
    //return quantia + ' de limite adicionado!'
    if (err) throw err;
  })
}
module.exports.darlimit = darlimit

async function expadd(numero, quantia) {
  let key = await usuario.findOne({ numero: numero });
  let valor = key.exp + quantia;
  usuario.updateOne({ numero: numero }, { exp: valor }, function(err, res) {
    if (err) throw err;
  })
}
module.exports.expadd = expadd

async function addcash(numero, quantia) {
  let key = await usuario.findOne({ numero: numero });
  let valor = key.cash + quantia;
  usuario.updateOne({ numero: numero }, { cash: valor }, function(err, res) {
    if (err) throw err;
  })
}
module.exports.addcash = addcash

async function addcashpix(cpf, quantia) {
  let key = await usuario.findOne({ cpf: cpf });
  let valor = key.cash + quantia;
  usuario.updateOne({ cpf: cpf }, { cash: valor }, function(err, res) {
    if (err) throw err;
  })
}
module.exports.addcashpix = addcashpix

async function delcash(numero, quantia) {
  let key = await usuario.findOne({ numero: numero });
  let valor = key.cash - quantia;
  usuario.updateOne({ numero: numero }, { cash: valor }, function(err, res) {
    if (err) throw err;
  })
}
module.exports.delcash = delcash

async function delcashpix(numero, quantia) {
  let key = await usuario.findOne({ cpf: numero });
  let valor = key.cash - quantia;
  usuario.updateOne({ cpf: numero }, { cash: valor }, function(err, res) {
    if (err) throw err;
  })
}
module.exports.delcashpix = delcashpix

async function niveladd(nmr, quantia) {
  let key = await usuario.findOne({ numero: nmr });
  let valor = key.nivel + quantia;
  usuario.updateOne({ numero: nmr }, { nivel: valor }, function(err, res) {
    if (err) throw err;
  })
}
module.exports.niveladd = niveladd

async function limitAdd(numero) {
  let key = await usuario.findOne({ numero: numero });
  let min = key.limit - 1;
  let plus = key.totalreq + 1;
  usuario.updateOne({ numero: numero }, { limit: min, totalreq: plus }, function(err, res) {
    if (err) throw err;
  })
}
module.exports.limitAdd = limitAdd

async function equilibrio(numero) {
  try {
    const freexp = Math.floor(Math.random() * 1) + 2
    const freedin = Math.floor(Math.random() * 1) + 1
    //await expadd(numero, freexp)
    await addcash(numero, freedin)
    await limitAdd(numero)
  } catch (err) {
    console.error(err)
  }
}
module.exports.equilibrio = equilibrio;


/*******ABA PREMIUM***********/

async function adicionar_premium(cpf, expired) {
  usuario.updateOne({ cpf: cpf }, { premium: Date.now() + toMs(expired), limit: limitpago }, function(err, res) {
    if (err) throw err;
  })
}
module.exports.adicionar_premium = adicionar_premium

async function tempo_expirado() {
  let users = await usuario.find({});
  users.forEach(async (data) => {
    let { premium, numero } = data
    if (!premium || premium === null) return
    if (Date.now() >= premium) {
      usuario.updateOne({ numero: numero }, { premium: null, limit: limitfree }, function(err, res) {
        if (err) throw err;
        console.log(`O premium de ${numero} acabou`)
      })
    }
  })
}
module.exports.tempo_expirado = tempo_expirado

async function verificar_dias_expirados(nmr) {
  let users = await usuario.findOne({ numero: nmr });
  if (users !== null) {
    return users.premium
  } else {
    return false
  }
}
module.exports.verificar_dias_expirados = verificar_dias_expirados


async function deletar_premium(cpf) {
  usuario.updateOne({ cpf: cpf }, { premium: null, limit: limitfree }, function(err, res) {
    if (err) throw err;
  })
}
module.exports.deletar_premium = deletar_premium

async function checkPremium(nmr) {
  let users = await usuario.findOne({ cpf: nmr });
  if (users.premium === null) {
    return false;
  } else {
    return true;
  };
};
module.exports.checkPremium = checkPremium;