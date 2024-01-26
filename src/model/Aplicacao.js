const { Sequelize, Model } = require('sequelize');
const sequelize = require('../utils/db');
const Usuarios = require('./Usuarios');

class Sessoes extends Model {}

Sessoes.init({
  session_id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  usuario_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  session: {
    type: Sequelize.JSON,
    allowNull: false,
  },
  data_cadastro: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  }
}, { 
  schema: 'public',
  tableName: 'sessoes',
  timestamps: false, // Não usar colunas "createdAt" e "updatedAt"
  sequelize, 
  modelName: 'Sessoes' 
});

// A relação entre Sessoes e Usuarios
Sessoes.belongsTo(Usuarios.Usuario, { foreignKey: 'usuario_id' });
Usuarios.Usuario.hasMany(Sessoes, { foreignKey: 'usuario_id' });

function sessoesVenom(usuario_id, token) {
  // Crie uma nova sessão com o usuario_id e o token
  return Sessao.create({
    usuario_id: usuario_id,
    token: token
  });
}



const modelAplicacao = {
  Sessoes,
  sessoesVenom
}; 

module.exports = modelAplicacao