/*
 * Requires:
 *     psiturk.js
 *     utils.js
 */

// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

var mycondition = condition;  // these two variables are passed by the psiturk server process
var mycounterbalance = counterbalance;// they tell you which condition you have been assigned to


// All pages to be loaded
var pages = [
	"instructions/instruct-1.html",
	"instructions/instruct-2.html",
	"instructions/instruct-ready.html",
	"stage.html",
	"postquestionnaire.html",
	"thanks-mturksubmit.html",
	"thanks.html"

];

psiTurk.preloadPages(pages);

var instructionPages = [ // add as a list as many pages as you like
	"instructions/instruct-1.html",
	"instructions/instruct-2.html",
	"instructions/instruct-ready.html"
];


/********************
* HTML manipulation
*
* All HTML files in the templates directory are requested
* from the server when the PsiTurk object is created above. We
* need code to get those pages from the PsiTurk object and
* insert them into the document.
*
********************/

/********************
* TranscriptionExperiment      *
********************/
var initial_treatment = 0.10
var treatments = [0.10, 0.15, 0.05];
var randomNr = Math.random() * 3;
var treatment = treatments[Math.floor(randomNr)];
var run = 0;
var score = 2*initial_treatment + 2*treatment;
var round_score = (Math.floor(100* score))/100;

// console.log('true score: '+score);
// console.log('round score: '+round_score);
// console.log('treatment: '+treatment);




