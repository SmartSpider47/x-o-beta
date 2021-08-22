var firebaseConfig = {
	apiKey: "AIzaSyCHTksylslqKdOeLLkwjoS4Tq_0C4uJFNI",
    authDomain: "learningproject-f17d4.firebaseapp.com",
    projectId: "learningproject-f17d4",
    storageBucket: "learningproject-f17d4.appspot.com",
    messagingSenderId: "1013425007796",
    appId: "1:1013425007796:web:d71a09eb0321f98d5a3be1"
};
firebase.initializeApp(firebaseConfig);


var base_gameID = -1;
var ServerType = -1;
var winner = -1;
var b_started = false;
var b_finished = false;
var b_draw = false;


var tb_empty = false;
var tb_write = false;


var mtrx = [[-1, -2, -3], [-4, -5, -6], [-7, -8, -9]];



var Player_1 = "<center><svg width=\"130\" height=\"130\"><circle cx=\"65\" cy=\"65\" r=\"50\" stroke=\"aqua\" stroke-width=\"10\" stroke-dasharray=\"314\" stroke-dashoffset=\"314\" fill=\"none\"><animate attributeName=\"stroke-dashoffset\" from=\"314\" to=\"0\" dur=\"0.4s\" fill=\"freeze\"></animate></circle></svg></center>";
var Player_2 = "<center><svg width=\"130\" height=\"130\"><line x1=\"20\" y1=\"20\" x2=\"110\" y2=\"110\" stroke=\"red\" stroke-width=\"10\" stroke-dasharray=\"127.2792206135786\" stroke-dashoffset=\"127.2792206135786\"><animate attributeName=\"stroke-dashoffset\" from=\"127.2792206135786\" to=\"0\" dur=\"0.4s\" fill=\"freeze\"></animate></line><line x1=\"110\" y1=\"20\" x2=\"20\" y2=\"110\" stroke=\"red\" stroke-width=\"10\" stroke-dasharray=\"127.2792206135786\" stroke-dashoffset=\"127.2792206135786\"><animate attributeName=\"stroke-dashoffset\" from=\"127.2792206135786\" to=\"0\" dur=\"0.4s\" fill=\"freeze\"></animate></line></svg></center>";



var title_1 = "<br><br><font class=\"css-text-aqua\">Вы играете за ноликов</font>";
var title_2 = "<br><br><font class=\"css-text-red\">Вы играете за крестиков</font>";



function CurrentTurn () {
	var cnt = 0;
	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 3; j++) {
			if (mtrx[i][j] > 0) {
				cnt++;
			}
		}
	}
	return cnt % 2;
}



function SaveMatrix () {
	var mt = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 3; j++) {
			var temp = 0;
			if (mtrx[i][j] > 0) {
				temp += mtrx[i][j];
			}
			mt[i][j] += temp;
		}
	}
	firebase.database().ref("game/" + base_gameID).set({
		"c1": mt[0][0],
		"c2": mt[0][1],
		"c3": mt[0][2],
		"c4": mt[1][0],
		"c5": mt[1][1],
		"c6": mt[1][2],
		"c7": mt[2][0],
		"c8": mt[2][1],
		"c9": mt[2][2],
		"started": "1"
	});
}



function Pressed (index) {
	if (b_finished || !b_started) {
		return;
	}
	var cx = parseInt((index - 1) / 3);
	var cy = index - (3 * cx) - 1;
	if (CurrentTurn() != ServerType || mtrx[cx][cy] > 0) {
		return;
	}

	mtrx[cx][cy] = ServerType + 1;
	SaveMatrix();

	if (ServerType == 0) {
		document.getElementById("id_cell_" + index).innerHTML = Player_1;
	}else {
		document.getElementById("id_cell_" + index).innerHTML = Player_2;
	}
}



document.getElementById("id_cell_1").onclick = function () { Pressed(1); }
document.getElementById("id_cell_2").onclick = function () { Pressed(2); }
document.getElementById("id_cell_3").onclick = function () { Pressed(3); }
document.getElementById("id_cell_4").onclick = function () { Pressed(4); }
document.getElementById("id_cell_5").onclick = function () { Pressed(5); }
document.getElementById("id_cell_6").onclick = function () { Pressed(6); }
document.getElementById("id_cell_7").onclick = function () { Pressed(7); }
document.getElementById("id_cell_8").onclick = function () { Pressed(8); }
document.getElementById("id_cell_9").onclick = function () { Pressed(9); }



function UpdateMatrix () {
	firebase.database().ref().child("game").child(base_gameID).get().then((snapshot) => {
		if (snapshot.exists()) {
			var tsv = snapshot.val();
			var tm = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

			tm[0][0] = parseInt(tsv.c1);
			tm[0][1] = parseInt(tsv.c2);
			tm[0][2] = parseInt(tsv.c3);
			tm[1][0] = parseInt(tsv.c4);
			tm[1][1] = parseInt(tsv.c5);
			tm[1][2] = parseInt(tsv.c6);
			tm[2][0] = parseInt(tsv.c7);
			tm[2][1] = parseInt(tsv.c8);
			tm[2][2] = parseInt(tsv.c9);

			for (var i = 0; i < 3; i++) {
				for (var j = 0; j < 3; j++) {
					if (tm[i][j] > 0 && mtrx[i][j] < 0) {
						mtrx[i][j] = tm[i][j];
						var ci = i * 3 + j + 1;
						if (mtrx[i][j] == 1) {
							document.getElementById("id_cell_" + ci).innerHTML = Player_1;
						}else if (mtrx[i][j] == 2) {
							document.getElementById("id_cell_" + ci).innerHTML = Player_2;
						}
					}
				}
			}

	  	}else {
	    	console.log("No data available");
	  	}
	}).catch((error) => {
		console.error(error);
	});
}



