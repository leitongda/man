import { useEffect, useRef } from 'react'
import * as Mx from '@galacean/engine'
import '@galacean/engine-loader'

type EngineWithVirtual = Mx.WebGLEngine & {
  resourceManager: Mx.ResourceManager & {
    initVirtualResources?: (list: unknown[]) => void
  }
}

const ACTION_CFG = {
  0: { DragForce: -1, JetForce: 2.5, Clip: 1, StrengthChange: 2.5 },
  1: { DragForce: -0.5, JetForce: 2.5, Clip: 1, StrengthChange: 2 },
  2: { DragForce: -1, JetForce: 5, Clip: 2, StrengthChange: -5 },
} as const

enum Octant {
  One = 0,
  Two = 1,
  Three = 2,
  Four = 3,
  Five = 4,
  Six = 5,
  Seven = 6,
  Eight = 7,
}

class BoundaryScript extends Mx.Script {
  private _customRect: Mx.Rect | null = null
  private _rect = new Mx.Rect()
  private _center = new Mx.Vector2()
  private _splice = [
    0.25 * Math.PI,
    0.5 * Math.PI,
    0.75 * Math.PI,
    Math.PI,
    1.25 * Math.PI,
    1.5 * Math.PI,
    1.75 * Math.PI,
    2 * Math.PI,
  ]

  onAwake(): void {
    this._calBoundary()
    this._onCanvasSizeListener = this._onCanvasSizeListener.bind(this)
    ;(this.engine.canvas as any)._sizeUpdateFlagManager?.addListener(this._onCanvasSizeListener)
  }

  get splice(): number[] {
    return this._splice
  }

  get center(): Mx.Vector2 {
    return this._center
  }

  get rect(): Mx.Rect {
    return this._customRect ?? this._rect
  }

  set rect(v: Mx.Rect) {
    this._customRect = v
    if (v) this._updateCenterAndSplice(v)
    else this._calBoundary()
  }

  getQuadrant(p: Mx.Vector2): Octant {
    const c = this._center
    const rad = this._normRadians(Math.atan2(p.y - c.y, p.x - c.x))
    for (let i = 0; i < 8; i++) {
      if (rad < this._splice[i]) return i as Octant
    }
    return Octant.Eight
  }

  onDestroy(): void {
    (this.engine.canvas as any)._sizeUpdateFlagManager?.removeListener(this._onCanvasSizeListener)
  }

  private _onCanvasSizeListener(): void {
    if (!this._customRect) this._calBoundary()
  }

  private _calBoundary(): void {
    const cam = this.scene.findEntityByName('Camera')?.getComponent(Mx.Camera)
    if (!cam) return
    const z = cam.entity.transform.position.z
    const halfH = z * Math.tan(0.5 * cam.fieldOfView * Mx.MathUtil.degreeToRadFactor)
    const halfW = halfH * cam.aspectRatio
    this._rect.set(-halfW, -halfH, 2 * halfW, 2 * halfH)
    this._updateCenterAndSplice(this._rect)
  }

  private _updateCenterAndSplice(r: Mx.Rect): void {
    this._center.set(r.x + 0.5 * r.width, r.y + 0.5 * r.height)
    this._splice[0] = this._normRadians(Math.atan2(r.y + r.height, r.x))
    this._splice[2] = this._normRadians(Math.atan2(r.y, r.x))
    this._splice[4] = this._normRadians(Math.atan2(r.y, r.x + r.width))
    this._splice[6] = this._normRadians(Math.atan2(r.y + r.height, r.x + r.width))
  }

  private _normRadians(rad: number): number {
    let v = rad - Math.PI / 2
    if (v < 0) v += 2 * Math.PI
    return v
  }
}

class OctopusScript extends Mx.Script {
  private _strength = 100
  private _curSpeed = 0
  private _animator: Mx.Animator | null = null
  private _boundary: BoundaryScript | null = null
  private _lastRecord = { action: 2 as 0 | 1 | 2, rotate: 0, speed: 0, position: new Mx.Vector3() }
  private _cameraTransform: Mx.Transform | null = null
  private _lookAtTransform: Mx.Transform | null = null
  private _eyesMaterial: Mx.Material | null = null
  private _blinkMinInterval = 3
  private _blinkMaxInterval = 8
  private _blickCountDown = 5
  private _camera: Mx.Camera | null = null
  private _screenPosition = new Mx.Vector3()
  private _frameCount = -1
  private _minDistance = 0
  private _maxDistance = 0
  private _tempRect0 = new Mx.Rect()
  private _tempVec30 = new Mx.Vector3()
  private _tempVec31 = new Mx.Vector3()
  private _tempVec32 = new Mx.Vector3()
  private _tempVec33 = new Mx.Vector3()
  private _tempVec34 = new Mx.Vector3()

