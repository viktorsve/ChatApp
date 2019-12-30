const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const pino = require('koa-pino-logger')();
const serve = require('koa-static');
const send = require('koa-send');
const config = require('./config');
const { videoToken } = require('./tokens');

const app = new Koa();
const router = new Router();
app.use(bodyParser());
app.use(pino);

if (process.env.NODE_ENV === 'PROD') {
  app.use(serve('../build'));

  router.get('*', async (ctx, next) => {
    try {
      await send(ctx, '../build/index.html');
    } catch (err) {
      ctx.status = err.statusCode || err.status || 500;
      throw err;
    }

    return next();
  });
}

router.post('/video/token', async ctx => {
  const { identity } = ctx.request.body;
  const { room } = ctx.request.body;
  const token = videoToken(identity, room, config);
  ctx.body = {
    token: token.toJwt()
  };
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3001);
