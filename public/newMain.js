import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { ARButton } from 'ARButton';
import ThreeMeshUI from 'https://cdn.skypack.dev/three-mesh-ui';

let originColor = 0xffff00;
let xColor = 0xff0000;
let yColor = 0x00ff00;
let zColor = 0x0000ff;

let FontJSON = './assets/Roboto-msdf.json';
let FontImage = './assets/Roboto-msdf.png';

let CoordO, CoordX, CoordY, CoordZ;
let LineOX, LineOY, LineOZ;
let coords_count = 0;

let container, textCont;
let camera, scene, renderer;
let controller, controller2;
let controllerGrip1, controllerGrip2;

let raycaster;

const intersected = [];
const tempMatrix = new THREE.Matrix4();

let controls, group, newPoints;

init();
animate();

function init() {

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
	scene.add(newPoints);
	scene.add( group );


	//
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
	controller.addEventListener( 'selectstart', onSelectStart );
	controller.addEventListener( 'selectend', onSelectEnd );
	scene.add( controller );

	//calc();

	const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );
	const line = new THREE.Line( geometry );
	line.name = 'line';
	line.scale.z = 5;

	controller.add( line.clone() );

	raycaster = new THREE.Raycaster();
	window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}


function calc(){
	
	let v2 = new THREE.Vector3(CoordZ.position.x, CoordZ.position.y, CoordZ.position.z);
	let v1 = new THREE.Vector3(CoordX.position.x, CoordX.position.y, CoordX.position.z);
	let o = new THREE.Vector3(CoordO.position.x, CoordO.position.y, CoordO.position.z);

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
	y.x = o.x + e3.x * 0.25;
	y.y = o.y + e3.y * 0.25;
	y.z = o.z + e3.z * 0.25;

	
	let e33 = new THREE.Vector3();
	e33.crossVectors(e1,e2).normalize();
	
	let v11 = new THREE.Vector3(CoordZ.position.x, CoordZ.position.y, CoordZ.position.z);
	let v22 = new THREE.Vector3(CoordX.position.x, CoordX.position.y, CoordX.position.z);
	let oo = new THREE.Vector3(CoordO.position.x, CoordO.position.y, CoordO.position.z);
	
	v11.sub(oo);
	v22.sub(oo);

	v11.normalize()
	v22.normalize();
	oo = oo.normalize();
	let m = new THREE.Matrix4();
	m.set(	v11.x, e33.x, v22.x, oo.x,
			v11.y, e33.y, v22.y, oo.y,
			v11.z, e33.z, v22.z, oo.z,
		    0 ,   0 ,   0 ,   1 )	

	let newPos = new THREE.Vector4(0,0,0,1);
	newPos = newPos.applyMatrix4(m);

	
	let newPos2 = new THREE.Vector4(1,0,1,1);
	newPos2 = newPos2.applyMatrix4(m);

	newPoints.children = [];
	const cont = new ThreeMeshUI.Block( {
		width: 0.25,
		height: 0.20,
		alignContent: 'center',
		fontFamily: FontJSON,
		fontTexture: FontImage
	} );
	cont.position.copy(newPos);
	newPoints.add(cont);
	cont.add(
		new ThreeMeshUI.Text( {
			content: "test test test test test test test test",
			fontSize: 0.03
		} ),
	);
	const cont2 = new ThreeMeshUI.Block( {
		width: 0.25,
		height: 0.20,
		alignContent: 'center',
		fontFamily: FontJSON,
		fontTexture: FontImage
	} );
	cont2.position.copy(newPos2);
	newPoints.add(cont2);
	cont2.add(
		new ThreeMeshUI.Text( {
			content: "test2 test2 test2 test2 test2 test2 test2 test2",
			fontSize: 0.03
		} ),
	);

	return y;

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
	if(type == "y"){

		const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 10 });
		const points = [];
		points.push( CoordO.position );
		points.push( CoordY.position );
		const geometry = new THREE.BufferGeometry().setFromPoints( points );
		LineOY = new THREE.Line( geometry, material );
		LineOY.name = "o-y";
		scene.add(LineOY);
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
	const CubeGeometry = new THREE.SphereGeometry(  0.015, 50, 50 );
	if( coords_count == 0){
		const CubeMaterial = new THREE.MeshStandardMaterial( { color: originColor } );
		CoordO = new THREE.Mesh( CubeGeometry, CubeMaterial );
		CoordO.quaternion.setFromRotationMatrix( controller.matrixWorld );
		CoordO.position.set( 0, 0, 0 ).applyMatrix4( controller.matrixWorld );
		CoordO.name = "o"
		//createCubeText(CoordO);
		group.add( CoordO );

	}else if(coords_count == 1){
		let CubeMaterial = new THREE.MeshStandardMaterial({ color: xColor } )
		CoordX = new THREE.Mesh( CubeGeometry, CubeMaterial );
		CoordX.quaternion.setFromRotationMatrix( controller.matrixWorld );
		CoordX.position.set( 0, 0, 0 ).applyMatrix4( controller.matrixWorld );
		CoordX.name = "x"
		//createCubeText(CoordX);
		createLine(CoordX.name);
		group.add( CoordX );

	}else if(coords_count == 2){
		let CubeMaterial = new THREE.MeshStandardMaterial({color: zColor})
		CoordZ = new THREE.Mesh( CubeGeometry, CubeMaterial );
		CoordZ.quaternion.setFromRotationMatrix( controller.matrixWorld );
		CoordZ.position.set( 0, 0, 0 ).applyMatrix4( controller.matrixWorld );
		CoordZ.name = "z"
		//createCubeText(CoordZ);
		createLine(CoordZ.name);
		group.add( CoordZ );

		
		let CubeMaterial2 = new THREE.MeshStandardMaterial({color: yColor})
		CoordY = new THREE.Mesh( CubeGeometry, CubeMaterial2 );
		CoordY.name = "y"
		CoordY.position.copy(calc());
		//createCubeText(CoordY);
		createLine(CoordY.name);
		group.add( CoordY );
		
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
			scene.remove(LineOY);
			CoordY.children = [];
			CoordY.visible = false;
		}
	}

}

function onSelectEnd( event ) {

	const controller = event.target;

	if ( controller.userData.selected !== undefined ) {
		logMsg("func: onSelectEnd");
		if(controller.userData.selected.name == "o"){
			CoordO.material.emissive.b = 0;
			//createCubeText(CoordO);
			group.attach( CoordO );
			controller.userData.selected = undefined;
			createLine(CoordX.name);
			createLine(CoordZ.name);
		}else if(controller.userData.selected.name == "x"){
			CoordX.material.emissive.b = 0;
			//createCubeText(CoordX);
			group.attach( CoordX );
			controller.userData.selected = undefined;
			createLine(CoordX.name);
		}else if(controller.userData.selected.name == "z"){
			CoordZ.material.emissive.b = 0;
			//createCubeText(CoordZ);
			group.attach( CoordZ );
			controller.userData.selected = undefined;
			createLine(CoordZ.name);
		}
		CoordY.visible = true;
		CoordY.position.copy(calc());
		//createCubeText(CoordY);
		createLine(CoordY.name);
		group.add( CoordY );
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

//

function animate() {

	renderer.setAnimationLoop( render );

}

function render() {

	ThreeMeshUI.update();

	cleanIntersected();

	intersectObjects( controller );
	
	renderer.render( scene, camera );	

	//textCont.rotation.y = Math.atan2( ( camera.position.x - textCont.position.x ), ( camera.position.z - textCont.position.z ) );

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