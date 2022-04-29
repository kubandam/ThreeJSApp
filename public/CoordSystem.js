import * as THREE from 'three';

export class CoordSystem{
    constructor(){
        this.count = 0
        this.CubeGeometry = new THREE.SphereGeometry(  0.02, 50, 50 );
	    this.matrix = new THREE.Matrix4();
    }
    setScene = (scene) => {
        this.scene = scene
    }
    setLines = (lines) => {
        this.lines = lines
    }
    setController = (controller) => {
        this.controller = controller
    }
    createCoord = () => {
        if(this.count == 0){
            this.createOrigin()
        }else if(this.count == 1){
            this.createAxisOne()
        }else if(this.count == 2){
            this.createAxisTwo()
        }
        this.count++;
    }
    reset = () => {
        this.count = 0;
    }
    createOrigin = () => {
        this.Origin = new THREE.Mesh( this.CubeGeometry, new THREE.MeshStandardMaterial( { color: 0xffff00 } ) );
		this.Origin.quaternion.setFromRotationMatrix( this.controller.matrixWorld );
		this.Origin.position.set( 0, 0, 0 ).applyMatrix4( this.controller.matrixWorld );
        //
        //this.Origin.position.set(0,1,0);
        this.Origin.name = "Origin";
        this.scene.add(this.Origin);
    }
    createAxisOne = () => {
        this.AxisOne = new THREE.Mesh( this.CubeGeometry, new THREE.MeshStandardMaterial( { color: 0x00ff00 } ) );
		this.AxisOne.quaternion.setFromRotationMatrix( this.controller.matrixWorld );
		this.AxisOne.position.set( 0, 0, 0 ).applyMatrix4( this.controller.matrixWorld );
        //
        //this.AxisOne.position.set(2,1,1);
        this.AxisOne.name = "AxisOne";
        this.scene.add(this.AxisOne);
        this.CreateLineOriginOne()
    }
    createAxisTwo = () => {
        this.AxisTwo = new THREE.Mesh( this.CubeGeometry, new THREE.MeshStandardMaterial( { color: 0x0000ff } ) );
		this.AxisTwo.quaternion.setFromRotationMatrix( this.controller.matrixWorld );
		this.AxisTwo.position.set( 0, 0, 0 ).applyMatrix4( this.controller.matrixWorld );
        //
        //this.AxisTwo.position.set(1,1,2);
        this.AxisTwo.name = "AxisTwo";
        this.scene.add(this.AxisTwo);
        this.CreateLineOriginTwo()
        this.createAxisThree();
    }
    createAxisThree = () => {       
        this.AxisThree = new THREE.Mesh( this.CubeGeometry, new THREE.MeshStandardMaterial( { color: 0xff0000 } ) );
        this.AxisThree.position.copy(this.getPosOfNewAxis());
        this.AxisThree.name = "AxisThree";
        this.scene.add(this.AxisThree);
        this.CreateLineOriginThree()
    }

    CreateLineOriginOne = () => {
        const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 10 });
        let geometry = new THREE.BufferGeometry().setFromPoints([this.Origin.position, this.AxisOne.position]);
        this.LineOriginOne = new THREE.Line( geometry, material );
        this.LineOriginOne.name = "LineOriginOne";
        this.lines.add(this.LineOriginOne);
    }

    CreateLineOriginTwo = () => {
        const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 10 });
        let geometry = new THREE.BufferGeometry().setFromPoints([this.Origin.position, this.AxisTwo.position]);
        this.LineOriginTwo = new THREE.Line( geometry, material );
        this.LineOriginTwo.name = "LineOriginTwo";
        this.lines.add(this.LineOriginTwo);
    }

    CreateLineOriginThree = () => {
        const material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 10 });
        let geometry = new THREE.BufferGeometry().setFromPoints([this.Origin.position, this.AxisThree.position]);
        this.LineOriginThree = new THREE.Line( geometry, material );
        this.LineOriginThree.name = "LineOriginThree";
        this.lines.add(this.LineOriginThree);
    }

    onSelectStart = (name) => {
        if(name == "Origin"){
            this.Origin.material.emissive.b = 1;
            this.Origin.children = [];

            this.controller.attach( this.Origin );
            this.controller.userData.selected = this.Origin;

            this.lines.remove(this.LineOriginOne);
            this.lines.remove(this.LineOriginTwo);
            this.lines.remove(this.LineOriginThree);
            this.scene.remove(this.AxisThree);
        }else if(name == "AxisOne"){
            this.AxisOne.material.emissive.b = 1;
            this.AxisOne.children = [];

            this.controller.attach( this.AxisOne );
            this.controller.userData.selected = this.AxisOne;

            this.lines.remove(this.LineOriginOne);
            this.lines.remove(this.LineOriginThree);
            this.scene.remove(this.AxisThree);
        }else if(name == "AxisTwo"){
            this.AxisTwo.material.emissive.b = 1;
            this.AxisTwo.children = [];

            this.controller.attach( this.AxisTwo );
            this.controller.userData.selected = this.AxisTwo;

            this.lines.remove(this.LineOriginTwo);
            this.lines.remove(this.LineOriginThree);
            this.scene.remove(this.AxisThree);
        }
    }

    onSelectEnd = (name) =>{
        if(name == "Origin"){		
            this.Origin.material.emissive.b = 0;
			this.scene.attach( this.Origin );
			this.controller.userData.selected = undefined;
            this.CreateLineOriginOne();
            this.CreateLineOriginTwo();
            this.createAxisThree();
        }else if(name == "AxisOne"){            
            this.AxisOne.material.emissive.b = 0;
			this.scene.attach( this.AxisOne );
			this.controller.userData.selected = undefined;
            this.CreateLineOriginOne();
            this.createAxisThree();
        }else if(name == "AxisTwo"){       
            this.AxisTwo.material.emissive.b = 0;
			this.scene.attach( this.AxisTwo );
			this.controller.userData.selected = undefined;
            this.CreateLineOriginTwo();
            this.createAxisThree();
        }
    }

    createLocalSpace = (e3) =>{
        let v1 = new THREE.Vector3().copy(this.AxisOne.position);
        let v2 = new THREE.Vector3().copy(this.AxisTwo.position);
        let o = new THREE.Vector3().copy(this.Origin.position);
        
        v1.sub(o).normalize();
        v2.sub(o).normalize();
    
        this.matrix.set(	v1.x, e3.x, v2.x, o.x,
                            v1.y, e3.y, v2.y, o.y,
                            v1.z, e3.z, v2.z, o.z,
        					0 ,   0 ,   0 ,   1 )	
    }

    getPosOfNewAxis = () => {
        let v1 = new THREE.Vector3().copy(this.AxisOne.position);
        let v2 = new THREE.Vector3().copy(this.AxisTwo.position);
        let o = new THREE.Vector3().copy(this.Origin.position);
    
        v1.sub(o);
        v2.sub(o);
    
        let e1 = new THREE.Vector3().copy(v1);
        e1.normalize()
    
        let u2 = v2.sub(e1.multiplyScalar((v2.dot(e1) / e1.dot(e1))));
    
        let e2 = new THREE.Vector3().copy(u2);
        e2.normalize();
    
        let e3 = new THREE.Vector3();
        e3.crossVectors(e1,e2).normalize();

        this.createLocalSpace(e3);
    
        return new THREE.Vector3(o.x + e3.x * 0.25, o.y + e3.y * 0.25, o.z + e3.z * 0.25);
    }

}