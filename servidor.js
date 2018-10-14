var express = require("express");
var nunjucks = require("nunjucks");

var app = express();

nunjucks.configure(__dirname + "/vistas",{
    express:app
});

app.listen(8084);

app.get("/articulo", function(req, res){
    res.render("articulo.html");
});

app.get("/informes", function(req, res){
   res.send("Informes aquí.");
});
