var minute = 0.6;
let classificação = 0;
let classificacao_total = 0;
let perguntas_parciais = 0;
let perguntas_erradas = 0;
var timer;
var endTime;

// type
// * single -> Escolha unica e verdadeiro e falso
// * multiple -> Para checkboxes (Answer passa a ser um array) (O tamanho do array são as respostas corretas)
// * text -> Para ser o user a escrever (Answer também pode passar a ser um array)
const questions = [
    '{"id":1,"type":"multiple","question":"As respostas um e dois são as corretas","mark":25,"choices":["Um","Dois","Três"],"answer":["Um","Dois"]}',
    '{"id":2,"question":"Olá [1], [2]","type":"text","mark":20,"answers":["mundo","como estás"]}',
    '{"id":3,"question":"O Cristiano Ronaldo é o melhor do mundo?","mark":35,"choices":["Verdadeiro","Falso"],"answer":"Verdadeiro"}',
    '{"id":4,"question":"Which English football club play at Roots Hall?","mark":20,"choices":["Liverpool","Southend United","Wolverhampton"],"answer":"Southend United"}',
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
    classificacao_total += obj.mark;

    $('#quiz').append(
        $(document.createElement('div')).attr('id', 'question_' + obj.id)
    );
    $('#question_' + obj.id).data('mark', obj.mark);
    if (obj.type != 'text') {
        $('#question_' + obj.id).append(
            $(document.createElement('p'))
                .attr('id', obj.id)
                .text(obj.question)
                .addClass('font-weight-bold')
        );
    }
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
        case 'text':
            $('#question_' + obj.id)
                .data('maxAnswers', obj.answers.length)
                .data('currAnswers', 0)
                .data('rightAnswers', 0);
            let question_text = obj.question;
            for (let j = 0; j < obj.answers.length; j++) {
                question_text = question_text.replace(
                    '[' + (j + 1) + ']',
                    '<input id="' +
                        j +
                        '" type="text" name="' +
                        obj.id +
                        '" onfocusout="verifyText(this)" data-correct-text="' +
                        obj.answers[j] +
                        '">'
                );
            }
            $('#question_' + obj.id).append(
                $(document.createElement('p'))
                    .attr('id', obj.id)
                    .html(question_text)
                    .addClass('font-weight-bold')
            );
            $('#question_' + obj.id).append(
                $(document.createElement('p')).text(
                    'Quando a caixa de texto deixar de ser selecionada, é considerada essa a resposta final'
                )
            );
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

function verifyText(el) {
    let nAnswers = $('#question_' + el.name).data('currAnswers');
    $('#question_' + el.name).data('currAnswers', nAnswers + 1);
    let maxAnswers = $('#question_' + el.name).data('maxAnswers');
    let rightAnswers = $('#question_' + el.name).data('rightAnswers');
    $(el).prop('disabled', true);

    if (
        $(el).val().toLowerCase().trim() ==
        $(el).data('correct-text').toLowerCase().trim()
    ) {
        $(el).css('background-color', 'lime');
        $('#question_' + el.name).data('rightAnswers', rightAnswers + 1);
        classificação += $('#question_' + el.name).data('mark') / maxAnswers;
    } else {
        $(el).css('background-color', 'red');
    }

    if ($('#question_' + el.name).data('currAnswers') == maxAnswers) {
        if ($('#question_' + el.name).data('rightAnswers') == maxAnswers) {
            correctAnswers++;
        }
        if (
            $('#question_' + el.name).data('rightAnswers') > 0 &&
            $('#question_' + el.name).data('rightAnswers') < maxAnswers
        ) {
            perguntas_parciais++;
        }
        if ($('#question_' + el.name).data('rightAnswers') == 0) {
            perguntas_erradas++;
        }
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
        classificação += $('#question_' + this.name).data('mark') / maxAnswers;
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
        if (
            $('#question_' + this.name).data('rightAnswers') > 0 &&
            $('#question_' + this.name).data('rightAnswers') < maxAnswers
        ) {
            perguntas_parciais++;
        }
        if ($('#question_' + this.name).data('rightAnswers') == 0) {
            perguntas_erradas++;
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
        classificação += $('#question_' + this.name).data('mark');
        correctAnswers++; //Adiciona 1 ao contador das respostas corretas
    } else {
        $('#lbl_' + this.name + '_' + this.id).addClass('text-danger');
        perguntas_erradas++;
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
    $('#time').addClass('d-none');
    $('#result').toggleClass('d-none');
    //Parar o temporizador e esconder o temporizador
    clearInterval(timer);
    console.log(classificação);
    $('#result').append(
        $(document.createElement('p')).text(
            correctAnswers +
                ' respostas corretas' +
                (perguntas_parciais > 0
                    ? ' e ' + perguntas_parciais + ' parcialmente corretas'
                    : '')
        )
    );
    $('#result').append(
        $(document.createElement('p')).text(
            perguntas_erradas + ' respostas incorretas'
        )
    );
    $('#result').append(
        $(document.createElement('p')).text(
            totalQuestions -
                perguntas_erradas -
                perguntas_parciais -
                correctAnswers +
                ' perguntas não respondidas'
        )
    );
    $('#result').append(
        $(document.createElement('p')).text(
            classificação + ' pontos de um máximo de ' + classificacao_total
        )
    );
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

        $('#btn_previous,#btn_next,#question_' + currentQuestion).addClass(
            'd-none'
        );

        //Chama a função para acabar o quiz
        finishQuiz();
        $('#time').removeClass('d-none');
    }
}
