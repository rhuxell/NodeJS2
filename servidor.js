var express = require("express");
var nunjucks = require("nunjucks");

var modelos = require("./modelos/principal.js");

console.log("PRUEBA: " + modelos.PRUEBA);

var app = express();

nunjucks.configure(__dirname + "/vistas",{
    express:app
});

app.listen(8084);

app.get("/articulo", function(req, res){
    res.render("articulo.html");
});

app.get("/blog", function(req, res){
    res.render("blog.html");
});

app.get("/usuario", function(req, res){
    res.render("usuario.html");
});

app.get("/informes", function(req, res){
   res.send("Informes aquí.");
});
