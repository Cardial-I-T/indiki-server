const { checkAuthUser } = require('../utils/autenticaUsuarios');
const { checkAuth } = require('../utils/autenticacao');
const Sessoes = require('../model/Aplicacao').Sessoes; 
const modelAplicacao = require('../model/Aplicacao');
const axios = require('axios');
const venom = require('venom-bot');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const nodemailer = require('nodemailer');

// Configuração do Nodemailer
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
    port: 465,
    secure: true,
  auth: {
    user: process.env.EMAIL, // Usa a variável de ambiente EMAIL
    pass: process.env.PASSWORD // Usa a variável de ambiente PASSWORD
  }
});

function AplicacaoController() {

  async function criarSessoesVenom(req, res) {
    const usuario_id = checkAuth(req); // Obtenha o ID do usuário logado
    const email = checkAuth(req); // Obtenha o e-mail do usuário logado
    console.log(req.body);
    try {
      venom
        .create(
          'sessionName', // nome da sessão
          (base64Qr, asciiQR) => {
            // Aqui você pode exibir o QR Code de base64Qr em sua interface de usuário
            const base64Data = base64Qr.replace(/^data:image\/png;base64,/, "");
  
            fs.writeFile(path.join(__dirname, `../utils/QR/${sessao.session}.png`), base64Data, 'base64', (err) => {
              if (err) {
                console.log('Erro ao salvar a imagem do QR Code:', err);
              } else {
                console.log('Imagem do QR Code salva com sucesso');
  
                // Obtenha o e-mail do usuário logado
                const emailDoUsuario = email;
  
                // Crie a mensagem de e-mail
                let mailOptions = {
                  from: 'indiki@cardealit.com.br', // Use a variável de ambiente casoi queira um email padrão
                  to: emailDoUsuario, // Use o e-mail do usuário logado
                  subject: 'Bem vindo ao app Indiki',
                  text: 'Olá tudo bem? seja muito bem vindo. Para começar escaneie o seguinte QR-CODE:',
                  attachments: [
                    {
                      filename: 'qrcode.png',
                      path: path.join(__dirname, `../utils/QR/${sessao.session}.png`)
                    }
                  ]
                };
  
                // Envie a mensagem de e-mail
                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    console.log('Erro ao enviar e-mail:', error);
                  } else {
                    console.log('E-mail enviado com sucesso:', info.response);
                  }
                });
              }
            });
            },
            {
              headless: false, // Abre o navegador Chromium
              // Outras opções
            }
          
        )
        .then((client) => {
          // Armazena a sessão no banco de dados após a criação bem-sucedida
          modelAplicacao.sessoesVenom(usuario_id, client.getSessionTokenBrowser())
            .then(session => {
              start(client);
              res.status(200).send({ message: 'Sessão criada com sucesso' });
            })
            .catch(error => {
              console.log(error);
              res.status(500).send({ message: 'Erro ao armazenar a sessão no banco de dados' });
            });
        })
        .catch((erro) => {
          console.log(erro);
          res.status(500).send({ message: 'Erro ao criar sessão' });
        });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: 'Erro ao criar sessão' });
    }
  }
  
  

  function start(client) {
    client.onMessage((message) => {
      if (message.body === 'Olá' && message.isGroupMsg === false) {
        client
          .sendText(message.from, 'Bem vindo ao Indiki!')
          .then((result) => {
            console.log('Result: ', result); //return object success
          })
      }
    });
  }





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
      await modelRecompensas.excluirRecompensas(recom_id);
      res.json({ message: `Recompensa ${recom_id} excluído com sucesso` });
    } catch (error) {
      console.error('Erro ao excluir recompensa:', error);
      res.status(500).json({ errorMessage: 'Erro ao excluir recompensa', error });
    }
  };
  
  function notFound(request, response) {
    return response.json({ errorMessage: 'Rota não encontrada' });
  };
  
  return {
    criarSessoesVenom: criarSessoesVenom,
    visualizarRecompensas:[checkAuthUser, visualizarRecompensas],
    localizarRecompensas: localizarRecompensas,
    cadastrarRecompensas: cadastrarRecompensas,
    atualizarRecompensas: atualizarRecompensas,
    excluirRecom: excluirRecom,
    notFound: notFound
  };
}

module.exports = AplicacaoController;