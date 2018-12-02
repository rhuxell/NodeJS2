var Sequelize = require("sequelize");

var sequelize = new Sequelize("NOMBRE_BASE", "USUARIO", "PASSWORD_USUARIO", {
    dialect:"sqlite",
    //Esta propiedad se usa solamente para Sqlite3
    storage:__dirname + "/database.db",
    define:{
        timestamps:false,
        freezeTableName:true,
    }

});

sequelize.authenticate().then(function(){
    console.log("Base lista!");
});

module.exports.PRUEBA = "hola";

//Mapeos

var Articulo = sequelize.define("Articulo", {
    id:{
        primaryKey:true,
        type:Sequelize.INTEGER
    },
    titulo:{
        type: Sequelize.TEXT,
        validate:{
            len:{
                args:[5],
                msg: "La longitud mínima de título debe ser de 5 caracteres."
            },
            filtrarGroserias:function(titulo){
                var groserias = ["puto", "culo", "pijita"];
                var groseriasEncontradas = [];
                
                groserias.forEach(function(groseria){
                    if (titulo.search(groseria) !== -1) {
                            groseriasEncontradas.push(groseria);
                        }
                });
                if (groseriasEncontradas.length > 0){
                    throw new Error("El título no puede contener las siguientes palabras: " + groseriasEncontradas);
                }
            }
        }
    },
    contenido: Sequelize.TEXT,
    fecha_creacion: Sequelize.DATE
},{
    tableName:"articulos"
});

var Usuario = sequelize.define("Usuario",{
    id:{
        primaryKey:true,
        type:Sequelize.INTEGER,
        autoIncrement:true
    },
    nombre:Sequelize.TEXT,
    email:Sequelize.TEXT,
    password:Sequelize.TEXT
},{
    tableName:"usuarios"
});

var Categoria = sequelize.define("Categoria", {
    id:{
        primaryKey:true,
        type: Sequelize.INTEGER
    },
    nombre: Sequelize.TEXT
}, {
    tableName:"categorias"
});

var Comentario = sequelize.define("Comentario",{
    id:{
        primaryKey:true,
        type:Sequelize.INTEGER
    },
    comentario: Sequelize.TEXT
},{
    tableName:"comentarios"
});

var DatosUsuario = sequelize.define("DatosUsuario",{
    id:{
        primaryKey:true,
        type:Sequelize.INTEGER
    },
    biografia: Sequelize.TEXT,
    fecha_registro: Sequelize.DATE
},{
    tableName: "datos_usuarios"
});

var ArticuloCategoria = sequelize.define("ArticuloCategoria",{
    categoria_id:Sequelize.INTEGER,
    articulo_id:Sequelize.INTEGER
},{
    tableName: "categorias_articulos"
});

// Mapeos 1-1

Usuario.hasOne(DatosUsuario,{
    foreignKey:"usuario_id",
    as:"datosUsuario"
});

// Mapeos 1-N

Usuario.hasMany(Articulo,{
    foreignKey:"usuario_id",
    as:"articulos"
});

Articulo.hasMany(Comentario,{
    foreignKey:"articulo_id",
    as: "comentarios",
    onDelete: 'CASCADE'
});

Articulo.belongsTo(Usuario,{
    foreignKey:"usuario_id",
    as: "usuario"
});

// Mapeos N-N

Articulo.belongsToMany(Categoria,{
    foreignKey:"articulo_id",
    as:"categorias",
    through:"categorias_articulos",
    onDelete: 'CASCADE'
});

Categoria.belongsToMany(Articulo,{
    foreignKey:"categoria_id",
    as:"articulos",
    through:"categorias_articulos",
    onDelete: 'CASCADE'
});

//Exports

module.exports.Articulo = Articulo;
module.exports.Usuario = Usuario;
module.exports.Categoria = Categoria;
module.exports.Comentario = Comentario;
module.exports.DatosUsuario = DatosUsuario;
module.exports.ArticuloCategoria = ArticuloCategoria;