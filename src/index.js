const path = require('path');

const Koa = require('koa');
var Router = require('koa-router');

const conditional = require('koa-conditional-get');
const etag = require('koa-etag');
const logger = require('koa-logger');
const responseTime = require('koa-response-time');
const serve = require('koa-static');
const views = require('koa-views');

const nunjucks = require('nunjucks');
const sleep = require('sleep');

const staticPath = path.join(__dirname, '../static');
const viewPath = path.join(__dirname, '../views');

const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(viewPath));
env.addFilter('json', function(value, spaces) {
  if (value instanceof nunjucks.runtime.SafeString) {
    value = value.toString();
  }
  const jsonString = JSON.stringify(value, null, spaces).replace(/</g, '\\u003c');
  return nunjucks.runtime.markSafe(jsonString);
});

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

const app = new Koa();
app.use(conditional());
app.use(etag());
app.use(logger());
app.use(responseTime());
app.use(
  serve(staticPath, {
    defer: true
  })
);
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
  sleep.msleep(randomInt(100, 500));

  ctx.state = {
    username: 'from-koa',
    request: ctx.request.headers
  };
  return ctx.render('index.njk');
});

app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 3000;
app.listen(port);
