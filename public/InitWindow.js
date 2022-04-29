import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { ARButton } from 'ARButton';

export class InitWindow{
    constructor(){
        this.container = document.getElementById( 'app' );
        document.body.appendChild( this.container );

        this.scene = new THREE.Scene();
        
        this.Camera();
        this.Controls();  
        this.Light();

        this.Render();
        this.Controllers();
        
        window.addEventListener( 'resize', this.onWindowResize );

    }

    Render = () => {
        this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        this.renderer.xr.enabled = true;
        this.container.appendChild( this.renderer.domElement );
        document.body.appendChild( ARButton.createButton( this.renderer ) );
    }

    Controllers = () => {
        this.controller = this.renderer.xr.getController( 0 );

        this.line = new THREE.Line(  new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] ) );
        this.line.name = 'line';
        this.line.scale.z = 5;
        this.controller.add( this.line.clone() );
        this.scene.add( this.controller );
    }

    Camera = () =>{
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 1000 );
	    this.camera.position.set( 0, 1.6, 3 );
        this.scene.add(this.camera)
    }

    Controls = () =>{
        this.controls = new OrbitControls( this.camera, this.container );
        this.controls.target = new THREE.Vector3( 0, 1.6, 0 );
        this.controls.update();
    }

    Light = () =>{
        this.light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
        this.light.position.set( 0.5, 1, 0.25 );
        this.scene.add( this.light );
    }

    onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }



}