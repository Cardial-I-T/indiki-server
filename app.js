const express = require('express');
const session = require('express-session');
const app = express();
const aplicationRouter = require('./src/routes/aplication');
const rewardsRouter = require('./src/routes/rewards');
const usersRouter = require('./src/routes/users');
const bodyParser = require('body-parser');

const axios = require('axios'); // Para fazer solicitações HTTP
require('dotenv').config();
const cors = require('cors');

const public_path = 'public';
const views_path = 'views';

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: '#%Tfgogogog!', // Substitua com seu segredo
  resave: false,
  saveUninitialized: false
}));

app.use(express.static(public_path));
app.set('view engine', 'ejs');
app.set('views', [
  views_path // Adicione o diretório views/aplication para procurar os arquivos EJS específicos da aplicação
]);

app.use(express.json());

app.use('/', aplicationRouter);
app.use('/users', usersRouter);
app.use('/rewards', rewardsRouter);
 // Adicione o prefixo '/api' para as rotas específicas da aplicação
//app.use((req, res, next) => {
    //res.status(404).render('naoexiste');
    app.use((req, res, next) => {
      console.log(`Recebido ${req.method} request para ${req.path}`);
      next();
    }); 


const sequelize = require('./src/utils/db'); // Importe a instância do Sequelize do arquivo de configuração

// Sincronize os modelos com o banco de dados
sequelize.sync()
  .then(() => {
    console.log('Modelos sincronizados com o banco de dados');
  })
  .catch((error) => {
    console.error('Erro ao sincronizar modelos com o banco de dados:', error);
  });
  
const PORT = 4000;

app.listen(PORT, function() {
  console.log('Servidor web iniciado na porta:', PORT);
});