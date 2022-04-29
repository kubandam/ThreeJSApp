import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { ARButton } from 'ARButton';
import ThreeMeshUI from 'ThreeMeshUi';
import {TextPanel} from 'TextPanel';
import {InitWindow} from 'InitWindow';
import data from './data.json'  assert { type: "json" }

let originColor = 0xffff00;
let xColor = 0xff0000;
let yColor = 0x00ff00;
let zColor = 0x0000ff;

let FontJSON = './assets/Roboto-msdf.json';
let FontImage = './assets/Roboto-msdf.png';

let CoordO, CoordX, CoordY, CoordZ;
let LineOX, LineOY, LineOZ;
let coords_count = 0;

let container, textCont, textcontainer2, container2;
let camera, scene, renderer, localMatrix;
let controller, controller2;
let controllerGrip1, controllerGrip2;

let raycaster;

const intersected = [];
const tempMatrix = new THREE.Matrix4();

let controls, group,newPoints;


window.addEventListener( 'load', init );
window.addEventListener( 'resize', onWindowResize );


const init = () => {
	container = document.getElementById( 'app' );
	document.body.appendChild( container );

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 1000 );
	camera.position.set( 0, 1.6, 3 );

	controls = new OrbitControls( camera, container );
	controls.target = new THREE.Vector3( 0, 1.6, 0 );
	controls.update();

	var light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
	light.position.set( 0.5, 1, 0.25 );
	scene.add( light );

	group = new THREE.Group();
	newPoints = new THREE.Group();
	scene.add( group );
	scene.add(newPoints);

	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.shadowMap.enabled = true;
	renderer.xr.enabled = true;
	container.appendChild( renderer.domElement );

	document.body.appendChild( ARButton.createButton( renderer ) );

	// controllers

	controller = renderer.xr.getController( 0 );
	//controller.addEventListener( 'selectstart', onSelectStart );
	//controller.addEventListener( 'selectend', onSelectEnd );
	scene.add( controller );

	calc();
	
	//makeTextPanel();

	const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );
	const line = new THREE.Line( geometry );
	line.name = 'line';
	line.scale.z = 5;

	controller.add( line.clone() );

	raycaster = new THREE.Raycaster();

	renderer.setAnimationLoop( render );
}


function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}


function calc(){
	// LOG MSG: v1 - x: 0.005908578634262085 y: -0.3584974408149719 z: -0.6021806001663208

	// 1.1 | Edge | POST | 3/22/2022, 12:39:04 PM | https://192.168.137.1:8000//logMsg
	// LOG MSG: o - x: -0.09012147039175034 y: -0.3617953360080719 z: -0.41405704617500305

	// 1.1 | Edge | POST | 3/22/2022, 12:39:04 PM | https://192.168.137.1:8000//logMsg
	// LOG MSG: v2 - x: 0.12211630493402481 y: -0.34081023931503296 z: -0.32565128803253174

	const CubeGeometry = new THREE.SphereGeometry(  0.05, 50, 50 );

	const CubeMaterialOrigin = new THREE.MeshStandardMaterial( { color: 0x000000 } );
	const CubeMaterialOne = new THREE.MeshStandardMaterial( { color: 0xff0000 } );
	const CubeMaterialTwo = new THREE.MeshStandardMaterial( { color: 0x0000ff } );

	let one = new THREE.Mesh( CubeGeometry, CubeMaterialOne );
	let two = new THREE.Mesh( CubeGeometry, CubeMaterialTwo );
	let origin = new THREE.Mesh( CubeGeometry, CubeMaterialOrigin );

	one.position.set(5,3,3);
	two.position.set(2,2,7);
	origin.position.set(0,1,0);

	// one.position.set(0.005908578634262085, -0.3584974408149719, -0.6021806001663208);
	// two.position.set(0.12211630493402481, -0.34081023931503296, -0.32565128803253174);
	// origin.position.set(-0.09012147039175034, -0.3617953360080719, -0.41405704617500305);

	group.add( one );
	group.add( two );
	group.add( origin );


	let points = [];
	points.push( origin.position );
	points.push( one.position );
	const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 10 });
	let geometry = new THREE.BufferGeometry().setFromPoints( points );
	LineOZ = new THREE.Line( geometry, material );
	scene.add(LineOZ);

	points = [];
	points.push( origin.position );
	points.push( two.position );
	geometry = new THREE.BufferGeometry().setFromPoints( points );
	LineOZ = new THREE.Line( geometry, material );
	scene.add(LineOZ);
	
	let v1 = new THREE.Vector3(one.position.x, one.position.y, one.position.z);
	let v2 = new THREE.Vector3(two.position.x, two.position.y, two.position.z);
	let o = new THREE.Vector3(origin.position.x, origin.position.y, origin.position.z);

	v1.sub(o);
	v2.sub(o);

	let e1 = new THREE.Vector3();
	e1.copy(v1);
	e1.normalize()

	let u2 = v2.sub(e1.multiplyScalar((v2.dot(e1) / e1.dot(e1))));

	let e2 = new THREE.Vector3();
	e2.copy(u2);
	e2.normalize();

	let e3 = new THREE.Vector3();
	e3.crossVectors(e1,e2).normalize();


	let y = new THREE.Vector3();
	y.x = o.x + e3.x;
	y.y = o.y + e3.y;
	y.z = o.z + e3.z;


	const CubeMaterialThree = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
	let Three = new THREE.Mesh( CubeGeometry, CubeMaterialThree );
	Three.position.copy(y);
	group.add( Three );

	
	points = [];
	points.push( origin.position );
	points.push( Three.position );
	geometry = new THREE.BufferGeometry().setFromPoints( points );
	LineOZ = new THREE.Line( geometry, material );
	scene.add(LineOZ);

	let v11 = new THREE.Vector3(two.position.x, two.position.y, two.position.z);
	let v22 = new THREE.Vector3(one.position.x, one.position.y, one.position.z);
	
	v11.sub(o);
	v22.sub(o);

	v11.normalize()
	v22.normalize();
	localMatrix = new THREE.Matrix4();
	localMatrix.set(	v11.x, e3.x, v22.x, o.x,
						v11.y, e3.y, v22.y, o.y,
						v11.z, e3.z, v22.z, o.z,
						0 ,   0 ,   0 ,   1 )	

	createTextPanels()

}

