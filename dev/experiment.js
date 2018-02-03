// Function Call to Run the experiment
function runExperiment(trials, subjCode, questions, workerId, assignmentId, hitId) {
    let timeline = [];

    // Data that is collected for jsPsych
    let turkInfo = jsPsych.turk.turkInfo();
    let participantID = makeid() + 'iTi' + makeid()

    jsPsych.data.addProperties({
        subject: participantID,
        condition: 'explicit',
        group: 'shuffled',
        workerId: workerId,
        assginementId: assignmentId,
        hitId: hitId
    });

    // sample function that might be used to check if a subject has given
    // consent to participate.
    var check_consent = function (elem) {
        if ($('#consent_checkbox').is(':checked')) {
            return true;
        }
        else {
            alert("If you wish to participate, you must check the box next to the statement 'I agree to participate in this study.'");
            return false;
        }
        return false;
    };


    // declare the block.
    var consent = {
        type: 'html',
        url: "./consent.html",
        cont_btn: "start",
        check_fn: check_consent
    };

    // timeline.push(consent);

    let welcome_block = {
        type: "text",
        cont_key: ' ',
        text: `<h1>Easy-To_Adapt Task</h1>
        <p class="lead">Welcome to the experiment. Thank you for participating! Press SPACE to begin.</p>`
    };

    timeline.push(welcome_block);

    let continue_space = "<div class='right small'>(press SPACE to continue)</div>";

    let instructions = {
        type: "instructions",
        key_forward: ' ',
        key_backward: 8,
        pages: [
            `<p class="lead">Insert Instructions
            </p> ${continue_space}`,
        ]
    };

    timeline.push(instructions);

    let trial_number = 1;
    let num_trials = trials.length;
    document.trials = trials;

    // Pushes each audio trial to timeline
    for (let trial of trials) {

        // Empty Response Data to be sent to be collected
        let response = {
            workerId: subjCode,
            trialNum: trial_number,
            filename: trial.filename,
            fileType: trial.fileType,
            correctAnswer: trial.corectAnswer,
            choices: trial.choices,
            isRight: false,
            expTimer: -1,
            chosen: -1,
            rt: -1,
            plays: -1
        }
        let stimHTML = '';
        if (trial.fileType == 'video') {
            stimHTML = `
            <div class="row center-xs center-sm center-md center-lg center-block">
                <h1>${trial.word_to_rate}</h1>
            </div>`;
        }

        let html = `
        <canvas width="800px" height="25px" id="bar"></canvas>
        <div class="progress progress-striped active">
            <div class="progress-bar progress-bar-success" style="width: ${trial_number / num_trials * 100}%;"></div>
        </div>
        <h6 style="text-align:center;">Trial ${trial_number} of ${num_trials}</h6>
        `+ stimHTML + ``;

        let questions = ['<h4>Which of the following words best describes the above?</h4>'];
        let required = [true];
        let options = [trial.choices]

        // Picture Trial
        let wordTrial = {
            type: 'survey-multi-choice',
            preamble: html,
            questions: questions,
            options: options,
            required: required,
            horizontal: true,

            // TODO: Switch to SurveyJS (switch between checkboxes and radio buttons)
            on_finish: function (data) {
                console.log(JSON.parse(data.responses));
                data.responses = JSON.parse(data.responses);
                response.chosen = data.responses.Q0;
                response.rt = data.rt;
                response.expTimer = data.time_elapsed / 1000;
                response.isRight = response.chosen == trial.correctAnswer;
                response.plays = document.plays;

                // POST response data to server
                $.ajax({
                    url: 'http://' + document.domain + ':' + PORT + '/data',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(response),
                    success: function () {
                        console.log(response);
                    }
                })
            }
        }
        timeline.push(wordTrial);
        trial_number++;
    };


    let questionsInstructions = {
        type: "instructions",
        key_forward: ' ',
        key_backward: 8,
        pages: [
            `<p class="lead">This is a filler for instructions for the questions.
            </p> ${continue_space}`,
        ]
    };
    timeline.push(questionsInstructions);

    let demographicsTrial = {
        type: 'html',
        url: "./demographics/demographics.html",
        cont_btn: "demographics-cmplt",
        check_fn: function () {
            if (demographicsIsCompleted()) {
                console.log(getDemographicsResponses());
                let demographics = Object.assign({ subjCode }, getDemographicsResponses());
                // POST demographics data to server
                $.ajax({
                    url: 'http://' + document.domain + ':' + PORT + '/demographics',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(demographics),
                    success: function () {
                    }
                })
                return true;
            }
            else {
                return false;
            }
        }
    };
    timeline.push(demographicsTrial);

    let endmessage = `
    <p class="lead">Thank you for participating! Your completion code is ${participantID}. Copy and paste this in 
    MTurk to get paid. If you have any questions or comments, please email jsulik@wisc.edu.</p>
    
    <h3>Debriefing </h3>
    <p class="lead">
    Thank you for your participation. The study is designed to collect information about the different ways 
    in which people typically represent thoughts in their mind. The responses will be used in the 
    development of a shorter questionnaire to assess differences in these representations. 
    </p>
    
    `


    let images = [];
    // add scale pic paths to images that need to be loaded
    images.push('img/scale.png');
    for (let i = 1; i <= 7; i++)
        images.push('img/scale' + i + '.jpg');

    jsPsych.pluginAPI.preloadImages(images, function () { startExperiment(); });
    document.timeline = timeline;
    function startExperiment() {
        jsPsych.init({
            default_iti: 0,
            timeline: timeline,
            fullscreen: FULLSCREEN,
            show_progress_bar: true,
            on_finish: function (data) {
                jsPsych.endExperiment(endmessage);
            }
        });
    }
}