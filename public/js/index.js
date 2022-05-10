"use strict"

let questionsData = JSON.parse(questionsJson)

let IndexCurrentQuestion = 0
let submitTrue

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
        $("#conteneurInfoPersonal").hide()
        $("#bloc-questions").removeClass("d-none")
        createQuizQuestion()
        progressbar()
    },
    showErrors: function (errorMap, errorList) {
        if (submitTrue) {
            const ul = $("<ul></ul>");
            $.each(errorList, function () {
                ul.append(`<li>${this.message}</li>`)
            })
            $("#errorSummary").html(ul)
            submitTrue = false
        }
        this.defaultShowErrors()
    },
    invalidHandler: function () {
        submitTrue = true
    }
    });
$.validator.addMethod(
    "validDate",
    function (value, element) {
        const dateCurrent = new Date()
        return this.optional(element) || dateCurrent >= new Date(value)
    },
);
jQuery.validator.addMethod(
    "alphanumeric",
    function (value, element) {
        return this.optional(element) || /^[\w.]+$/i.test(value)
    },
)

//----------------------------------------ProgressBar---------------------------------
let progressbar = () => {
    $("#progressbar").progressbar({
        value: 100 / questionsData.length * IndexCurrentQuestion
    })
}

let createQuizQuestion = () => {
    $(`#questions`).append(`<h2> ${IndexCurrentQuestion+1}-${questionsData[IndexCurrentQuestion].question} </h2>`)
    //---------------------------Choix de réponses----------------------------
    for (let r = 0; r < questionsData[IndexCurrentQuestion].réponses.length; r++) {
        let inputResponseChoice = `<input type=radio class=form-check-input name=reponse${IndexCurrentQuestion} id=reponse${r} value=${r}>`
        let labelResponseChoise = `<label  for=reponse${r}>${questionsData[IndexCurrentQuestion].réponses[r]}</label><br>`
        $(`#questions`).append(inputResponseChoice, labelResponseChoise)
    }
    //---------------------------Création boutons---------------------------
    let btnNext = `<div><button type=button name=validResponse>Suivant</button></div>`
    let btnEnd = `<div><button type=button name=validResponse>Terminer</button></div>`
    IndexCurrentQuestion != questionsData.length-1 ? $(`#questions`).append(btnNext) : $(`#questions`).append(btnEnd)

    $(`button[name=validResponse]`).on("click", function () {
        let checked = $(this).parent().parent().find("input:checked")

        if (checked.length != 0) {
            if (IndexCurrentQuestion  != questionsData.length) {
                //insertion de la réponse de l'utilisateur dans l'objet "questionsData"
                questionsData[IndexCurrentQuestion-1].resUser = checked.attr("value")
                //animation
                $("#questions").fadeOut(300).queue(function() {
                    $(`#questions`).html("")
                    $("#questions").fadeIn(800)
                    createQuizQuestion()
                    progressbar()
                    $(this).dequeue()
                 })
            } else {//Dernière Questions

                //insertion de la réponse de l'utilisateur dans l'objet "questionsData"
                questionsData[IndexCurrentQuestion-1].resUser = checked.attr("value")
                $(`#bloc-questions`).remove()
                $("#progressbar").remove()
                $("#pageResult").removeClass("d-none")
                pageResult()
            }
        }
    })
    IndexCurrentQuestion++
}

function pageResult(){
    modal()
    totalNbrRes()
    alertMessage()
    tabResult()
    accordeon()
    infoResult()
}

//----------------------------------Calcul Bonnes Réponses-----------------------------
function totalNbrRes() {
    let goodRes = 0;
    questionsData.forEach(function (q) {
        if (q.réponse == q.resUser) {
            q.verdictRes = "Correct"
            goodRes++;
        } else {
            q.verdictRes = "Erreur"
        }
    });
    return goodRes
}
//-------------------------Calcul du % de bonne réponses-----------------------
let calculScore = () => Math.floor(totalNbrRes()/questionsData.length*100)
//---------------------------------Modal-----------------------------------------
function modal(){
    let success = "<p>Réussite</p>"
    let fail = "<p>Échec</p>"
    $("#modalResultat").append(calculScore() >= 60 ? success : fail)
    $( function() {
        $( "#modalResultat" ).dialog({
          modal: true,
          buttons: {
            Ok: function() {
              $( this ).dialog( "close" )
            }
          }
        })
      })
}
//---------------------------------Message alert -----------------------------------
function alertMessage(){
    const score = calculScore()

    let scoreHight = `<p class="alert alert-success text-center">C'est toi le Boss Dude!!!!!</p>`
    let scoreMiddle = `<p class="alert alert-warning text-center">Hisssssss sur les fesses</p>`
    let scoreLow = `<p class="alert alert-danger text-center">T'es capable de faire mieux El Gros</p>`

    if(score < 60) $("#alertResult").append(scoreLow)
    else if(score >= 60 && score <=75) $("#alertResult").append(scoreMiddle)
    else $("#alertResult").append(scoreHight)
}

//----------------------------------Calcul de la Date de Naissance-----------------------------
function ageUser() {
    let dateNow = new Date();
    let dateEnterUser = new Date($('#date').val())

    let nowYear = dateNow.getFullYear()
    let userYear = dateEnterUser.getFullYear()
    let ageValue = parseInt(nowYear - userYear)

    if (dateNow.getMonth() < dateEnterUser.getMonth()) {
        ageValue -= 1
    } else if (dateNow.getMonth() == dateEnterUser.getMonth()) {
        if (dateNow.getDay() < dateEnterUser.getDay()) {
            ageValue -= 1
        }
    }
    return ageValue
}
//-------------------------------------Tableau question + resultat----------------------------------
function tabResult(){
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
//--------------------------------------------Accordéon---------------------------------------
function accordeon(){
    for (let i = 0; i < questionsData.length; i++) {
        $("#accordeon").append(`<div class='drawer${i}'></div>`)
        $(`.drawer${i}`).append(`<p class="titre${i}">${i+1}-${questionsData[i].question}</p>`)
        for (let q = 0; q < questionsData[i].réponses.length; q++) {
            $(`.titre${i}`).append(`<p class="contenu">${questionsData[i].réponses[q]}</p>`)   
        }
        $(".contenu").hide()
        $(`.titre${i}`).on("click", function () {
            $(".contenu").hide(500)
            $(this).parent().find(".contenu").show()
        })
    }
}
    //-------------------------------info + résusltat de l'utilisateur----------------------------
let infoResult = () => {
    let nomValue = $("#nom").val()
    let prenomValue = $("#prenom").val()
    let statutValue = $("option:checked").html()
    let nom = `<p>Nom : ${nomValue}</p>`
    let prenom = `<p>Prénom : ${prenomValue}</p>`
    let age = `<p>Age : ${ageUser()}</p>`
    let statut = `<p>Statut : ${statutValue}</p>`
    let score = `Votre Score : ${calculScore()} %`
    $("#infoUtilisateur").append(nom, prenom, age , statut, score)
}


