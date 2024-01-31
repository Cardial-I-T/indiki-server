const { Client, RemoteAuth } = require('whatsapp-web.js');
const Sessoes = require('../model/Aplicacao').Sessoes; 
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const modelAplicacao = require('../model/Aplicacao');
const axios = require('axios');
const QRCode = require('qrcode-generator');

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

 
  async function criarSessoesWhatsApp(req, res) {
    const usuario_id = req.body.usuario_id;
    const email = req.body.email;

    // Flag para controlar se o e-mail foi enviado
    let emailEnviado = false;

    const clientId = usuario_id;

   

// Load the session data
mongoose.connect(process.env.MONGODB_URI).then(() => {
  const store = new MongoStore({ mongoose: mongoose });
  const client = new Client({
      authStrategy: new RemoteAuth({
          clientId: clientId,
          store: store,
          backupSyncIntervalMs: 300000
      })
  });
  client.initialize();
});
 

     // Evento 'qr' é acionado quando o código QR é gerado
     client.on('qr', (qr) => {
      console.log('QR Code gerado:', qr);
      
      
      
       // Verifica se o e-mail já foi enviado
    if (!emailEnviado) {
      
     
      // Cria o QR code usando a biblioteca qrcode-generator
      const qrcode = QRCode(0, 'L');
        qrcode.addData(qr);
        qrcode.make();

        // Obtém o conteúdo do QR code em formato Base64
        const qrcodeBase64 = qrcode.createDataURL(5, 5);

            
            // Envia o QR Code por e-mail
            let mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: 'Bem vindo ao app Indiki',
                html: `<p>Olá tudo bem? Seja muito bem vindo. Para começar, escaneie o seguinte QR-CODE: </p> <img src="cid:qrCode@nodemailer.com" alt="QR Code" />`,
                attachments: [
                    {
                        filename: 'qrcode.png',
                        content: qrcodeBase64.split(';base64,').pop(),
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

                    // Atualiza a variável de controle para indicar que o e-mail foi enviado
                    emailEnviado = true;
                }
            });
        }
    });

    
   // Evento 'authenticated' é acionado quando a autenticação é bem-sucedida
client.on('authenticated', async () => {
  
    res.status(200).send({ message: 'Sessão criada com sucesso' });
});



};











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
    criarSessoesWhatsApp:  criarSessoesWhatsApp 
   
    
  };
}


module.exports = AplicacaoController;