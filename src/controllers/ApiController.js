const Usuario = require('../model/Usuarios').Usuario;
const modelUsuario = require('../model/Usuarios');
const checkAuthUser = require('../utils/checkAuthUser');
const checkAuth = require('../utils/checkAuth');
const axios = require('axios');

function ApiController() {
function cadastro(req, res) {
    res.render('cadastro');
  }

async function visualizarUsuario(req, res) {
    try {
      const usuarios = await Usuario.findAll();
      
      if (usuarios.length === 0) {
        return res.status(404).json({ error: 'Nenhum usuário encontrado' });
      }
      
      res.json(usuarios);
    } catch (error) {
      console.error('Erro ao obter usuários:', error);
      res.status(500).json({ error: 'Erro ao obter usuários' });
    }
  }

  async function localizar (req, res) {
    const { usuario_id, usuario , nome, email, cpf } = req.query;
    const conditions = {};
  
    if (usuario_id) {
      conditions.usuario_id = usuario_id;
    }
    if (usuario) {
      conditions.usuario = usuario;
    }
    if (nome) {
      conditions.nome = nome;
    }
    if (email) {
      conditions.email = email;
    }
    if (cpf) {
      conditions.cpf = cpf;
    }
  
    try {
      const user = await modelUsuario.Usuario.findByFields(conditions);
  
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ errorMessage: 'Usuário não encontrado' });
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ errorMessage: 'Erro ao buscar usuário',  error: error.message  });
    }
  };

  async function cadastrar(req, res) {
    const { nome, email, senha, data_aniversario, cpf } = req.body;
    console.log(req.body);
    try {
      await modelUsuario.criarUsuario(nome, email, senha, data_aniversario, cpf);
      res.json({ message: `Usuário ${nome} cadastrado com sucesso` });
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      res.status(500).json({ errorMessage: 'Erro ao cadastrar usuário', error: error.message  });
    }
  };

  async function atualizar (req, res) {
    const { cpf } = req.params;
    const { admin, nome, senha, email, data_aniversario, cnpj, empresa } = req.body;
  
    try {
      await modelUsuario.atualizarUsuario(cpf, admin, nome, senha, email, data_aniversario, cnpj, empresa);
      res.json({ message: `Usuário ${nome} atualizado com sucesso` });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ errorMessage: 'Erro ao atualizar usuário', error: error.message  });
    }
  }

  async function excluir(req, res) {
    const { usuario_id } = req.params;
  
    try {
      const numRegistrosExcluidos = await modelUsuario.excluirUsuario(usuario_id);
      if (numRegistrosExcluidos === 0) {
        res.status(404).json({ message: `Usuário ${usuario_id} não encontrado` });
      } else {
        res.json({ message: `Usuário ${usuario_id} excluído com sucesso` });
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      res.status(500).json({ errorMessage: 'Erro ao excluir usuário', error });
    }
  };
  
  async function logar(req, res) {
    const { email, senha } = req.body;
  
    try {
      const foundUser = await modelUsuario.Usuario.findOne({
        where: { email, senha },
      });
  
      if (foundUser.admin === true) {
        // Usuário é administrador
        checkAuth(req, res);
      } else {
        // Usuário não é administrador, chame a função checkAuthUser
        checkAuthUser(req, res);
      }
    
    } catch (error) {
      console.error('Erro ao autenticar usuário:', error);
      res.status(500).json({ errorMessage: 'Erro ao autenticar usuário', error: error.message });
    }
  }
  
  

  function notFound(request, response) {
    return response.json({ errorMessage: 'Rota não encontrada' });
  };
  
  return {
    cadastro: cadastro,
    visualizarUsuario: visualizarUsuario,
    localizar: localizar,
    cadastrar: cadastrar,
    atualizar: atualizar,
    excluir: excluir,
    logar: logar,
    
    notFound: notFound
  };
}

module.exports = ApiController;
