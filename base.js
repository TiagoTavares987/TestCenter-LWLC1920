var minute = 0.6;
let classificação = 0;
let classificacao_total = 0;
let perguntas_parciais = 0;
let perguntas_erradas = 0;
var timer;
var endTime;

//JQuery Notas:
// x.append: Adiciona um elemento HTML(h1, p) dentro do elemento x
// x.text: Muda o texto de x
// x.html: Muda o HTML dentro do elemento x
// x.addClass: Adiciona uma classe CSS no elemento x
// x.removeClass: Remove uma classe CSS no elemento x
// x.toggleClass: Caso x tenha a classe passada á função remove a classe, se não tiver a classe adiciona-a
// x.attr: Se a função for usada com um só valor retorna algo correspondente a esse valor
// ou seja x.attr('name') retorna o nome do elemento x
// Se por exemplo a função for usada da seguinte forma x.attr('name', 'teste')
// Muda o nome do elemento x para teste
// x.data: Igual a x.attr() mas permite ao utilizador criar propriedades para utilização própria
// x.click(func): Quando o utilizador carrega no elemento x, a função func é executada

//Formato JSON:
// ID: Número inteiro que identifica a pergunta
// Type: single(Escolha única), multiple(Escolha Múltipla), text(O utilizador têm de preencher)
// Mark: Número que representa a classificação da pergunta
// Question: Enunciado da pergunta
// Choices: Representa as escolhas para perguntas de escolha única ou múltipla
// Answers: Pode ser valor único para questões de escolha única ou um array para questões de preencher e escolha múltipla

const questions = [
    '{"id":1,"type":"multiple","question":"Como é que se diz bolacha em inglês?","mark":25,"choices":["Cookie","Biscuit","Boleich"],"answer":["Cookie","Biscuit"]}',
    '{"id":2,"question":"Traduz a seguinte frase para português:\\n Hello Tiago, how are you? \\n [1] Tiago, [2]","type":"text","mark":20,"answers":["Olá","como estás"]}',
    '{"id":3,"question":"O Cristiano Ronaldo é o melhor do mundo?","mark":35,"choices":["Verdadeiro","Falso"],"answer":"Verdadeiro"}',
    '{"id":4,"question":"Which English football club play at Roots Hall?","mark":20,"choices":["Liverpool","Southend United","Wolverhampton"],"answer":"Southend United"}',
];

var totalQuestions = questions.length;
var currentQuestion = 1;
var correctAnswers = 0;

$('#btn_start').click(startQuiz); // Ver linha 21
$('#btn_next').click(nextQuestion); // Ver linha 21
$('#btn_finish').click(finishQuiz); // Ver linha 21
$('#btn_previous').click(previousQuestion); // Ver linha 21

