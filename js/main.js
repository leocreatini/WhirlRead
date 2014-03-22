$(document).ready(function(){
	//Get DOM elements
	var startB = document.getElementById("start");
	var textShow = document.getElementById("screen");
	var speedI = document.getElementById("speed");
	var textI = document.getElementById("text");
	//We'll use this to add extra delays to punctuations
	var punctuations = ".,;:!?-";

	//Set variables
	var time;
	var i;
	var word;
	var running;
	var trueLength;
	var flow;
	var curSpd;
	var exp;
	var lvl;
	var expToLvl;
	
	//Add 10% delay to words ending with punctuation
	var delayPercPunct = 0.15;
	
	//SAVING SYSTEM START
		$(function() {
			//Recalls last saved WPM.
			curSpd = parseInt( localStorage.getItem("wpm") );
			$("#speed").val(curSpd);
			//Recalls saved EXP, ensures Lvl is declared.
			if (localStorage.getItem("exp") > 0) {
				exp = parseInt( localStorage.getItem("exp") );
				lvl = parseInt( localStorage.getItem("lvl") );
				if ( isNaN(lvl) ){
					lvl = 1;
				}
				console.log("Loading save at: " + exp + "exp and Lvl: " + lvl);
			//If new user, sets starting EXP and Lvl.
			} else if (exp == undefined ){
				exp = 0;
				lvl = 1;
				localStorage.setItem("exp", exp);
				localStorage.setItem("lvl", lvl);
			}
			//If new user, sets WPM at 250.
			if ( $("#speed").val() == ""){
				$("#speed").val(250);
			}
		});
	//SAVING SYSTEM STOP

	//DRIVER START
	
		//Function that runs text and keeps running
		//Until there aren't any more words in array.
		var run = function() {
			word = padWord(text[i]);
			word = word.split("~");
			if(word[1]){text.splice(i+1, 0, word[1]);}
			if (i <= text.length) {
				running = setTimeout(run, ( 60000 / delayTime(time, word) ));
			}else{
				word = "";
			}
			textShow.innerHTML = word[0];
			i++;
			exp += 5;
		};
	
	//DRIVER STOP
	
	//BUTTONS START
	
		//Initiates the driver.
		$(".start").click(function() {
			var $this = $("#start");
			if( $("#text").val() != "" ){
				i = 0;
				time = speedI.value;
				text = textI.value.trim().replace(/(\r\n|\n|\r)/gm," ").replace(/\t/g, " ").replace(/\s{2,}/g, " ").split(" ");
				//Hides replay button and input.
				$this.removeClass("start").addClass("replay");
				$this.text("replay");
				$this.css("visibility", "hidden");
				$("#text").css("visibility", "hidden");
				$("#exp").text("Exp: " + commaSeparateNumber(exp) + " Level: " + lvl);
				run();
			}
		});
		
		//Replays and resets 'pause'
		$(".replay").click(function(){
			$(document).find('.resume').removeClass('resume').addClass('pause').text("pause");
			$("#start").css("visibility", "hidden");
			i = 0;
			
		});

		//Pauses and resumes playback.
		$("#pause").click(function() {
			var $this = $(this);
			if( i > 0 ) {
				if ($this.hasClass("pause")) {
					clearTimeout(running);
					$this.removeClass("pause").addClass("resume");
					$this.text("resume");
					$("#start").css("visibility", "visible");
				} else {
					$this.removeClass("resume").addClass("pause");
					$this.text("pause");
					run();
				}
			}
		});
		
		//Resets the system.
		$("#reset").click(function(){
			$("#start").text("start");
			$("#start").removeClass("replay").addClass("start");
			$("#pause").removeClass("resume").addClass("pause");
			$("#pause").text("pause");
			$("#text").val("");
			text = null;
			$("#screen").text("");
			$("#text").css('visibility', 'visible');
			$("#start").css('visibility', 'visible');
			$(".block").css({"width":"1px","height":"1px","margin-left":"-1px","margin-top":"-84px"});
			$(".block").fadeIn(0);
			i = 0;
		});
		
		//Adding keyboard hotkeys
		$(document).keydown(function(e) {
			curSpd = parseInt($("#speed").val());
			switch(e.which) {
				case 13:
					$("#start").click(); //Enter to start.
				break;
				case 37: // Left: Rewinds 20 words.
					if(i > 20){
						i -= 20;
					}else{
						i = 0;
					}
					break;
				case 38: // Up: Increases WPM by 25;
					$("#speed").val( (curSpd += 25) );
					time = speedI.value;
					localStorage.setItem("wpm", curSpd);
					break;
				case 39: // Right: Pauses/plays
					$("#pause").click();
					break;
				case 40: // Down: Decreases WPM by 25;
					$("#speed").val( (curSpd -= 25) );
					time = speedI.value;
					localStorage.setItem("wpm", curSpd);
					break;
				default: 
					return; // Exit this handler for other keys
			}
			e.preventDefault(); // prevent the default action (scroll / move caret)
		});
		
		//Hotkey to paste from clipboard to text area.
		//Green confirmation animation.
		$(document).bind('paste', function(e) {
			var data = e.originalEvent.clipboardData.getData('Text');
			$("#text").val("");
			$("#text").val(data);
			$(".block").css({"width": $("#text").width()+18 ,"height": $("#text").height()+18 ,"margin-left":"-8px","margin-top":"-94px"});
			$(".block").fadeOut(600);
		});

	//BUTTONS STOP
	
	//BEHAVIOR START
	
		//Listening for WPM adjustments, if user manually enters rate.
		$(document).mousemove(function(){
			time = speedI.value;
		});
		
		//Pauses when user leaves window, tabs out.
		$(window).blur(function(e) {
			if( $("#pause").hasClass("pause") ){
				$("#pause").click();
			}
		});
		
	//BEHAVIOR STOP
	
	//SPECIAL FUNCTIONS START
	
		//Replaces character with color.
		String.prototype.replaceAt=function(index, character, color) {
			return this.substr(0, index) + character.fontcolor(color) + this.substr(index+character.length);
		};
		
		//Adds dashes to prepare oversized string for splitting.
		String.prototype.splitThirteen=function(index, character) {
			return this.substr(0, (index+1)) + "~-" + this.substr(index+character.length);
		};

		//Accounts for punctuations and highlights letter.
		var padWord = function(word){
			if(word == " "){word = "";}
			if(endsInPunctuation(word)){
				trueLength = (word.length)-1;
			}else{
				trueLength = word.length;
			}
			switch(trueLength){
				case 1:
					word = "&nbsp      " + word.fontcolor("#F90101");
					break;
				case 2:
					word = "&nbsp     " + word.replaceAt(1, word.charAt(1), "#F90101");
					break;
				case 3:
					word = "&nbsp     " + word.replaceAt(1, word.charAt(1), "#F90101");
					break;
				case 4:
					word = "&nbsp     " + word.replaceAt(1, word.charAt(1), "#F90101");
					break;
				case 5:
					word = "&nbsp    " + word.replaceAt(2, word.charAt(2), "#F90101");
					break;
				case 6:
					word = "&nbsp    " + word.replaceAt(2, word.charAt(2), "#F90101");
					break;
				case 7:
					word = "&nbsp    " + word.replaceAt(2, word.charAt(2), "#F90101");
					break;
				case 8:
					word = "&nbsp    " + word.replaceAt(2, word.charAt(2), "#F90101");
					break;
				case 9:
					word = "&nbsp   " + word.replaceAt(3, word.charAt(3), "#F90101");
					break;
				case 10:
					word = "&nbsp   " + word.replaceAt(3, word.charAt(3), "#F90101");
					break;
				case 11:
					word = "&nbsp   " + word.replaceAt(3, word.charAt(3), "#F90101");
					break;
				case 12:
					word = "&nbsp   " + word.replaceAt(3, word.charAt(3), "#F90101");
					break;
				case 13:
					word = "&nbsp   " + word.replaceAt(3, word.charAt(3), "#F90101");
					break;
				default:
					word = word.splitThirteen(9,word.charAt(9));
					word = "&nbsp   " + word.replaceAt(3, word.charAt(3), "#F90101");
					break;
			}
			return word;
		};
		
		//Return a new time (ms)
		var delayTime = function(time, word) {
			if (endsInPunctuation(word)) {
				time = parseInt(time) + parseInt(time)*delayPercPunct;
			}
			return time;
		};

		//Return a boolean if this ends in punctuation
		var endsInPunctuation = function(word) {
			if (punctuations.indexOf(word[word.length-1]) !== -1) {
				leveling();
				return true;
			} else {
				return false;
			}
		};
		
		//Separates numbers by 1,000's.
		function commaSeparateNumber(val){
			while (/(\d+)(\d{3})/.test(val.toString())){
			  val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
			}
			return val;
		}
		
	//SPECIAL FUNCTIONS STOP
	
	//LEVELING SYSTEM START
		var leveling = function(){
			//Scoreboard and update save.
			$("#exp").text("Exp: " + commaSeparateNumber(exp) + " Level: " + lvl);
			localStorage.setItem("exp", exp);
			localStorage.setItem("lvl", lvl);
			//Sets required experience to level up.
			if (lvl < 11){
				expToLvl = (100*(lvl*lvl)) + (720*lvl);
				if (exp >= expToLvl){
					lvlUp();
				}
			} else if(lvl >= 11 && lvl < 32){
				expToLvl = (40*lvl*lvl*lvl) + (40.4*lvl*lvl) + (800*lvl);
				if (exp >= expToLvl){
					lvlUp();
				}
			} else if (lvl >= 32 && lvl < 60){
				expToLvl = (200*lvl*lvl*lvl) - (100*lvl);
				if (exp >= expToLvl){
					lvlUp();
				}
			}
		}
		
		//Leveling up events.
		var lvlUp = function(){
			var $this = $(".arrow");
			lvl++;
			$this.css({"color":"#FDD017","opacity":"1"});
			$this.animate({"opacity":".45"}, 1000);
			$this.delay(1);
			$this.animate({"opacity":".2","color":"#111111"},1);
		};
		
	//LEVELING SYSTEM STOP
});
