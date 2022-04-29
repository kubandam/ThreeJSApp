import * as THREE from 'three';
import ThreeMeshUI from 'https://cdn.skypack.dev/three-mesh-ui';

let FontJSON = './assets/Roboto-msdf.json';
let FontImage = './assets/Roboto-msdf.png';

export class TextPanel {
	constructor(pos,panel){	
		createPanel(panel)
        this.setPos(pos) 
	}
    createPanel(panel){
        this.cont = new ThreeMeshUI.Block( {
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
		const innerContainer = new ThreeMeshUI.Block( {
			width: 0.95,
			height: 0.45,
			padding: 0.03,
			backgroundColor: new THREE.Color( 0xffffff ),
			backgroundOpacity: 0.5,
			bestFit: 'auto'
		} );
		this.cont.add( innerContainer );

		const firstTextBlock = new ThreeMeshUI.Text( {
			content: panel.text,
			fontSize: 0.08
		} );

		innerContainer.add( firstTextBlock );   
    }

    setPos = (pos) => {
	    this.cont.position.copy(pos);
    }
}  
