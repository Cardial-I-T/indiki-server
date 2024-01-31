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

client.initialize();
});

};

async function indicar(req, res) {
  const usuario_id = req.body.usuario_id;
  const telefone = req.body.telefone;
  const name = req.body.nome;

  const clientId = usuario_id;

   // Conecte-se ao MongoDB e carregue os dados da sessão
   await mongoose.connect(process.env.MONGODB_URI);
   const store = new MongoStore({ mongoose: mongoose });
   const sessionData = await store.extract({ session: clientId });

   if (sessionData) {
       const client = new Client({
           session: sessionData
       });

       client.on('ready', async () => {
           console.log('Client is ready!');
           const phoneNumber = "+55"+telefone+"@c.us";
           const text = `Olá, tudo bem ${name}? Você foi indicado a experimentar o nosso aplicativo. Participe, indique amigos e ganhe recompensas.`;
           await client.sendMessage(phoneNumber, text);
       });

       client.initialize();
   } else {
       console.log("Sessão não encontrada!");
   }
};






  return {
    criarSessoesWhatsApp:  criarSessoesWhatsApp, 
    indicar: indicar
    
  };
}


module.exports = AplicacaoController;