/**
 * jspsych-survey-likert
 * a jspsych plugin for measuring items on a likert scale
 *
 * Josh de Leeuw (March 2013)
 * Updated October 2013
 * 
 * parameters:
 *      questions: array of arrays. inner arrays are arrays of strings, where each string represents a prompt
 *                  for the user to respond to.
 *      labels: array of arrays of arrays. inner most arrays are label markers for the slider, e.g. ["Strongly Disagree", "Neutral", "Strongly Agree"]. 
 *              need one inner array for every question that is part of the trial. middle arrays group questions together.
 *      intervals: array of arrays. inner arrays are how many different responses the user can select from, e.g. 5, one for each question.
 *      show_ticks: graphically show tick marks on the slider bar to indicate the response levels.
 *      data: optional data object
 *
 */

(function($) {
    jsPsych['survey-likert'] = (function() {

        var plugin = {};

        plugin.create = function(params) {
            var trials = [];
            for (var i = 0; i < params.questions.length; i++) {
                trials.push({
                    type: "survey-likert",
                    questions: params.questions[i],
                    labels: params.labels[i],
                    intervals: params.intervals[i],
                    show_ticks: (typeof params.show_ticks === 'undefined') ? true : params.show_ticks,
                    data: (typeof params.data === 'undefined') ? {} : params.data[i]
                });
            }
            return trials;
        };

        plugin.trial = function(display_element, block, trial, part) {

            // add likert scale questions
            for (var i = 0; i < trial.questions.length; i++) {
                // create div
                display_element.append($('<div>', {
                    "id": 'jspsych-survey-likert-' + i,
                    "class": 'jspsych-survey-likert-question'
                }));

                // add question text
                $("#jspsych-survey-likert-" + i).append('<p class="jspsych-survey-likert-text survey-likert">' + trial.questions[i] + '</p>');

                // create slider
                $("#jspsych-survey-likert-" + i).append($('<div>', {
                    "id": 'jspsych-survey-likert-slider-' + i,
                    "class": 'jspsych-survey-likert-slider jspsych-survey-likert'
                }));
                $("#jspsych-survey-likert-slider-" + i).slider({
                    value: Math.ceil(trial.intervals[i] / 2),
                    min: 1,
                    max: trial.intervals[i],
                    step: 1
                });

                // show tick marks
                if (trial.show_ticks) {
                    $("#jspsych-survey-likert-" + i).append($('<div>', {
                        "id": 'jspsych-survey-likert-sliderticks' + i,
                        "class": 'jspsych-survey-likert-sliderticks jspsych-survey-likert',
                        "css": {
                            "position": 'relative'
                        }
                    }));
                    for (var j = 1; j < trial.intervals[i] - 1; j++) {
                        $('#jspsych-survey-likert-slider-' + i).append('<div class="jspsych-survey-likert-slidertickmark"></div>');
                    }

                    $('#jspsych-survey-likert-slider-' + i + ' .jspsych-survey-likert-slidertickmark').each(function(index) {
                        var left = (index + 1) * (100 / (trial.intervals[i] - 1));
                        $(this).css({
                            'position': 'absolute',
                            'left': left + '%',
                            'width': '1px',
                            'height': '100%',
                            'background-color': '#222222'
                        });
                    });
                }

                // create labels for slider
                $("#jspsych-survey-likert-" + i).append($('<ul>', {
                    "id": "jspsych-survey-likert-sliderlabels-" + i,
                    "class": 'jspsych-survey-likert-sliderlabels survey-likert',
                    "css": {
                        "width": "100%",
                        "margin": "10px 0px 0px 0px",
                        "padding": "0px",
                        "display": "block",
                        "position": "relative"
                    }
                }));

                for (var j = 0; j < trial.labels[i].length; j++) {
                    $("#jspsych-survey-likert-sliderlabels-" + i).append('<li>' + trial.labels[i][j] + '</li>');
                }

                // position labels to match slider intervals
                var slider_width = $("#jspsych-survey-likert-slider-" + i).width();
                var num_items = trial.labels[i].length;
                var item_width = slider_width / num_items;
                var spacing_interval = slider_width / (num_items - 1);

                $("#jspsych-survey-likert-sliderlabels-" + i + " li").each(function(index) {
                    $(this).css({
                        'display': 'inline-block',
                        'width': item_width + 'px',
                        'margin': '0px',
                        'padding': '0px',
                        'text-align': 'center',
                        'position': 'absolute',
                        'left': (spacing_interval * index) - (item_width / 2)
                    });
                });
            }

            // add submit button
            display_element.append($('<button>', {
                'id': 'jspsych-survey-likert-next',
                'class': 'jspsych-survey-likert'
            }));
            $("#jspsych-survey-likert-next").html('Submit Answers');
            $("#jspsych-survey-likert-next").click(function() {
                // measure response time
                var endTime = (new Date()).getTime();
                var response_time = endTime - startTime;

                // create object to hold responses
                var question_data = {};
                $("div.jspsych-survey-likert-slider").each(function(index) {
                    var id = "Q" + index;
                    var val = $(this).slider("value");
                    var obje = {};
                    obje[id] = val;
                    $.extend(question_data, obje);
                });

                // save data
                block.writeData($.extend({}, {
                    "trial_type": "survey-likert",
                    "trial_index": block.trial_idx,
                    "rt": response_time
                }, question_data, trial.data));

                display_element.html('');

                // next trial
                block.next();
            });

            var startTime = (new Date()).getTime();
        };

        return plugin;
    })();
})(jQuery);
