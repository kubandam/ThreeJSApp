import * as THREE from 'three';
import ThreeMeshUI from 'ThreeMeshUi';
import {TextPanel} from 'TextPanel';
import {InitWindow} from 'InitWindow';
import {CoordSystem} from 'CoordSystem';
import data from './DynamicData.json'  assert { type: "json" }

const initWindow = new InitWindow()
const coordSystem = new CoordSystem()
var raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();
const intersected = [];
var scene, camera, controller, renderer, group, textPoints, lines


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

	//controller.addEventListener( 'selectstart', onSelectStart );
	//controller.addEventListener( 'selectend', onSelectEnd );

	coordSystem.createOrigin()
	coordSystem.createAxisOne()
	coordSystem.createAxisTwo()

	createTextPanels();

	// one.position.set(0.005908578634262085, -0.3584974408149719, -0.6021806001663208);
	// two.position.set(0.12211630493402481, -0.34081023931503296, -0.32565128803253174);
	// origin.position.set(-0.09012147039175034, -0.3617953360080719, -0.41405704617500305);

	renderer.setAnimationLoop( render );

}

function createTextPanels(){
	textPoints.children = [];
	data.forEach(panel => {
		let pos = new THREE.Vector4(panel.position.x, panel.position.y, panel.position.z, 1);
		pos = pos.applyMatrix4(coordSystem.matrix);

		var newPanel = new TextPanel(pos,panel);
		textPoints.add(newPanel.cont);
	});
}


function onSelectStart( event ) {
	const controller = event.target;
	const intersections = getIntersections( controller );
	coordSystem.setController(controller);
	if(coordSystem.count < 3){
		coordSystem.createCoord()
	}else{
		if ( intersections.length > 0 ) {
			logMsg("func: onSelectStart");
			coordSystem.onSelectStart(intersections[ 0 ].object.name);
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

	//cleanIntersected();

	//intersectObjects(controller);
	
	renderer.render( initWindow.scene, initWindow.camera );	

	//textCont.rotation.y = Math.atan2( ( camera.position.x - textCont.position.x ), ( camera.position.z - textCont.position.z ) );
	//textCont.lookAt( camera.position );
	
	textPoints.children.forEach(function(pChild) {
		pChild.lookAt( camera.position );
	});
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

function round(num, decimalPlaces) {
    num = Math.round(Math.abs(num) + "e" + decimalPlaces) * Math.sign(num);
    return Number(num + "e" + -decimalPlaces);
}
