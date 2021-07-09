const path = require('path');
const http = require('http');
const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const pg = require('pg');
const events = require('events');
const socket = require("socket.io");
var em = new events.EventEmitter();
//const tools= require("./tools.js");
const ejs = require('ejs');
const url = require('url');
var jsdom = require('jsdom');
$ = require('jquery')(new jsdom.JSDOM().window);
//Create connection
const conn = mysql.createConnection({
host: 'localhost',
user: 'root',
password: '',
database: 'invoice'
});

const server = app.listen(3000, () => {
  console.log('Server is running at port 3000');
});

const io = socket(server);

io.on("connection", function (socket) {
    socket.join(1);
  console.log("Made socket connection");
  socket.on('chat message', (msg,fr_use) => {
    //console.log('message: ' + msg);
    to=0
    if(fr_use == 1){
        to=2;
        
    }
    else{
        to=1;
        //socket.join(1);
    }
    //console.log(to);
    var now = new Date();
    var jsonDate = now.toJSON();
    var then = new Date(jsonDate);
    let sql = "INSERT INTO chat SET ?";
    let data = { from_user: fr_use, to_user: to , msg: msg ,date: then};
    let query = conn.query(sql, data, (err, results1) => {
        if (err) throw err;
        let sql1 = "SELECT msg from chat WHERE from_user = "+to;
        let query1 = conn.query(sql1,(err, results)=>{
        if (err) throw err;
        console.log("calling show");
        socket.to(1).emit("show",msg);
        });
        //console.log("success");
        
    });
  });

});

conn.connect((err) => {
if (err) throw err;
console.log('Mysql Connected...');
});

//set views file
app.set('views', path.join(__dirname, 'views'));
//set view engine
app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//set public folder as static folder for static file
app.use('/assets', express.static(__dirname + '/public'));
var from=0;
var to = 0;
app.post('/h_save',(req, res) =>{
    //console.log("home_save");
    from = req.body.from_user;
    if(from == 1){
        to = 2;
    }
    else
    {
        to=1;
    }
    
    let sql1 = "SELECT * from chat WHERE from_user = "+to;
        let query1 = conn.query(sql1,(err, results)=>{
        if (err) throw err;
        res.render('product_view.hbs', {
            from1: from, to1 : to, results1 : results
            
        });
    });
    
});

app.get('/', (req, res) => {
    //console.log("get");
    let sql = "SELECT * FROM chat";
    let query = conn.query(sql, (err, results) => {
        if (err) throw err;
        res.render('home_view.hbs', {
            results: results
            
        });
    });
});
