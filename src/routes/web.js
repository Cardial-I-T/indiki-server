const express = require("express");

const RecompensasController = require("../controllers/RecompensasController");
const recompensasController = RecompensasController();

const router = express.Router();
router.use(express.json()); // Middleware para interpretar o corpo da solicitação como JSON



//Rotas do API do Sistema de Recompensas
router.get('/recompensas', recompensasController.visualizarRecompensas);
router.get('/recompensas/localizar', recompensasController.localizarRecompensas);
router.post('/cadastro/recompensas', recompensasController.cadastrarRecompensas);
router.put('/recompensas/:recom_id', recompensasController.atualizarRecompensas);
router.delete('/recompensas/:recom_id', recompensasController.excluirRecom);



module.exports = router;
