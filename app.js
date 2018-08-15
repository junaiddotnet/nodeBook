const express  = require('express');
const path  = require('path');
const bodyparser  = require('body-parser');
const redis   = require('redis')


// set up the redis

const client = redis.createClient();
client.on('connect',function(){
    console.log('redis is Connected ....');
});

var entries=[];

// set the app object
const app  = express();
//set the view engine
app.set('views',path.resolve(__dirname,'views'));
app.set ('view engine','ejs');
//
app.locals.entries = entries;
// set the routes 

// set body parser middle wear 
app.use(bodyparser.urlencoded({extended:false}));

app.get('/delete',function(req,res){
    if (req.query.id!=undefined)
    {

        client.del(req.query.id,function(err,response){
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
  console.log('/ get called');
    client.keys('*',function(err,replies){
    
    if (err)
    {
        console.log('Error while reading keys ...'+err);
    }
    else
    {
        console.log('Length of array is '+entries.length);
        entries.length=0;
        console.log('after setting length to 0 '+entries.length);
        replies.forEach(function (reply, index) {
           // console.log("Reply " + index + ": " + reply.toString());
            
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
            }
        });

        }); // end of else statment 
        app.locals.entries=entries;
    }
  

  });
   
    res.render('index');
});
app.get('/edit',function(req,res){

    client.hgetall(req.query.id,function(err,response){
        if (err)
        {
            console.log('error in edit fetch operation ...');
        }
        else
        {
            let entry  = response;
            res.render('editform',{dataValues:entry});
        }
    });
   // res.render('editform';
    console.log('Edit node is called ..'+req.query.id);
});
app.get('/entry',function(req,res){
    res.render('entryform');
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
      
        client.hmset(name,[
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


app.use(function(req,res){
    // unkonw URl 

    res.status(404).send("404 Erro");

});

app.listen(3000,function(){
    console.log('Server is Running on port 3000');
});