  onStart(): void {
    const lookAt = this.entity.findByName('lookAt')
    this._lookAtTransform = lookAt.transform
    const skeleton = lookAt.findByName('model').findByName('骨架')
    this._animator = skeleton.getComponent(Mx.Animator)

    const camEntity = this.scene.findEntityByName('Camera')
    this._camera = camEntity?.getComponent(Mx.Camera) ?? null
    this._cameraTransform = camEntity?.transform ?? null
    this._boundary = this.scene.findEntityByName('boundary')?.getComponent(BoundaryScript) ?? null

    this.engine.time.maximumDeltaTime = 0.05
    const eyes = skeleton.findByName('eyes')
    if (eyes) {
      const eyeRenderer = eyes.getComponent(Mx.SkinnedMeshRenderer)
      if (eyeRenderer) this._eyesMaterial = eyeRenderer.getMaterial()
    }

    this._minDistance = this._getMaxDistance(ACTION_CFG[1].DragForce, ACTION_CFG[1].JetForce)
    this._maxDistance = this._getMaxDistance(ACTION_CFG[2].DragForce, ACTION_CFG[2].JetForce)
    this.firstActionAndRotate()
  }

  onUpdate(delta: number): void {
    if (this._lookAtTransform && this._cameraTransform) {
      const e = this._lookAtTransform.worldPosition
      const c = this._cameraTransform.worldPosition
      const t = this._tempVec30
      Mx.Vector3.subtract(e, c, t)
      Mx.Vector3.add(e, t, t)
      ;(this._lookAtTransform as any).lookAt(t, this.entity.transform.worldUp)
    }

    this._blickCountDown -= delta
    if (this._eyesMaterial) {
      const color = this._eyesMaterial.shaderData.getColor('material_BaseColor')
      if (this._blickCountDown <= 0) {
        color.a = 1
        this._blickCountDown = Math.random() * (this._blinkMaxInterval - this._blinkMinInterval) + this._blinkMinInterval
      } else if (this._blickCountDown <= 0.15) color.a = 0
      else color.a = 1
      this._eyesMaterial.shaderData.setColor('material_BaseColor', color)
    }

    this.engine.dispatch('octopus', this.screenPosition)
  }

  get screenPosition(): Mx.Vector3 {
    const f = this.engine.time.frameCount
    if (f !== this._frameCount && this._camera) {
      this._frameCount = f
      this._camera.worldToScreenPoint(this.entity.transform.position, this._screenPosition)
      const canvas = this.engine.canvas as any
      const webCanvas = canvas._webCanvas
      const sx = canvas.width / webCanvas.clientWidth
      const sy = canvas.height / webCanvas.clientHeight
      this._screenPosition.set(this._screenPosition.x / sx, this._screenPosition.y / sy, 0)
    }
    return this._screenPosition
  }

  setPoint(x: number, y: number): void {
    const canvas = this.engine.canvas as any
    if (!this._camera) {
      const ce = this.scene.findEntityByName('Camera')
      this._camera = ce?.getComponent(Mx.Camera) ?? null
    }
    if (!this._camera) return

    const webCanvas = canvas._webCanvas
    const sx = canvas.width / webCanvas.clientWidth
    const sy = canvas.height / webCanvas.clientHeight
    const p = this._camera.screenToWorldPoint(this._tempVec31.set(x * sx, y * sy, 20), this._tempVec30)
    this.rotation = 60
    this.moveTo(p)
    this.firstActionAndRotate()
  }

  get strength(): number {
    return this._strength
  }

  get curSpeed(): number {
    return this._curSpeed
  }

  set curSpeed(v: number) {
    this._curSpeed = v
  }

  get rotation(): number {
    let z = this.entity.transform.rotation.z
    z %= 360
    if (z < 0) z += 360
    return z
  }

