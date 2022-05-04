"use strict"
let questions = JSON.parse(questionsJson);

let estSoumis;

$("#formInfoPersonnes").validate({
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
            datePlusPetite: true
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
            datePlusPetite: "La date doit être inférieur à celle d'aujourd'hui"
        },
        statut: "Veiller faire un choix"
    },
    submitHandler: function () {
        $("#formInfoPersonnes").hide();
        quiz();
        progressbar()
    },
    showErrors: function () {
        if (estSoumis) {
            const ul = $("<ul></ul>");
            $.each(errorList, function () {
                ul.append(`<li>${this.message}</li>`);
            });
            $("#affichageErreurs").html(ul);
            estSoumis = false;
        }
        this.defaultShowErrors();
    },
    invalidHandler: function () {
        estSoumis = true;
    }
    });
$.validator.addMethod(
    "datePlusPetite",
    function (value, element) {
        const dateActuelle = new Date();
        return this.optional(element) || dateActuelle >= new Date(value);
    },
);
jQuery.validator.addMethod(
    "alphanumeric",
    function (value, element) {
        return this.optional(element) || /^[\w.]+$/i.test(value);
    },
);

let index = 0
let quiz = () => {
    $(`#questions`).append(`<h2> ${index+1}-${questions[index].question} </h2>`);
    //Loop pour choix de réponse
    for (let r = 0; r < questions[index].réponses.length; r++) {
        let inputChoixReponse = `<input type=radio name=reponse${index} id=reponse${r} value=${r}>`
        let labelChoixReponse = `<label for=reponse${r}>${questions[index].réponses[r]}</label><br>`
        $(`#questions`).append(inputChoixReponse, labelChoixReponse);
    }
    //création bouton
    let btnSuivant = `<button type=button name=validReponse>Suivant</button>`
    let btnFin = `<button type=button name=validReponse>Terminer</button>`
    index != questions.length-1 ? $(`#questions`).append(btnSuivant) : $(`#questions`).append(btnFin)

    nextQuestion(index)
    index++
}

let nextQuestion = (index) => {
    $(`button[name=validReponse]`).on("click", function () {

        let checked = $(this).parent().find("input:checked");
        if (checked.length != 0) {
            if (index != questions.length - 1) {
                //insertion la réponse de l'utilisateur dans objet "questions"
                questions[index].repUtilisateur = checked.attr("value");
                $(`#questions`).html("")
                quiz()
                progressbar()
                
                //Dernière Questions
            } else {
                //insertion la réponse de l'utilisateur dans objet "questions"
                questions[index].repUtilisateur = checked.attr("value");

                $(`#questions`).html("")
                $("#progressbar").remove()
                $("#tableauResultat").removeClass("cache");
                nbrBonneRep()
                tableauResultat()
                createResultat()
            }
        }
    })
}
let indexProgress = 0
let progressbar = () => {
    indexProgress++
    $("#progressbar").progressbar({
        value: 100 / questions.length * indexProgress
    })
}

let bonneRep = 0;
let nbrBonneRep = () => {
    questions.forEach(function (q) {
        if (q.réponse == q.repUtilisateur) {
            q.verdictRep = "Correct"
            bonneRep++
        }else{
            q.verdictRep = "Erreur"}
    })
}

