# octopus.glb 逻辑梳理

源文件：`/Users/leijiadashao/Pictures/0a44ea72-async.6f89c38e.js`

## 1. 入口与初始化

- 页面组件 `MU()` 中，通过内部 hook 调用 `MS(canvas)` 初始化 3D 引擎。
- `MS(canvas)` 完成：
  - 构建 WebGL 引擎配置（含 `alpha: true`、`preserveDrawingBuffer: true`）
  - `registerIncludes()` 注册 shader include
  - `Mx.WebGLEngine.create(...)` 创建引擎
  - `canvas.resizeByClientSize(...)` 按 runtime 设置调整 DPR

运行后返回 `engine`，并在组件中保存。

## 2. octopus.glb 资源如何加载

`MS(canvas)` 中定义资源清单 `i`，核心项如下：

- `Environment`: `https://static.zenmux.ai/octopus/Internal/Bake/ambient.bin`
- `GLTF`: `https://static.zenmux.ai/octopus/octopus.glb`（`virtualPath: /octopus.glb`）
- `Scene`: `https://static.zenmux.ai/octopus/Scene`
- `AnimatorController`: `https://static.zenmux.ai/octopus/OctopusAnimator`
- `Material`: `body-copied`
- `Material`: `eye-copied`

加载流程：

1. `engine.resourceManager.initVirtualResources(i)` 注册虚拟资源映射。
2. 遍历 `i`，逐项调用：`resourceManager.load({ url: item.path, type: item.type })`。
3. 若当前资源类型是 `Scene`，将其设置为：`engine.sceneManager.activeScene = loadedScene`。
4. `await Promise.all(...)` 等待全部资源完成。
5. `engine.run()` 启动渲染循环。

说明：`octopus.glb` 本身是 GLTF 资源之一，实际在场景中由 `Scene`/实体层级引用并驱动。

## 3. octopus 实体与控制脚本

初始化完成后，组件通过：

- `engine.sceneManager.scenes[0].findEntityByName("octopus")`
- `getComponent(Mh)`

拿到章鱼控制脚本实例（类 `Mh`）。

类注册映射：

- `Mh`：`a9c647fc-09e2-4756-83e4-93dc5145b343`（章鱼主逻辑）
- `Md`：`968bb63c-a41b-4806-8027-2eef4fce2d05`（拖拽/减速状态）
- `ML`：`ef329862-0a66-4e55-b88a-eab965e212ea`（喷射/加速状态）
- `MO`：`55744963-8a74-42c2-97de-3a3c8431c229`（状态切换过渡）
- `MA`：`290bc111-8bda-4a55-8d5f-315da90cec7d`（边界计算）

## 4. 模型参数如何设置

### 4.1 动作参数配置表（核心）

`Mm` 定义了动作档位参数：

- 动作 0：`DragForce=-1`，`JetForce=2.5`，`Clip=1`，`StrengthChange=2.5`
- 动作 1：`DragForce=-0.5`，`JetForce=2.5`，`Clip=1`，`StrengthChange=2`
- 动作 2：`DragForce=-1`，`JetForce=5`，`Clip=2`，`StrengthChange=-5`

### 4.2 Animator 参数写入点

在 `Mh._exeActionAndRotate(action, rotate)` 中统一写入：

- `Animator.setParameterValue("Rotate", rotate)`
- `Animator.setParameterValue("DragForce", cfg.DragForce)`
- `Animator.setParameterValue("JetForce", cfg.JetForce)`
- `Animator.setParameterValue("State", cfg.Clip)`

并更新内部 stamina：`_strength`。

### 4.3 参数读取与二次调整

- `ML`（加速态）在 `onStateEnter` 读取 `JetForce`，每帧更新速度和位移，并衰减 `Rotate`。
- `Md`（减速态）在 `onStateEnter` 读取 `DragForce`，每帧减速并衰减 `Rotate`。
- `Md.onStateEnter` 会执行 `setParameterValue("State", 0)`，用于切换回基础状态。
- `MO` 在速度接近阈值后触发 `decideActionAndRotate()`，重新选择动作与转向。

## 5. 位置、朝向、边界与视觉细节

- 初始落点：`setPoint(x, y)` 将屏幕坐标转世界坐标，再设置
  - `rotation = 60`
  - `moveTo(worldPos)`
  - `firstActionAndRotate()`（默认触发动作 1、旋转 45）
- 边界：`MA` 根据 Camera FOV/Aspect/Z 动态计算可活动矩形与象限。
- 眨眼：在 `Mh.onUpdate` 中，通过 eyes 材质 `material_BaseColor.a` 在间隔内切换透明度。
- 朝向：`lookAt` 每帧更新，保证模型朝向与镜头关系自然。

## 6. 如果要调模型行为，优先改哪里

1. 改动作手感：调整 `Mm`（`DragForce/JetForce/Clip/StrengthChange`）。
2. 改转向灵敏度：调整 `decideActionAndRotate()`、`_correctRotate()`、`_randomRotate()`。
3. 改活动范围：调整 `MA` 边界计算与 `decideActionAndRotate()` 内的边距收缩值。
4. 改初始出现位置：调整 `setPoint(...)` 的调用参数。
5. 改眨眼节奏：调整 `_blinkMinInterval/_blinkMaxInterval` 和阈值 `0.15`。

## 7. 一句话总结

`octopus.glb` 通过 `MS(canvas)` 中的资源清单统一加载，真正的“运动与动画参数”由 `Mh + Md + ML + MO + MA` 这组脚本在运行时持续写入/读取 Animator 参数并驱动模型行为。
