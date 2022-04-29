import * as THREE from 'three';
import ThreeMeshUI from 'ThreeMeshUi';
import {InitWindow} from 'InitWindow';
import {CoordSystem} from 'CoordSystem';
import data from './DynamicData.json'  assert { type: "json" }
let FontJSON = './assets/Roboto-msdf.json';
let FontImage = './assets/Roboto-msdf.png';

const initWindow = new InitWindow()
const coordSystem = new CoordSystem()
var raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();
const intersected = [];
var scene, camera, controller, renderer, group, textPoints, lines, reset


window.addEventListener( 'load', init )

function init(){
	
	scene = initWindow.scene
	camera = initWindow.camera
	renderer = initWindow.renderer
	controller = initWindow.controller

	group = new THREE.Group()
	textPoints = new THREE.Group()
	lines = new THREE.Group()

	scene.add( group )
	scene.add( lines )
	scene.add( textPoints )

	coordSystem.setScene(group);
	coordSystem.setLines(lines)
	coordSystem.setController(controller);

	controller.addEventListener( 'selectstart', onSelectStart );
	controller.addEventListener( 'selectend', onSelectEnd );
	
	// coordSystem.createOrigin();
	// coordSystem.createAxisOne();
	// coordSystem.createAxisTwo();

	renderer.setAnimationLoop( render );
	
	//createTextPanels()
}

function createTextPanels(){
	textPoints.children = [];
	data.forEach(panel => {
		createText2(panel);
	});
}

function resetApp(){
	this.group.children = []
	this.group.lines = []
	this.coordSystem.reset()
}

function onSelectStart( event ) {
	const controller = event.target;
	const intersections = getIntersections( controller );
	coordSystem.setController(controller);
	if(coordSystem.count < 3){
		coordSystem.createCoord()
		if(coordSystem.count == 3){
			createTextPanels()
			createResetButton()
		}
	}else{
		if ( intersections.length > 0 ) {
			logMsg("func: onSelectStart");
			if(intersections[ 0 ].object.name == "Restart"){
				//resetApp();
			}else{
				coordSystem.onSelectStart(intersections[ 0 ].object.name);
			}
		}
	}

}

function onSelectEnd( event ) {
	const controller = event.target;
	if ( controller.userData.selected !== undefined ) {
		logMsg("func: onSelectEnd");		
		coordSystem.onSelectEnd(controller.userData.selected.name );
		createTextPanels()
	}
}

function getIntersections( controller ) {

	tempMatrix.identity().extractRotation( controller.matrixWorld );
	raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
	raycaster.ray.direction.set( 0,0,-1 ).applyMatrix4( tempMatrix );
	return raycaster.intersectObjects( group.children, false );

}

function intersectObjects( controller ) {

	if ( controller.userData.selected !== undefined ) return;

	const line = controller.getObjectByName( 'line' );
	const intersections = getIntersections( controller );

	if ( intersections.length > 0 ) {
		if(intersections[ 0 ].object.name == "Origin"){
			coordSystem.Origin.material.emissive.r = 1
			intersected.push( coordSystem.Origin );
			line.scale.z = intersections[ 0 ].distance;
		}else if(intersections[ 0 ].object.name == "AxisOne"){
			coordSystem.AxisOne.material.emissive.r = 1
			intersected.push( coordSystem.AxisOne );
			line.scale.z = intersections[ 0 ].distance;
		}else if(intersections[ 0 ].object.name == "AxisTwo"){
			coordSystem.AxisTwo.material.emissive.r = 1
			intersected.push( coordSystem.AxisTwo );
			line.scale.z = intersections[ 0 ].distance;
		}else if(intersections[ 0 ].object.name == "Restart"){
			reset.material.emissive.r = 1
			intersected.push( reset );
			line.scale.z = intersections[ 0 ].distance;
		}else{
			line.scale.z = 5;
		}
	} else {
		line.scale.z = 5;
	}

}