  set rotation(v: number) {
    let z = v % 360
    if (z < 0) z += 360
    this.entity.transform.setRotation(0, 0, z)
  }

  moveTo(v: Mx.Vector3): void {
    this.entity.transform.position = v
  }

  firstActionAndRotate(): void {
    this._exeActionAndRotate(1, 45)
  }

  decideActionAndRotate(): void {
    if (!this._boundary) return
    const tr = this.entity.transform
    const rect = this._tempRect0.copyFrom(this._boundary.rect)
    rect.x += 0.8
    rect.y += 0.8
    rect.width -= 1.6
    rect.height -= 1.6

    const pos = this._tempVec30.copyFrom(tr.position)
    const minPos = this._tempVec32.copyFrom(pos).add(this._tempVec33.copyFrom(tr.worldUp).scale(this._minDistance))
    const maxPos = this._tempVec34.copyFrom(pos).add(this._tempVec33.copyFrom(tr.worldUp).scale(this._maxDistance))

    let rotate = 0
    let action: 0 | 1 | 2 = 0

    if (this._isOut(pos, rect)) {
      action = 2
      const c = this._boundary.center
      const target = this._normAngle((Math.atan2(c.y - pos.y, c.x - pos.x) / Math.PI) * 180 - 90)
      const current = this.rotation
      if (target > current) {
        const d = target - current
        rotate = d < 180 ? d : d - 360
      } else {
        const d = current - target
        rotate = d < 180 ? -d : 360 - d
      }
      action = Math.abs(rotate) < 15 ? 2 : 0
    } else if (this._isOut(minPos, rect)) {
      rotate = this._correctRotate()
      action = 0
    } else if (this._isOut(maxPos, rect)) {
      rotate = this._correctRotate()
      action = 1
    } else {
      rotate = this._randomRotate()
      action = this._randomAction()
    }

    this._exeActionAndRotate(action, rotate)
  }

  private _exeActionAndRotate(action: 0 | 1 | 2, rotate: number): void {
    if (!this._animator) return
    const cfg = ACTION_CFG[action]
    this._lastRecord.action = action
    this._lastRecord.position.copyFrom(this.entity.transform.position)
    this._lastRecord.rotate = rotate
    this._lastRecord.speed = this._curSpeed
    this._animator.setParameterValue('Rotate', rotate)
    this._animator.setParameterValue('DragForce', cfg.DragForce)
    this._animator.setParameterValue('JetForce', cfg.JetForce)
    this._animator.setParameterValue('State', cfg.Clip)
    this._strength = Math.min(this._strength + cfg.StrengthChange, 100)
  }

  private _randomAction(): 0 | 1 | 2 {
    let action: 0 | 1 | 2
    const r = Math.random()
    if (r < 0.5) action = r <= 0.35 ? 2 : 1
    else action = (this._lastRecord.action === 0 ? 1 : this._lastRecord.action) as 0 | 1 | 2
    const cfg = ACTION_CFG[action]
    if (this._strength + cfg.StrengthChange < 0) action = 1
    return action
  }

