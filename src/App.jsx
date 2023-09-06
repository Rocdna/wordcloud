import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useFrame, Canvas } from '@react-three/fiber'

import font from './assets/Albertson.otf'
import { useRef, useState, useEffect, useMemo } from 'react'
import { Leva, useControls, folder } from 'leva'

// 随机英文单词
const randomWord = () => {
  const data2 = [
    'Serendipity',
    'Euphoria',
    'Mellifluous',
    'Nebulous',
    'Quintessential',
    'Ethereal',
    'Resplendent',
    'Epiphany',
    'Eloquence',
    'Opulent',
    'Serene',
    'Magnanimous',
    'Eloquent',
    'Repertoire',
    'Exquisite',
    'Pristine',
    'Enigma',
    'Penumbra',
    'Scintillating',
    'Melancholy',
  ]
  return data2[Math.floor(Math.random() * (data2.length - 1))]
}
//随机颜色
const randomColor = () => {
  const r = Math.floor(Math.random() * 200) + 55;  // 100 到 255 之间的随机数
  const g = Math.floor(Math.random() * 200) + 55;
  const b = Math.floor(Math.random() * 200) + 55;
  // 将十进制的 RGB 值转换为十六进制
  const hexR = r.toString(16).padStart(2, '0');
  const hexG = g.toString(16).padStart(2, '0');
  const hexB = b.toString(16).padStart(2, '0');
  return `#${hexR}${hexG}${hexB}`;
}

function Word({ children, ...props }) {
  const color = new THREE.Color()
  // 字体配置
  const fontProps = {
    font: font,
    fontSize: 2.4,
    lineHeight: 1,
    'material-toneMapped': false
  }

  const { lookAtCamera } = useControls({ lookAtCamera: true })

  const ref = useRef()
  const [ hovered, hover ] = useState(false)
  const over = (e) => (e.stopPropagation(), hover(true))
  const out = () => hover(false)

  useEffect(() => {
    if(hovered) document.body.style.cursor = 'pointer'
    return () => (document.body.style.cursor = 'auto')
  }, [hovered])

  useFrame(({ camera }) => {
    // 让字体的旋转度始终等于相机的旋转度
    ref.current.quaternion.copy(camera.quaternion)

    if (lookAtCamera) ref.current.lookAt(camera.position)
    // 颜色插值
    ref.current.material.color.lerp(color.set(hovered ? '#fa2720' : randomColor()), 0.1)
  })

  return (
    <Text 
      ref={ ref }
      onPointerOver={ over }
      onPointerOut={ out }
      onClick={ () => console.log(children) }
      {...props}
      {...fontProps}
      children={ children }
    />
  )
}

// 云
function Cloud({ count = 4, radius = 20 }) {
  const group = useRef()

  const words = useMemo(() => {
    // 创建一个球面
    const spherical = new THREE.Spherical()
    const temp = []
    const phiSpan = Math.PI / (count + 1)
    const thetaSpane = (Math.PI * 2) / count

    for (let i = 1; i < count + 1; i++) {
      for (let j = 0; j < count; j++) {
        temp.push([ new THREE.Vector3().setFromSpherical(spherical.set(radius, phiSpan * i, thetaSpane * j)), randomWord() ])
      }
    }

    return temp

  }, [ count, radius ])

  const { radiusPartten, frequency, phiPartten, thetaPartten } = useControls({
    radiusPartten: false,
    phiPartten: false,
    thetaPartten: false,
    frequency: { value: 1.2, min: 0.1, max: 10, step: 0.01 }
  })

  useFrame(({ clock }) => {
    const time = clock.elapsedTime
    let l = group.current.children.length

    const spherical = new THREE.Spherical()
    const phiSpan = Math.PI / (count + 1)
    const thetaSpan = (Math.PI * 2) / count


    // 给字体添加动画
    for (let i = 0; i < l; i++) {
        let row = Math.floor(i / count) + 1
        let col = (i % count) + 1

        let newPos = new THREE.Vector3().setFromSpherical(spherical
            .set(
                radius * ( radiusPartten ? Math.abs(Math.sin(time)) + 0.7 : 1 ),
                phiSpan * (phiPartten ? (row / Math.sin( time * frequency / 2 ) / 1.2) : row),
                thetaSpan * (thetaPartten ? (col * (Math.sin(time * frequency) * 4 / col + 1)) : col * (time * frequency / col + 1))
            ))
        group.current.children[i].position.set(...newPos)
    }
  })

  return (
    <>
      <group ref={ group }>
        {words.map(([pos, word], index) => 
          <Word key={ index } position={ pos } children={ word } />)}
      </group>
    </>
  )

}

function App() {

  const { count, radius } = useControls({
    count: { value: 12, min: 2, max: 30, step: 1 },
    radius: { value: 20, min: 10, max: 100, step: 1 }
  })

  return (
    <>

      <Leva />

      <Canvas
        camera={ { position: [ 0, 40, 40 ], fov: 75 } }
        gl={ { antialias: true } }
        dpr={ [ 1, 2 ] }
      >
        <fog attach='fog' args={ [ '#202025', 0, 140 ] } />
        <Cloud count={ count } radius={ radius } />
        <OrbitControls dampingFactor={ 0.05 } />
      </Canvas>
    </>
  )
}

export default App
