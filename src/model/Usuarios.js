const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = require('../utils/db');

const Usuario = sequelize.define('usuarios', {
  usuario_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  admin:{
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    
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

  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'O campo "email" não pode estar vazio.',
      },
      isEmail: {
        msg: 'O campo "email" deve ser um endereço de e-mail válido.',
      },
      notNull: {
        msg: 'O campo "email" é obrigatório.',
      },
     
    },
  },
  senha: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'O campo "senha" não pode estar vazio.',
      },
      notNull: {
        msg: 'O campo "senha" é obrigatório.',
      },
      len: {
        args: [6, 16], // Define os limites mínimo e máximo
        msg: 'O campo "senha" deve ter entre 6 e 16 caracteres.',
      },
      isAlphanumeric: {
        msg: 'O campo "senha" deve ser Alfanumérico.',
      },
    },
  },
  data_aniversario: {
    type: Sequelize.STRING,
    allowNull: false,
    validate:{
        notEmpty: {
            msg: 'O campo "aniversário" não pode estar vazio.',
          },
          notNull: {
            msg: 'O campo "aniversário" é obrigatório.',
          },

    },
  },
 
  cpf:{
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate:{
        notEmpty: {
            msg: 'O campo "CPF" não pode estar vazio.',
          },
          notNull: {
            msg: 'O campo "CPF" é obrigatório.',
          },
          len: {
            args: [11, 11], // Define os limites mínimo e máximo
            msg: 'O campo "CPF" deve ter 11 caracteres.',
          },
          
    },
  },
  cnpj:{
    type: Sequelize.STRING,
     validate:{
            len: {
            args: [14, 14], // Define os limites mínimo e máximo
            msg: 'O campo "CNPJ" deve ter 14 caracteres.',
          },
          
    },
  },
  empresa:{
    type: Sequelize.STRING,
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
  tableName: 'usuarios',
  timestamps: false // Não usar colunas "createdAt" e "updatedAt"
});

Usuario.findByFields = async function (fields) {
  return Usuario.findOne({ where: fields });
};


function visualizarUsuario() {
  return Usuario.findAll();
  }

async function criarUsuario(nome, email, senha, data_aniversario, cpf) {
// Verificar se já existe um usuário com o mesmo nome
const existingUser = await Usuario.findOne({ where: { nome } });
if (existingUser) {
  throw new Error('Nome de usuário já existe');
}

// Verificar se já existe um usuário com o mesmo email
const existingEmail = await Usuario.findOne({ where: { email } });
if (existingEmail) {
  throw new Error('Email já está em uso');
}

return Usuario.create({
  nome: nome,
  email: email,
  senha: senha,
  data_aniversario: data_aniversario,
  cpf: cpf
  
});
}; 

async function atualizarUsuario(cpf, admin, nome, senha, email, data_aniversario, cnpj, empresa) {
  // Verificar se já existe um usuário com o mesmo nome
  const CPF = await Usuario.findOne({ where: { cpf: cpf } });
  if (!CPF) {
    return { message: 'Usuário não encontrado' };
  }

  const updatedUser = {
    admin: admin,
    nome: nome,
    senha: senha,
    email: email,
    data_aniversario: data_aniversario,
    cpf: cpf,
    cnpj: cnpj,
    empresa: empresa,
  };

  // Exclua o campo data_cadastro, para garantir que não seja atualizado
  delete updatedUser.data_cadastro;

  return Usuario.update(updatedUser, {
    where: {
      cpf: cpf
    }
  });
}



function excluirUsuario(usuario_id) {
  return Usuario.destroy({
    where: {
      usuario_id: usuario_id
    }
  });
}

const modelUsuario = {
  Usuario,
  visualizarUsuario,
  criarUsuario,
  atualizarUsuario,
  excluirUsuario
};

module.exports = modelUsuario;
