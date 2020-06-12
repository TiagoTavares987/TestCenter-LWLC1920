var minute = 0.1;
var timer;
var endTime;

// Type: single para escolhas unica e verdadeiro e falso
// * Single -> Escolha unica e verdadeiro e falso
// * Multiple -> Para checkboxes (Answer passa a ser um array) (O tamanho do array são as respostas corretas)
// * Type -> Para ser o user a escrever (Answer também pode passar a ser um array)
const questions = [
    '{"id":1,"type":"multiple","question":"Which planet in our solar system is closest to the sun?","choices":["Mars","Mercury","Jupiter"],"answer":["Mars","Mercury"]}',
    '{"id": 2, "question": "Which actor played Richard III in the 1995 British film drama of the same title?", "choices": ["Ian McKellen", "Partrick Stewart", "Elijah Wood"],"answer": "Ian McKellen"}',
    '{"id": 3, "question": "Which Marvel superhero, also known as Steve Rogers, made his first appearance in March 1941?","choices": ["Hulk", "Iron Man", "Captain America"], "answer": "Captain America" }',
    '{"id": 4, "question": "Which English football club play at Roots Hall?", "choices": ["Liverpool", "Southend United", "Wolverhampton"], "answer": "Southend United" }',
];

var totalQuestions = questions.length;
var currentQuestion = 1;
var correctAnswers = 0;

$('#btn_start').click(startQuiz);
$('#btn_next').click(nextQuestion);
$('#btn_finish').click(finishQuiz);
$('#btn_previous').click(previousQuestion);

for (let i = 0; i < questions.length; i++) {
    let obj = JSON.parse(questions[i]);
    console.log(obj.question);

    $('#quiz').append(
        $(document.createElement('div')).attr('id', 'question_' + obj.id)
    );

    $('#question_' + obj.id).append(
        $(document.createElement('p'))
            .attr('id', obj.id)
            .text(obj.question)
            .addClass('font-weight-bold')
    );
    if (obj.type == 'multiple') {
        $('#question_' + obj.id).append(
            $(document.createElement('p')).text(
                'Escolha até ' + obj.answer.length + ' opções'
            )
        );
    }

    if (i != 0) {
        $('#question_' + obj.id).toggleClass('d-none');
    }
    switch (obj.type) {
        case 'multiple':
            $('#question_' + obj.id)
                .data('maxAnswers', obj.answer.length)
                .data('currAnswers', 0)
                .data('rightAnswers', 0);
            for (let j = 0; j < obj.choices.length; j++) {
                console.log(obj.choices[j]);
                $('#question_' + obj.id)
                    .append(
                        $(document.createElement('input'))
                            .attr({
                                id: j,
                                name: obj.id,
                                type: 'checkbox',
                                value: obj.answer.includes(obj.choices[j])
                                    ? 1
                                    : 0,
                            })
                            .click(multipleAnswer)
                            .addClass('ml-20, mr-10')
                    )
                    .append(
                        $(document.createElement('label'))
                            .attr('id', 'lbl_' + obj.id + '_' + j)
                            .text(obj.choices[j])
                    );
            }
            break;
        default:
            for (let j = 0; j < obj.choices.length; j++) {
                console.log(obj.choices[j]);
                $('#question_' + obj.id)
                    .append(
                        $(document.createElement('input'))
                            .attr({
                                id: j,
                                name: obj.id,
                                type: 'radio',
                                value: obj.answer == obj.choices[j] ? 1 : 0,
                            })
                            .click(singleAnswer)
                            .addClass('ml-20, mr-10')
                    )
                    .append(
                        $(document.createElement('label'))
                            .attr('id', 'lbl_' + obj.id + '_' + j)
                            .text(obj.choices[j])
                    );
            }
            break;
    }
}