let createResultat = () => {
    //Calcul de la Date de Naissance
    let now = new Date();
    let past = new Date($('#date').val());

    let nowYear = now.getFullYear();
    let pastYear = past.getFullYear();
    let ageValue = parseInt(nowYear - pastYear);

    if (now.getMonth() < past.getMonth()) {
        ageValue -= 1
    } else if (now.getMonth() == past.getMonth()) {
        if (now.getDay() < past.getDay()) {
            ageValue -= 1
        }
    }
    let nomValue = $("#nom").val();
    let prenomValue = $("#prenom").val();
    let statutValue = $("option:checked").html();
    let nom = `<p>${nomValue}</p>`;
    let prenom = `<p>${prenomValue}</p>`;
    let age = `<p>${ageValue}</p>`;
    let statut = `<p>${statutValue}</p>`;
    let calculScore = Math.floor(bonneRep/questions.length*100)
    let score = `Votre Score : ${calculScore} %`;

    $("#infoUtilisateur").append(nom, prenom, age, statut, score);

    $( function() {
        $( "#modalResultat" ).dialog({
          modal: true,
          buttons: {
            Ok: function() {
              $( this ).dialog( "close" );
            }
          }
        });
      } );
    let reussite = "<p>Réussite</p>"
    let echec = "<p>Échec</p>"
    $("#modalResultat").append(calculScore >= 60 ? reussite : echec)


    let perPlus70 = `<p class="alert alert-success text-center">Your The Boss Dude!!!!!</p>`
    let per6070 = `<p class="alert alert-warning text-center">Hisssssss sur les fesses</p>`
    let perMoin60 = `<p class="alert alert-danger text-center">T'es capable de faire mieux El Gros</p>`
    if(calculScore < 60){
        console.log(60);
        $("#alertResultat").append(perMoin60)
    }else if(calculScore){
        console.log(75);
        $("#alertResultat").append(per6070)
    }else{
        $("#alertResultat").append(perPlus70)
    }

}

let tableauResultat = () => {
    $('#myTable').DataTable({
        data: questions,
        columns: [{
                data: "numero"
            },
            {
                data: "question"
            },
            {
                data: "verdictRep"
            },
        ]
    });
}

$(".contenu").hide();
$(".titre").on("click", function () {
    $(".contenu").hide(500)
    $(this).parent().find(".contenu").show();
});





// quiz = () => {
//     for (let i = 0; i < questions.length; i++) {
//         $("#questions").append(`<div id=question${i}></div>`)
//         $(`#question${i}`).append(`<h2> ${i+1}-${questions[i].question} </h2>`);
//         for (let r = 0; r < questions[i].réponses.length; r++) {

//             $(`#question${i}`).append(`<input type=radio name=reponse${i} id=reponse${i}.${r} value=${r}>`);
//             $(`#question${i}`).append(`<label for=reponse${i}.${r}>${questions[i].réponses[r]}</label><br>`);
//         }
//         if (i == questions.length - 1) {
//             $(`#question${i}`).append(`<button type=button name=validReponse${i} id=quizEnd>Terminer</button>`);
//         } else {
//             $(`#question${i}`).append(`<button type=button name=validReponse${i}>Valider</button>`);
//         }
//         if (i == 0) {
//             $(`#question${i}`).show();
//         } else {
//             $(`#question${i}`).hide();
//         }
//         $(`button[name=validReponse${i}]`).on("click", function () {
//             let checked = $(this).parent().find("input:checked");

//             if (checked.length != 0) {
//                 if ($(this).attr("id") == "quizEnd") {
//                     questions[i].repUtilisateur = checked.attr("value");
//                     $(this).parent().hide();

//                     questions.forEach(function (q) {

//                         if (q.réponse == q.repUtilisateur) {
//                             bonneRep ++            
//                         }
//                     });
//                     $("#tableauResultat").removeClass("cache");
//                     $("#progressbar").hide();
//                     createResultat()
//                     tableauResultat()

//                 } else {
//                     questions[i].repUtilisateur = checked.attr("value");
//                     $(this).parent().hide();
//                     $(this).parent().next().show();
//                     progressbar();   
//                 }                   
//             }
//         });   
//     }
// };                 


// $("#test").append("<p>allo</p>", "<p>yooo</p>", "<p>yooo2</p>", "<p>yooo3</p>")



// if(index != questions.length -1){
//     $(`#question${index}`).append(`<button type=button name=validReponse>Suivant</button>`);
// //Dernière
// }else{
//     $(`#question${index}`).append(`<button type=button name=validReponse>Terminer</button>`);
// }




// $(`button[name=validReponse]`).on("click", function (){
//     let checked = $(this).parent().find("input:checked");
//     if(checked.length != 0){           
//         nextQuestion(index, checked);
//     }
// })