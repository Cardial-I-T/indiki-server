const express = require("express");

const AplicacaoController = require("../controllers/AplicacaoController");
const aplicacaoController = AplicacaoController();

const router = express.Router();
router.use(express.json()); // Middleware para interpretar o corpo da solicitação como JSON



//Rotas do API do Sistema de Recompensas
router.post('/register-session', aplicacaoController.criarSessoesVenom);
router.get('/recompensas/localizar', aplicacaoController.localizarRecompensas);
router.post('/cadastro/recompensas', aplicacaoController.cadastrarRecompensas);
router.put('/recompensas/:recom_id', aplicacaoController.atualizarRecompensas);
router.delete('/recompensas/:recom_id', aplicacaoController.excluirRecom);



module.exports = router;