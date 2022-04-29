import * as THREE from 'three';
import ThreeMeshUI from 'ThreeMeshUi';
import { OrbitControls } from 'OrbitControls';
import { ARButton } from 'ARButton';
import {BoxLineGeometry} from 'BoxLineGeometry';
import {TextPanel} from 'TextPanel';
import {InitWindow} from 'InitWindow';
import {CoordSystem} from 'CoordSystem';
import data from './DynamicData.json'  assert { type: "json" }

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

let FontJSON = './assets/Roboto-msdf.json';
let FontImage = './assets/Roboto-msdf.png';

let scene, camera, renderer, controls, stats;
const innerContainers = [];

window.addEventListener( 'load', init );
window.addEventListener( 'resize', onWindowResize );

//

function init() {

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 60, WIDTH / HEIGHT, 0.1, 100 );

	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( WIDTH, HEIGHT );
	renderer.xr.enabled = true;
	document.body.appendChild( ARButton.createButton( renderer ) );
	document.body.appendChild( renderer.domElement );

	controls = new OrbitControls( camera, renderer.domElement );
	camera.position.set( 0, 1.6, 1.5 );
	controls.target = new THREE.Vector3( 0, 1, -1.8 );
	controls.update();

	// TEXT PANEL

	makeTextPanel();

	//

	renderer.setAnimationLoop( loop );

}

//

function makeTextPanel() {

		const outerContainer = new ThreeMeshUI.Block( {
			width: 1,
			height: 0.50,
			padding: 0.05,
			backgroundColor: new THREE.Color( 0xd9d9d9 ),
			borderRadius: 0.05,
			borderWidth: 0.005,
			borderColor: new THREE.Color( 0x333333 ),
			justifyContent: 'center',
			alignItems: 'center',
			fontColor: new THREE.Color( 0x111111 ),
			fontFamily: FontJSON,
			fontTexture: FontImage,
		} );

		outerContainer.rotation.x = -0.55;
		scene.add( outerContainer );
		
		const innerContainer = new ThreeMeshUI.Block( {
			width: 0.95,
			height: 0.45,
			padding: 0.03,
			backgroundColor: new THREE.Color( 0xffffff ),
			backgroundOpacity: 0.5,
			bestFit: 'auto'
		} );

		outerContainer.add( innerContainer );
		innerContainers.push( innerContainer );

		const firstTextBlock = new ThreeMeshUI.Text( {
			content: 'This option will This option will This option will This option will This option will This option will This option will',
			fontSize: 0.08
		} );

		innerContainer.add( firstTextBlock );


}

// handles resizing the renderer when the viewport is resized

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}


//

function loop() {

	// Don't forget, ThreeMeshUI must be updated manually.
	// This has been introduced in version 3.0.0 in order
	// to improve performance
	ThreeMeshUI.update();

	controls.update();
	renderer.render( scene, camera );

}