function startQuiz() {
    //Faz com que o quiz fique visível
    $('#quiz').toggleClass('d-none');
    $('#intro').toggleClass('d-none');
    $('#btn_start').toggleClass('d-none');
    $('#btn_next').removeClass('d-none');

    endTime = new Date(new Date().getTime() + minute * 60000);
    timer = setInterval(countDown, 1000); // A cada 1000 nanosegundos chama a função countDown
}

function multipleAnswer() {
    let nAnswers = $('#question_' + this.name).data('currAnswers');
    $('#question_' + this.name).data('currAnswers', nAnswers + 1);
    let maxAnswers = $('#question_' + this.name).data('maxAnswers');
    let rightAnswers = $('#question_' + this.name).data('rightAnswers');

    if (this.value == '1') {
        $('#lbl_' + this.name + '_' + this.id).addClass('text-success');
        $('#question_' + this.name).data('rightAnswers', rightAnswers + 1);
    } else {
        $('#lbl_' + this.name + '_' + this.id).addClass('text-danger');
    }

    if ($('#question_' + this.name).data('currAnswers') == maxAnswers) {
        $('#question_' + this.name + ' :input').attr({
            disabled: true,
        });
        if ($('#question_' + this.name).data('rightAnswers') == maxAnswers) {
            correctAnswers++;
        }
    }

    //Verifica se é a resposta correta
}

function singleAnswer() {
    $('#question_' + this.name + ' :input').attr({
        disabled: true,
    });
    //Verifica se é a resposta correta
    if (this.value == '1') {
        $('#lbl_' + this.name + '_' + this.id).addClass('text-success');
        correctAnswers++; //Adiciona 1 ao contador das respostas corretas
    } else {
        $('#lbl_' + this.name + '_' + this.id).addClass('text-danger');
    }
}

function nextQuestion() {
    //Esconde a questão atual
    $('#question_' + currentQuestion).addClass('d-none');
    $('#question_' + (currentQuestion + 1)).removeClass('d-none');
    currentQuestion++;
    if (currentQuestion != totalQuestions) {
        $('#btn_next,#btn_previous').removeClass('d-none');
    } else {
        //Faz o butão finish ficar vísivel se a questão atual for a última questão
        $('#btn_finish').removeClass('d-none');
        $('#btn_next').addClass('d-none');
    }
}

function previousQuestion() {
    $('#btn_finish,#question_' + currentQuestion).addClass('d-none');
    $('#btn_next,#question_' + (currentQuestion - 1)).removeClass('d-none');
    currentQuestion--;
    if (currentQuestion == 1) {
        $('#btn_previous').addClass('d-none');
    }
}

function finishQuiz() {
    //Esconde-te o butão finish
    $('#btn_previous,#btn_finish,#time,#question_' + currentQuestion).addClass(
        'd-none'
    );
    $('#time').toggleClass('d-none');
    $('#result').toggleClass('d-none');
    //Parar o temporizador e esconder o temporizador
    clearInterval(timer);
    $('#correct_answers').text(correctAnswers + '/' + totalQuestions);
}

function countDown() {
    //Se a variável reset for verdadeira, dá reset ao temporizador
    //Fazendo com que o endTime seja egual ao tempo atual.
    let now = new Date().getTime(); // Tempo atual

    let distance = endTime - now; // Diferença entre o tempo atual e o tempo em o temporizador acaba

    let minutes = Math.max(
        Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        0
    ); //Nanosegundos -> Minutos
    let seconds = Math.max(Math.floor((distance % (1000 * 60 * 60)) / 1000), 0); //Nanosegundos -> Segundos

    $('#time').text(minutes + ':' + seconds);

    if (distance <= 0) {
        clearInterval(timer); //Faz com que o temporizador pare
        $('#time').text('Acabou o tempo!');

        $(
            '#btn_previous,#time,#btn_next,#question_' + currentQuestion
        ).addClass('d-none');

        //Chama a função para acabar o quiz
        finishQuiz();
    }
}
