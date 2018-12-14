const Router = require('koa-router');
const User =require('../dbs/models/users')
const Passport = require('./utils/passport')

let router = new Router({
    prefix:'/users'
})

//注册接口
router.post('/signup',async ctx=>{
    const {username,password} = ctx.request.body;

    //验证用户名
    let user = User.find({username});

    if(user.length){
        ctx.body={
            code:-1,
            msg:'已被注册'
        }
        return
    }

    //验证通过后进行写库操作
    let nuser = await User.create({
        username,
        password
    })
    //写库成功
    if(nuser){
        // 进行登录操作
        ctx.body = {
            code:0,
            msg:'注册成功',
            user:''
        }
    }else{
        ctx.body = {
            code:-1,
            msg:'注册失败'
        }
    }
})

//登录接口
router.post('/signin',async (ctx,next)=>{
    return Passport.authenticate('local',function(err,user,info,status){
        if(err){
            ctx.body = {
                code:-1,
                msg:err
            }
        }else{
            if(user){
                ctx.body = {
                    code:0,
                    msg:'登录成功',
                    user
                }
                return ctx.login(user) //登录动作
            }else{
                ctx.body = {
                    code:1,
                    msg:info
                }
            }
        }
    })(ctx,next)
})

//用户退出接口
router.get('/exit',async (ctx,next)=>{
    await ctx.logout()  //退出动作

    //是否注销
    if(!ctx.isAuthenticated()){ 
        ctx.body = {
            code:0
        }
    }else{
        ctx.body = {
            code:-1
        }
    }
})

//获取用户信息
router.get('/getUser',async (ctx,next)=>{
    //是否登录状态
    if(ctx.isAuthenticated()){
        let username = ctx.session.password.username;
        ctx.body = {
            user:username
        }
    }else{
        ctx.body = {
            user:''
        }
    }
})

module.exports = router