var TranscriptionExperiment = function() {

	var time, // time word is presented
	    listening = false;


	// Stimuli/ images for the transcription
	var stims = [
			["/static/images/21.jpeg", String("In theorie kan het feit dat de rijke landen een deel van de hoofdstad van arme landen bezitten een deugdelijke uitwerking hebben door convergentie te bevorderen. Als de rijke landen zo gespannen zijn met sparen en kapitaal dat er weinig reden is om nieuwe woningen te bouwen of nieuwe machines toe te voegen (in welk geval economen zeggen dat de"), 1],
			["/static/images/22.jpeg", String("marginale productiviteit van kapitaal, dat wil zeggen, de extra output als gevolg van het toevoegen van een nieuwe kapitaaleenheid aan de rand, is zeer laag), kan het collectief efficient zijn om een deel van de binnenlandse besparingen in armere landen in het buitenland te investeren Deze optimistische theorie heeft echter twee grote"), 2],
			["/static/images/23.jpeg", String("Betekortkomingen. Ten eerste garandeert het vereveningsmechanisme vanuit strikt logisch oogpunt geen wereldwijde convergentie van het inkomen per hoofd van de bevolking. In het beste geval kan dit tot convergentie van de output per hoofd van de bevolking leiden, op voorwaarde dat we uitgaan van een perfecte kapitaalmobiliteit en, nog"), 3],
			["/static/images/24.jpeg", String("Belangrijker, totale gelijkheid van competentieniveaus en menselijk kapitaal in de verschillende landen - geen kleine veronderstelling. In elk geval impliceert de mogelijke convergentie van de output per hoofd niet de convergentie van het inkomen per hoofd. Er kan dus geen reden zijn waarom iemand zou reageren op een verandering in beloning."), 4]
			//["/static/images/25.jpeg", "Nadat de rijke landen hebben geinvesteerd in hun armere buren, kunnen ze hen voor onbepaalde tijd blijven bezitten, en hun aandeel in eigendom kan zelfs tot enorme proporties groeien, zodat het nationale inkomen per hoofd van de rijke landen permanent groter blijft dan dat van de armere landen. landen, die aan buitenlanders een substantieel", 5],
			//["/static/images/26.jpeg", "Bovendien, als we naar het historisch record kijken, lijkt het er niet op dat kapitaalmobiliteit de belangrijkste factor is geweest voor het bevorderen van de convergentie van rijke en arme landen. Geen van de Aziatische landen die de laatste jaren dichter bij de ontwikkelde landen van het Westen zijn gekomen, heeft geprofiteerd van grote buitenlandse", 6],
			//["/static/images/27.jpeg", "Een deel van de reden voor die instabiliteit kan de volgende zijn. Wanneer een land grotendeels in handen is van buitenlanders, is er een terugkerende en bijna onstuitbare maatschappelijke vraag naar onteigening. Andere politieke actoren antwoorden dat investering en ontwikkeling alleen mogelijk zijn als bestaande eigendomsrechten deel van hun", 7]
	];

	//stims = _.shuffle(stims);
	total_runs = stims.length;

	var next = function() {
		run = run + 1;
		if(run < 3){
			treat = initial_treatment;
		} else{
			treat = treatment;
		}
		if (stims.length===0) {
			finish();
		}
		else {
			stim = stims.shift();
			show_img( stim[0] ); 
			time = new Date().getTime();
			listening = true;
			d3.select("#query").html('<p id="prompt">For this task you get $ ' + String(treat) + '</p>');
			var progress = (run / total_runs) * 100;
			$('#progress-bar').width(progress + '%');

		}
	};

	var bonus_unlock = function(){

			$("#bonus").prop('readonly', false);
			$("#textbox").prop('readonly', true);

	}

	var start_write = function() {

		bonus = $("#bonus").val();

		if (bonus != treat){
			$("#textbox").prop('readonly', true);
			alert("Please make sure you have entered your current bonus correctly.");
		}
		else {
			$("#textbox").prop('readonly', false);
			$("#bonus").prop('readonly', true);

		}
	};

	var submit_handler = function() {

		// if (!listening) return;
		var response = $("#textbox").val();
		// var bonus = $("#bonus").val();  //maximal 3 character
		var stimuli = String(stim[1]);
		var text_nr = String(stim[2]);
		var stimuli_length = String(stim[1].length);
		var resp_length = String(response.length);

		var levenshteinScore = levenshtein(stimuli, response);

		// console.log(levenshteinScore);

		//NEW: bonus==treat && quality
		if ((response.length!=0) && (levenshteinScore < 320)) {
			listening = false;
			var rt = new Date().getTime() - time;



			// console.log('treat: ' + treat)
			psiTurk.recordTrialData( {	'phase':"TEST",
																	'text-nr':text_nr,
																	'treatment':treat,
                                	'sample-text':stimuli,
																	'stimuli-length':stimuli_length,
																	'response':response,
																	'resp-length':resp_length,
																	'run':String(run),
                                  'rt':String(rt),
																	'levenshtein':String(levenshteinScore) }
																);

			remove_img();
			remove_text();
			remove_bonus();
			bonus_unlock();
			alert("Your text has been submitted. Click 'OK' to continue.");
			next();

		}

		else {
			alert("Please make sure your task is entered below before submitting.");
		}

	};

	var levenshtein = function (eins, zwei) {
	    if (eins === zwei) {
	        return 0;
	    }
	    var n = eins.length, m = zwei.length;
	    if (n === 0 || m === 0) {
	        return n + m;
	    }
	    var x = 0, y, a, b, c, d, g, h, k;
	    var p = new Array(n);
	    for (y = 0; y < n;) {
	        p[y] = ++y;
	    }

	    for (; (x + 3) < m; x += 4) {
	        var e1 = zwei.charCodeAt(x);
	        var e2 = zwei.charCodeAt(x + 1);
	        var e3 = zwei.charCodeAt(x + 2);
	        var e4 = zwei.charCodeAt(x + 3);
	        c = x;
	        b = x + 1;
	        d = x + 2;
	        g = x + 3;
	        h = x + 4;
	        for (y = 0; y < n; y++) {
	            k = eins.charCodeAt(y);
	            a = p[y];
	            if (a < c || b < c) {
	                c = (a > b ? b + 1 : a + 1);
	            }
	            else {if (e1 !== k) {
	                    c++;
	                }
	            }

	            if (c < b || d < b) {
	                b = (c > d ? d + 1 : c + 1);
	            }
	            else {
	                if (e2 !== k) {
	                    b++;
	                }
	            }

	            if (b < d || g < d) {
	                d = (b > g ? g + 1 : b + 1);
	            }
	            else {
	                if (e3 !== k) {
	                    d++;
	                }
	            }

	            if (d < g || h < g) {
	                g = (d > h ? h + 1 : d + 1);
	            }
	            else {
	                if (e4 !== k) {
	                    g++;
	                }
	            }p[y] = h = g;
	            g = d;
	            d = b;
	            b = c;
	            c = a;
	        }
	    }

	    for (; x < m;) {
	        var e = zwei.charCodeAt(x);
	        c = x;
	        d = ++x;
	        for (y = 0; y < n; y++) {
	            a = p[y];
	            if (a < c || d < c) {
	                d = (a > d ? d + 1 : a + 1);
	            }
	            else {
	                if (e !== eins.charCodeAt(y)) {
	                    d = c + 1;
	                }
	                else {
	                    d = c;
	                }
	            }
	            p[y] = d;
	            c = a;
	        }
	        h = d;
			}

	    return h;
	};

	var finish = function() {
			// console.log('FINISH')

		  $("#submit").unbind("click", submit_handler); // Unbind click
	    currentview = new Questionnaire();
	};

	var show_img = function(path) {
		d3.select("#stim")
			.append("img")
			.attr("id","text-to-type")
			.attr("src", path);
	};

	var remove_img = function() {
		d3.select("#text-to-type").remove();
	};

	var remove_text = function() {
		$("#textbox").val("");
	};
	//NEW
	var remove_bonus = function() {
		$("#bonus").val("");
		$("#bonus").prop('readonly', false);
	};

	// Load the stage.html snippet into the body of the page
	psiTurk.showPage('stage.html');



	// Register the response handler that is defined above to handle any
	// click events.
	$("#submit").click(submit_handler);
	//$("#confirm").click(bonus);
	$("#confirm").click(start_write);



	next();

};
/****************
* Questionnaire *
****************/