function createTextPanels(){
	newPoints.children = [];
	data.forEach(panel => {
		let pos = new THREE.Vector4(panel.position.x, panel.position.y, panel.position.z, 1);
		pos = pos.applyMatrix4(localMatrix);

		var newPanel = new TextPanel(pos,panel);
		newPoints.add(newPanel.cont);
	});
}

function makeTextPanel() {

	textcontainer2 = new ThreeMeshUI.Block( {
		width: 1,
		height: 1,
		padding: 0.09,
		backgroundColor: new THREE.Color( 'black' ),
		backgroundOpacity: 0.2,
		justifyContent: 'center',
		hiddenOverflow: 'auto'
	} );

	scene.add( textcontainer2 );

	const text = new ThreeMeshUI.Text( {
		content: 'hiddenOverflow '.repeat( 80 ),
		fontFamily: FontJSON,
		fontTexture: FontImage,
	} );

	textcontainer2.add( text );


}

function createLine(type){
	if(type == "x" || type == "o"){

		const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 10 });
		const points = [];
		points.push( CoordO.position );
		points.push( CoordX.position );
		const geometry = new THREE.BufferGeometry().setFromPoints( points );
		LineOX = new THREE.Line( geometry, material );
		LineOX.name = "o-x";
		scene.add(LineOX);

	}
	if(type == "z" || type == "o"){

		const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 10 });
		const points = [];
		points.push( CoordO.position );
		points.push( CoordZ.position );
		const geometry = new THREE.BufferGeometry().setFromPoints( points );
		LineOZ = new THREE.Line( geometry, material );
		LineOZ.name = "o-z";
		scene.add(LineOZ);
	}
}

function createCubeText(cube){
	if(cube.name == "o"){
		var name = "ORIGIN"
	}else if(cube.name == "x"){
		var name = "Suradnica X"
	}else if(cube.name == "z"){
		var name = "Suradnica Z"
	}else if(cube.name == "y"){
		var name = "Suradnica Y"
	}
	const cont = new ThreeMeshUI.Block( {
		width: 0.1,
		height: 0.1,
		padding: 0.01,
		alignContent: 'left',
		fontFamily: FontJSON,
		fontTexture: FontImage
	} );
	cube.add(cont);
	cont.position.y += 0.07;
	var text = 	name + "\n" +
				"x: " + round(cube.position.x, 7) + "\n" +
				"z: " + round(cube.position.z, 7) + "\n" +
				"y: " + round(cube.position.y, 7);
	cont.add(
		new ThreeMeshUI.Text( {
			content: text,
			fontSize: 0.009
		} ),
	);
}

