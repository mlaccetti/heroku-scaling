const path = require('path');
const viewPath = path.join(__dirname, './views');

const Koa = require('koa');
var Router = require('koa-router');

const logger = require('koa-logger');
const responseTime = require('koa-response-time');
const views = require('koa-views');

const nunjucks = require('nunjucks');
const nunjucksEnvironment = new nunjucks.Environment(new nunjucks.FileSystemLoader(viewPath));

const app = new Koa();
app.use(logger());
app.use(responseTime());
app.use(
  views(viewPath, {
    extension: 'njk',
    map: { njk: 'nunjucks' },
    options: {
      nunjucksEnv: nunjucksEnvironment
    }
  })
);

const router = new Router();
router.get('/', (ctx) => {
  return ctx.render('index.njk');
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
