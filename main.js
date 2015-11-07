window.addEventListener("load",init);

var canvas,ctx;

//global variables for the snake and snack
var snake,snack;

//the array of pressed keys
var pressedKeys=[];

//the switch for collisions
var collided=false;

//score
var score=0;

//timer,used for calculating framerate
d1=new Date();
t1=d1.getTime();

//timer used for timing position updates
var updateTimer=t1;

//Total no. of frames rendered.
var frameCount=0;

//framerate
var frameRate=0;

//DOM element for displaying framerate and framcount
var infoBox;

//the value that will be given to snackMoveCounter.
//this value will be decreased everytime the player gets the snack,
//progressively making the movement of the snack more sporadic
//TODO: give this var a better name.
var sporadicity=100;

//if this is equal to 4, then the snack will move in a certain direction 4 times before picking another direction 
var snackMoveCounter =sporadicity;


//The code for direction in which the snack will move.
var directionCode=randInt(1,4);

//boolean that tells whether the game is paused or not.
var isPaused=false;


//init
function init(){
	
	canvas = document.getElementById("screen");
	ctx=canvas.getContext("2d");
	
	
	/*
	canvas.width=window.innerWidth;
	canvas.height=window.innerHeight;
	*/
	
	
	//define position and size of the snake and the snack
	snake={
		pos_x:50,
		pos_y:50,
		width:20,
		height:20
		
	};
	
	snack={
		pos_x:randInt(0,500),
		pos_y:randInt(0,500),
		width:20,
		height:20,
		diff_pos:5	
		
	};
	
	//event handlers for the key down and up
	window.onkeydown=function(e){
	onKeyDown(e);
	console.log("Key pressed: "+e.keyCode);
	
	};
	
	window.onkeyup=function(e){
	onKeyUp(e);
	}
	
	//DOM element for displaying info about framerate and total no of frames rendered.
	infoBox=document.getElementById("infoDiv");

	console.log(window.innerWidth);
	console.log(window.innerHeight);
	
	//begin the loop
	loop();
	
}

//Game loop
function loop(){

update();
render();

//Update info about framerate and total frames rendered
frameCount++;
d2=new Date();
var t2=d2.getTime();
frameRate=1000/(t2-t1);
t1=t2;


//shim for requestAnimatioFrame that works on many browsers.
requestAnimFrame(loop);

}

//method for updating the postion of the snake and/or snack
function update(){
	/*
	Keycodes:
	left-37
	right-39
	up-38
	down-40
	space-32
	ESC-27
	*/
	
	
	var date=new Date();
	var curTime=date.getTime();
	
	if(pressedKeys[27]){
		isPaused=!isPaused;
		delete pressedKeys[27];
	}
	
	
	
	if(curTime-updateTimer>=25 && !isPaused){ 
		//if the position of the snake is inside the canvas boundaries,then update position of snake according to key pressed.
		if(pressedKeys[37]){
			if(snake.pos_x>0){
				snake.pos_x-=10;
			}	
		}
		if(pressedKeys[38]){
			if(snake.pos_y>0){
				snake.pos_y-=10;
			}
		}
		if(pressedKeys[39]){
			if(snake.pos_x<canvas.width-20){
				snake.pos_x+=10;
			}	
		}
		if(pressedKeys[40]){
			if(snake.pos_y<canvas.height-20){
				snake.pos_y+=10;
			}
		}
		
		
		
	
		detectCollision();
		//if the snake has collided with the snack,then update position of snack
		//Also,update sporadicity.
		if(collided){
			snack.pos_x=randInt(0,canvas.width-10);
			snack.pos_y=randInt(0,canvas.height-10);
			if(sporadicity<20){
				sporadicity-=2;
			}
			if(sporadicity<=10){
				sporadicity=randInt(10,100);
			}
			else{
				sporadicity-=5;
			}
			
			score++;
			collided=false;
		}
		
		
		
		//if snackMoveCounter is greater than 0, then the snack will be moved 
		//and snackMoveCounter will be subtracted by 1.
		//if it is 0,then the snackMoveCounter will be reset to initial value 
		//and a new direction will be chosen for a snack
		//Also, if the snack is touching any of the edges, snackMoveCounter will 
		//be set to 0 so that it will be given a new direction in the next frame.
		if(snackMoveCounter > 0){
			switch (directionCode){
				case 1:
					if(snack.pos_x < canvas.width-20){ 
						snack.pos_x+=snack.diff_pos;
					}
					else{
						snackMoveCounter=0;
					}
					break;
				case 2:
					if(snack.pos_x > 0){
					snack.pos_x-=snack.diff_pos;
					}
					else{
						snackMoveCounter=0;
					}
					break;
				case 3:
					if(snack.pos_y < canvas.height-20){
					snack.pos_y+=snack.diff_pos;
					}
					else{
						snackMoveCounter=0;
					}
					break;
				case 4:
					if(snack.pos_y > 0){
					snack.pos_y-=snack.diff_pos;
					}
					else{
						snackMoveCounter=0;
					}
					break;
				
			}
			snackMoveCounter--;
		}
		else{
			directionCode=randInt(1,4);
			snackMoveCounter=sporadicity;
		}
		
		
		updateTimer=curTime;
	
	}
	
}
	
//render scene
function render(){
//clear the previous frame
ctx.clearRect(0,0,canvas.width,canvas.height);
//draw the snake
ctx.fillStyle="#f00";
ctx.fillRect(snake.pos_x,snake.pos_y,snake.width,snake.height);
//draw the snack
ctx.fillStyle="#0f0";
ctx.fillRect(snack.pos_x,snack.pos_y,snack.width,snack.height);

//draw the score  
ctx.fillStyle="#000";
ctx.font = "bold 20px helvetica";
ctx.fillText("Score:"+score,10,20);

//console.log("isPaused:"+isPaused);
	
	
//If the game is paused,show that on the screen 
if(isPaused){
ctx.fillStyle="#F00";
ctx.font = "bold 20px helvetica";
ctx.fillText('Game Paused',((canvas.width)/2-60),canvas.height-40);
ctx.fillText('Press ESC to resume',((canvas.width)/2-100),canvas.height-20);

}

//line for testing...
/*
ctx.fillStyle="#000";
ctx.moveTo(canvas.width/2,0);
ctx.lineTo(canvas.width/2,canvas.height);
ctx.stroke();
*/

//update info about framecount and framerate	
infoBox.innerHTML="";
infoBox.innerHTML="Total no. of frames rendered: "+frameCount+"<br>Instantaneous framerate: "+frameRate;
	
		

}








//collision detection
function detectCollision(){
		
		if(snake.pos_x<snack.pos_x+snack.width &&
		snake.pos_x+snake.width>snack.pos_x &&
		snake.pos_y<snack.pos_y+snack.height &&
		snake.pos_y+snake.height>snack.pos_y
		){
			collided=true;
			console.log("Collision detected");
		}
		
}







//when a key is pressed down,put the keycode in the pressedKeys array
function onKeyDown(e){
	
	pressedKeys[e.keyCode]=true;
	
}



//when a pressed key is let go of,clear out the pressedKeys array
function onKeyUp(e){
	delete pressedKeys[e.keyCode];
}





//return a random integer from a range of values between min and max
function randInt(min,max){
	return(Math.floor(Math.random() * (max - min + 1)) + min);
	}



// shim layer for requestAnimatioFrame with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
		  function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();
