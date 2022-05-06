"use strict"

let questionsData = JSON.parse(questionsJson);

let submitTrue;

$("#formInfoPersonal").validate({
    rules: {
        prenom: {
            required: true,
            alphanumeric: true
        },
        nom: {
            required: true,
            alphanumeric: true
        },
        dateNaissance: {
            required: true,
            validDate: true
        },
        statut: "required",

    },
    messages: {
        prenom: {
            required: "Veuiller entre votre Prénom",
            alphanumeric: "Le format dot être Alphanumeric"
        },
        nom: {
            required: "Veuiller entre votre Nom",
            alphanumeric: "Le format dot être Alphanumeric"
        },
        dateNaissance: {
            required: "Veuiller entre une Date",
            validDate: "La date doit être inférieur à celle d'aujourd'hui"
        },
        statut: "Veiller faire un choix"
    },
    submitHandler: function () {
        $("#conteneurInfoPersonal").hide();
        createQuizQuestion();
        progressbar();
    },
    showErrors: function (errorMap, errorList) {
        if (submitTrue) {
            const ul = $("<ul></ul>");
            $.each(errorList, function () {
                ul.append(`<li>${this.message}</li>`);
            });
            $("#errorSummary").html(ul);
            submitTrue = false;
        }
        this.defaultShowErrors();
    },
    invalidHandler: function () {
        submitTrue = true;
    }
    });
$.validator.addMethod(
    "validDate",
    function (value, element) {
        const dateCurrent = new Date();
        return this.optional(element) || dateCurrent >= new Date(value);
    },
);
jQuery.validator.addMethod(
    "alphanumeric",
    function (value, element) {
        return this.optional(element) || /^[\w.]+$/i.test(value);
    },
);

let IndexCurrentQuestion = 0
let createQuizQuestion = () => {

    $(`#questions`).append(`<h2> ${IndexCurrentQuestion+1}-${questionsData[IndexCurrentQuestion].question} </h2>`);
    //---------------------------Choix de réponse----------------------------
    for (let r = 0; r < questionsData[IndexCurrentQuestion].réponses.length; r++) {
        let inputResponseChoice = `<input type=radio name=reponse${IndexCurrentQuestion} id=reponse${r} value=${r}>`
        let labelResponseChoise = `<label for=reponse${r}>${questionsData[IndexCurrentQuestion].réponses[r]}</label><br>`
        $(`#questions`).append(inputResponseChoice, labelResponseChoise);
    }
    //---------------------------Création bouton---------------------------
    let btnNext = `<button type=button name=validResponse>Suivant</button>`
    let btnEnd = `<button type=button name=validResponse>Terminer</button>`
    IndexCurrentQuestion != questionsData.length-1 ? $(`#questions`).append(btnNext) : $(`#questions`).append(btnEnd)

    nextQuestion(IndexCurrentQuestion)
    IndexCurrentQuestion++
}

let nextQuestion = (IndexCurrentQuestion) => {

    $(`button[name=validResponse]`).on("click", function () {
        let checked = $(this).parent().find("input:checked");
        if (checked.length != 0) {
            if (IndexCurrentQuestion != questionsData.length - 1) {
                //insertion de la réponse de l'utilisateur dans l'objet "questionsData"
                questionsData[IndexCurrentQuestion].resUser = checked.attr("value");
                //animation
                $("#questions").fadeOut(300).queue(function() {
                    $(`#questions`).html("")
                    $("#questions").fadeIn(800)
                    createQuizQuestion()
                    progressbar()
                    $(this).dequeue();
                 });

            } else {//Dernière Questions

                //insertion de la réponse de l'utilisateur dans l'objet "questionsData"
                questionsData[IndexCurrentQuestion].resUser = checked.attr("value");
                $(`#questions`).html("")
                $("#progressbar").remove()
                $("#pageResult").removeClass("hide");
                totalGoodRes()
                infoResult()
            }
        }
    })
}
let indexProgress = 0
let progressbar = () => {
    indexProgress++
    $("#progressbar").progressbar({
        value: 100 / questionsData.length * indexProgress
    })
}
let goodRes = 0;
let totalGoodRes = () => {
    questionsData.forEach(function (q) {
        if (q.réponse == q.resUser) {
            q.verdictRes = "Correct"
            goodRes++
        }else{
            q.verdictRes = "Erreur"
        }
    })
}
let infoResult = () => {
    //----------------------------------Calcul de la Date de Naissance-----------------------------
    let dateNow = new Date();
    let dateEnterUser = new Date($('#date').val());

    let nowYear = dateNow.getFullYear();
    let userYear = dateEnterUser.getFullYear();
    let ageValue = parseInt(nowYear - userYear);

    if (dateNow.getMonth() < dateEnterUser.getMonth()) {
        ageValue -= 1
    } else if (dateNow.getMonth() == dateEnterUser.getMonth()) {
        if (dateNow.getDay() < dateEnterUser.getDay()) {
            ageValue -= 1
        }
    }
    //-------------------------------info + résusltat de l'utilisateur----------------------------
    let nomValue = $("#nom").val();
    let prenomValue = $("#prenom").val();
    let statutValue = $("option:checked").html();
    let nom = `<p>${nomValue}</p>`;
    let prenom = `<p>${prenomValue}</p>`;
    let age = `<p>${ageValue}</p>`;
    let statut = `<p>${statutValue}</p>`;
    let calculScore = Math.floor(goodRes/questionsData.length*100)
    let score = `Votre Score : ${calculScore} %`;
    $("#infoUtilisateur").append(nom, prenom, age, statut, score);

    //---------------------------------------Modal------------------------------------
    let success = "<p>Réussite</p>"
    let fail = "<p>Échec</p>"
    $("#modalResultat").append(calculScore >= 60 ? success : fail)
    $( function() {
        // $("#modalResultat").append(`<img src="gif-ballon.gif"></img>`)
        $( "#modalResultat" ).dialog({
          modal: true,
          buttons: {
            Ok: function() {
              $( this ).dialog( "close" );
            }
          }
        });
      });

    //---------------------------------Message alert -----------------------------------
    let scoreHight = `<p class="alert alert-success text-center">Your The Boss Dude!!!!!</p>`
    let scoreMiddle = `<p class="alert alert-warning text-center">Hisssssss sur les fesses</p>`
    let scoreLow = `<p class="alert alert-danger text-center">T'es capable de faire mieux El Gros</p>`

    if(calculScore < 60) $("#alertResult").append(scoreLow)
    else if(calculScore >= 60 && calculScore <=75) $("#alertResult").append(scoreMiddle)
    else $("#alertResult").append(scoreHight)

    //--------------------------Tableau question + resultat-----------------------
    $('#tabResult').DataTable({
        data: questionsData,
        columns: [{
            data: "numero"
        },
        {
            data: "question"
        },
        {
            data: "verdictRes"
        },
    ]
    });
    }
    //--------------------------------------Accordéon---------------------------------
    for (let i = 0; i < questionsData.length; i++) {
        $("#accordeon").append(`<div class='drawer${i}'></div>`)
        $(`.drawer${i}`).append(`<p class="titre${i} titleClick">${i+1}-${questionsData[i].question}</p>`)
        for (let q = 0; q < questionsData[i].réponses.length; q++) {
            $(`.titre${i}`).append(`<p class="contenu">${questionsData[i].réponses[q]}</p>`)   
        }
        $(".contenu").hide();
        $(".titleClick").on("click", function () {
            $(".contenu").hide(500)
            $(this).parent().find(".contenu").show();
        });
}
