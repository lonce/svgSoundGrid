// main.js
/*
	Click one to play one. Click and drag to create a path. Click a path to play it. Shift-click to add one elmt to a path, CTL-click to remove one elmt from path. ESC or click body to clear a path.
*/
//==========================================================
//==========================================================
// Only need to change code here  vvvvvvvvvvvvvvvvvvvvvvvvvv

// Each cell at (row, col) will have a sound file attached to it.
// rowRows*numCols should be the number of files you have in the resources folder.
const numRows=4
const numCols=3

// inter onset interval between sound onsets in a sequence,
// if it is equal to your sound file duration, there will be no space between them
// const IOI = 743 // ms, 
const IOI = 743// ms, 

let makefnamestring=function(row,col){
	// map (row, col) to file names
	let r=2*row;
	let c=2*col;
	return `resources/test_2D4pt_d1.${r}_d0.${c}_v.0.wav`
}

// Only need to change code above ^^^^^^^^^^^^^^^^^^^^^^^^^^
//==========================================================
//==========================================================

let playlist=[] // list of cells with Audio properties to play 
let playTimer  // ID for timer to set through playList

let lastSelectedCellID=null
let dragging=false

const body = document.getElementById("body");
body.addEventListener('mousedown', function(){
	clearPlaylist()
})
body.addEventListener('mouseup', function(){
	dragging=false
})


//const container = document.getElementById("container");


var paper = new Raphael(document.getElementById("container"));
// Find get paper dimensions
var dimX = paper.width;
var dimY = paper.height;


let makeOctagon=function(x,y,rx, ry){
	let a=Math.PI/8.
	let pathstring=`M ${x+rx*Math.cos(a)}, ${y+ry*Math.sin(a)}, `
	for(let i=0;i<7;i++){
		a += Math.PI/4.
		pathstring += `L ${x+rx*Math.cos(a)}, ${y+ry*Math.sin(a)}, `
	}
	pathstring +=`Z`
	//console.log("pathstring = " + pathstring)

	oct=paper.path(pathstring)
	oct.attr({
		"fill":'#FFFFFF', 
		"stroke": '#000000', 
		"stroke-width": 1})

	return oct
}

colWidth=dimX/numRows
rowHeight=dimY/numCols


let makeGrid = function(rows, cols) {
//  container.style.setProperty('--grid-rows', rows);
//  container.style.setProperty('--grid-cols', cols);

  for (let r=0;r<rows;r++){
  	for (let c=0;c<cols;c++){



	    ////let cell = document.createElement("div");
	    let cell = makeOctagon(colWidth/2+c*colWidth, rowHeight/2+r*rowHeight, colWidth/2-2, rowHeight/2-2)
	    // make row and col numbers visible on cells
	    ////cell.innerHTML = `${r}/${c}`;
	    ////cell.style.backgroundColor=cell2colorstring(r,c);
	    cell.attr({"fill": cell2colorstring(r,c)})

	    // hang info on cell useful in callbacks etc
	    cell.id=`${r}/${c}`;
	    cell.row=r
	    cell.col=c
	    cell.fname=makefnamestring(r,c)
	    cell.audioClip= new Audio(cell.fname);

	    // so we can get the cell in event listeners
	    cell.node.cell=cell;

	    ////container.appendChild(cell).className = "grid-item";


	    cell.node.addEventListener('mousedown', function(ev){
	    	//console.log(`r: ${ev.target.row}, c: ${ev.target.col}`)
	    	target=ev.target.cell
	    	ev.preventDefault()
		    ev.stopPropagation()
	    	if (target.selected) { // if clicking on a cell already on the playlist
	    		if (ev.ctrlKey){
	    			console.log("Remove this event")
	    			removeOneFromPlaylist(target)
	    		} else {
	    			playTheList()
	    		}
	    	} else {   
	    		 if (ev.shiftKey) {
					addToPlaylist(target)
	    			//ev.target.style.backgroundColor= "#FFF";
	    			target.attr({"fill": "#FFF"})
	    		} else {         // else start a new playlist
			    	console.log(`fname: ${target.fname}`)
			    	clearPlaylist()
			    	addToPlaylist(target)
			    	dragging=true;
			    	////ev.target.style.backgroundColor= "#FFF";
			    	target.attr({"fill": "#FFF"})
			    }
		    }
	    })

	    cell.node.addEventListener('mousemove', function(ev){
	    	target=ev.target.cell;
	    	if (dragging && (target.id != lastSelectedCellID)) {
	    		addToPlaylist(target)
	    		////ev.target.style.backgroundColor= "#FFF";
	    		target.attr({"fill": "#FFF"})
	    	}
	    })

	    cell.node.addEventListener('mouseup', function(ev){
	    	target=ev.target.cell
	    	ev.preventDefault()
		    ev.stopPropagation()	    	
	    	if (ev.shiftKey || ev.ctrlKey) return;
	    	dragging=false

	    	// mouse click on single cell (no playlist) just plays it.
	    	if ((playlist.length==1) && (target.id == lastSelectedCellID)) {
	    		target.audioClip.play()
	    		clearPlaylist()
	    	}
	    })


  	}

  }
}

