const proxy = require('http-proxy-middleware');

module.exports = (app) => {
  app.use(proxy('/video', { target: 'http://localhost:3001/', changeOrigin: true }));
};
