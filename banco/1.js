require('../config');
const mongoose = require('mongoose');

function viverdb() {
  mongoose.connect(linkdb,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'erro na invasão 😪'))
  db.once('open', () => {
    console.log('invadi o banco de dados! 😈')
    return 'invadi o banco de dados! 😈'
  })
}

module.exports.viverdb = viverdb