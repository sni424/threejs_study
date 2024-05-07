import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Circle {
    constructor() {
        const divContainer = document.querySelector('#webgl-container');
        this._divContainer = divContainer;
        /**랜더러 생성 */
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        /**랜더러 객체 setPixelRatio값 정의 */
        renderer.setPixelRatio(window.devicePixelRatio);
        divContainer.appendChild(renderer.domElement);
        this._renderer = renderer;
        this._isCube = false;
        /**scene객체 생성 */
        const scene = new THREE.Scene();
        /**필드화 시킴 */
        this._scene = scene;
        this._location = new THREE.Vector3(0, 0, 0);
        this._velocity = new THREE.Vector3(0, 0, 0);
        this._dir = new THREE.Vector3(0, 0, 0);

        this._mouse = new THREE.Vector3(0, 0, 0);
        this._center = new THREE.Vector3(0, 0, 0);
        this._isLine = false;
        this._length;
        /**카메라 light, 3차원 모델을 설정하는 _setupModel을 설정  */
        this._setupCamera();
        this._setupLight();
        this._setupModel();
        this._setupControls();

        /**창크기가 변경될때 발생 bind을 사용한 이유는 this가 app클래스 객체가 되기위함 */
        window.onresize = this.resize.bind(this);
        this.resize();

        /**render메서드는 3차원 그래픽장면을 만들어주는 메서드 */
        requestAnimationFrame(this.render.bind(this));
    }
    _setupCamera() {
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;
        const camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            1000
        );
        camera.position.set(0, 0, 5);
        this._camera = camera;
    }
    _setupControls() {
        const material = new THREE.LineBasicMaterial({
            color: 0x0000ff,
        });
        let points = [];
        this._divContainer.addEventListener('mousedown', (event) => {
            this._isCube = false;
            this._location = new THREE.Vector3(0, 0, 0);
            this._velocity = new THREE.Vector3(0, 0, 0);
            this._dir = new THREE.Vector3(0, 0, 0);
            this._cube.removeFromParent();
            this._center = new THREE.Vector3(
                ((event.clientX / this._divContainer.clientWidth) * 2 - 1) *
                    6.5,
                -((event.clientY / this._divContainer.clientHeight) * 2 - 1) *
                    3,
                0
            );

            this._cube.position.set(this._center.x, this._center.y, 0);

            this._scene.add(this._cube);

            points.push(new THREE.Vector3(this._center.x, this._center.y, 0));
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            this._line = new THREE.Line(geometry, material);
            this._scene.add(this._line);
            this._isLine = true;
        });

        this._divContainer.addEventListener('mouseup', (event) => {
            this._isCube = true;

            this._scene.children.map((object) => {
                if (object.type === 'Line') {
                    this._scene.remove(object);
                }
            });

            this._dir = this._mouse.clone().sub(this._center).normalize();
            this._length = this._center.distanceTo(this._mouse);

            this._velocity.add(this._dir);
            console.log(this._line);
            points = [];
            this._isLine = false;
        });

        this._divContainer.addEventListener('mousemove', (event) => {
            if (this._isLine) {
                this._mouse = new THREE.Vector3(
                    ((event.clientX / this._divContainer.clientWidth) * 2 - 1) *
                        6.5,
                    -(
                        (event.clientY / this._divContainer.clientHeight) * 2 -
                        1
                    ) * 3,
                    0
                );

                points = [this._center, this._mouse];

                const geometry = new THREE.BufferGeometry().setFromPoints(
                    points
                );

                this._line.geometry = geometry;
            }
        });
    }
    _setupLight() {
        /**메인광 */
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this._scene.add(ambientLight);
        const directionLight = new THREE.DirectionalLight(0xfffff, 1);
        directionLight.position.set(-1, 2, 4);
        this._scene.add(directionLight);
    }
    _setupModel() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0x44a88 });
        const cube = new THREE.Mesh(geometry, material);
        this._cube = cube;
    }
    resize() {
        /** divCotainer의 width과height를 가져옴  */
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;

        /**카메라 속성값 설정 */
        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();

        /**설정한 값으로 renderer 크기 설정 */
        this._renderer.setSize(width, height);
    }
    render(time) {
        /**render가 _scene을 _camera시점을 이용해서 렌더링해라   */
        this._renderer.render(this._scene, this._camera);
        this.update(time);
        /** 브라우저에게 수행하기를 원하는 애니메이션을 알리고 다음 리페인트가 진행되기 전에 해당 애니메이션을 업데이트하는 함수를 호출하게 합니다. 이 메소드는 리페인트 이전에 실행할 콜백을 인자로 받습니다. */
        requestAnimationFrame(this.render.bind(this));
    }
    update(time) {
        if (this._isCube) {
            time *= 0.001;
            this._cube.rotation.x = time;
            this._cube.rotation.y = time;

            this._location.add(this._velocity);
            this._location.multiplyScalar(this._length * 0.05);

            this._cube.position.add(this._location);

            // 화면 경계에 부딪혔을 때
            const boundaryX = this._divContainer.clientWidth / 250;
            const boundaryY = this._divContainer.clientHeight / 250;

            if (
                this._cube.position.x + 0.5 > boundaryX ||
                this._cube.position.x - 0.5 < -boundaryX
            ) {
                console.log('여기');
                this._velocity.x = this._velocity.x * -1; // x 이동 방향 반전
            }
            if (
                this._cube.position.y + 0.5 > boundaryY ||
                this._cube.position.y - 0.5 < -boundaryY
            ) {
                console.log('여기');
                this._velocity.y = this._velocity.y * -1; // y 이동 방향 반전
            }
        }
    }
}
