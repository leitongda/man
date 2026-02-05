// 项目配置
export interface ProjectConfig {
  style: 'manga' | 'manhua' | 'webtoon' | 'american' | 'realistic' | 'watercolor'
  format: 'webtoon_vertical' | 'a4_page' | 'custom'
  panels_per_chapter: number
  max_characters: number
  content_rating: 'all_ages' | 'teen' | 'mature'
  tone: 'comedy' | 'serious' | 'suspense' | 'romance' | 'action'
  language: string
}

// 项目
export interface Project {
  id: string
  name: string
  description?: string
  config: ProjectConfig
  status: 'draft' | 'in_progress' | 'completed'
  current_step: number
  created_at: string
  updated_at: string
}

// 角色
export interface Character {
  id: string
  name: string
  appearance: {
    face: string
    hair: string
    body: string
    clothing: string[]
    accessories: string[]
  }
  personality: string
  speech_pattern: string
  motivation: string
  relationships: { character_id: string; relation: string }[]
  reference_images: string[]
  prompt_fragments: string[]
}

// 世界观设定
export interface WorldSetting {
  era: string
  location: string
  rules: string[]
  technology_level: string
  social_structure: string
}

// 风格指南
export interface StyleGuide {
  art_style: string
  line_style: string
  coloring: string
  texture: string
  camera_preferences: string[]
}

// 一致性规则
export interface ContinuityRule {
  subject: string
  rule: string
  reference_image?: string
}

// Story Bible
export interface StoryBible {
  characters: Character[]
  world: WorldSetting
  style_guide: StyleGuide
  continuity_rules: ContinuityRule[]
}

// 节拍
export interface Beat {
  id: string
  order: number
  type: 'setup' | 'conflict' | 'twist' | 'climax' | 'resolution'
  description: string
  characters_involved: string[]
}

// 故事大纲
export interface StoryOutline {
  synopsis_short: string
  synopsis_mid: string
  synopsis_long?: string
  key_beats: Beat[]
  outline: Beat[]
}

// 对话
export interface Dialogue {
  character_id: string
  text: string
  type: 'speech' | 'thought' | 'narration' | 'os'
}

// 分镜
export interface Panel {
  id: string
  scene_id: string
  order: number
  location: string
  time: string
  characters: string[]
  camera: 'wide' | 'medium' | 'close_up' | 'extreme_close_up' | 'bird_eye' | 'worm_eye'
  action: string
  expression: string
  dialogue: Dialogue[]
  sfx: string[]
  composition: string
  continuity_notes: string
  rough_image?: string
  final_image?: string
  generation_prompt?: string
  status: 'pending' | 'rough' | 'final' | 'approved' | 'rejected'
}

// 场景
export interface Scene {
  id: string
  location: string
  time: string
  characters: string[]
  purpose: string
  mood: string
  panels: Panel[]
}

// 章节
export interface Chapter {
  id: string
  order: number
  title: string
  logline: string
  beats: string[]
  cliffhanger?: string
  estimated_panels: number
  scenes: Scene[]
}

// 角色设定图
export interface CharacterSheet {
  character_id: string
  front_view: string
  side_view: string
  back_view: string
  expressions: { emotion: string; image: string }[]
  key_props: { name: string; image: string }[]
  outfits: { name: string; image: string }[]
}

// 场景设定图
export interface EnvironmentSheet {
  id: string
  name: string
  description: string
  reference_images: string[]
  prompt_fragments: string[]
}

// 分镜布局
export interface PanelPlacement {
  panel_id: string
  x: number
  y: number
  width: number
  height: number
}

// 页面布局
export interface PageLayout {
  page_number: number
  format: 'page' | 'webtoon'
  panels: PanelPlacement[]
}

// 文字气泡
export interface TextBubble {
  id: string
  type: 'speech' | 'thought' | 'narration' | 'sfx'
  text: string
  x: number
  y: number
  width: number
  height: number
  font: string
  font_size: number
  tail_direction?: 'left' | 'right' | 'top' | 'bottom'
}

// 分镜文字层
export interface PanelText {
  panel_id: string
  bubbles: TextBubble[]
}

// 文字层
export interface TextLayer {
  panels: PanelText[]
}
