jsPsych.plugins['jspsych-blurry-word'] = (function(){

    var plugin = {};

    jsPsych.pluginAPI.registerPreload('image-slider-response', 'stimulus', 'image');


    plugin.info = {
        name: 'jspsych-blurry-word',
        description: '',
        parameters: {
            // Sets up the target stimulus
            target_stimulus: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Fixed stimulus',
                default: undefined,
                description: 'The image to be displayed but not adjusted'
            },
            // Sets up the test stimulus
            test_stimulus: {
                type: jsPsych.plugins.parameterType.IMAGE,
                pretty_name: 'Stimulus',
                default: undefined,
                description: 'The image to be displayed'
            },
            // Sets up the fixation target
            include_fixation: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Include fixation?',
                default: undefined,
                description: 'Whether to include the fixation target in the display'
            },
            purpose: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Is this a practice or test trial?',
                default: 'test',
                description: 'Whether the trial is practice ("practice") or experimental ("test")'
            },
            min: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Min slider',
                default: 0,
                description: 'Sets the minimum value of the slider.'
            },
            max: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Max slider',
                default: 10,
                description: 'Sets the maximum value of the slider',
            },
            start: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Slider starting value',
                default: 5,
                description: 'Sets the starting value of the slider',
            },
            step: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Step',
                default: .1,
                description: 'Sets the step of the slider'
            },
            labels: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name:'Labels',
                default: ['', ''],
                array: true,
                description: 'Labels of the slider.',
            },
            button_label: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button label',
                default:  'Continue',
                array: false,
                description: 'Label of the button to advance.'
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: null,
                description: 'Any content here will be displayed below the slider.'
            },
            stimulus_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Stimulus duration',
                default: null,
                description: 'How long to hide the stimulus.'
            },
            trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Trial duration',
                default: null,
                description: 'How long to show the trial.'
            },
            response_ends_trial: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Response ends trial',
                default: true,
                description: 'If true, trial will end when user makes a response.'
            }
        }
    }

    plugin.trial = function(display_element, trial) {

        var html = '<div id="jspsych-image-slider-response-wrapper" style="margin: 0px 0px; position: relative;">';
        // Prepare the click reminder for no target practice trials
        html += '<div id=click-reminder style="visibility: hidden">'
        + '<p>Remember to click on the area between the two letter strings '
        + 'to go to the next pair.'
        + '</p>'
        + '</div>';

        // Display the fixed target stimulus
        html += '<div id="jspsych-image-slider-response-target_stimulus">'
        + '<img id="targetimg" src="' + trial.target_stimulus + '">'
        + '</div>'
        // Display the "Next" button (either fixation target or empty)
        + '<button id="jspsych-image-slider-response-next"'; 
        if (trial.include_fixation) {
            html += 'class="blur target jspsych-btn">';
        } else {            
            html += 'class="blur notarget jspsych-btn">';
        };
        html += '<div style="z-index:101">'
        + '<img src="fixationcrosses/fixsmaller.png">'
        + '</div>'
        + '</button>'
        // Display the adjustable test stimulus with 5px blur
        + '<div id="jspsych-image-slider-response-stimulus">'
        + '<img id="testimg" src="' + trial.test_stimulus + '" style="blur: 5px">'
        + '</div>'
        // Display the response slider with the inputted specifications
        + '<div class="jspsych-image-slider-response-container"' 
        + 'style="position:relative;">'
        + '<input type="range" value="' + trial.start + '"min="' + trial.min 
        + '"max="' + trial.max + '" step="' + trial.step 
        + '"style="width: 100%;" id="jspsych-image-slider-response-response">'
        + '</input>'
        + '<div>';
        /* Label the slider with the desired number of steps. The labels are 
            placed at the centers of contiguous bins
        */
        for(var j=0; j < trial.labels.length; j++){
            // Calculate width of space between labels
            var width = 100 / (trial.labels.length - 1); 
            /* Calculate the "left_offset" (starting position measured from the 
                left end of the slider) of the label with zero-indexed number 
                j as the label number times the label-space width minus half 
                the width. */
            var left_offset = j * width - width / 2; 
            html += '<div style="display: inline-block; position: absolute;' 
            + 'left:' + left_offset + '%; text-align: center; width: ' 
            + width + '%;">'
            + '<span style="text-align: center; font-size: 80%;">'
            + trial.labels[j] 
            + '</span>'
            + '</div>';
        };
        html += '</div>';

        // Add all the HTML we've prepared to the trial display and close divs
        display_element.innerHTML = html;
        + '</div>';
        + '</div>';
        + '</div>';
        + '</div>';

        // If there is a trial prompt, add it to the trial display --- this seems off, why are we adding it to the html variable after adding that variable's contents to display_element.innerHTML
        if (trial.prompt !== null){
            html += trial.prompt;
        }

        // Set up RT and response data collection
        var response = [];
        var response_history = [];

        /* Pass in the targetBlur parameter from the timeline to apply blurring 
            to the static stimulus (the words come unblurred) */
        // Blur the target image (id "targetimg")
        document.querySelector("#targetimg").style.filter = "blur(" + trial.targetBlur + "px)";
        // Set starting test word blur to 5px (average of all test blur levels)
        document.querySelector("#testimg").style.filter = "blur(" + 5 + "px)";
        // Record information each time the participant moves the slider
        display_element.querySelector('#jspsych-image-slider-response-response').addEventListener('mousemove', function() {
            // Set the blur response to the value of the slider stored as a float
            response = parseFloat(display_element.querySelector('#jspsych-image-slider-response-response').value);
            rt = performance.now();
            // Update the blur of the test image
            document.querySelector("#testimg").style.filter = "blur("+ String(response) + "px)";
            // Add the present slider setting to the stored response history if...
            // ...it's the result of the participant's first adjustment in this trial...
            if (response_history.length === 0) {
                response_history.push([response, rt]);
            } else { // ...or if it is at least a slider unit more extreme than the previous response
                last_response = response_history[response_history.length - 1][0];
                if (Math.abs(response - last_response) > 0.5) {
                    response_history.push([response, rt]);
                };
            };
        });

        /* During the practice trials in the "no target" version of the task,
            remind participants to click in the middle of the screen to 
            advance if they click elsewhere */
        function toggleMessage() {
            // Display reminder message and highlight the clickable zone
            display_element.querySelector('#click-reminder').style.visibility = "visible";
            display_element.querySelector('button.notarget').style.backgroundColor = "#fff675";

        }; 
        if (trial.include_fixation === false && trial.purpose === "practice") {
            // Get all the divs in which clicking should activate the message
            var elements = display_element.querySelectorAll('#jspsych-image-slider-response-wrapper > div:not(#jspsych-image-slider-response-next)');
            for (element of elements) {
                element.addEventListener('click', toggleMessage);
            };
        }; 


        /* When the participant clicks the "next" button, record their final 
            response and RT */
        display_element.querySelector('#jspsych-image-slider-response-next').addEventListener('click', function() {
            /* Get the time of the click to the "next" button and calculate the 
                RT as time at end minus time at start */
            var endTime = performance.now();
            /* Store the response (as a float, for consistency with the above) 
                and RT */
            response.rt = endTime - startTime;
            response.response = parseFloat(display_element.querySelector('#jspsych-image-slider-response-response').value);
            // Reset click reminder message 
            /* If the trial is supposed to end when the participant responds, 
                end it */
            if(trial.response_ends_trial){
                end_trial();
            } else { // Otherwise, disable the "next" button
                display_element.querySelector('#jspsych-image-slider-response-next').disabled = true;
            };
        });


        // FUNCTION TO END THE TRIAL WHEN IT IS TIME
        function end_trial(){
            jsPsych.pluginAPI.clearAllTimeouts();

            // Save data
            var trialdata = {
                "target_stimulus": trial.target_stimulus,
                "test_stimulus": trial.test_stimulus,
                "target_blur": trial.targetBlur,
                "blur_rt": response.rt,
                "blur_response": response.response,
                "blur_response_rt_history": response_history
            };

            display_element.innerHTML = '';

            // Advance to next trial
            jsPsych.finishTrial(trialdata);
        }

        // End the trial after a certain amount of time elapses, if desired
        // Display stimulus for a limited time, if desired
        if (trial.stimulus_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
                display_element.querySelector('#jspsych-image-slider-response-stimulus').style.visibility = 'hidden';
            }, trial.stimulus_duration);
        }

        // End the trial after a certain amount of time elapses, if desired
        if (trial.trial_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
                end_trial();
            }, trial.trial_duration);
        }

        // Record start time for trial
        var startTime = performance.now();
    };


    return plugin;

})();