  private _correctRotate(): number {
    if (!this._boundary) return 0
    const p = this._tempVec31.copyFrom(this.entity.transform.position).add(this._tempVec30.copyFrom(this.entity.transform.worldUp).scale(0.6))
    const quad = this._boundary.getQuadrant(new Mx.Vector2(p.x, p.y)) as Octant
    const splice = this._boundary.splice
    const i = this.rotation
    const r = (i / 180) * Math.PI
    let D: Octant = Octant.One
    for (let m = 0; m < 8; m++) {
      if (r < splice[m]) {
        D = m as Octant
        break
      }
    }

    switch (quad) {
      case Octant.One:
        switch (D) {
          case Octant.One:
          case Octant.Two: return 90 - i + 0.5
          case Octant.Three:
          case Octant.Four: return 180 - i + 0.5
          case Octant.Five:
          case Octant.Six: return 0.5
          case Octant.Seven:
          case Octant.Eight: return 270 - i - 0.5
        }
      // falls through
      case Octant.Two:
        switch (D) {
          case Octant.One:
          case Octant.Two: return -i - 0.5
          case Octant.Three:
          case Octant.Four: return 180 - i + 0.5
          case Octant.Five:
          case Octant.Six: return 0.5
          case Octant.Seven:
          case Octant.Eight: return 270 - i - 0.5
        }
      // falls through
      case Octant.Three:
        switch (D) {
          case Octant.One:
          case Octant.Two: return -i - 0.5
          case Octant.Three:
          case Octant.Four: return 180 - i + 0.5
          case Octant.Five:
          case Octant.Six: return 270 - i + 0.5
          case Octant.Seven:
          case Octant.Eight: return 0.5
        }
      // falls through
      case Octant.Four:
        switch (D) {
          case Octant.One:
          case Octant.Two: return -i - 0.5
          case Octant.Three:
          case Octant.Four: return 90 - i - 0.5
          case Octant.Five:
          case Octant.Six: return 270 - i + 0.5
          case Octant.Seven:
          case Octant.Eight: return 0.5
        }
      // falls through
      case Octant.Five:
        switch (D) {
          case Octant.One:
          case Octant.Two: return 0.5
          case Octant.Three:
          case Octant.Four: return 90 - i - 0.5
          case Octant.Five:
          case Octant.Six: return 270 - i + 0.5
          case Octant.Seven:
          case Octant.Eight: return 360 - i + 0.5
        }
      // falls through
      case Octant.Six:
        switch (D) {
          case Octant.One:
          case Octant.Two: return 0.5
          case Octant.Three:
          case Octant.Four: return 90 - i - 0.5
          case Octant.Five:
          case Octant.Six: return 180 - i - 0.5
          case Octant.Seven:
          case Octant.Eight: return 360 - i + 0.5
        }
      // falls through
      case Octant.Seven:
        switch (D) {
          case Octant.One:
          case Octant.Two: return 90 - i + 0.5
          case Octant.Three:
          case Octant.Four: return 0.5
          case Octant.Five:
          case Octant.Six: return 180 - i - 0.5
          case Octant.Seven:
          case Octant.Eight: return 360 - i + 0.5
        }
      // falls through
      case Octant.Eight:
        switch (D) {
          case Octant.One:
          case Octant.Two: return 90 - i + 0.5
          case Octant.Three:
          case Octant.Four: return 0.5
          case Octant.Five:
          case Octant.Six: return 180 - i - 0.5
          case Octant.Seven:
          case Octant.Eight: return 270 - i - 0.5
        }
    }
    return 0
  }

  private _randomRotate(): number {
    const animatorRotate = this._animator?.getParameterValue('Rotate') as number
    if (animatorRotate === 0) {
      const r = Math.random()
      if (r <= 0.7) return 0
      if (!this._boundary) return 0
      const e = this._tempRect0.copyFrom(this._boundary.rect)
      const t = this._minDistance + 0.8
      e.x += t
      e.y += t
      e.width -= 2 * t
      e.height -= 2 * t
      const p = this.entity.transform.position
      if (r <= 0.9 || this._isOut(p, e)) {
        const c = this._boundary.center
        const target = this._normAngle((Math.atan2(c.y - p.y, c.x - p.x) / Math.PI) * 180 - 90)
        const current = this.rotation
        if (target > current) return target - current < 180 ? 180 * Math.random() : -(180 * Math.random())
        return current - target < 180 ? -(180 * Math.random()) : 180 * Math.random()
      }
      return 180 * Math.random() - 90
    }
    return animatorRotate
  }

  private _normAngle(v: number): number {
    v %= 360
    return v < 0 ? v + 360 : v
  }

  private _isOut(p: Mx.Vector3 | Mx.Vector2, r: Mx.Rect): boolean {
    return p.x < r.x || p.x > r.x + r.width || p.y < r.y || p.y > r.y + r.height
  }

  private _getMaxDistance(dragForce: number, jetForce: number): number {
    let t = 0
    const N = 0.2 + (dragForce / 1) * 0.8
    t += ((0.2 + N) * 0.8) / 2
    const i = N + (jetForce / 1) * 0.4
    t += ((N + i) * 0.4) / 2
    let r = i
    while (r > 0.2) {
      const next = r + 0.016 * (-r / 1)
      t += ((r + next) * 0.016) / 2
      r = next
    }
    return t
  }
}

class CoastState extends Mx.StateMachineScript {
  private _time: Mx.Time | null = null
  private _octopus: OctopusScript | null = null
  private _transform: Mx.Transform | null = null
  private _isExit = false
  private _frameCount = 0

