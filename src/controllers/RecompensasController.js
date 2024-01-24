const Recompensas = require('../model/Recompensas').Recompensas;
const modelRecompensas = require('../model/Recompensas');
const axios = require('axios');

function recompensasController() {


    async function visualizarRecompensas(req, res) {
        try {
          const recompensas = await modelRecompensas.Recompensas.findAll();
      
          if (recompensas.length === 0) {
            return res.status(404).json({ error: 'Nenhuma recompensa encontrada' });
          }
                      
          res.json(recompensas);
        } catch (error) {
          console.error('Erro ao obter recompensas:', error);
          res.status(500).json({ error: 'Erro ao obter recompensas' });
        }
      }

  async function localizarRecompensas (req, res) {
    const { recom_id, nome, pontos, estoque } = req.query;
    const conditions = {};
  
    if (recom_id) {
      conditions.recom_id = recom_id;
    }
    if (nome) {
      conditions.nome = nome;
    }
    if (pontos) {
      conditions.pontos = pontos;
    }
    if (estoque) {
        conditions.estoque = estoque;
      }
  
    try {
      const nome = await modelRecompensas.Recompensas.findByFields(conditions);
  
      if (nome) {
        res.json(nome);
      } else {
        res.status(404).json({ errorMessage: 'Recompensa não encontrada' });
      }
    } catch (error) {
      console.error('Erro ao buscar recompensas:', error);
      res.status(500).json({ errorMessage: 'Erro ao buscar recompensas',  error: error.message  });
    }
  };

  async function cadastrarRecompensas(req, res) {
    const { nome, pontos, estoque } = req.body;
    console.log(req.body);
    try {
      await modelRecompensas.criarRecompensas(nome, pontos, estoque);
      res.json({ message: `Recompensa ${nome} cadastrado com sucesso` });
    } catch (error) {
      console.error('Erro ao cadastrar recompensa:', error);
      res.status(500).json({ errorMessage: 'Erro ao cadastrar recompensa', error: error.message  });
    }
  };

  async function atualizarRecompensas (req, res) {
    const { recom_id } = req.params;
    const { nome, pontos, estoque } = req.body;
  
    try {
      await modelRecompensas.updateRecompensas(recom_id, nome, pontos, estoque);
      res.json({ message: `Recompensa ${recom_id} atualizada com sucesso` });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ errorMessage: 'Erro ao atualizar usuário', error: error.message  });
    }
  }

  async function excluirRecom(req, res) {
    const { recom_id } = req.params;
  
    try {
      const numRegistrosExcluidos = await modelRecompensas.excluirRecompensas(recom_id);
      if (numRegistrosExcluidos === 0) {
        res.status(404).json({ message: `Recompensa ${recom_id} não encontrada` });
      } else {
        res.json({ message: `Recompensa ${recom_id} excluída com sucesso` });
      }
    } catch (error) {
      console.error('Erro ao excluir recompensa:', error);
      res.status(500).json({ errorMessage: 'Erro ao excluir recompensa', error });
    }
  };
  
  function notFound(request, response) {
    return response.json({ errorMessage: 'Rota não encontrada' });
  };
  
  return {
    
    visualizarRecompensas: visualizarRecompensas,
    localizarRecompensas: localizarRecompensas,
    cadastrarRecompensas: cadastrarRecompensas,
    atualizarRecompensas: atualizarRecompensas,
    excluirRecom: excluirRecom,
    notFound: notFound
  };
}

module.exports = recompensasController;