function createCoords(){
	const CubeGeometry = new THREE.SphereGeometry(  0.02, 50, 50 );
	if( coords_count == 0){
		//let CubeMaterial = new THREE.MeshStandardMaterial({map: textureO})
		const CubeMaterial = new THREE.MeshStandardMaterial( { color: originColor } );
		CoordO = new THREE.Mesh( CubeGeometry, CubeMaterial );
		CoordO.quaternion.setFromRotationMatrix( controller.matrixWorld );
		CoordO.position.set( 0, 0, 0 ).applyMatrix4( controller.matrixWorld );
		CoordO.name = "o"
		createCubeText(CoordO);
		group.add( CoordO );

	}else if(coords_count == 1){
		let CubeMaterial = new THREE.MeshStandardMaterial({ color: xColor } )
		CoordX = new THREE.Mesh( CubeGeometry, CubeMaterial );
		CoordX.quaternion.setFromRotationMatrix( controller.matrixWorld );
		CoordX.position.set( 0, 0, 0 ).applyMatrix4( controller.matrixWorld );
		CoordX.name = "x"
		createCubeText(CoordX);
		createLine(CoordX.name);
		group.add( CoordX );

	}else if(coords_count == 2){
		let CubeMaterial = new THREE.MeshStandardMaterial({color: zColor})
		CoordZ = new THREE.Mesh( CubeGeometry, CubeMaterial );
		CoordZ.quaternion.setFromRotationMatrix( controller.matrixWorld );
		CoordZ.position.set( 0, 0, 0 ).applyMatrix4( controller.matrixWorld );
		CoordZ.name = "z"
		createCubeText(CoordZ);
		createLine(CoordZ.name);
		group.add( CoordZ );
		calc();
	}
	coords_count++;
}

function onSelectStart( event ) {
	const controller = event.target;
	const intersections = getIntersections( controller );

	if(coords_count < 3){
		createCoords()
	}else{
		if ( intersections.length > 0 ) {
			logMsg("func: onSelectStart");
			if(intersections[ 0 ].object.name == "o"){
				CoordO.material.emissive.b = 1;
				CoordO.children = [];
				controller.attach( CoordO );
				controller.userData.selected = CoordO;
				scene.remove(LineOX);
				scene.remove(LineOZ);
			}else if(intersections[ 0 ].object.name == "x"){
				CoordX.material.emissive.b = 1;
				CoordX.children = [];
				controller.attach( CoordX );
				controller.userData.selected = CoordX;
				scene.remove(LineOX);
			}else if(intersections[ 0 ].object.name == "z"){
				CoordZ.material.emissive.b = 1;
				CoordZ.children = [];
				controller.attach( CoordZ );
				controller.userData.selected = CoordZ;
				scene.remove(LineOZ);
			}
		}
	}

}

function onSelectEnd( event ) {

	const controller = event.target;

	if ( controller.userData.selected !== undefined ) {
		logMsg("func: onSelectEnd");
		if(controller.userData.selected.name == "o"){
			CoordO.material.emissive.b = 0;
			createCubeText(CoordO);
			group.attach( CoordO );
			controller.userData.selected = undefined;
			createLine(CoordX.name);
			createLine(CoordZ.name);
		}else if(controller.userData.selected.name == "x"){
			CoordX.material.emissive.b = 0;
			createCubeText(CoordX);
			group.attach( CoordX );
			controller.userData.selected = undefined;
			createLine(CoordX.name);
		}else if(controller.userData.selected.name == "z"){
			CoordZ.material.emissive.b = 0;
			createCubeText(CoordZ);
			group.attach( CoordZ );
			controller.userData.selected = undefined;
			createLine(CoordZ.name);
		}
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
		if(intersections[ 0 ].object.name == "o"){
			CoordO.material.emissive.r = 1
			intersected.push( CoordO );
		}else if(intersections[ 0 ].object.name == "x"){
			CoordX.material.emissive.r = 1
			intersected.push( CoordX );
		}else if(intersections[ 0 ].object.name == "z"){
			CoordZ.material.emissive.r = 1
			intersected.push( CoordZ );
		}
		line.scale.z = intersections[ 0 ].distance;
	} else {
		line.scale.z = 5;
	}

}

function cleanIntersected() {

	while ( intersected.length ) {

		const object = intersected.pop();
		if(object.name == "o"){
			CoordO.material.emissive.r = 0
		}else if(object.name == "x"){
			CoordX.material.emissive.r = 0
		}else if(object.name == "z"){
			CoordZ.material.emissive.r = 0
		}
	}

}

function render() {
	ThreeMeshUI.update();

	cleanIntersected();

	intersectObjects( controller );
	
	renderer.render( scene, camera );	

	//textCont.rotation.y = Math.atan2( ( camera.position.x - textCont.position.x ), ( camera.position.z - textCont.position.z ) );
	//textCont.lookAt( camera.position );
	
	newPoints.children.forEach(function(pChild) {
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


init();
animate();