  onStateEnter(animator: Mx.Animator): void {
    const e = animator.entity.parent?.parent?.parent
    if (!e) return
    this._transform = e.transform
    this._octopus = e.getComponent(OctopusScript)
    this._time = e.engine.time
    this._isExit = false
  }

  onStateUpdate(): void {
    if (!this._time || !this._octopus || !this._transform || this._isExit || this._time.frameCount === this._frameCount) return
    this._frameCount = this._time.frameCount
    const speed = this._octopus.curSpeed
    if (speed <= 0.2) this._next(this._octopus)
    else {
      const dt = this._time.deltaTime
      const dec = -speed
      const next = speed + dec * dt
      const v = new Mx.Vector3()
      if (next <= 0) {
        this._octopus.curSpeed = 0
        v.copyFrom(this._transform.worldUp).scale((-speed / dec) * speed * 0.5)
        this._transform.worldPosition.add(v)
        this._next(this._octopus)
      } else {
        this._octopus.curSpeed = next
        v.copyFrom(this._transform.worldUp).scale(((speed + next) * dt) * 0.5)
        this._transform.worldPosition.add(v)
      }
    }
  }

  private _next(o: OctopusScript): void {
    this._isExit = true
    o.decideActionAndRotate()
  }
}

class JetState extends Mx.StateMachineScript {
  private _time: Mx.Time | null = null
  private _octopus: OctopusScript | null = null
  private _transform: Mx.Transform | null = null
  private _jetForce = 0
  private _isExit = false
  private _frameCount = 0

  onStateEnter(animator: Mx.Animator): void {
    const e = animator.entity.parent?.parent?.parent
    if (!e) return
    this._transform = e.transform
    this._octopus = e.getComponent(OctopusScript)
    this._time = e.engine.time
    this._jetForce = Number(animator.getParameterValue('JetForce'))
    this._isExit = false
  }

  onStateUpdate(animator: Mx.Animator): void {
    if (!this._time || !this._octopus || !this._transform || this._isExit || this._time.frameCount === this._frameCount) return
    this._frameCount = this._time.frameCount
    const dt = this._time.deltaTime
    const v0 = this._octopus.curSpeed
    const v1 = v0 + this._jetForce * dt
    this._octopus.curSpeed = v1
    const d = new Mx.Vector3().copyFrom(this._transform.worldUp).scale(((v0 + v1) * dt) * 0.5)
    this._transform.worldPosition.add(d)
    if (v0 + v1 < 0) {
      const rot = Number(animator.getParameterValue('Rotate'))
      if (rot !== 0) {
        const max = (Math.sqrt(Math.abs(v0 + v1)) / 0.7) * dt * 40
        const step = Math.abs(rot) < max ? rot : Math.sign(rot) * max
        ;(this._transform.rotation as any).z += step
        animator.setParameterValue('Rotate', rot - step)
      }
    }
  }

  onStateExit(): void {
    this._isExit = true
  }
}

class DragState extends Mx.StateMachineScript {
  private _time: Mx.Time | null = null
  private _octopus: OctopusScript | null = null
  private _transform: Mx.Transform | null = null
  private _dragForce = 0
  private _isExit = false
  private _frameCount = 0

  onStateEnter(animator: Mx.Animator): void {
    const e = animator.entity.parent?.parent?.parent
    if (!e) return
    this._transform = e.transform
    this._octopus = e.getComponent(OctopusScript)
    this._time = e.engine.time
    animator.setParameterValue('State', 0)
    this._dragForce = Number(animator.getParameterValue('DragForce'))
    this._isExit = false
  }

  onStateUpdate(animator: Mx.Animator): void {
    if (!this._time || !this._octopus || !this._transform || this._isExit || this._time.frameCount === this._frameCount) return
    this._frameCount = this._time.frameCount
    const dt = this._time.deltaTime
    const v0 = this._octopus.curSpeed
    const v1 = v0 + this._dragForce * dt
    this._octopus.curSpeed = v1
    const d = new Mx.Vector3().copyFrom(this._transform.worldUp).scale(((v0 + v1) * dt) * 0.5)
    this._transform.worldPosition.add(d)
    if (v0 + v1 < 0) {
      const rot = Number(animator.getParameterValue('Rotate'))
      if (rot !== 0) {
        const e = Math.sqrt(Math.abs(v0 + v1)) / 0.7
        const max = e * dt * 40
        const step = Math.abs(rot) < max ? rot : Math.sign(rot) * max
        ;(this._transform.rotation as any).z += step
        animator.setParameterValue('Rotate', rot - step)
      }
    }
  }

