const checkAuth = (req, res, next) => {
  if (req.session && req.session.usuario_id) {
    // Busque o usuário no banco de dados
    modelUsuario.Usuario.findOne({ where: { usuario_id: req.session.usuario_id } })
      .then(usuario => {
        if (usuario && usuario.admin) {
          // Usuário é administrador, continue com a próxima rota
          next();
        } else {
          // Usuário não é administrador, redirecione para a página de login
          res.redirect('/');
        }
      })
      .catch(error => {
        console.log(error);
        res.redirect('/');
      });
  } else {
    // Usuário não autenticado, redirecione para a página de login
    res.redirect('/');
  }
};

module.exports = {
  checkAuth
};