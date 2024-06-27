const db = require('../db/connection');
const { DataTypes } = require("sequelize");

const Jogo = require('./Jogo');


const Conquista = db.define("Conquista", {
    titulo: {
        type: DataTypes.STRING,
        required: true,
    },
    descricao: {
        type: DataTypes.STRING,
        required: true,
    },
});

Conquista.belongsTo(Jogo, { foreignKey: 'jogoId' });
Jogo.hasMany(Conquista, { foreignKey: 'jogoId' });

module.exports =  Conquista;
