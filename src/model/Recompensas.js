const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = require('../utils/db');

const Recompensas = sequelize.define('recompensas', {
  recom_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  
  nome: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'O campo "nome" não pode estar vazio.',
      },
      notNull: {
        msg: 'O campo "nome" é obrigatório.',
      },
      isSafeCharacters(value) {
        // Verifica se o valor contém apenas letras, números, espaços e acentos gráficos
        const regex = /^[a-zA-Z0-9\sáÁàÀâÂãÃéÉèÈêÊíÍìÌîÎóÓòÒôÔõÕúÚùÙûÛüÜñÑçÇ]+$/;
        if (!regex.test(value)) {
          throw new Error('O campo "nome" contém caracteres inválidos.');
        }
      },
    },
  },
  pontos: {
    type: Sequelize.INTEGER,
  },
  estoque: {
    type: Sequelize.INTEGER,

  },
  
  data_cadastro: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  data_update: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  }
}, {
  schema: 'public',
  tableName: 'recompensas',
  timestamps: false // Não usar colunas "createdAt" e "updatedAt"
});

Recompensas.findByFields = async function (fields) {
  return Recompensas.findOne({ where: fields });
};


function listarRecompensas() {
  return Recompensas.findAll();
  }

async function criarRecompensas(nome, pontos, estoque) {
// Verificar se já existe um usuário com o mesmo nome
const existingUser = await Recompensas.findOne({ where: { nome } });
if (existingUser) {
  throw new Error('Nome do produto já existe');
}

return Recompensas.create({
  nome: nome,
  pontos: pontos,
  estoque: estoque
  
});
}; 

async function updateRecompensas(recom_id, nome, pontos, estoque) {
    try {
      // Verificar se já existe uma recompensa com o mesmo nome
      const existingRecompensa = await Recompensas.findOne({
        where: {
          nome,
          recom_id: { [Sequelize.Op.ne]: recom_id }
        }
      });
  
      if (existingRecompensa) {
        throw new Error('Nome da recompensa já existe');
      }
  
      // Atualizar a recompensa
      const result = await Recompensas.update(
        {
          nome: nome,
          pontos: pontos,
          estoque: estoque
        },
        {
          where: {
            recom_id: recom_id
          }
        }
      );
  
      // Verificar se algum registro foi atualizado
      if (result[0] === 0) {
        throw new Error(`Recompensa com ID ${recom_id} não encontrada`);
      }
  
      return result;
    } catch (error) {
      throw error;
    }
  }

function excluirRecompensas(recom_id) {
  return Recompensas.destroy({
    where: {
      recom_id: recom_id
    }
  });
}

const modelRecompensas = {
  Recompensas,
  listarRecompensas,
  criarRecompensas,
  updateRecompensas,
  excluirRecompensas
};

module.exports = modelRecompensas;