var Questionnaire = function() {
 // console.log('new questionaire');
	var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. soll might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

	 question_check = function() {
		 var count = 0;
		$('select').each ( function(i, val){

			if (this.value > 0) {

				count+=1;
			}

		});
		$('textarea').each( function(i, val){

			if (this.value > 0) {
				count+= 1;
			}
			console.log('count: '+ count);
		});

		if (count > 0 && count < 4) {
			score += 0.05;
		}
		else if (count >= 4){
			score += 0.15;
		}
		else {
			score = score;
		}
		var round_score = (Math.floor(100* score))/100;
		psiTurk.taskdata.set('bonus', round_score);

		}





	record_responses = function() {

		question_check();
		psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'submit'});

		$('textarea').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);
		});
		$('select').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);
		});

	}

	prompt_resubmit = function() {
		document.body.innerHTML = error_message;
		$("#resubmit").click(resubmit);
	};

	resubmit = function() {
		document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
		reprompt = setTimeout(prompt_resubmit, 10000);

		psiTurk.saveData({
			success: function() {
				    clearInterval(reprompt);
                psiTurk.computeBonus('compute_bonus', function(){
                	psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                });


			},
			error: prompt_resubmit
		});
	};


	// Load the questionnaire snippet
	psiTurk.showPage('postquestionnaire.html');
	psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'begin'});

	$("#next").click(function () {
	    record_responses();
	    psiTurk.saveData({
            success: function(){
                psiTurk.computeBonus('compute_bonus', function() {
                psiTurk.completeHIT(); // when finished saving compute bonus, the quit
							});
            },
            error: prompt_resubmit});
	});
};


// Task object to keep track of the current phase
var currentview;

/*******************
 * Run Task
 ******************/
$(window).load( function(){
    psiTurk.doInstructions(
    	instructionPages, // a list of pages you want to display in sequence
    	function() { currentview = new TranscriptionExperiment(); } // what you want to do when you are done with instructions
    );
});
