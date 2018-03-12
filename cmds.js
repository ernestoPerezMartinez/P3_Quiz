
const Sequelize = require('sequelize');

const {log, biglog, errorlog, colorize} = require("./out");

const {models} = require('./model');


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

    models.quiz.findAll() //promesa
        .each(quiz => {
                log(`[${colorize(quiz.id, 'magenta')}]:  ${quiz.question}`);
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(()  => {
            rl.prompt();

        })
};

/**
 * Esta funcion devuelve una promesa que:
 *      -Valida que se ha itroducido un valor para el parametro.
 *      -Convierte el parametro en un numero entero.
 *si va bien, la promesa se satisface y devuelve el valor de id a usar.
 * @param id Parametro con el indice a validar
 */


const validateId = id => {

    return new Sequelize.Promise((resolve , reject) => {
        if (typeof id == "undefined") {
            reject(new Error(`Falta el parámetro <id>. `));
        }else{
            id= parseInt(id);
            if (Number.isNaN(id)){
                reject(new Error(`El valor del parámetro <id> no es un número`))
            }else{
                resolve(id);
            }
        }
    });
};

exports.showCmd = (rl, id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }
            log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};


const makeQuestion = (rl, text) => {

    return new Sequelize.Promise((resolve, reject) => {
        rl.question(colorize(text,'red'), answer => {
            resolve(answer.trim());
        });
    });
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

    makeQuestion(rl, 'Introduzca una pregunta: ')
        .then(q => {
            return makeQuestion(rl, 'Introduzca una pregunta: ')
        .then(a => {
            return {question: q, answer: a};
        });
})
.then((quiz) => {
    return models.quiz.create(quiz);
})
    .then((quiz) => {
        log(` ${colorize('Se ha añadido', 'magenta')}:  ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
    })
    .catch(Sequelize.ValidationError, error => {
        errorlog('El quiz es erróneo:');
        error.errors.forEach(({message}) => errorlog(message));
    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
});

};
exports.deleteCmd = (rl, id) => {

    validateId(id)
        .then(id => models.quiz.destroy({where: {id}}))
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
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
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if(!quiz){
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }

            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
            return makeQuestion(rl, 'Introduzca la pregunta: ')
                .then(q => {
                    process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
                    return makeQuestion(rl, 'Introduzca la respuesta ')
                        .then(a => {
                            quiz.question= q;
                            quiz.answer=a;
                            return quiz;
                        });

                });
        })

        .then(quiz => {
            return quiz.save();
        })
        .then(quiz => {
            log(`Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erróneo; ');
            error.errors.forEach(({message}) => errorlog(message));
        })

        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });



};

exports.testCmd = (rl, id) => {

    var testea=0;
    var juega= 0;
    var count;

    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if(!quiz){
                throw new Error(`No existe un quiz asociado al id=${id}`);
            }
            return makeQuestion(rl, `${colorize(quiz.question + "? ", 'red')} `)
                .then(answer => {
                    if(answer.trim().toLowerCase() === quiz.answer.toLowerCase()){
                        log('Respuesta correcta.', 'green');
                        biglog('Correcto','green');
                    }
                    else{
                        log('Respuesta incorrecta.', 'red');
                        biglog('Incorrecto','red')
                    }
                });
        })
        .then(() => {
            rl.prompt();
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erróneo:');
            error.errors.forEach(({message}) => errorlog(message));
            rl.prompt();
        })
        .catch(error => {
            errorlog(error.message);
            rl.prompt();
        });

};


 exports.playCmd = rl => {

	let score = 0;
	let toBeResolved = new Array();

	let i = 1;
	models.quiz.findAll().each(quiz => {
		toBeResolved.push(i++);
		let thereWere = toBeResolved.length;
    }).
    then(() => {
    	playOne();
    });

	const playOne = () => {
		if(toBeResolved.length === 0){

			log('No hay mas preguntas','black');
			log('Fin del quiz, Aciertos: ${score}', 'black');
			biglog(` ${score}`, 'magenta');
			rl.prompt();

		}
		else{

			let iden = Math.ceil(Math.random() * toBeResolved.length);

			let jug;
			let perd=0;

			validateId(iden)

		    .then(iden => models.quiz.findById(toBeResolved[iden-1]))

		    .then(quiz => {

		        if(!quiz){
		    		throw new Error(`No existe un quiz asociado al id=${r}`);
		    	}

		    	return makeQuestion(rl, `  ${colorize(quiz.question + "? ", 'red')}`)
		    	.then(answer => {
		    		toBeResolved.splice(iden-1, 1);
		    		if(answer.trim().toLowerCase() === quiz.answer.toLowerCase()){
		    			log(` CORRECTO - Lleva : ${++score} aciertos`, 'green');
		    			playOne();
		    		}


		    		else{

                        console.log(` Incorrecta. Fin del examen. Aciertos: ${score}`);
                        rl.prompt();
		    		}
				});
		    })


	        .then(() => {
				rl.prompt();
			})


			.catch(Sequelize.ValidationError, error => {
				errorlog('El quiz es erroneo:');
				error.errors.forEach(({message}) => errorlog(message));

			})
                .catch(error => {
                    errorlog(error.message);
                })
                .then(() => {
                    rl.prompt();
                });

		}
	};
     playOne();
}





exports.creditsCmd = rl => {
    log('Autores de la práctica:');
    log('Ernesto Pérez Martínez de Tejada', 'green');
    log('Alberto Cuevas Abad', 'green');
    rl.prompt();


};

exports.quitCmd = rl =>{
    rl.close();

};