function ColorCell (ci, cj) {
	var c_index = ci * 3 + cj + 1;
	document.getElementById("id_cell_" + c_index).style.backgroundColor = "gray";
}



function CheckWin () {
	var co = "000102101112202122001020011121021222001122021120";
	for (var k = 0; k < co.length; k += 6) {
		var x1 = parseInt(co[k]);
		var y1 = parseInt(co[k + 1]);
		var x2 = parseInt(co[k + 2]);
		var y2 = parseInt(co[k + 3]);
		var x3 = parseInt(co[k + 4]);
		var y3 = parseInt(co[k + 5]);
		if (mtrx[x1][y1] > 0 && mtrx[x1][y1] == mtrx[x2][y2] && mtrx[x2][y2] == mtrx[x3][y3]) {
			winner = mtrx[x1][y1];
			ColorCell(x1, y1);
			ColorCell(x2, y2);
			ColorCell(x3, y3);
			b_finished = true;
			return;
		}
	}

	var tcnt = 0;
	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 3; j++) {
			if (mtrx[i][j] > 0) {
				tcnt++;
			}
		}
	}
	if (tcnt >= 9) {
		b_draw = true;
		b_finished = true;
		return;
	}
	
}


setInterval(function () {
	if (ServerType == -1 || b_finished) {
		return;
	}


	if (!b_started) {
		firebase.database().ref().child("game").child(base_gameID).get().then((snapshot) => {
			if (snapshot.exists()) {
				var tsv = snapshot.val();
				if (tsv.started == "1") {
					b_started = true;
				}
		  	}else {
		    	console.log("No data available");
		  	}
		}).catch((error) => {
			console.error(error);
		});
	}

	UpdateMatrix();

	CheckWin();



	if (b_draw) {
		document.getElementById("id_inf_1").innerHTML = "Ничья!";
	}else if (b_finished) {
		if (winner == ServerType + 1) {
			document.getElementById("id_inf_1").innerHTML = "Вы Победили!";
		}else {
			document.getElementById("id_inf_1").innerHTML = "Вы Проиграли!";
		}
	}else {
		if (CurrentTurn() == ServerType) {
			document.getElementById("id_inf_1").innerHTML = "Ваш Ход";
		}else {
			document.getElementById("id_inf_1").innerHTML = "Ход Соперника";
		}
	}



	if (ServerType == 0) {
		if (b_started && !tb_empty) {
			document.getElementById("id_inf_1").innerHTML = "";
			tb_empty = true;
			return;
		}else if (!b_started || !tb_write) {
			document.getElementById("id_inf_1").innerHTML = "Ожидание второго игрока<br>Пригласительный код: " + base_gameID;
			tb_write = true;
			return;
		}
		if (!b_started) {
			return;
		}



	}else if (ServerType == 1) {



	}
}, 1000);



/*firebase.database().ref('users/' + "tempo").set({
	"sad": "name"
});*/

/*
firebase.database().ref("_game_info_").set({
	"mgi": "0"
});
*/

/*firebase.database().ref().child("users").get().then((snapshot) => {
	if (snapshot.exists()) {
    	console.log(snapshot.val());
    	var l = snapshot.val();
    	console.log(l.smid);
  	}else {
    	console.log("No data available");
  	}
}).catch((error) => {
	console.error(error);
});*/

//firebase.database().ref('users/' + _UserID).remove();

document.getElementById("id_creategame").onclick = function () {
	firebase.database().ref().child("_game_info_").get().then((snapshot) => {
		if (snapshot.exists()) {
	    	var mxi = snapshot.val().mgi;
	    	
	    	base_gameID = parseInt(mxi);
	    	ServerType = 0;

	    	var tmp = base_gameID + 1;

	    	firebase.database().ref("_game_info_").set({
				"mgi": tmp
			});

	    	firebase.database().ref("game/" + base_gameID).set({
				"c1": "0",
				"c2": "0",
				"c3": "0",
				"c4": "0",
				"c5": "0",
				"c6": "0",
				"c7": "0",
				"c8": "0",
				"c9": "0",
				"started": "0"
			});

			document.getElementById("id_inf_1").innerHTML = "";

			document.getElementById("id_my_4").innerHTML = title_1;

	    	document.getElementById("id_my_1").hidden = "hidden";
	    	document.getElementById("id_my_2").removeAttribute("hidden");

	  	}else {
	    	console.log("No connection!");
	  	}
	}).catch((error) => {
		console.error(error);
	});
}

document.getElementById("id_button_join").onclick = function () {
	var cur = document.getElementById("id_joincode").value;
	
	firebase.database().ref().child("game").child(cur).get().then((snapshot) => {
		if (snapshot.exists()) {
			var sv = snapshot.val();
			if (sv.started == "0") {

				base_gameID = parseInt(cur);
				ServerType = 1;

				firebase.database().ref("game/" + base_gameID).set({
					"c1": "0",
					"c2": "0",
					"c3": "0",
					"c4": "0",
					"c5": "0",
					"c6": "0",
					"c7": "0",
					"c8": "0",
					"c9": "0",
					"started": "1"
				});

				b_started = true;

				document.getElementById("id_inf_1").innerHTML = "";

				document.getElementById("id_my_4").innerHTML = title_2;

				document.getElementById("id_my_3").hidden = "hidden";
	    		document.getElementById("id_my_2").removeAttribute("hidden");

			}else {
				console.log("No Game");
			}
	  	}else {
	    	console.log("No Game");
	  	}
	}).catch((error) => {
		console.error(error);
	});

}

document.getElementById("id_joingame").onclick = function () {
	document.getElementById("id_my_1").hidden = "hidden";
	document.getElementById("id_my_3").removeAttribute("hidden");
}