  onStateExit(): void {
    this._isExit = true
  }
}

let classRegistered = false
const registerClasses = () => {
  if (classRegistered) return
  classRegistered = true
  Mx.Loader.registerClass('a9c647fc-09e2-4756-83e4-93dc5145b343', OctopusScript)
  Mx.Loader.registerClass('968bb63c-a41b-4806-8027-2eef4fce2d05', DragState)
  Mx.Loader.registerClass('ef329862-0a66-4e55-b88a-eab965e212ea', JetState)
  Mx.Loader.registerClass('55744963-8a74-42c2-97de-3a3c8431c229', CoastState)
  Mx.Loader.registerClass('290bc111-8bda-4a55-8d5f-315da90cec7d', BoundaryScript)
}

const initEngine = async (canvas: HTMLCanvasElement): Promise<{ engine: EngineWithVirtual; octopus: OctopusScript | null }> => {
  registerClasses()
  const engine = (await Mx.WebGLEngine.create({
    canvas,
    graphicDeviceOptions: {
      webGLMode: 0,
      alpha: true,
      preserveDrawingBuffer: true,
    },
  })) as EngineWithVirtual

  engine.canvas.resizeByClientSize()

  const resources = [
    { id: '9be0d037-5df4-4850-9fdd-86638467dc72', type: 'Environment', virtualPath: '/Internal/Bake/ambient.bin', path: '/ambient.bin' },
    { id: '915495ab-9ac0-47bc-8fec-ebba8b8b642c', type: 'GLTF', virtualPath: '/octopus.glb', path: '/octopus.glb' },
    { id: '0000000', type: 'Scene', virtualPath: '/Scene', path: '/Scene' },
    { id: '293bd166-10fb-47bf-b85c-505d7984ee63', type: 'AnimatorController', virtualPath: '/OctopusAnimator', path: '/OctopusAnimator' },
    { id: '3d2b2f50-eecc-450a-8028-6d10a7980a0b', type: 'Material', virtualPath: '/body-copied', path: '/body-copied' },
    { id: 'c9ba1d5f-6734-4ae0-bda1-599664fd996f', type: 'Material', virtualPath: '/eye-copied', path: '/eye-copied' },
  ]

  engine.resourceManager.initVirtualResources?.(resources as never[])

  const tasks = resources.map((item) =>
    engine.resourceManager.load({ url: item.path, type: item.type }).then((asset) => {
      if (item.type === 'Scene') {
        engine.sceneManager.activeScene = asset as Mx.Scene
      }
    }),
  )

  await Promise.all(tasks)
  engine.run()

  const octopusEntity = engine.sceneManager.scenes[0]?.findEntityByName('octopus') ?? null
  if (octopusEntity) {
    const s = octopusEntity.transform.scale
    octopusEntity.transform.setScale(s.x * 2, s.y * 2, s.z * 2)
  }
  const octopus = octopusEntity?.getComponent(OctopusScript) ?? null
  return { engine, octopus }
}

export default function OctopusScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let engine: EngineWithVirtual | null = null
    let octopus: OctopusScript | null = null

    initEngine(canvas)
      .then((res) => {
        engine = res.engine
        octopus = res.octopus

        const setSpawnPoint = () => {
          if (!octopus) return
          const rect = canvas.getBoundingClientRect()
          octopus.setPoint(document.documentElement.clientWidth + 60, rect.top + rect.height / 2)
        }

        setSpawnPoint()

        const onResize = () => {
          if (!engine) return
          engine.canvas.resizeByClientSize()
          setSpawnPoint()
        }

        window.addEventListener('resize', onResize)
        ;(canvas as any).__octopusResize = onResize
      })
      .catch((e) => {
        console.error('[Octopus] Galacean init failed:', e)
      })

    return () => {
      const onResize = (canvas as any).__octopusResize
      if (onResize) window.removeEventListener('resize', onResize)
      if (engine) engine.destroy()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  )
}
