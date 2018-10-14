var express = require("express");

var app = express();

app.listen(8084);

app.get("/inicio", function(req, res){
    res.send("Holis!");
});

app.get("/informes", function(req, res){
   res.send("Informes aquí.");
});