function cleanIntersected() {
	while ( intersected.length ) {
		const object = intersected.pop();
		if(object.name == "Origin"){
			coordSystem.Origin.material.emissive.r = 0
		}else if(object.name == "AxisOne"){
			coordSystem.AxisOne.material.emissive.r = 0
		}else if(object.name == "AxisTwo"){
			coordSystem.AxisTwo.material.emissive.r = 0
		}
	}

}

function render() {
	ThreeMeshUI.update();

	cleanIntersected();

	intersectObjects(controller);
	
	renderer.render( initWindow.scene, initWindow.camera );	

	textPoints.children.forEach(function(pChild) {
		pChild.lookAt( camera.position );
	});
	if(reset != null)
		reset.lookAt( camera.position );
}

function logMsg(value){
	let data = {log: value};
	fetch("/logMsg", {
	  method: "POST",
	  headers: {'Content-Type': 'application/json'}, 
	  body: JSON.stringify(data)
	}).then(res => {
	  console.log("Request complete! response:", res);
	});
}

function createResetButton(){
	reset = new ThreeMeshUI.Block( {
		width: 0.2,
		height: 0.10,
		padding: 0.02,
		backgroundColor: new THREE.Color( 0xd9d9d9 ),
		borderRadius: 0.02,
		borderWidth: 0.0001,
		borderColor: new THREE.Color( 0x333333 ),
		justifyContent: 'center',
		alignItems: 'center',
		fontColor: new THREE.Color( 0x111111 ),
		fontFamily: FontJSON,
		fontTexture: FontImage,
	} );
	const innerContainer = new ThreeMeshUI.Block( {
		width: 0.195,
		height: 0.09,
		padding: 0.001,
		justifyContent: 'center',
		alignItems: 'start',
		backgroundColor: new THREE.Color( 0xff0000 ),
		backgroundOpacity: 0.5,
	} );
	const firstTextBlock = new ThreeMeshUI.Text( {
		content: "Restart",
		fontSize: 0.05
	} );
	innerContainer.add( firstTextBlock ); 

	reset.add( innerContainer );
	reset.position.copy(coordSystem.Origin.position);
	reset.position.x += 0.1;
	reset.position.z -= 0.1;
	reset.name = "Restart";
	group.add(reset);
}

function createText2(panel){
	let pos = new THREE.Vector4(panel.position.x, panel.position.y, panel.position.z, 1);
	pos = pos.applyMatrix4(coordSystem.matrix);
	let image = panel.img;
	const cont = new ThreeMeshUI.Block( {
		width: 0.2,
		height: 0.10,
		padding: 0.02,
		backgroundColor: new THREE.Color( 0xd9d9d9 ),
		borderRadius: 0.02,
		borderWidth: 0.0001,
		borderColor: new THREE.Color( 0x333333 ),
		justifyContent: 'center',
		alignItems: 'center',
		fontColor: new THREE.Color( 0x111111 ),
		fontFamily: FontJSON,
		fontTexture: FontImage,
	} );
	const innerContainer = new ThreeMeshUI.Block( {
		width: 0.195,
		height: 0.09,
		padding: 0.001,
		justifyContent: 'center',
		alignItems: 'start',
		backgroundColor: new THREE.Color( 0xffffff ),
		backgroundOpacity: 0.5,
		whiteSpace: 'pre-line',
		bestFit: 'auto'
	} );
	if(image != null){
		const imageBlock = new ThreeMeshUI.Block({
			height: 0.2,
			width: 0.2,
			padding: 0.1,
			margin: 0.0025,
		});
		cont.add( imageBlock );
		const loader = new THREE.TextureLoader();
		loader.load(image, (texture) => {
			imageBlock.set({ backgroundTexture: texture });
		});
	}
	const firstTextBlock = new ThreeMeshUI.Text( {
		content: panel.text,
		fontSize: 0.005
	} );
	innerContainer.add( firstTextBlock ); 

	cont.add( innerContainer );
	cont.position.copy(pos);
	textPoints.add(cont);
}