playCount=0
let scheduleNextPlay=function(i){
	playTimer = setTimeout(function(){ 
		////playlist[i-1].style.backgroundColor= "#FFF";
		playlist[i-1].attr({"fill": "#FFF"})
		////playlist[i].style.backgroundColor= "#0F0";
		playlist[i].attr({"fill": "#0F0"})
		//console.log(`playing sound list number ${i}`)
		playlist[i].audioClip.play();

		if (playlist.length > i+1){  // done playing all sounds on playlist?
			scheduleNextPlay(++i);
		} else { // just set up a call to turn the color when the sound is done playing
			playTimer = setTimeout(function(){
				//playlist[i].style.backgroundColor= "#FFF";
				playlist[i].attr({"fill": "#FFF"})
			}, IOI);
		}
	 }, IOI);

}

// Plays sounds attached to cells on the list in playlist
let playTheList=function(){
	//playlist[0].style.backgroundColor= "#0F0";
	playlist[0].attr({"fill":"#0F0"})
	playlist[0].audioClip.play()
	if (playlist.length > 1){
		scheduleNextPlay(1)
	}
}

// Add a cell to the playlist
let addToPlaylist=function(c){
	playlist.push(c)
	c.selected=true
	lastSelectedCellID=c.id
}

// Empties the playlist, turns the playlist cells back to their normal color
let clearPlaylist=function(){
	for (i=playlist.length-1;i>=0;i--){
		playlist[i].selected=false;
		//playlist[i].style.backgroundColor=cell2colorstring(playlist[i].row,playlist[i].col)
		playlist[i].attr({"fill" : cell2colorstring(playlist[i].row,playlist[i].col)})
		playlist.pop();
		lastSelectedCellID=null;

		clearTimeout(playTimer)
	}
}

let removeOneFromPlaylist=function(cell){
	for (i=playlist.length-1;i>=0;i--){
		if (playlist[i]==cell){
			playlist[i].selected=false;
			playlist[i].attr({"fill" : cell2colorstring(playlist[i].row,playlist[i].col)})
			playlist.splice(i, 1);
		}		
		//lastSelectedCellID=null;
	}
}

document.addEventListener('keydown', function (ev) {
  //console.log(` ${ev.code}`);
  switch(ev.key) {
  case "Escape":
  	ev.preventDefault()
	ev.stopPropagation()	    	
    clearPlaylist()
    break;
  case "Control":
  	ev.preventDefault()
	ev.stopPropagation()	    	
    break;

   }
});

document.addEventListener('contextmenu', event => event.preventDefault());
/* 
	These functions map the (row,col) to points on the hue, saturation disk. 
*/

let map=function(x,a,b,m,n) {
	return m + ((x-a)/(b-a))*(n-m)
}

let cartesian2Polar=function(x, y){
    distance = Math.sqrt(x*x + y*y)
    radians = Math.atan2(y,x) //This takes y first
    polarCoor = { distance:distance, radians:radians , degrees: radians* (180/Math.PI)}
    return polarCoor
}

let cell2colorstring=function(row, col){
	x= map(row, 0, numRows, -.70, .70)
	y=map(col,0,numCols,-.70, .70)

	pc=cartesian2Polar(x,y)
	//let cs = `hsl(${pc.degrees},${100*pc.distance}%,40%)`
	//console.log(`colorstring[${row},${col}]=${cs}`)

	// convert for raphael in [0,1] for each
	pc.degrees = (pc.degrees + 180)/360.
	cs = `hsl(${pc.degrees},${pc.distance},.4)`
	//console.log(` NEW  colorstring[${row},${col}]=${cs}`)
	return cs
}

// -------------------------------------------------------------


makeGrid(numRows, numCols);

