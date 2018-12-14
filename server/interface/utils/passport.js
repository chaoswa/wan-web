const passport = require('koa-passport');
const LocalStrategy =require('passport-local');
const UserModel = require('../../dbs/models/users')

// 提交策略,用户名密码验证策略
passport.use(new LocalStrategy(async function (username,password,done) {
    console.log('用户输入的:',username,password);

    //数据库查找用户
    let where = {username};
    let result = await UserModel.findOne(where);

    if(result!=null){

        if(result.password === password){
            return done(null,result)
        }else{
            return done(null,false,'密码错误')
        }

    }else{
        return done(null,false,'用户不存在')
    }
    
}))

//序列化，ctx.login()触发，登录验证成功以后把用户的数据存储到session中
passport.serializeUser(function(user,done){
    done(null,user);
})

//反序列化，在每次请求的时候将从 session 中读取用户对象
passport.deserializeUser(function (user,done) {
    done(null,user)
})

module.exports = passport;