import { View as GraphicsView } from 'expo-graphics';
import ExpoTHREE, { THREE } from 'expo-three';
import React from 'react';
import { Dimensions, View,Text, PanResponder } from 'react-native';
const window = Dimensions.get('window');

export default class App extends React.Component {
  panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (e, gesture) => true,
    onPanResponderGrant: ({ nativeEvent }, gesture) => {
      this.onTouch(nativeEvent.pageX, nativeEvent.pageY);
    },
    onPanResponderMove: ({ nativeEvent }, gestureState) => {
      this.onTouch(nativeEvent.locationX, nativeEvent.locationY);
    },
  });

  componentDidMount() {
    THREE.suppressExpoWarnings();
  }

  onTouch = (x, y) => {
    if (!this.raycaster) {
      this.raycaster = new THREE.Raycaster();
    }

    const position = new THREE.Vector2();

    position.x = (x / window.width) * 2 - 1;
    position.y = -(y / window.height) * 2 + 1;

    console.log(`position (${position.x},${position.y})`);

    this.raycaster.setFromCamera(position, this.camera);

    const intersects = this.raycaster.intersectObjects(this.scene.children);
    console.log('yo intersects', intersects.length);

    for (let i = 0; i < intersects.length; i++) {
      intersects[i].object.material.color.set(
          Math.floor(Math.random() * 16777215)
      );
    }
  };

  render() {
    // Create an `ExpoGraphics.View` covering the whole screen, tell it to call our
    // `onContextCreate` function once it's initialized.
    return (
        <View
            {...this.panResponder.panHandlers}
            style={{ width: window.width, height: window.height, flex: 1 }}>
          <Text>{"Hello"}</Text>
          <GraphicsView
              style={{ flex: 1 }}
              onContextCreate={this.onContextCreate}
              onRender={this.onRender}
          />
        </View>
    );
  }

  // This is called by the `ExpoGraphics.View` once it's initialized
  onContextCreate = async ({
                             gl,
                             canvas,
                             width,
                             height,
                             scale: pixelRatio,
                           }) => {
    // expo-graphics 이슈일 가능성 있음, expo-gl 로 변경 필요할듯?
    gl.canvas = {width, height};
    console.log('on context create!!!!');
    this.renderer = new ExpoTHREE.Renderer({ gl, pixelRatio, width, height });
    this.renderer.setClearColor(0xffffff);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 5;
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    const material = new THREE.MeshPhongMaterial({
      color: 0xff8888,
    });

    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    this.scene.add(new THREE.AmbientLight(0xffffff));

    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(3, 3, 3);
    this.scene.add(light);
  };

  onRender = (delta) => {
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
    this.renderer.render(this.scene, this.camera);
  };
}
