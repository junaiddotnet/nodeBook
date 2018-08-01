const express  = require('express');
const path  = require('path');
const bodyparser  = require('body-parser');

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

app.get('/',function(req,res){
    res.render('index');
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
        entries.push({
            name:req.body.name,
            comments :req.body.comments,
            pubdate:new Date()
        });
        
      res.redirect('/');
    }
});


app.use(function(req,res){
    // unkonw URl 

    res.status(404).send("404 Erro");

});

app.listen(3000,function(){
    console.log('Server is Running on port 3000');
});

