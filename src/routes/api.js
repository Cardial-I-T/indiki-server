const express = require("express");
const ApiController = require("../controllers/ApiController");
const router = express.Router();
const apiController = ApiController();

router.use(express.json()); // Middleware para interpretar o corpo da solicitação como JSON


//Rotas do API de Usuarios do Sistema
router.get('/cadastro', apiController.visualizarUsuario);
router.get('/cadastro/localizar', apiController.localizar);
router.post('/cadastro', apiController.cadastrar);
router.put('/cadastro/:usuario_id', apiController.atualizar);
router.delete('/cadastro/:usuario_id', apiController.excluir);
router.post('/login', apiController.logar);
router.post('/consultar', apiController.consultar);
router.get('*', apiController.notFound);

module.exports = router;
