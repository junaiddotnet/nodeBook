const express  = require('express');
const path  = require('path');
const bodyparser  = require('body-parser');
const redis   = require('redis')
const fs   = require('fs');
const morgan = require('morgan');
var apiRoutes = require('./userRoutes');

// set up the redis

const client = redis.createClient();
client.on('connect',function(){
    console.log('redis is Connected ....');
});
console.log('docler');
var entries=[];

// set the app object
const app  = express();
//set the view engine
app.use(morgan("short"));
app.use("/api",apiRoutes);
app.use(function(req,res,next){
    console.log("entry");
    var filepath = path.join(__dirname,'public',req.url);
    fs.stat(filepath,function(err,fileinfo){
        console.log(err);
        console.log(fileinfo);
        
        if (err)
        {
            next();
        return;
        }
        if (fileinfo.isFile)
        {
            res.sendFile(filepath);
        }
        else
        {
            next();
        }
        
    });
});

app.set('views',path.resolve(__dirname,'views'));
app.set ('view engine','ejs');
//
app.locals.entries = entries;
// set the routes 

// set body parser middle wear 
app.use(bodyparser.urlencoded({extended:false}));


app.get(/^\/users\/(\d+)$/,function(req,res){
    console.log("params"+req.params[0]);
});
app.get('/delete',function(req,res){
    if (req.query.id!=undefined)
    {

        client.del("note:"+req.query.id,function(err,response){
            if (response==1)
            {
                console.log('deleted succesfully '+req.query.id);
            }
        });
        res.redirect('/');
    }
    console.log('delete command ......');
});
app.get('/',function(req,res){
    let length=1;
  console.log('/ get called');
    client.keys('note:*',function(err,replies){
        console.log("replies.."+replies.length);
   
    if (err)
    {
        console.log('Error while reading keys ...'+err);
    }
    else if(replies.length>0)
    {
        console.log('Length of array is '+entries.length);
        entries.length=0;
        
        console.log('after setting length to 0 '+entries.length);
        replies.forEach(function (reply, index) {
           // console.log("Reply " + index + ": " + reply.toString());
            length++;
           client.hgetall(reply.toString(),function(err,response){
            if (err)
            {
                console.log('Error reading data'+err);
            }
            else
            {
                console.log(reply.toString());
                
                entries.push({
                    name:response.name,
                    comments:response.comments,
                    pubdate:response.pubdate
                });
                console.log("entries length"+entries.length);
            }
        });
        
        }); // end of for loo statment 
        
        console.log("if end");
    }
   
   
    
  
  });
  
 
      console.log("length."+length);
      res.render('index',{entries:entries});
  
  console.log(33);

console.log("entries.."+entries.length); 
});
app.get('/edit',function(req,res){

    client.hgetall("note:"+req.query.id,function(err,response){
        if (err)
        {
            console.log('error in edit fetch operation ...');
        }
        else
        {
            let entry  = response;
            console.log(response);
            
            res.render('editform',{dataValues:entry});
        }
    });
   // res.render('editform';
    console.log('Edit node is called ..'+req.query.id);
});
app.get('/entry',function(req,res){
    res.render('entryform');
});
app.get('/delete',function(req,res){
    console.log("delete operation ");
    console.log(req.query.id);
});
app.post('/entry',function(req,res){

    if (!req.body.name || !req.body.comments)
    {
        res.status(400).send('must have title and body ...');
    }
    else
    {
        let name  = req.body.name;
        let comments  = req.body.comments;
      console.log(name);
      console.log(comments);
        client.hmset("note:"+name,[
            'name',name,
            'comments',comments,
            'pubdate',new Date().toDateString()
        ],function(err,reply){
            if (err)
            {
                console.log('Error while saving data to redis'+err);
                
            }
            else
            {
                console.log('Data Saved '+reply);
                res.redirect('/');

            }
        });
        
    }
});

app.use(function(err,req,res,next){
    res.status(500);
    res.send("Inernal Server Error");
}); 
app.use(function(req,res){
    // unkonw URl 

    res.status(404).send("404 Erro");

});

app.listen(3000,function(){
    console.log('Server is Running on port 3000 also set on jenkins');
    console.log('jenkins delply buit 5');
});

