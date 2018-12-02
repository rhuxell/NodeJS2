var express = require("express");
var nunjucks = require("nunjucks");
var bodyParser = require("body-parser");
var expressSession = require("express-session");

var sesion = expressSession({
    secret:"sdhjksdh",
    key:"sesionServidor",
    resave: true,
    saveUninitialized:true,
    cookie:{
        //milisegundos
        //milisegundos*segundos*minutos*horas*dias
        maxAge:1000*60*60*24*30
    }
});

var modelos = require("./modelos/principal.js");
console.log("PRUEBA: " + modelos.PRUEBA);

var app = express();

app.use(sesion);

app.use(bodyParser());

nunjucks.configure(__dirname + "/vistas",{
    express:app
});

app.listen(8084);


function validarSesion(req,res,next){
    console.log("Validando sesión del usuario.");
    if (typeof req.session.usuarioLogueado == "undefined" ){
        res.redirect("/login");
    }
    else{
        next();
    }
}

function validarUsuario(req,res,next){
    var articuloId = req.params.articuloId;
    
    if(typeof articuloId == "undefined"){
            articuloId = req.body.id;
       }
    
    modelos.Articulo.find({
        where:{id:articuloId}
    }).then(function(articulo){
        if (articulo.usuario_id == req.session.usuarioLogueado.id){
                next();
            }else{
                res.send("No es posible modificar el articulo. No le pertenece");
            }
    })
}



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

app.get("/usuario/:usuarioId([0-9]+)", function(req, res){
    var pUsuarioId = req.params.usuarioId;
    
    modelos.Usuario.find({
        where:{id:pUsuarioId},
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

app.get("/articulo/:articuloId([0-9]+)/editar", validarSesion, validarUsuario, function(req, res){
    var articuloId = req.params.articuloId;
    modelos.Articulo.findById(articuloId).then(function(articulo){
        res.render("articulo_editar.html",{
            articuloPrincipal:articulo
        });
    });
});
app.post("/guardar-articulo", validarSesion, validarUsuario, function(req, res){
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
        }).catch(function(err){
            console.log(JSON.stringify(err));
            var url = "/articulo/" + id + "?actualizado=false";
            res.redirect(url);
        });
    });
});

app.get("/articulo/crear", validarSesion, function(req, res){
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
        }).catch(function(err){
            console.log(JSON.stringify(err));
            res.render("articulo_crear.html");
        });
});

app.get("/articulo/:articuloId([0-9]+)/eliminar", validarSesion, validarUsuario, function(req,res){
    
    var articuloId = req.params.articuloId;
    
    modelos.Articulo.find({
        where:{id:articuloId}
    }).then(function(articulo){
            
            if (articulo == null){
                    res.send("No existe el articulo.");
                }else{
                    modelos.Comentario.destroy({
                    where:{articulo_id:articuloId}
                    });
                    modelos.ArticuloCategoria.destroy({
                        where:{articulo_id:articuloId}
                    });
                    articulo.destroy().then(function(){
                    res.send("El artículo se ha eliminado correctamente");
                    });
                }
        }
    )
})


app.get("/login",function(req, res){
    res.render("login.html");
});

app.post("/autentificar", function(req, res){
    var pEmail = req.body.email;
    var pPassword = req.body.password;
    
    modelos.Usuario.find({
        where:{
            email:pEmail,
            password:pPassword 
        }
    }).then(function(usuario){
        if(usuario == null){
            res.send("No existe usuario.");
        }else{
            req.session.usuarioLogueado = {
                id:usuario.id,
                email:usuario.email
            };
            
            res.send("usuario logueado");
            
            /*
            var url = "/usuario/" + usuario.id;
            res.redirect(url);
            */
        }
    });
});