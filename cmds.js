

const {log, biglog, errorlog, colorize} = require("./out");

const model = require('./model');


/**
 * Muestra la ayuda.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */

exports.helpCmd = rl => {

    log("Comandos:");
    log(" h|help - Muestra esta ayuda.");
    log(" list - Listar los quizzes existentes. ");
    log(" show <id> - Muestra la pregunta y la respuesta del quiz indicado.");
    log(" add - Añadir un nuevo quiz interactivamente. ");
    log(" delete <id> - Borrar el quiz indicado.");
    log(" edit <id> - Editar el quiz indicado.");
    log(" test <id> - Probar el quiz indicado.");
    log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log(" credits - Créditos.");
    log(" q|quit - Salir del programa.");
    rl.prompt();
};


exports.listCmd = rl => {


    model.getAll().forEach((quiz, id) => {

    log(` [${colorize(id, 'magenta')}]: ${quiz.question}`);
});


    rl.prompt();
};


exports.showCmd = (rl, id) => {

        if (typeof id === "undefined") {
            errorlog(`Falta el parámetro id.`);
    } else {
            try{
                const quiz = model.getByIndex(id);
                log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
            } catch (error) {
                errorlog(error.message);
            }
    }

    rl.prompt();
};

/**
 * Añade un nuevo quiz al modelo.
 * Pregunta interactivamente por la pregunta y por la respuesta.
 *
 * Hay que recordar que el funcionamiento de la función rl.question es asíncrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario.,
 * es decir, la llamada a rl.prompt() se debe hacer en la callback de la segunda llamada a
 * rl.question.
 *
 * @param rl Objeto readLine usado para implementar el CLI.
 */

exports.addCmd = rl => {

    rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

        rl.question(colorize(' Introduzca la respuesta', 'red'), answer => {

            model.add(question, answer);
            log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);
            rl.prompt();
        });
    });


};

exports.deleteCmd = (rl, id) => {


    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
    } else {
        try{
            model.deleteByIndex(id);
        } catch (error) {
            errorlog(error.message);
        }
    }

    rl.prompt();
};

/**
 * Edita un quiz del modelo.
 * Hay que recordar que el funcionamiento de la función rl.question es asíncrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamada a rl.prompt() se debe hacer en la callback de la segunda
 * llamada a rl.question.
 *
 * @param rl Objeto readLine usado para implementar el CLI
 * @param id Clave del quiz a editar en el modelo.
 */

exports.editCmd = (rl, id) => {
    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else {
        try {

            const quiz = model.getByIndex(id);

            process.stdout.isTTY && setTimeout(() => { rl.write(quiz.question)},0);

            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

                process.stdout.isTTY && setTimeout(() => { rl.write(quiz.answer)},0);

                    rl.question(colorize(' Introduzca la respuesta', 'red'), answer => {
                    model.update(id, question, answer);
                    log(`Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`);
                    rl.prompt();
                });
            });

        } catch (error) {
            errorlog(error.message);
            rl.prompt
        }
    }
};

exports.testCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else {
        try {
            const quiz = model.getByIndex(id);

            rl.question(`${colorize(quiz.question, 'red')}: `, answer => {
                if (answer.trim().toLowerCase() === quiz.answer.toLowerCase()) {
                    log(`Su respuesta es correcta.`);
                    biglog(`CORRECTO`, 'green');
                    rl.prompt();
                } else {
                    log(`Su respuesta es incorrecta.`);
                    biglog(`INCORRECTO`, 'red');
                    rl.prompt();
                }
            });

        }


        catch (error) {
            errorlog(error.message);
            rl.prompt

        }


    }

};

exports.playCmd = rl => {



        let score = 0;
        let toBeResolved = [];


        for (var i = 0; i < model.count(); i++) {
            toBeResolved.push(i);
        }

        const playOne = () => {
            if (toBeResolved.length === 0) {

                log('No hay nada más que preguntar', 'black');
                log(`Fin del juego. Aciertos: ${score} `, 'black');
                biglog(`${score}`, 'magenta');
                rl.prompt();

            }
            else {

                let iden = Math.round(Math.random() * (toBeResolved.length) - 0.5);

                const quiz = model.getByIndex(toBeResolved[iden]);

                rl.question(`${colorize(quiz.question, 'red')}`, answer => {

                    toBeResolved.splice(iden, 1);

                    if (answer.trim().toLowerCase() === quiz.answer.toLowerCase()) {
                        log(`CORRECTO - Lleva ${++score} aciertos`, 'green');
                        playOne();
                    }
                    else {
                        log(`INCORRECTO`, 'red');
                        log(`Fin del juego. Aciertos: ${score}`, 'black');
                        biglog(`${score}`, 'magenta');
                        rl.prompt();
                    }

                });


            };

        }
        playOne();


    };
exports.creditsCmd = rl => {
    log('Autores de la práctica:');
    log('Ernesto Pérez Martínez de Tejada', 'green');
    log('Alberto Cuevas Abad', 'green');
    rl.prompt();


};

exports.quitCmd = rl =>{
    rl.close();

};

