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
    const usuario_id = req.body.usuario_id;
    const email = req.body.email;
  
    try {
      venom.create(
        'sessionName',
        async (base64Qr, asciiQR) => {
          const base64Data = base64Qr.replace(/^data:image\/png;base64,/, '');
  
          fs.writeFile(path.join(__dirname, `../utils/QR/${usuario_id}.png`), base64Data, 'base64', (err) => {
            if (err) {
              console.log('Erro ao salvar a imagem do QR Code:', err);
            } else {
              console.log('Imagem do QR Code salva com sucesso');
  
              const emailDoUsuario = email;
  
              let mailOptions = {
                from: 'indiki@cardealit.com.br',
                to: emailDoUsuario,
                subject: 'Bem vindo ao app Indiki',
                html: `<p>Olá tudo bem? seja muito bem vindo. Para começar escaneie o seguinte QR-CODE: </p> <img src="cid:qrCode@nodemailer.com" alt="QR Code" />`,
                attachments: [
                  {
                    filename: 'qrcode.png',
                    path: path.join(__dirname, `../utils/QR/${usuario_id}.png`),
                    content: base64Data,
                    encoding: 'base64',
                    cid: 'qrCode@nodemailer.com',
                  },
                ],
              };
  
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
          headless: false,
        }
      )
      .then(async (client) => {
        try {
          const sessionToken = await client.getSessionTokenBrowser();
          await modelAplicacao.sessoesVenom(usuario_id, sessionToken);
          start(client);
          res.status(200).send({ message: 'Sessão criada com sucesso' });
        } catch (error) {
          console.log(error);
          res.status(500).send({ message: 'Erro ao armazenar a sessão no banco de dados' });
        }
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

  async function indicacoes(req, res) {
    try {
      // Recupere a sessão ativa do usuário
      const usuario_id = req.body.usuario_id;
      const sessaoAtiva = await Sessoes.findOne({ where: { usuario_id } });
  
      if (!sessaoAtiva) {
        return res.status(404).json({ error: 'Nenhuma sessão ativa encontrada para o usuário' });
      }
  
      const session_id = sessaoAtiva.session_id;
  
      // Inicialize o cliente Venom-bot com a sessão ativa
      const venomClient = await venom.create({
        session: session_id, // Utilize o session_id como nome da sessão
        sessionToken: sessaoAtiva.session, // Ajuste aqui para acessar diretamente a variável de sessão
        // Outras configurações
      });
  
      // Capturar o número do destinatário do corpo da requisição
      const { numeroDestinatario } = req.body;
  
      if (!numeroDestinatario) {
        return res.status(400).json({ error: 'Número do destinatário não fornecido no formulário' });
      }
  
      // Neste ponto, você pode usar venomClient para enviar mensagens
      const mensagem = 'Sua mensagem de texto aqui!';
  
      venomClient.sendText(`${numeroDestinatario}@c.us`, mensagem)
        .then((message) => {
          console.log('Mensagem enviada com sucesso:', message);
          res.status(200).json({ message: 'Mensagem enviada com sucesso' });
        })
        .catch((error) => {
          console.error('Erro ao enviar mensagem:', error);
          res.status(500).json({ error: 'Erro ao enviar mensagem' });
        });
    } catch (error) {
      console.error('Erro ao processar indicações:', error);
      res.status(500).json({ error: 'Erro ao processar indicações' });
    }
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
    criarSessoesVenom:  criarSessoesVenom, 
    indicacoes: indicacoes
    
  };
}

module.exports = AplicacaoController;