
const Koa = require('koa')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')

//post请求必须的
const bodyParser =require('koa-bodyparser');

const session = require('koa-session2');
const passport = require('./interface/utils/passport');
const json = require('koa-json'); //美化输出的json格式


//引入mongoose
const mongoose = require('mongoose')
const db = require('./dbs/config').mongoURI;

//连接mongodb数据库
mongoose.connect(db,{useNewUrlParser:true,useCreateIndex: true}).then(()=>{
  console.log('MongoDB Connected')
  }).catch((err)=>{
  console.log(err)
})

//引入koa-router接口
const users=require('./interface/users');

const app = new Koa()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

// 启用认证路由
app.proxy=true;
//使用bodyParser中间件
app.use(bodyParser({
  extendTypes:['json','form','text']
}))
app.use(session({key: "SESSIONID"}));
app.use(json());
app.use(passport.initialize());
app.use(passport.session());

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(app.env === 'production')

async function start() {
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config)

  // Build in development
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  //使用路由接口
  app.use(users.routes()).use(users.allowedMethods());
  

  app.use(ctx => {
    ctx.status = 200 // koa defaults to 404 when it sees that status is unset

    return new Promise((resolve, reject) => {
      ctx.res.on('close', resolve)
      ctx.res.on('finish', resolve)
      nuxt.render(ctx.req, ctx.res, promise => {
        // nuxt.render passes a rejected promise into callback on error.
        promise.then(resolve).catch(reject)
      })
    })
  })

  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}

start()
