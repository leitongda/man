"""Step 7: 排版与合成"""

from typing import List, Literal, Optional
from io import BytesIO
import base64

from PIL import Image, ImageDraw, ImageFont
from celery import shared_task


class LayoutService:
    """排版合成服务"""
    
    def __init__(self):
        self.default_font_size = 24
        self.bubble_padding = 10
        self.page_margin = 20
    
    def calculate_webtoon_layout(
        self,
        panels: List[dict],
        width: int = 800,
        gap: int = 20,
    ) -> List[dict]:
        """计算条漫排版"""
        placements = []
        current_y = self.page_margin
        
        for i, panel in enumerate(panels):
            # 假设每个分镜高度为宽度的1.3倍（竖版）
            panel_height = int(width * 1.3)
            
            placements.append({
                "panel_id": panel.get("id"),
                "x": 0,
                "y": current_y,
                "width": width,
                "height": panel_height,
            })
            
            current_y += panel_height + gap
        
        return placements
    
    def calculate_page_layout(
        self,
        panels: List[dict],
        page_width: int = 1200,
        page_height: int = 1700,  # A4比例
        cols: int = 2,
        rows: int = 3,
    ) -> List[List[dict]]:
        """计算页漫排版（多页）"""
        panels_per_page = cols * rows
        pages = []
        
        panel_width = (page_width - self.page_margin * (cols + 1)) // cols
        panel_height = (page_height - self.page_margin * (rows + 1)) // rows
        
        for page_idx in range(0, len(panels), panels_per_page):
            page_panels = panels[page_idx:page_idx + panels_per_page]
            page_placements = []
            
            for i, panel in enumerate(page_panels):
                row = i // cols
                col = i % cols
                
                x = self.page_margin + col * (panel_width + self.page_margin)
                y = self.page_margin + row * (panel_height + self.page_margin)
                
                page_placements.append({
                    "panel_id": panel.get("id"),
                    "x": x,
                    "y": y,
                    "width": panel_width,
                    "height": panel_height,
                })
            
            pages.append(page_placements)
        
        return pages
    
    def composite_webtoon(
        self,
        panel_images: List[dict],  # [{panel_id, image_base64}]
        layout: List[dict],
        width: int = 800,
    ) -> str:
        """合成条漫"""
        # 计算总高度
        total_height = max(p["y"] + p["height"] for p in layout) + self.page_margin
        
        # 创建画布
        canvas = Image.new("RGB", (width, total_height), color="white")
        
        # 粘贴每个分镜
        for placement in layout:
            panel_id = placement["panel_id"]
            panel_data = next((p for p in panel_images if p.get("panel_id") == panel_id), None)
            
            if panel_data and panel_data.get("image"):
                try:
                    # 解码base64图像
                    img_data = base64.b64decode(panel_data["image"])
                    img = Image.open(BytesIO(img_data))
                    
                    # 调整大小
                    img = img.resize((placement["width"], placement["height"]), Image.Resampling.LANCZOS)
                    
                    # 粘贴到画布
                    canvas.paste(img, (placement["x"], placement["y"]))
                except Exception as e:
                    print(f"Failed to process panel {panel_id}: {e}")
        
        # 转为base64
        buffer = BytesIO()
        canvas.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode()
    
    def add_text_bubbles(
        self,
        image_base64: str,
        text_layer: dict,
    ) -> str:
        """添加文字气泡"""
        # 解码图像
        img_data = base64.b64decode(image_base64)
        img = Image.open(BytesIO(img_data))
        draw = ImageDraw.Draw(img)
        
        # 尝试加载字体
        try:
            font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", self.default_font_size)
        except:
            font = ImageFont.load_default()
        
        # 绘制气泡
        for panel_text in text_layer.get("panels", []):
            for bubble in panel_text.get("bubbles", []):
                x = bubble.get("x", 0)
                y = bubble.get("y", 0)
                width = bubble.get("width", 100)
                height = bubble.get("height", 50)
                text = bubble.get("text", "")
                bubble_type = bubble.get("type", "speech")
                
                # 绘制气泡背景
                if bubble_type == "speech":
                    # 圆角矩形
                    draw.rounded_rectangle(
                        [x, y, x + width, y + height],
                        radius=10,
                        fill="white",
                        outline="black",
                        width=2,
                    )
                elif bubble_type == "thought":
                    # 云朵形状（简化为椭圆）
                    draw.ellipse(
                        [x, y, x + width, y + height],
                        fill="white",
                        outline="black",
                        width=2,
                    )
                elif bubble_type == "narration":
                    # 矩形
                    draw.rectangle(
                        [x, y, x + width, y + height],
                        fill="lightyellow",
                        outline="black",
                        width=1,
                    )
                elif bubble_type == "sfx":
                    # 拟声词，直接绘制文字
                    pass
                
                # 绘制文字
                text_x = x + self.bubble_padding
                text_y = y + self.bubble_padding
                draw.text((text_x, text_y), text, fill="black", font=font)
        
        # 转为base64
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode()
    
    def export_to_pdf(
        self,
        pages: List[str],  # base64 images
        output_path: str,
    ) -> None:
        """导出为PDF"""
        images = []
        
        for page_base64 in pages:
            img_data = base64.b64decode(page_base64)
            img = Image.open(BytesIO(img_data))
            if img.mode == "RGBA":
                img = img.convert("RGB")
            images.append(img)
        
        if images:
            images[0].save(
                output_path,
                save_all=True,
                append_images=images[1:],
                format="PDF",
            )


@shared_task(bind=True)
def composite_chapter_task(
    self,
    project_id: str,
    chapter_id: str,
    panel_images: List[dict],
    panels: List[dict],
    format: Literal["webtoon", "page"] = "webtoon",
    text_layer: Optional[dict] = None,
):
    """Celery任务：合成章节"""
    service = LayoutService()
    
    if format == "webtoon":
        layout = service.calculate_webtoon_layout(panels)
        result = service.composite_webtoon(panel_images, layout)
    else:
        # 页漫需要额外处理
        pages_layout = service.calculate_page_layout(panels)
        # TODO: 实现页漫合成
        result = None
    
    # 添加文字气泡
    if text_layer and result:
        result = service.add_text_bubbles(result, text_layer)
    
    return {
        "chapter_id": chapter_id,
        "image": result,
        "format": format,
    }