for (let i = 0; i < questions.length; i++) {
    //Converte JSON para código
    let obj = JSON.parse(questions[i]);
    classificacao_total += obj.mark;
    //Cria um elemento div com id question_ e o índice do ciclo e faz append ao elemento quizz
    //(linha 10)
    $('#quiz').append(
        $(document.createElement('div')).attr('id', 'question_' + obj.id)
    );

    //Guarda a classificação num atributo da pergunta para poder posteriormente
    //utilizar(linha 20)
    $('#question_' + obj.id).data('mark', obj.mark); //linha (20)

    // Se não for uma pergunta de texto adicionar o enunciado da pergunta
    //Pois as perguntas de texto são feitas de forma diferente
    if (obj.type != 'text') {
        //Ao div da questão faz append(linha 10) a um parágrafo com id igual ao id da questão
        // com texto(linha 11) igual ao enunciado da questão e com classe CSS(linha 13) que faz com
        //que fique em negrito
        $('#question_' + obj.id).append(
            $(document.createElement('p'))
                .attr('id', obj.id) // linha 16
                .text(obj.question) // linha 11
                .addClass('font-weight-bold') // linha (13)
        );
    }

    if (obj.type == 'multiple') {
        //Se for uma questão de escolha multipla faz appenda um parágrafo
        //que informa ao utilizador até quantas opções pode escolher
        //linha 10
        $('#question_' + obj.id).append(
            //linha 11
            $(document.createElement('p')).text(
                'Escolha até ' + obj.answer.length + ' opções'
            )
        );
    }

    //Esconde todas as perguntas meno a primeira
    if (i != 0) {
        $('#question_' + obj.id).toggleClass('d-none'); // linha 15
    }
    switch (obj.type) {
        case 'multiple':
            //Guarda no div pergunta o máximo de respostas que o utilizador têm de responder
            // as respostas que já respondeu e as respostas que acertou
            $('#question_' + obj.id)
                .data('maxAnswers', obj.answer.length) //linha (20)
                .data('currAnswers', 0) //linha (20)
                .data('rightAnswers', 0); //linha (20)
            for (let j = 0; j < obj.choices.length; j++) {
                console.log(obj.choices[j]);
                //Cria as checkboxes
                // value é igual a 1 se a resposta for uma das corretas
                $('#question_' + obj.id)
                    .append(
                        $(document.createElement('input'))
                            //linha 16
                            //value é 1 se no array das respostas inclui
                            //a resposta ue está a ser criada
                            .attr({
                                id: j,
                                name: obj.id,
                                type: 'checkbox',
                                value: obj.answer.includes(obj.choices[j])
                                    ? 1
                                    : 0,
                            })
                            .click(multipleAnswer) //linha 21
                            .addClass('ml-20, mr-10') // linha 13
                    )
                    //Cria o texto da resposta
                    //linha 10
                    .append(
                        $(document.createElement('label'))
                            .attr('id', 'lbl_' + obj.id + '_' + j) // linha 16
                            .text(obj.choices[j]) //linha 11
                    );
            }
            break;
        case 'text':
            //Guarda na pergunta o máximo de respostas que o utilizador têm de responder
            // as respostas que já respondeu e as respostas que acertou
            $('#question_' + obj.id)
                .data('maxAnswers', obj.answers.length) //linha 20
                .data('currAnswers', 0) // linha 20
                .data('rightAnswers', 0); // linha 20
            let question_text = obj.question;
            while (question_text.includes('\n')) {
                question_text = question_text.replace('\n', '<br>');
            }

            for (let j = 0; j < obj.answers.length; j++) {
                //Substitui o [j] em que j é o índice por
                //um input de texto para o utilizador meter a resposta
                //que é verificado quando o utilizador carrega fora dele
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
            //Cria a pergunta em si
            $('#question_' + obj.id).append(
                $(document.createElement('p'))
                    .attr('id', obj.id) //linha 16
                    .html(question_text) //linha 12
                    .addClass('font-weight-bold') //linha 13
            );
            //Informa o utilizador de quando a resposta é verificada
            //linha 10
            $('#question_' + obj.id).append(
                $(document.createElement('p')).text(
                    //linha 11
                    'Quando a caixa de texto deixar de ser selecionada, é considerada essa a resposta final'
                )
            );
            break;
        default:
            for (let j = 0; j < obj.choices.length; j++) {
                console.log(obj.choices[j]);
                //Cria os butoẽs de radio para as escolhas únicas
                $('#question_' + obj.id)
                    //linha 10
                    .append(
                        $(document.createElement('input'))
                            //linha 16
                            .attr({
                                id: j,
                                name: obj.id,
                                type: 'radio',
                                value: obj.answer == obj.choices[j] ? 1 : 0,
                            })
                            .click(singleAnswer) //linha 21
                            .addClass('ml-20, mr-10') //linha 13
                    )
                    //Cria o texto correspondente a escolha única
                    //linha 10
                    .append(
                        $(document.createElement('label'))
                            .attr('id', 'lbl_' + obj.id + '_' + j)
                            .text(obj.choices[j])
                    );
            }
            break;
    }
}

//é necessario o el pois como não é associado ao elemento a função
//é necessário passar uma referência ao elemento
function verifyText(el) {
    //Guarda o número de respostas a que já respondeu, respostas que já acertou
    //e o máximo de respostas a que pode responder em variáveis
    let nAnswers = $('#question_' + el.name).data('currAnswers');
    //Incrementa o número de respostas a que já respondeu
    //Pois esta função só é chamada quando o utilizador responde
    $('#question_' + el.name).data('currAnswers', nAnswers + 1);
    let maxAnswers = $('#question_' + el.name).data('maxAnswers');
    let rightAnswers = $('#question_' + el.name).data('rightAnswers');
    //Desativa a caixa de texto para o utilizador não poder mudar a resposta
    $(el).prop('disabled', true);

    //Verifica se o texto é igual ao correct-text que é um atributo que
    //guarda o texto correto
    if (
        $(el).val().toLowerCase().trim() == // faz com que o texto que utilizador escreveu fique em minúsculas e tira o espaço á frente se tiver
        $(el).data('correct-text').toLowerCase().trim() //linha 20
    ) {
        $(el).css('background-color', 'lime'); //muda a propriedade css 'background-color' para lima
        $('#question_' + el.name).data('rightAnswers', rightAnswers + 1); //linha 20
        classificação += $('#question_' + el.name).data('mark') / maxAnswers; //linha 20
    } else {
        $(el).css('background-color', 'red'); //muda a propriedade css 'background-color' para vermelho
    }

    //Se já tiver repsondido a todas as perguntas
    //Avalia corretamente a pergunta como correta se tiver respondido corretamente a todas
    //Parcialmente correta se tiver respondido pelo menos uma correta
    //E errada se não tiver respondido a nada correta
    if ($('#question_' + el.name).data('currAnswers') == maxAnswers) {
        //linha 20
        if ($('#question_' + el.name).data('rightAnswers') == maxAnswers) {
            correctAnswers++;
        }
        if (
            //linha 20
            $('#question_' + el.name).data('rightAnswers') > 0 &&
            $('#question_' + el.name).data('rightAnswers') < maxAnswers
        ) {
            perguntas_parciais++;
        }
        //linha 20
        if ($('#question_' + el.name).data('rightAnswers') == 0) {
            perguntas_erradas++;
        }
    }
}

function startQuiz() {
    //Faz com que o quiz e o butão seguinte fique visível,
    //Esconde a mensagem de introdução e o butão de start
    $('#quiz').toggleClass('d-none'); //linha 15
    $('#intro').toggleClass('d-none'); //linha 15
    $('#btn_start').toggleClass('d-none'); //linha 15
    $('#btn_next').removeClass('d-none'); //linha 14
    $('#perguntas').text('1/' + totalQuestions);

    endTime = new Date(new Date().getTime() + minute * 60000); //Faz com que o tempo final do temporizador seja igual ao tempo em que o utilizador começou o quizz + o tempo máximo do temporizador
    timer = setInterval(countDown, 1000); // A cada 1000 nanosegundos chama a função countDown
}

function multipleAnswer() {
    //Guarda o número de respostas a que já respondeu, respostas que já acertou
    //e o máximo de respostas a que pode responder em variáveis
    let nAnswers = $('#question_' + this.name).data('currAnswers'); //linha 20
    //Incrementa o número de respostas a que já respondeu
    //Pois esta função só é chamada quando o utilizador responde
    $('#question_' + this.name).data('currAnswers', nAnswers + 1); //linha 20
    let maxAnswers = $('#question_' + this.name).data('maxAnswers'); //linha 20
    let rightAnswers = $('#question_' + this.name).data('rightAnswers'); //linha 20

    //Verifica a resposta
    if (this.value == '1') {
        $('#lbl_' + this.name + '_' + this.id).addClass('text-success'); //linha 13
        classificação += $('#question_' + this.name).data('mark') / maxAnswers; //linha 20
        $('#question_' + this.name).data('rightAnswers', rightAnswers + 1); //linha 20
    } else {
        $('#lbl_' + this.name + '_' + this.id).addClass('text-danger'); //linha 13
    }

    //Se já tiver repsondido a todas as perguntas
    //Avalia corretamente a pergunta como correta se tiver respondido corretamente a todas
    //Parcialmente correta se tiver respondido pelo menos uma correta
    //E errada se não tiver respondido a nada correta
    //linha 20
    if ($('#question_' + this.name).data('currAnswers') == maxAnswers) {
        //Se já tiver respondido até ao número de respostas que pede
        //Desativar o resto para não poder responder mais
        //linha 15
        $('#question_' + this.name + ' :input').attr({
            disabled: true,
        });
        //linha 20
        if ($('#question_' + this.name).data('rightAnswers') == maxAnswers) {
            correctAnswers++;
        }
        if (
            //linha 20
            $('#question_' + this.name).data('rightAnswers') > 0 &&
            $('#question_' + this.name).data('rightAnswers') < maxAnswers
        ) {
            perguntas_parciais++;
        }
        //linha 20
        if ($('#question_' + this.name).data('rightAnswers') == 0) {
            perguntas_erradas++;
        }
    }
}

function singleAnswer() {
    //Desativa o resto das escolhas
    $('#question_' + this.name + ' :input').attr({
        //linha 15
        disabled: true,
    });
    //Verifica se é a resposta correta
    if (this.value == '1') {
        $('#lbl_' + this.name + '_' + this.id).addClass('text-success'); // linha 13
        classificação += $('#question_' + this.name).data('mark'); // linha 20
        correctAnswers++; //Adiciona 1 ao contador das respostas corretas
    } else {
        $('#lbl_' + this.name + '_' + this.id).addClass('text-danger'); //linha 13
        perguntas_erradas++;
    }
}

function nextQuestion() {
    //Esconde a questão atual e faz com que a próxima questão fique visível
    $('#question_' + currentQuestion).addClass('d-none'); //linha 13
    $('#question_' + (currentQuestion + 1)).removeClass('d-none'); //linha 14
    currentQuestion++;
    if (currentQuestion != totalQuestions) {
        //Faz com que o butão anterior e seguinte fiquem visível
        $('#btn_next,#btn_previous').removeClass('d-none'); //linha 14
    } else {
        //Faz o butão finish ficar vísivel se a questão atual for a última questão
        //Também esconde o butão next
        $('#btn_finish').removeClass('d-none'); //linha 14
        $('#btn_next').addClass('d-none'); //linha 13
    }
    $('#perguntas').text(currentQuestion + '/' + totalQuestions);
}

function previousQuestion() {
    //Esconde a questão atual e faz com que a anterior questão fique visível
    $('#btn_finish,#question_' + currentQuestion).addClass('d-none'); //linha 13
    $('#btn_next,#question_' + (currentQuestion - 1)).removeClass('d-none'); //linha 14
    currentQuestion--;
    if (currentQuestion == 1) {
        //Faz com que o butão anterior fique escondido se estiver na primeira pergunta
        $('#btn_previous').addClass('d-none'); //linha 13
    }
    $('#perguntas').text(currentQuestion + '/' + totalQuestions);
}

function finishQuiz() {
    //Esconde-te o butão finish, anterior, o temporizador e a questão atual
    $(
        '#perguntas,#btn_previous,#btn_finish,#time,#question_' +
            currentQuestion
    ).addClass(
        //linha 13
        'd-none'
    );

    $('#result').toggleClass('d-none'); //linha 15
    //Parar o temporizador e esconder o temporizador
    clearInterval(timer);

    //Só mostra as perguntas parciais se estiver respondido a alguma parcialmente
    //linha 10
    $('#result').append(
        //linha 11
        $(document.createElement('p')).text(
            correctAnswers +
                ' respostas corretas' +
                (perguntas_parciais > 0
                    ? ' e ' + perguntas_parciais + ' parcialmente corretas'
                    : '')
        )
    );
    //linha 10
    $('#result').append(
        //linha 11
        $(document.createElement('p')).text(
            perguntas_erradas + ' respostas incorretas'
        )
    );
    //Perguntas não respondidas = Total de Perguntas - Perguntas Erradas - Perguntas Parciais - Perguntas Corretas
    //linha 10
    $('#result').append(
        //linha 11
        $(document.createElement('p')).text(
            totalQuestions -
                perguntas_erradas -
                perguntas_parciais -
                correctAnswers +
                ' perguntas não respondidas'
        )
    );
    //linha 10
    $('#result').append(
        //linha 11
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

    $('#time').text(minutes + ':' + seconds); //linha 11

    if (distance <= 0) {
        clearInterval(timer); //Faz com que o temporizador pare
        $('#time').text('Acabou o tempo!'); //linha 11

        //Esconde o butão anterior, próximo e a questão atual
        $(
            '#perguntas,#btn_previous,#btn_next,#question_' + currentQuestion
        ).addClass(
            //linha 13
            'd-none'
        );

        //Chama a função para acabar o quiz
        finishQuiz();
        $('#time').removeClass('d-none'); //linha 14
    }
}
