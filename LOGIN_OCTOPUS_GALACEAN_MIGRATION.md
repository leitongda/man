# 登录页章鱼迁移总结（Galacean 同引擎）

## 目标
- 将登录页章鱼动画从 `Three.js` 近似实现，迁移为与目标文件 `/Users/leijiadashao/Pictures/0a44ea72-async.6f89c38e.js` 同引擎（Galacean）实现。
- 对齐关键行为：资源加载、状态机运动、边界控制、眼睛眨眼逻辑。

## 本次完成内容

### 1. 引擎与依赖
- 新增依赖：
  - `@galacean/engine`
  - `@galacean/engine-loader`
- 登录页章鱼组件改为基于 `Mx.WebGLEngine.create(...)` 启动引擎。

### 2. 资源对齐
- 已将以下资源放到 `frontend/public`：
  - `Scene`
  - `OctopusAnimator`
  - `ambient.bin`
  - `body-copied`
  - `eye-copied`
  - `octopus.glb`
- 资源加载路径改为本地同名路径，并按目标资源清单顺序加载。

### 3. 脚本映射与类注册
- 在登录页组件中实现并注册目标同名/同 ID 脚本链：
  - `a9c647fc-09e2-4756-83e4-93dc5145b343` -> `OctopusScript`（Mh）
  - `290bc111-8bda-4a55-8d5f-315da90cec7d` -> `BoundaryScript`（MA）
  - `ef329862-0a66-4e55-b88a-eab965e212ea` -> `JetState`（ML）
  - `968bb63c-a41b-4806-8027-2eef4fce2d05` -> `DragState`（Md）
  - `55744963-8a74-42c2-97de-3a3c8431c229` -> `CoastState`（MO）

### 4. 运动逻辑对齐
- 动作参数表对齐：
  - `0`: `DragForce=-1`, `JetForce=2.5`, `StrengthChange=2.5`
  - `1`: `DragForce=-0.5`, `JetForce=2.5`, `StrengthChange=2`
  - `2`: `DragForce=-1`, `JetForce=5`, `StrengthChange=-5`
- 保留 `decideActionAndRotate / _randomAction / _randomRotate / _correctRotate` 核心结构。
- `drag/jet/coast` 三状态每帧积分位移与转向衰减按目标公式迁移。
- 边界计算按 `Camera FOV + aspect + z` 推导活动矩形。

### 5. 眼睛逻辑对齐
- 对齐到目标模式：绑定 `eyes` 节点材质（不替换材质类型）。
- 眨眼逻辑：周期 3~8 秒，临界窗口 `<=0.15s` 时 alpha 置 0，其余为 1。
- 登录页实现通过材质透明度等价控制 alpha，行为与目标一致。

## 关键文件
- 迁移主文件：`frontend/src/pages/Login/OctopusScene.tsx`
- 资源文件：
  - `frontend/public/Scene`
  - `frontend/public/OctopusAnimator`
  - `frontend/public/ambient.bin`
  - `frontend/public/body-copied`
  - `frontend/public/eye-copied`
  - `frontend/public/octopus.glb`

## 校验情况
- `eslint frontend/src/pages/Login/OctopusScene.tsx` 通过。
- `tsc --noEmit` 中该文件无报错（项目仍有其它历史 TS 报错，与本次迁移无关）。

## 已知说明
- 依赖安装过程中 `canvas` 可选构建在本机环境报 `pixman-1` 缺失，但不影响登录页章鱼 Galacean 运行链路。
- 若后续需要像目标文件一样直接复用远端 `static.zenmux.ai` 资源，可将当前本地资源路径替换为远端 URL。
