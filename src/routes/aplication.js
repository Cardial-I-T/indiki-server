const express = require("express");

const AplicacaoController = require("../controllers/AplicacaoController");
const aplicacaoController = AplicacaoController();

const router = express.Router();
router.use(express.json()); // Middleware para interpretar o corpo da solicitação como JSON



//Rotas do API do Sistema Venom
router.post('/register-session', aplicacaoController.criarSessoesWhatsApp);
router.post('/indicar', aplicacaoController.indicar);
//router.put('/recompensas/:recom_id', aplicacaoController.atualizarRecompensas);
//router.delete('/recompensas/:recom_id', aplicacaoController.excluirRecom);



module.exports = router;