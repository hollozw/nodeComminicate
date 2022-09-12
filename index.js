let express=require('express');
let app=express();
let server=require('http').Server(app);
let io=require('socket.io')(server);
let form=require('formidable');

let cookie=require('cookie-parser');
app.use(cookie());

// 获取mysql模块开始
let mysql=require('mysql');
const { render } = require('ejs');
let connection=mysql.createConnection({
    host:'127.0.0.1',
    user:'root',
    password:'root',
    database:'project1',
})
connection.connect();
// 获取mysql模块结束
app.use(express.static('node_modules'));
app.set('view engine','ejs');
app.set('views','./views');

app.get('/',(req,res)=>{
    res.render('loading',{data:'请登入，也可以选择游客登入'});
    res.end();
})


app.get('/index',(req,res)=>{
    res.render('index',{data:req.cookies.data});
    res.end();
})

app.get('/index2',(req,res)=>{
    res.render('index',{data:'youke'});
    res.end();
})


//登入时创建cookie
app.post('/loading',(req,res)=>{
    let form1=new form.IncomingForm();
    form1.parse(req,(error,results)=>{
        if(!error){
            let {username,password}=results;
            let arr=[username];
            let str='select * from usepass where username=?';
            let sql=mysql.format(str,arr);
            connection.query(sql,(err,flids)=>{
                if(flids.length){
                    if(password==flids[0].password){
                        res.cookie('data',username);
                        res.cookie('id',flids[0].id);
                        res.redirect('/index');
                        res.end();
                        
                    }else{
                        console.log('密码错误');
                        res.render('loading',{data:'信息错误'});
                        res.end();
                    }
                }else{
                    console.log('账号错误');
                    res.render('loading',{data:'信息错误'});
                    res.end();
                }
            })

        }
    })
})


//退出时清除cookie
app.get('/outing',(req,res)=>{
    res.redirect('/');
    res.end()
})


server.listen(8090);


io.on('connection',function(socket){
    socket.on('meeting',function(res){
        socket.broadcast.emit('meeting',res);
    })
})