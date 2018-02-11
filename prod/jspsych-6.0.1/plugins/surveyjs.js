/*
 * Example plugin template
 */

jsPsych.plugins["surveyjs"] = (function () {

	var plugin = {};

	plugin.info = {
		name: "surveyjs",
		parameters: {
			questions: {
				type: jsPsych.plugins.parameterType.COMPLEX, // INT, IMAGE, KEYCODE, STRING, FUNCTION, FLOAT
				default_value: []
			}
		}
	}

	plugin.trial = function (display_element, trial) {

		display_element.innerHTML = `<div  class="survey">
	  <div id="surveyElement"></div>
  </div>`;
		let survey = new Survey.Model({
			questions: trial.questions
		});

		survey.onComplete.add(function (result) {
			demographicsResponses = result.data;
			$('#surveyComplete').remove();
			$('#cmplt').css('display', 'inherit');
			// end trial
			jsPsych.finishTrial({
				response: demographicsResponses
			});
		});

		$("#surveyElement").Survey({
			model: survey
		});
		survey.showCompletedPage = false;

	};

	return plugin;
})();

// let demographicsResponses = {};
// let demographicsTrial = {
// 	type: 'external-html',
// 	url: "./demographics.html",
// 	cont_btn: 'cmplt',
// 	// force_refresh: true,
// 	on_load: function () {
// 		waitForElement('#surveyElement', () => {
// 			let survey = new Survey.Model({
// 				questions: [
// 					{ type: "radiogroup", name: "gender", isRequired: true, title: "What is your gender?", choices: ["Male", "Female", "Other", "Perfer not to say"] },

// 					{ type: "radiogroup", name: "native", isRequired: true, title: "Are you a native English speaker", choices: ["Yes", "No"] },
// 					{ type: "text", name: "native language", visibleIf: "{native}='No'", title: "Please indicate your native language or languages:" },

// 					{ type: "text", name: "languages", title: "What other languages do you speak?" },

// 					{ type: "text", name: "age", title: "What is your age?", width: "auto" },

// 					{ type: "radiogroup", name: "degree", isRequired: true, title: "What is the highest degree or level of shcool you have completed/ If currently enrolled, highest degree received.", choices: ["Less than high school", "High school diploma", "Some college, no degree", "associates|Associate's degree", "bachelors|Bachelor's degree", "masters|Master's degree", "PhD, law, or medical degree", "Prefer not to say"] },
// 					{ type: "text", name: "favorite hs subject", visibleIf: "{degree}='Less than high school' or {degree}='High school diploma' or {degree}='Some college, no degree'", title: "What was your favorite subject in high school?" },
// 					{ type: "text", name: "college", visibleIf: "{degree}='associates' or {degree}='bachelors' or {degree}='masters' or {degree}='PhD, law, or medical degree'", title: "What did you study in college?" },
// 					{ type: "text", name: "grad", visibleIf: "{degree}='masters' or {degree}='PhD, law, or medical degree'", title: "What did you study in graduate school?" },
// 				]
// 			});
// 			survey.showNavigationButtons = false;

// 			survey.onComplete.add(function (result) {
// 				demographicsResponses = result.data;
// 				$('#surveyComplete').remove();
// 				$('#cmplt').css('display', 'inherit');
// 			});

// 			$("#surveyElement").Survey({
// 				model: survey
// 			});
// 			// survey.showCompletedPage = false;
// 			survey.completedHtml = '<h4>Submitted! Click on the button below to finish the experiment.</h4>'
// 			waitForElement('#surveyComplete', () => {
// 				$('#surveyComplete').on('click', () => {
// 					survey.completeLastPage();
// 				})
// 				$('#surveyComplete').on('click', () => {
// 					console.log('ehllo')
// 				})
// 			})
// 		})
// 	},