import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import {  TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

const gui = new dat.GUI()
const parameters = {
    materialColor: '#ffeded'
}

gui
    .addColor(parameters, 'materialColor')
    .onChange(() => {
        material.color.set(parameters.materialColor)
})

const canvas = document.querySelector('canvas.webgl')
// Scene
const scene = new THREE.Scene()

const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('textures/matcaps/7.png')
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter
const material = new THREE.MeshToonMaterial({color: parameters.materialColor, gradientMap: gradientTexture})
const wordCloud = new THREE.Mesh()
const fontLoader = new FontLoader()
const fontMaterial = new THREE.MeshMatcapMaterial({matcap: matcapTexture})
const skills = ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Git', 'Webpack','Three.js', 'GSAP', 'Jest', 'TypeScript', 'Vite', 'XSLT', 'SQL', 'Python', '.NET Core', 'Electron.js', 'Mobx' ]
fontLoader.load(
    'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
    (font) => {
        for (let i = 0; i < skills.length; i++) {

        const textGeometry = new TextGeometry(
            skills[i],
            {
                font: font,
                size: 0.06,
                height: 0.01,
                curveSegments: 5,
                bevelEnabled: false,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0, 
                bevelSegments: 4
            }
        )
            const textMesh = new THREE.Mesh(textGeometry, fontMaterial)
            textMesh.position.x = (Math.random() - 0.5) *1.5
            textMesh.position.y = (Math.random() - 0.5) *1.5
            textMesh.position.z = (Math.random() - 0.5) *1.5
            wordCloud.add(textMesh)
        }
        
    }
)
const objectDistance = 4

const TorusMesh = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material
)
const ConeMesh = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
)

// const wordCloud = new THREE.Mesh(

const TorusKnotMesh = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
    material
)
wordCloud.position.y = - objectDistance * 1
ConeMesh.position.y = objectDistance * 1
TorusKnotMesh.position.y = - objectDistance * 2

TorusMesh.position.x = 2
wordCloud.position.x = -2
ConeMesh.position.x = -2
TorusKnotMesh.position.x = 2
scene.add(TorusMesh, wordCloud, TorusKnotMesh)

const sectionMeshes = [TorusMesh,wordCloud, TorusKnotMesh]


const particlesCount = 200
const positions = new Float32Array(particlesCount * 3)

for (let i = 0; i < particlesCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = objectDistance * 0.5 - Math.random()  * objectDistance*sectionMeshes.length
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
}
const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))


const particlesMaterial = new THREE.PointsMaterial({color: parameters.materialColor, sizeAttenuation: true, size: 0.03})

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const cameraGroup = new THREE.Group()
scene.add(cameraGroup)
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    const newSection = Math.round(scrollY/sizes.height)

    if (newSection !== currentSection) {
        currentSection = newSection
        
        gsap.to(
            sectionMeshes[currentSection].rotation, 
            {
                duration: 1.5, 
                ease: 'power2.inOut',
                x: '+=6',
                y: '+=3'
            }
        )
    }
})


const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})
const clock = new THREE.Clock()
let previousTime = 0
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    camera.position.y = - scrollY/sizes.height * objectDistance

    const paralaxX = cursor.x
    const paralaxY = -cursor.y
    cameraGroup.position.x += (paralaxX - cameraGroup.position.x) * 0.02
    cameraGroup.position.y += (paralaxY - cameraGroup.position.y) * 0.02
    // for (const [i, mesh] of sectionMeshes.entries()) {
    //     mesh.rotation.y = elapsedTime * (i + 1) * 0.1
    // }
    for (const mesh of sectionMeshes) {
        mesh.rotation.y += deltaTime * 0.1
        mesh.rotation.x += deltaTime * 0.12
    }
    // wordCloud.rotation.y += deltaTime * 0.1
    // wordCloud.rotation.x += deltaTime * 0.12
    for (const mesh of wordCloud.children) {
        mesh.lookAt(camera.position)
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()