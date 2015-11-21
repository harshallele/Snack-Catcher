//Event listeners
window.addEventListener("load",init);
window.addEventListener("resize",resizeGame);
window.addEventListener("mousemove",getCoordinates);
	

//DOM elements
var canvas,ctx;

//global variables for on screen elements
var player,snack,full_screen_button;

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


//if this is equal to 1,then the snack moves in multiple directions.
//if it is 0,it moves in a single direction
var isMultiDir=randInt(0,1);

//The codes for the direction/s in which the snack will move.
var directionCode=randInt(1,4);
var secDirectionCode=randInt(1,2);

//boolean that tells whether the game is paused or not.
var isPaused=false;


//size of player and snack
var char_size;
	
//full screen button
var full_screen_button;	

//mouse co-ordinates
var mouse_x,mouse_y;

//boolean that tells if game is full screen.
var isFullScreen = false;

//init
function init(){
	//define DOM elements
	canvas = document.getElementById("screen");
	ctx=canvas.getContext("2d");
	//full_screen_button=document.getElementById("full_screen_button");
	
	//set canvas dimensions
	canvas.width=window.innerWidth*0.8;
	canvas.height=window.innerHeight*0.8;
	
	
	//event listeners for canvas
	canvas.addEventListener("click",handleClick);
	
	
	
	
	//define full_screen button,co-ordinates,click area 
	//and whether the mouse cursor is in the click area
	var i1=new Image();
	var i2=new Image();
	
	full_screen_button={
		image_normal:loadImage(i1,"full_screen.png"),
		image_hover:loadImage(i2,"full_screen_hover.png"),
		pos_x:canvas.offsetLeft+canvas.width-45,
		pos_y:canvas.offsetTop+canvas.height-45,
		isInClickArea:false
		
		
		
		};
		
	
		
	
	//size is avarage of 2.5% of the width and height of canvas.
	//PROBABLY WILL CHANGE
	char_size=((canvas.width*0.025)+(canvas.height*0.025))/2;
	
	
	//define position and size of the player and the snack
	player={
		pos_x:20,
		pos_y:50,
		width:char_size,
		height:char_size,
		diff_x:canvas.width*0.015,
		diff_y:canvas.height*0.015
		
	};
	
	snack={
		pos_x:randInt(0,500),
		pos_y:randInt(0,500),
		width:char_size,
		height:char_size,
		diff_x:canvas.width*0.01,
		diff_y:canvas.height*0.01
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

//method for updating the postion of the player and/or snack,
//detecting collisions and resize events
function update(){
	/*
	Keycodes:
	left-37
	up-38
	right-39
	down-40
	space-32
	ESC-27
	*/
	
	
	var date=new Date();
	var curTime=date.getTime();
	
	//Check for Space bar outside the if block because
	//if isPaused is true once, code inside the block won't get executed
	//But we want to check for space bar everytime
	if(pressedKeys[32]){
		isPaused=!isPaused;
		delete pressedKeys[32];
	}
	
	//check ESC key for exiting from full screen.
	if(pressedKeys[27]){
		isFullScreen=false;
		delete pressedKeys[27];
	}
	
	
	
	
	if(curTime-updateTimer>=25 && !isPaused){ 
		//if the position of the player is inside the canvas boundaries,then update position of player according to key pressed.
		if(pressedKeys[37]){
			if(player.pos_x>0){
				player.pos_x-=player.diff_x;
			}	
		}
		if(pressedKeys[38]){
			if(player.pos_y>0){
				player.pos_y-=player.diff_y;
			}
		}
		if(pressedKeys[39]){
			if(player.pos_x<canvas.width-player.width){
				player.pos_x+=player.diff_x;
			}	
		}
		if(pressedKeys[40]){
			if(player.pos_y<canvas.height-player.height){
				player.pos_y+=player.diff_y;
			}
		}
		
		detectCollision();
		//if the player has collided with the snack,then update position of snack
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
		//and a new direction will be chosen for the snack
		//Also, if the snack is touching any of the edges, snackMoveCounter will 
		//be set to 0 so that it will be given a new direction in the next frame.
		//Motion of snack is set randomly to be either single or multi directional(TODO)
		
		/*
		Direction Codes:
		left-2
		right-1
		down-3
		up-4
		*/
		
		
		//Change the direction according to directionCode,
		//if isMultiDir is 1, then change secondary direction.
		//For eg. if the snack moves towards right and if isMultiDir is 1,
		//then the y co-ordinate will be changed according to secDirectionCode
		//(if it is 1, then decrease y co-ordinate,else increase it)
		if(snackMoveCounter > 0){
			switch (directionCode){
				case 1:
					if(snack.pos_x < canvas.width-snack.width){ 
						snack.pos_x+=snack.diff_x;
						
						if(isMultiDir==1){
							if(secDirectionCode==1){
								if(snack.pos_y>0)snack.pos_y-=snack.diff_y;
								}
							else{
								if(snack.pos_y+snack.height<canvas.height)snack.pos_y+=snack.diff_y;
								}
							}
						}
						
					else{
						snackMoveCounter=0;
					}
					break;
				
				
				case 2:
					if(snack.pos_x > 0){
					snack.pos_x-=snack.diff_x;
					
					
					if(isMultiDir==1){
							if(secDirectionCode==1){
								
								if(snack.pos_y>0)snack.pos_y-=snack.diff_y;
								}
							else{
								if(snack.pos_y+snack.height<canvas.height)snack.pos_y+=snack.diff_y;
								}
							}
					}
					
					else{
						snackMoveCounter=0;
					}
					break;
				
				
				case 3:
					if(snack.pos_y < canvas.height-snack.height){
					snack.pos_y+=snack.diff_y;
					
					if(isMultiDir==1){
							if(secDirectionCode==1){
								
								if(snack.pos_x>0)snack.pos_x-=snack.diff_x;
								}
							else{
								if(snack.pos_x+snack.width<canvas.width)snack.pos_x+=snack.diff_x;
								}
							}
					}
					
					else{
						snackMoveCounter=0;
					}
					break;
				
				
				case 4:
					if(snack.pos_y > 0){
					snack.pos_y-=snack.diff_y;
						
						if(isMultiDir==1){
							if(secDirectionCode==1){
								if(snack.pos_x>0)snack.pos_x-=snack.diff_x;
								}
							else{
								if(snack.pos_x+snack.width<canvas.width)snack.pos_x+=snack.diff_x;
								}
							}
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
			secDirectionCode=randInt(1,2);
			isMultiDir=randInt(0,1);
			snackMoveCounter=sporadicity;
		}
		
		
		updateTimer=curTime;
	
	}
	
}
	
//render scene
function render(){
//clear the previous frame
ctx.clearRect(0,0,canvas.width,canvas.height);
//draw the player
ctx.fillStyle="#f00";
ctx.fillRect(player.pos_x,player.pos_y,player.width,player.height);
//draw the snack
ctx.fillStyle="#0f0";
ctx.fillRect(snack.pos_x,snack.pos_y,snack.width,snack.height);

//draw the score  
ctx.fillStyle="#000";
ctx.font = "bold 20px helvetica";
ctx.fillText("Score:"+score,10,20);


if(!isFullScreen){
	//If mouse position is inside the full screen button, then render the hover button 
	//If not, then render normal button
	if(mouse_x > full_screen_button.pos_x && mouse_y > full_screen_button.pos_y && mouse_x < full_screen_button.pos_x+45 && mouse_y < full_screen_button.pos_y+45 && !isFullScreen){
				ctx.drawImage(full_screen_button.image_hover,full_screen_button.pos_x,full_screen_button.pos_y);
				full_screen_button.isInClickArea=true;
		}

	else{
			ctx.drawImage(full_screen_button.image_normal,full_screen_button.pos_x,full_screen_button.pos_y);
			
		}

}

	
	
//If the game is paused,show that on the screen 
if(isPaused){
ctx.fillStyle="#F00";
ctx.font = "bold 20px helvetica";
ctx.fillText('Game Paused',((canvas.width)/2-60),canvas.height-40);
ctx.fillText('Press SPACE to resume',((canvas.width)/2-100),canvas.height-20);

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
		
		if(player.pos_x<snack.pos_x+snack.width &&
		player.pos_x+player.width>snack.pos_x &&
		player.pos_y<snack.pos_y+snack.height &&
		player.pos_y+player.height>snack.pos_y
		){
			collided=true;
			console.log("Collision detected");
		}
		
}






//resize the size of the canvas,the sizes,speeds and positions of the player
function resizeGame(){
	var width_ratio,height_ratio;
	
	//change canvas to be 80% of window size.
	canvas.width=window.innerWidth*0.8;
	canvas.height=window.innerHeight*0.8;
		
	//get the ratio of new canvas width/height to that of old canvas width/height,
	//for calculating the new positions of the player and the snack.
	width_ratio=(window.innerWidth*0.8)/canvas.width;
	height_ratio=(window.innerHeight*0.8)/canvas.height;

	
	//change position of  full screen button
	full_screen_button.pos_x=canvas.offsetLeft+canvas.width-45;
	full_screen_button.pos_y=canvas.offsetTop+canvas.height-45;
	
	char_size=((canvas.width*0.025)+(canvas.height*0.025))/2;
	
	//change size,position and speed of player according to the new size of the window
	player.width=char_size;
	player.height=char_size;
	player.diff_x=canvas.width*0.015;
	player.diff_y=canvas.height*0.015;
	player.pos_x=player.pos_x*width_ratio;
	player.pos_y=player.pos_y*height_ratio;
	
	
	//change size,position and speed of snack according to the new size of the window 
	snack.width=char_size;
	snack.height=char_size;
	snack.diff_x=canvas.width*0.01;
	snack.diff_y=canvas.height*0.01;
	snack.pos_x=snack.pos_x*width_ratio;
	snack.pos_y=snack.pos_y*height_ratio;
	

	
	
}


//handle mouse clicks that happen inside the canvas
//Detect if the mouse is over any of the clickable elements inside the canvas 
//by checking if isInClickArea for that element is true if it is,handle click depending upon which element was clicked
function handleClick(){
	
	//check if the full screen button was clicked
	if (full_screen_button.isInClickArea){
		
		if(!isFullScreen){
				isFullScreen=true;
				launchFullScreen(canvas);
		
			}
		else if(isFullScreen){
			isFullScreen=false;
			}
			
		resizeGame();
		console.log("Full screen button clicked!");
		}
	
	}



//load images
function loadImage(imageObj,src){
		imageObj.src=src;
		return(imageObj);
		}


//set co-ordinates, used for handling mouse over and click handling
function getCoordinates(e){
	if(e.clientX < canvas.width && e.clientY < canvas.height){
		mouse_x=e.clientX;
		mouse_y=e.clientY;
	}	
	
	else {
		mouse_x=0;
		mouse_y=0;
		
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


// shim for full screen page
function launchFullScreen(element) {
  if(element.requestFullScreen) {
    element.requestFullScreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen();
  }
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
