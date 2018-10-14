var Sequelize = require("sequelize");

var sequelize = new Sequelize("NOMBRE_BASE", "USUARIO", "PASSWORD", {
    dialect:"postgres",
    //Esta propiedad se usa solamente para Sqlite3
    storage:__dirname + "/database.db",
    define:{
        timestamps:false,
        freezeTableName:true
    }

});



module.exports.PRUEBA = "hola";
