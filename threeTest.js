import * as THREE from 'three';

let center, velocity, mouse, dir, m;
let renderer, scene, camera, sphere, line;

export default function init() {
    // Renderer 설정
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(640, 240);
    document.body.appendChild(renderer.domElement);

    // Scene 설정
    scene = new THREE.Scene();

    // Camera 설정
    camera = new THREE.PerspectiveCamera(45, 640 / 240, 0.1, 1000);
    camera.position.z = 500;

    // 구 객체 생성
    const geometry = new THREE.SphereGeometry(24, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x7777ff });
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // 라인 객체 생성
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    line = new THREE.Line(new THREE.BufferGeometry(), lineMaterial);
    scene.add(line);

    // 이벤트 리스너 등록
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // 렌더링 루프 시작
    animate();
}

function onMouseDown(event) {
    mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    center = new THREE.Vector3(mouse.x, mouse.y, 0);
    sphere.position.copy(center);
    velocity = new THREE.Vector3();
}

function onMouseMove(event) {
    if (center) {
        mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        dir = new THREE.Vector3(mouse.x, mouse.y, 0);
        dir.sub(center);
        m = dir.length();

        const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(dir.x, dir.y, dir.z),
        ];

        line.geometry = new THREE.BufferGeometry().setFromPoints(points);
    }
}

function onMouseUp(event) {
    if (center) {
        dir.normalize();
        dir.multiplyScalar(m / 50);
        velocity.copy(dir);
        velocity.multiplyScalar(50);
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (center && velocity) {
        center.add(velocity);

        if (center.x > 1 || center.x < -1) {
            velocity.x *= -1;
        }
        if (center.y > 1 || center.y < -1) {
            velocity.y *= -1;
        }

        sphere.position.copy(center);
    }

    renderer.render(scene, camera);
}

init();
