$(document).load(function() { $('noscript').hide(); });

$(document).ready(function () {

    var ua = navigator.userAgent,
        checker = {
            iphone: ua.match(/(iPhone|iPod|iPad)/),
            blackberry: ua.match(/BlackBerry/),
            android: ua.match(/Android/)
        };
		
    var mobile = (getParameterByName("m") == "0") ? false : true;

    if ((checker.iphone || checker.ipod || checker.ipad || checker.blackberry || checker.android) && mobile) {

        var location = window.location.href,
            locTemp,
			locIndex = location.indexOf(".");
        
		locTemp = location.substr(locIndex);
        location = "http://webstreamer" + locTemp + "?m=0";

        $("#player").hide();

        $('body').html('<div style="text-align:center; width:450px; height:315px;"><a href="' + location + '" target="_blank"><img src="https://mediastreamer.doit.wisc.edu/uwli-ltc/media/storybook_plus/img/view_on_full_site.png" width="450px" height="315px" alt="Launch Presentation in New Window" border="0" /></a></div>');

    } else {

        // global variable declarations
        var pFontSize = 14,
            pLineHeight = 18,
            h1FontSize = 22,
            h1LineHeight = 26,
            h2FontSize = 20,
            h2LineHeight = 24,
            h3h4h5h6FontSize = 18,
            h3h4h5h6LineHeight = 22,
            firstList = true,
            topicCount = 0,
            counter = 1,
            previousIndex = 0,
            tocIndex = 0,
            audioPlaying = false,
            XMLData,
            topicType,
            topicSrc,
            slideImgFormat,
            audioPlayer,
            imgPath,
            imgCaption, quiz, quizArray, found = false,
            qNum = 0;

        // AJAX setup
        $.ajaxSetup({
            url: 'assets/topic.xml',
            type: 'GET',
            dataType: 'xml',
            accepts: 'xml',
            content: 'xml',
            contentType: 'xml; charset="utf-8"',
            cache: false
        });

        // Encoding XML data
        $.ajax({
            encoding: 'UTF-8',
            beforeSend: function (xhr) {
                xhr.overrideMimeType("xml; charset=utf-8");
                xhr.setRequestHeader("Accept", "text/xml");
            },
            success: function (xml) {
				
                setupXML(xml);
				
            },
            error: function (xhr, exception) {
                displayError(xhr.status, exception);
            }
        });

        // XML Setup function
        function setupXML(xml) {

            var SETUP = $(xml).find('setup');
            var TOPIC = $(xml).find('topic');
            var profile = $(xml).find('profile').text();
            var lessonTitle = (SETUP.find('lesson').text().length <= 0) ? 'Lesson name is not specified' : SETUP.find('lesson').text();
            var instructor = (SETUP.find('instructor').text().length <= 0) ? 'Instructor is not specified' : '<a class="instructorP" href="#profile">' + SETUP.find('instructor').text() + '</a>';
            var length = (SETUP.find('length').text().length <= 0) ? '' : SETUP.find('length').text();

            slideImgFormat = (SETUP.find('slideImgFormat').text().length <= 0) ? 'png' : SETUP.find('slideImgFormat').text();
            XMLData = $(xml);

            $('#lessonTitle').html(lessonTitle);
            $('#instructorName').html(instructor);
            $('#bio').html('<p><strong>' + SETUP.find('instructor').text() + '</strong></p>' + profile);

            topicSrc = new Array();
            quizArray = new Array();

            // loop through each topic node to get lesson topics
            // display each topic to web page as well
            TOPIC.each(function () {

                var topicTitle = $(this).attr('title');

                topicSrc[topicCount] = $(this).attr('src');

                if (firstList === true) {

                    $('#selectable').html('<li class="ui-widget-content" title="' + topicTitle + '">' + '<div style="width:10%;padding:0px 1%;text-align:right;float:left;">' + (((topicCount + 1) < 10) ? '0' + (topicCount + 1) : (topicCount + 1)) + '.</div><div class="title" style="width:86%;padding:0px 1%;float:left;">' + topicTitle + '</div></li>');

                    firstList = false;

                } else {

                    $('#selectable').append('<li class="ui-widget-content" title="' + topicTitle + '">' + '<div style="width:10%;padding:0px 1%;text-align:right;float:left;">' + (((topicCount + 1) < 10) ? '0' + (topicCount + 1) : (topicCount + 1)) + '.</div><div class="title" style="width:86%;padding:0px 1%;float:left;">' + topicTitle + '</div></li>');

                }

                if (topicSrc[topicCount] === "quiz") {

                    quiz = new Object;
                    quiz.id = topicCount;
                    quiz.type = XMLData.find('topic:eq(' + topicCount + ')').find('quiz').attr('type');
                    quiz.question = XMLData.find('topic:eq(' + topicCount + ')').find('quiz').find('question').text();

                    if (XMLData.find('topic:eq(' + topicCount + ')').find('quiz').find('choice').text() != "") {
                        quiz.choice = parseSelects(XMLData.find('topic:eq(' + topicCount + ')').find('quiz').find('choice').text());
                        quiz.wrongFeedback = parseSelects(XMLData.find('topic:eq(' + topicCount + ')').find('quiz').find('wrongFeedback').text());
                    } else {
	                    quiz.wrongFeedback = XMLData.find('topic:eq(' + topicCount + ')').find('quiz').find('wrongFeedback').text();
                    }

                    quiz.answer = parseSelects(XMLData.find('topic:eq(' + topicCount + ')').find('quiz').find('answer').text());
                    quiz.stuAnswer = "";
                    quiz.correct = false;
                    //quiz.incorrectIndex = 0;
                    quiz.correctFeedback = XMLData.find('topic:eq(' + topicCount + ')').find('quiz').find('correctFeedback').text();
                    quiz.taken = false;
                    quizArray.push(quiz);

                }

                topicCount++;

            });
			
			// set the document title to the lesson title
			$(document).attr('title', lessonTitle);
			
			// set the browser address bar without redirecting
			try {
				
				if (mobile) {
					
					var path = window.location.href;
					path = path.replace("index.html","");
					window.history.pushState("", "", path + "index.html");
					
				}
				
			} catch (e) {
				
				// for debug console purposes
				console.log(e + ' ---> No HTML history API support!');
				
			}

			// set the splash screen
            $("#storybook_plus_wrapper").append('<div id="splash_screen"><p>' + lessonTitle + '</p><p>' + ((SETUP.find('instructor').text().length <= 0) ? 'Instructor is not specified' : SETUP.find('instructor').text()) + '</p>' + ((length != 0) ? '<p>' + length + '</p>' : '') + '<p><button id="playBtn" class="btn btn-primary">PLAY</button></p></div>');

            $('#splash_screen').css("background-image", "url(assets/splash.jpg)");

            $('#splash_screen, #playBtn').bind("click", function () {
                // initalize the player
                initializePlayer();
                $("#splash_screen").hide();
            });

        }

        function parseSelects(ans) {

            var index = 0;
            var answerArray = new Array();
            var answer = ans,
                answerTemp, position;

            answer += "|";

            position = answer.indexOf('|');

            while (answer.indexOf('|') != -1) {

                answerTemp = answer.substring(0, position);
                answer = answer.substring(position + 1);

                position = answer.indexOf('|');

                answerArray[index] = answerTemp;
                index++;

            }
			
            return answerArray;
        }

        // initialized player function
        function initializePlayer() {

            $('#splash_screen, #playBtn').unbind("click");

            $("#player").show();

            //loadCookie();

            loadSlide(topicSrc[0], counter);
            $('#selectable li:first').addClass('ui-selected');

            // hide error message div tag
            $('#errorMsg').fadeOut();

            // enable table of content selection
            $('#selectable').selectable({

                stop: function () {

                    $(".ui-selected", this).each(function () {

                        tocIndex = $("#selectable li").index(this) + 1;

                    });

                    $('#slide').addClass('loading');

                    if (tocIndex != previousIndex) {

                        loadSlide(topicSrc[tocIndex - 1], tocIndex);
                        previousIndex = tocIndex;

                    }
                }

            });

            // load and set the instructor picture
            loadProfilePhoto();

            // enable fancy box for profile panel
            $("a#info, a.instructorP").fancybox({
                'closeClick': false,
                'autoDimensions': true,
                'overlayOpacity': .75,
                'overlayColor': '#000'
            });

            // display current font size
            $('#fontSizeIndicator').html(pFontSize);

            $('#note').before('<div id="ap"></div>');
            $('#ap').hide();

        } // end init

        // binding left and right click event
        $('#leftBtn').bind('click', function () {

            counter--;

            if (counter <= 0) {
                counter = topicCount;
            }

            $('#slide').addClass('loading');
            loadSlide(topicSrc[counter - 1], counter);

        });

        $('#rightBtn').bind('click', function () {

            counter++;

            if (counter > topicCount) {
                counter = 1;
            }

            $('#slide').addClass('loading');
            loadSlide(topicSrc[counter - 1], counter);

        });

        // binding increasing and decreasing font size buttons
        $('#fontMinusBtn').bind('click', function () {

            pFontSize -= 2;
            pLineHeight -= 2;

            h1FontSize -= 2;
            h1LineHeight -= 2;

            h2FontSize -= 2;
            h2LineHeight -= 2;

            h3h4h5h6FontSize -= 2;
            h3h4h5h6LineHeight -= 2;

            if (pFontSize <= 12) {

                pFontSize = 12;
                pLineHeight = 16;

            }

            if (h3h4h5h6FontSize <= 16) {

                h3h4h5h6FontSize = 16;
                h3h4h5h6LineHeight = 20;

            }

            if (h2FontSize <= 18) {

                h2FontSize = 18;
                h2LineHeight = 22;

            }

            if (h1FontSize <= 20) {

                h1FontSize = 20;
                h1LineHeight = 24;

            }

            $('#note, #note p').css({
                'font-size': pFontSize,
                'line-height': pLineHeight + 'px'
            });

            $('#note h1').css({
                'font-size': h1FontSize,
                'line-height': h2LineHeight + 'px'
            });

            $('#note h2').css({
                'font-size': h2FontSize,
                'line-height': h2LineHeight + 'px'
            });

            $('#note h3, #note h4, #note h5, #note h6').css({
                'font-size': h3h4h5h6FontSize,
                'line-height': h3h4h5h6LineHeight + 'px'
            });

            $('#fontSizeIndicator').html(pFontSize);

        });

        // font plus button
        $('#fontPlusBtn').bind('click', function () {

            pFontSize += 2;
            pLineHeight += 2;

            h1FontSize += 2;
            h1LineHeight += 2;

            h2FontSize += 2;
            h2LineHeight += 2;

            h3h4h5h6FontSize += 2;
            h3h4h5h6LineHeight += 2;

            if (pFontSize >= 28) {

                pFontSize = 28;
                pLineHeight = 32;

            }

            if (h3h4h5h6FontSize >= 30) {

                h3h4h5h6FontSize = 30;
                h3h4h5h6LineHeight = 34;

            }

            if (h2FontSize >= 32) {

                h2FontSize = 32;
                h3LineHeight = 36;

            }

            if (h1FontSize >= 34) {

                h1FontSize = 34;
                h1LineHeight = 38;

            }

            $('#note, #note p').css({
                'font-size': pFontSize,
                'line-height': pLineHeight + 'px'
            });

            $('#note h1').css({
                'font-size': h1FontSize,
                'line-height': h1LineHeight + 'px'
            });

            $('#note h2').css({
                'font-size': h2FontSize,
                'line-height': h2LineHeight + 'px'
            });

            $('#note h3, #note h4, #note h5, #note h6').css({
                'font-size': h3h4h5h6FontSize,
                'line-height': h3h4h5h6LineHeight + 'px'
            });

            $('#fontSizeIndicator').html(pFontSize);

        });

        // load selected slide
        function loadSlide(sn, sNum) {

            var currentNum, noteNum;
            //saveLocations(sNum);
            sNum = (sNum < 10) ? '0' + sNum : sNum;
            currentNum = Number(sNum) - 1;
            noteNum = Number(sNum) - 1;
			
			$('#slide').html('<div id="progressing"></div>');
			$('#progressing').fadeIn();

            if (sn.substring(0, sn.indexOf(":") + 1) == "image:") {

                var img = new Image();

                imgPath = 'assets/slides/' + sn.substring(sn.indexOf(":") + 1) + '.' + slideImgFormat;
                imgCaption = $('#selectable li .title').get(currentNum).innerHTML;

                $(img).load(function () {

                    $(this).hide();
                    $('#slide').removeClass('loading');
                    $('#slide').append('<a id="img" title="' + imgCaption + '"href="' + imgPath + '">');
                    $('#slide #img').html(img);
                    $('#slide').append('</a><div id="magnifyIcon"></div>');

                    $(this).fadeIn();

                    $('a#img').fancybox({
                        closeClick: true,
                        closeBtn: true,
                        autoSize: true
                    });

                    bindImgMagnify(true);

                }).error(function (error) {

                    $('#slide').html('<p><strong>Error</strong>: image not found. Image path: ' + imgPath + '</p><p>Total number of slides: ' + topicCount + '</p>');

                }).attr({
                    'src': imgPath,
                    'border': 0
                });


                // youtube
            } else if (sn.substring(0, sn.indexOf(":") + 1) == "youtube:") {

                bindImgMagnify(false);

                $('#slide').removeClass('loading');

                $('#slide').append('<iframe width="640" height="360" src="https://www.youtube.com/embed/' + sn.substring(sn.indexOf(":") + 1) + '?autoplay=1&rel=0" frameborder="0" allowfullscreen></iframe>');


                // video
            } else if (sn.substring(0, sn.indexOf(":") + 1) == "video:") {

                bindImgMagnify(false);

                $('#slide').append('<video controls="controls" autoplay="autoplay" preload="none" width="640" height="360"><source src="assets/video/' + sn.substring(sn.indexOf(":") + 1) + '.mp4" type="video/mp4" /><track src="assets/video/'+ sn.substring(sn.indexOf(":") + 1) +'.vtt" kind="subtitles" srclang="en" type="text/vtt" default="default"></track><object width="640" height="360" type="application/x-shockwave-flash" data="https://mediastreamer.doit.wisc.edu/uwli-ltc/media/storybook_plus/htmlPlayer/flashmediaelement.swf"><param name="movie" value="assets/htmlPlayer/flashmediaelement.swf" /><param name="flashvars" value="controls=true&file=assets/video/' + sn.substring(sn.indexOf(":") + 1) + '.mp4" /></object></video>');
				
				$('video').mediaelementplayer({
					defaultVideoWidth: 640,
					defaultVideoHeight: 360,
					startVolume: 0.8,
					loop: false,
					enableAutosize: true,
					features: ['playpause', 'progress', 'current', 'duration', 'tracks', 'volume', 'fullscreen'],
					alwaysShowControls: false,
					iPadUseNativeControls: false,
					iPhoneUseNativeControls: false,
					AndroidUseNativeControls: false,
					pauseOtherPlayers: true
				});
				
				
                // swf or interactive objects
            } else if (sn.substring(0, sn.indexOf(":") + 1) == "swf:") {

                bindImgMagnify(false);

                $('#slide').removeClass('loading');

                $('#slide').append('<object width="640" height="360" type="application/x-shockwave-flash" data="assets/swf/' + sn.substring(sn.indexOf(":") + 1) + '.swf"><param name="movie" value="assets/swf/' + sn + '.swf" /><p>Your web browser does not support Adobe Flash.</p></object>');

                // image slide with audio
            } else if (sn.substring(0, sn.indexOf(":") + 1) == "image-audio:") {

                var img = new Image();

                imgPath = 'assets/slides/' + sn.substring(sn.indexOf(":") + 1) + '.' + slideImgFormat;
                imgCaption = $('#selectable li .title').get(currentNum).innerHTML;

                $(img).load(function () {

                    $(this).hide();

                    $('#slide').removeClass('loading');
                    $('#slide').append('<a id="img" title="' + imgCaption + '"href="' + imgPath + '">');
                    $('#slide #img').html(img);
                    $('#slide').append('</a><div id="magnifyIcon"></div>');
                    $('#ap').html('<audio id="apc" src="assets/audio/' + sn.substring(sn.indexOf(":") + 1) + '.mp3" type="audio/mpeg" autoplay="autoplay" preload="none" controls="controls"><object width="640" height="360" type="application/x-shockwave-flash" data="https://mediastreamer.doit.wisc.edu/uwli-ltc/media/storybook_plus/htmlPlayer/flashmediaelement.swf"><param name="movie" value="assets/htmlPlayer/flashmediaelement.swf" /><param name="flashvars" value="controls=true&file=assets/audio/' + sn.substring(sn.indexOf(":") + 1) + '.mp3" /></object></audio>');

                    $(this).fadeIn();

                    $('a#img').fancybox({
                        closeClick: true,
                        closeBtn: true,
                        autoSize: true
                    });

                    bindImgMagnify(true);
				
					if (!audioPlaying) {
						$('#ap').show();
						audioPlayer = new MediaElementPlayer('#apc', {
							audioWidth: 640,
							audioHeight: 30,
							startVolume: 0.8,
							loop: false,
							enableAutosize: true,
							iPadUseNativeControls: false,
							iPhoneUseNativeControls: false,
							AndroidUseNativeControls: false,
							pauseOtherPlayers: true
						});

						audioPlaying = true;

						$('#note').height($('#note').height() - 30);
					}

                }).error(function (error) {

                    $('#slide').html('<p><strong>Error</strong>: image not found. Image path: ' + imgPath + '</p>');

                }).attr({
                    'src': imgPath,
                    'border': 0
                });

            } else if (sn == "quiz") {
				
				try {
               		setupQuiz(currentNum);
				} catch (e) {
					// for debug console purposes
					debugConsole.append('<li>'+e+'</li>');
				}

            } else {

                $('#slide').html("<p>ERROR!</p>");

            }

            // if audio is playing
            if (audioPlaying) {

                audioPlayer.pause();
                audioPlaying = false;
                $('#ap').hide();
                $('#note').height($('#note').height() + 30);

            }

            // load current slide note and update the slide number
            loadNote(noteNum);
            updateSlideNum(sNum);
			
			$('#progressing').fadeOut();

        }

        function loadNote(num) {

            var note = XMLData.find('topic:eq(' + num + ')').find('note').text();

            $('#note').html(note);

        }

        function loadProfilePhoto() {


            var img = new Image(),
                imgPath = 'assets/pic.jpg';

            $(img).load(function (e) {

                $('#photo').html('<img src="' + imgPath + '" alt="Instructor Photo" border="0" />');

            }).error(function (error) {

                $('#photo').html('<img src="assets/img/profile.png" width="200" height="300" alt="No Profile Photo" border="0" />');

            }).attr({
                'src': imgPath,
                'border': 0
            });

        }

        function updateSlideNum(num) {

            counter = num;

            $('#selectable li').each(function () {
                $(this).removeClass('ui-selected');
            });

            $('#selectable li:nth-child(' + Number(num) + ')').addClass('ui-selected');
            $("#currentStatus").html('Slide ' + num + ' of ' + ((topicCount < 10) ? "0" + topicCount : topicCount));

        }

        // function to bind magnify icon
        function bindImgMagnify(t) {
            if (t) {
                $('a#img, #magnifyIcon').bind('mouseenter', function () {
                    $("#magnifyIcon").show();
                });
                $('a#img, #magnifyIcon').bind('mouseleave', function () {
                    $("#magnifyIcon").hide();
                });
                $("#magnifyIcon").bind('click', function () {
                    $.fancybox.open({
                        href: imgPath,
                        title: imgCaption
                    });
                });
            } else {
                $('a#img, #magnifyIcon').unbind('mouseenter');
                $('a#img, #magnifyIcon').unbind('mouseleave');
                $("#magnifyIcon").unbind('click');
            }
        }

        function setupQuiz(num) {

            // loop to find the question
            while (!found || qNum == quizArray.length) {

                if (quizArray[qNum].id === num) {
                    found = true;
                } else {
                    qNum++;
                }

            }

            //console.log("Quiz ID: " + quizArray[qNum].id + "\nQuiz type: " + quizArray[qNum].type + "\nQuestion: " + quizArray[qNum].question + "\nChoice: " + quizArray[qNum].choice + "\nAnswer: " + quizArray[qNum].answer);

            // build the question
            $('#slide').append('<div id="quiz"><div class="header">Quiz ' + (qNum + 1) + ' of ' + quizArray.length + '</div>');

            // give the quiz a second to build up
            $('#quiz').hide();
            $('#quiz').fadeIn();

            if (!quizArray[qNum].taken) {

                $('#quiz').append('<div class="question">' + quizArray[qNum].question + '</div>');

                if (quizArray[qNum].type == "t/f") {

                    $('#quiz').append('<div class="answerArea"><label for="t"><input id="t" type="radio" name="tf" value="true" /> True</label><label for="f"><input type="radio" id="f" name="tf" value="false" /> False</label></div>');

                } else if (quizArray[qNum].type == "fib") {

                    $('#quiz').append('<div class="answerArea"><textarea id="saAns"></textArea></div>');

                } else if (quizArray[qNum].type == "mc") {

                    $('#quiz').append('<div class="answerArea">');
					
					for (var i = 0; i < quizArray[qNum].choice.length; i++) {
						$('.answerArea').append('<label for="'+i+'"><input id="'+i+'" type="radio" name="mc" value="'+quizArray[qNum].choice[i]+'" /> '+quizArray[qNum].choice[i]+'</label>');
					}
					
					$('#quiz').append('</div>');

                } else if (quizArray[qNum].type == "sa") {

                    $('#quiz').append('<div class="answerArea"><textarea id="saAns"></textArea></div>');

                } else {

                    $('#quiz').append('<div class="answerArea">ERROR!</div>');

                }

                $('#quiz').append('<div class="submitArea"><button id="check" rel="' + qNum + '">SUBMIT</button></div>');

                $('#check').click(function () {

                    var position = Number($(this).attr('rel'));
                    var stuAnswer;
                    var keepChecking = true;

                    if (quizArray[position].type == "t/f") {

                        stuAnswer = $('input:radio[name=tf]:checked').val();
                        if (stuAnswer == undefined) {
                            stuAnswer = "";
                        }

                    } else if (quizArray[position].type == "fib") {

                        stuAnswer = $.trim($('#saAns').val());

                    } else if (quizArray[position].type == "mc") {

                        stuAnswer = $('input:radio[name=mc]:checked').val();
                        quizArray[position].incorrectIndex = $('input:radio[name=mc]').index($('input:radio[name=mc]').filter(":checked"));
                        
                        if (stuAnswer == undefined) {
                            stuAnswer = "";
                        }

                    } else if (quizArray[position].type == "sa") {

                        stuAnswer = $.trim($('#saAns').val());

                    } else {
                        $.trim(stuAnswer);
                    }

                    if (stuAnswer != "") {

                        for (var i = 0; i < quizArray[position].answer.length; i++) {

                            if (quizArray[position].type == "fib") {
                                var index = 0;

                                while (keepChecking) {

                                    if (stuAnswer.toLowerCase() == quizArray[position].answer[i].toLowerCase()) {
                                        quizArray[position].correct = true;
                                        keepChecking = false;
                                    }

                                    index++;

                                    if (index > quizArray[position].answer.length) {
                                        quizArray[position].correct = false;
                                        keepChecking = false;
                                    }
                                }

                                index = 0;

                            } else if (quizArray[position].type == "t/f") {

                                if (stuAnswer.toLowerCase() == quizArray[position].answer[i].toLowerCase()) {
                                    quizArray[position].correct = true;
                                } else {
                                    quizArray[position].correct = false;
                                }

                            } else if (quizArray[position].type == "mc") {
                                if (stuAnswer.toLowerCase() == quizArray[position].answer[i].toLowerCase()) {
                                    quizArray[position].correct = true;
                                } else {
                                    quizArray[position].correct = false;
                                }

                            }

                        }

                        quizArray[position].stuAnswer = stuAnswer;
                        quizArray[position].taken = true;

                        showFeedback(position);

                    } else {
                        alert("Please answer the question before submitting.");
                    }

                });

            } else {

                showFeedback(qNum);

            }

            $('#slide').append('</div>');

            // reset counter and flag for next quextion
            qNum = 0;
            found = false;

        }

        function showFeedback(position) {
			
			var correctAnswer = "";
			
            $('#slide').html('<div id="quiz"><div class="header">Quiz ' + (position + 1) + ' of ' + quizArray.length + ' Feedback</div>');
			
			if (quizArray[position].type != "sa") {

				if (quizArray[position].correct) {
					$('#quiz').append('<p class="quizCorrect">Correct!</p>');
				} else {
					$('#quiz').append('<p class="quizIncorrect">Incorrect!</p>');
				}
			
			}

            $('#quiz').append('<div class="question">' + quizArray[position].question + '</div>');
            $('#quiz').append('<div class="feedback"><p><strong>Your anwser</strong>: ' + quizArray[position].stuAnswer + '</p>');
			
			for (var i = 0; i < quizArray[position].answer.length; i++) {
				
				if (i == quizArray[position].answer.length-1) {
					correctAnswer += quizArray[position].answer[i];
				} else {
					correctAnswer += quizArray[position].answer[i] + ", ";
				}
				
			}
			
            $('.feedback').append('<p><strong>Correct anwser</strong>: ' + correctAnswer + '</p></div>');
            
            if (quizArray[position].type != "sa") {

				if (quizArray[position].correct) {
					$('.feedback').append('<p><strong>Feedback:</strong> '+quizArray[position].correctFeedback+'</p>');
				} else {
					if (quizArray[position].type == "mc") {
					
						var feedback = quizArray[position].wrongFeedback[quizArray[position].incorrectIndex];
						if (typeof feedback === 'undefined') {
							feedback = "";
						}
					
						$('.feedback').append('<p><strong>Feedback:</strong> ' + feedback +'</p>');
					} else {
						$('.feedback').append('<p><strong>Feedback:</strong> '+quizArray[position].wrongFeedback+'</p>');
					}
				}
			
			}
            
        }

        /* function loadCookie() {
			var cookieCrumb = localStorage["cookieCrumb"];
			if (cookieCrumb) {
				if (cookieCrumb != 1) {
					$("#player").append('<div id="splash_screen"><p>Would you like to continue on where you left off at slide '+cookieCrumb+'?</p><p><button id="yesBtn" class="btn btn-primary">Yes</button> <button id="noBtn" class="btn btn-danger">No</button></p></div>');
					
					$("#splash_screen").fadeIn(500);
					
					$("#yesBtn").bind("click", function(){
						loadSlide(topicSrc[cookieCrumb-1], cookieCrumb);
						$("#splash_screen").hide();
					});
					
					$("#noBtn").bind("click", function(){
						loadSlide(topicSrc[0], counter);
						$('#selectable li:first').addClass('ui-selected');
						$("#splash_screen").hide();
					});
				} else {
					loadSlide(topicSrc[0], counter);
					$('#selectable li:first').addClass('ui-selected');
				}
			} else {
				loadSlide(topicSrc[0], counter);
				$('#selectable li:first').addClass('ui-selected');
			}
		}
		
		function saveLocations(loc){
    		localStorage["cookieCrumb"] = loc;
		} */

        // error handling function
        function displayError(status, exception) {

            var statusMsg, exceptionMsg; // hold status and error message

            // assign status
            if (status === 0) {
                statusMsg = '<strong>Error 0</strong> - Not connect. Please verify network.';
            } else if (status === 404) {
                statusMsg = '<strong>Error 404</strong> - Requested page not found.';
            } else if (status === 406) {
                statusMsg = '<strong>Error 406</strong> - Not acceptable error.';
            } else if (status === 500) {
                statusMsg = '<strong>Error 500</strong> - Internal Server Error.';
            } else {
                statusMsg = 'Unknow error';
            }

            // assign error
            if (exception === 'parsererror') {
                exceptionMsg = 'Requested XML parse failed.';
            } else if (exception === 'timeout') {
                exceptionMsg = 'Time out error.';
            } else if (exception === 'abort') {
                exceptionMsg = 'Ajax request aborted.';
            } else if (exception === "error") {
                exceptionMsg = 'HTTP / URL Error (most likely a 404 or 406).';
            } else {
                exceptionMsg = ('Uncaught Error.\n' + status.responseText);
            }

            $('#preloader').fadeOut(); // hide preloader div tag
            $('#player').fadeOut(); // hide player div tag
            $('#errorMsg').html('<p>' + statusMsg + '<br />' + exceptionMsg + '</p>'); // display error message

        }

    }

    function getParameterByName(name) {
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);

        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        if (results == null) {
            return "";
        } else {
            return decodeURIComponent(results[1].replace(/\+/g, " "));
        }
    }

});