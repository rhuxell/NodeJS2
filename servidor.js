var express = require("express");
var nunjucks = require("nunjucks");
var bodyParser = require("body-parser");
var modelos = require("./modelos/principal.js");
console.log("PRUEBA: " + modelos.PRUEBA);
var app = express();
app.use(bodyParser());
nunjucks.configure(__dirname + "/vistas",{
    express:app
});
app.listen(8084);
app.get("/articulo/:articuloId([0-9]+)", function(req, res){
    var articuloId = req.params.articuloId;
    var actualizado = req.query.actualizado;
    modelos.Articulo.find({
            where:{id:articuloId},
            include:[{
                model: modelos.Comentario,
                as:"comentarios"
            },{
                model: modelos.Categoria,
                as:"categorias"
            },{
                model: modelos.Usuario,
                as:"usuario"
            }]
        }).then(function(articulo){
        //console.log("Se encontró articulo:" + articulo.titulo);
        res.render("articulo.html",{
            articuloPrincipal:articulo,
            actualizado:actualizado
        });
    });
});
app.get("/blog", function(req, res){
    var vOffset = req.query.offset;
    modelos.Articulo.findAll({
        //IMPLEMENTAR PAGINADOR. AVERIGUAR CÓMO SE HACE.
        limit:3,
        offset:vOffset
    }).then(function(articulos){
        modelos.Categoria.findAll().then(function(categorias){
            res.render("blog.html",{
                articulosPrincipal:articulos,
                categoriasPrincipal:categorias
            });  
        });   
    });
});
app.get("/usuario", function(req, res){
    modelos.Usuario.find({
        where:{id:1},
        include:[{
            model:modelos.Articulo,
            as: "articulos"
        },{
            model:modelos.DatosUsuario,
            as:"datosUsuario"
        }]
    }).then(function(usuario){
        res.render("usuario.html",{
            usuarioPrincipal:usuario
        });
    });
});
app.get("/informes", function(req, res){
   res.send("Informes aquí.");
});
app.get("/articulo/:articuloId([0-9]+)/editar", function(req, res){
    var articuloId = req.params.articuloId;
    modelos.Articulo.findById(articuloId).then(function(articulo){
        res.render("articulo_editar.html",{
            articuloPrincipal:articulo
        });
    });
});
app.post("/guardar-articulo", function(req, res){
    var titulo = req.body.titulo;
    var contenido = req.body.contenido;
    var usuario_id = req.body.usuario_id;
    var id = req.body.id;
    modelos.Articulo.findById(id).then(function(articulo){
        articulo.titulo = titulo;
        articulo.contenido = contenido;
        articulo.save().then(function(){
            //res.send("Se realizó la modificación correctamente.");
            var url = "/articulo/" + id + "?actualizado=true";
            res.redirect(url);
        });
    });
});

app.get("/articulo/crear", function(req, res){
    res.render("articulo_crear.html");
});

app.post("/crear-articulo", function(req,res){
    var titulo = req.body.titulo;
    var contenido = req.body.contenido;
    
        modelos.Articulo.create({
            titulo : titulo,
            usuario_id:1,
            contenido : contenido,
            fecha_creacion : new Date()
        }).then(function(articuloNuevo){
            var url = "/articulo/" + articuloNuevo.null;
            res.redirect(url);
        });
});

app.get("/articulo/:articuloId([0-9]+)/eliminar", function(req,res){
    
    var articuloId = req.params.articuloId;
    
    modelos.Articulo.find({
        where:{id:articuloId},
        include:[
            {model:modelos.Comentario,
            as:"comentarios"},
            {
            model.modelos.Categoria;
                as:"categorias"
            }
        ]
    }).then(function(articulo){
        console.log(articulo.comentarios);
        if (articulo.comentarios == null){
            console.log("Comentario está vacío");
            articulo.destroy().then(function(){
            res.send("El artículo se ha eliminado correctamente");
            });
        }
        //TENGO QUE IMPLEMENTAR EL BORRADO DE CATEGORÍAS
        else{
            console.log("Comentarios tiene algo");

            articulo.comentarios.forEach(function(comentario){
                console.log(comentario);
                comentario.destroy().then(function(){
                    console.log("Se eliminó el comentario");
                });
            });
            articulo.destroy().then(function(){
            res.send("El artículo se ha eliminado correctamente");
        });
        }
    })
})