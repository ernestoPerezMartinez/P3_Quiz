

//Cargamos modulo 'sequelize'
const Sequelize = require('sequelize');

//Genero instancia new Sequelize para acceder a bbdd que esta en el fichero "sqlite:quizzes.sqlite"
const sequelize = new Sequelize("sqlite:quizzes.sqlite", {logging: false});

//Genero modelo de datos
sequelize.define('quiz', {
    question: {
        type: Sequelize.STRING,
        unique: {msg: "Ya existe esta pregunta"},  //restriccion
        validate: {notEmpty: {msg: "La respuesta no puede estar vacía"}}  //comprobacion
    },
    answer: {
        type: Sequelize.STRING,
        validate: {notEmpty: {msg: " La respuesta no puede estar vacía"}}
    }
});

//miro si en la bbdd existen las tablas que necesito. si no estan, se crean
sequelize.sync()
.then(() => sequelize.models.quiz.count()) // accede a models, quiz y cuento cuantos hay
.then(count => { //toma el valor de la cuenta(count)
    if (!count) { // si es 0:
        return sequelize.models.quiz.bulkCreate([  //para crear varios quizzes
            {question: "Capital de Italia", answer: "Roma"},
            {question: "Capital de España", answer: "Madrid"},
            {question: "Capital de Francia", answer: "Paris"},
            {question: "Capital de Portugal", answer: "Lisboa"}

        ]);
    }
})
.catch(error => {
    console.log(error);
});
    module.exports = sequelize;