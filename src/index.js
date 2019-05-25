const path = require('path');

const Koa = require('koa');
var Router = require('koa-router');

const logger = require('koa-logger');
const responseTime = require('koa-response-time');
const views = require('koa-views');

const bcrypt = require('bcrypt');
const nunjucks = require('nunjucks');

const viewPath = path.join(__dirname, './views');
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(viewPath));
env.addFilter('json', function(value, spaces) {
  if (value instanceof nunjucks.runtime.SafeString) {
    value = value.toString();
  }
  const jsonString = JSON.stringify(value, null, spaces).replace(/</g, '\\u003c');
  return nunjucks.runtime.markSafe(jsonString);
});

const app = new Koa();
app.use(logger());
app.use(responseTime());
app.use(
  views(viewPath, {
    extension: 'njk',
    map: { njk: 'nunjucks' },
    options: {
      nunjucksEnv: env
    }
  })
);

const router = new Router();
router.get('/', async (ctx) => {
  // we do this per-request because we are intentionally trying to create load
  const saltRounds = 13;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashed = await bcrypt.hash(JSON.stringify(ctx.request.headers), salt);

  ctx.state = {
    username: 'from-koa',
    request: ctx.request.headers,
    hashed: hashed
  };
  return ctx.render('index.njk');
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
