var express = require('express');

var api = express.Router();

api.get('/',function(req,res){
    console.log("Route is called with local path");
});
api.get('/users',function(req,res){
    console.log("Routher is called");
});
module.exports=api;