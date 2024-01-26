const checkAuthUser = (req, res, next) => {
    if (req.session && req.session.usuario) {
      // Usuário autenticado, continue com a próxima rota
      next();
    } else {
      // Usuário não autenticado, redirecione para a página de login
      res.redirect('/');
    }
  };
  
  module.exports = {
    checkAuthUser
  };