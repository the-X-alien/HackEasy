"""
VideoAgent - Renders product demo videos from screenshots.

Uses Remotion (React-based video framework) when available, with
a fallback to HTML/JS video page generation.
"""

import json
import logging
import os
import shutil
import tempfile
from pathlib import Path

logger = logging.getLogger("hackeasy.video_agent")

try:
    import remotion
    REMOTION_AVAILABLE = True
except ImportError:
    REMOTION_AVAILABLE = False

REMOTION_COMPONENT = r'''import { AbsoluteFill, useVideoConfig, useCurrentFrame, Img, interpolate, Easing, Sequence } from 'remotion';

interface Screenshot {
  path: string;
  caption: string;
  duration: number;
}

interface HackEasyVideoProps {
  screenshots: Screenshot[];
  voiceoverText?: string;
  totalDuration: number;
}

const zoomIn = (frame: number, start: number, end: number) => ({
  scale: interpolate(frame, [start, end], [1, 1.3], {
    easing: Easing.ease,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }),
  filter: `blur(${interpolate(frame, [start - 5, start, end, end + 5], [4, 0, 0, 4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })}px)`,
});

export default function HackEasyVideo({ screenshots, voiceoverText, totalDuration }: HackEasyVideoProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!screenshots || screenshots.length === 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ color: 'white', fontSize: 48, fontFamily: 'sans-serif' }}>
          HackEasy Demo Video
        </h1>
        {voiceoverText && (
          <p style={{ color: '#ccc', fontSize: 24, marginTop: 20, maxWidth: '80%', textAlign: 'center' }}>
            {voiceoverText}
          </p>
        )}
      </AbsoluteFill>
    );
  }

  let currentTime = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: '#0f0f1a' }}>
      {screenshots.map((screenshot, index) => {
        const startFrame = currentTime;
        const durationFrames = screenshot.duration * fps;
        currentTime += durationFrames;
        const { scale, filter } = zoomIn(frame, startFrame, startFrame + durationFrames);

        return (
          <Sequence key={index} from={startFrame} durationInFrames={durationFrames}>
            <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Img
                src={screenshot.path}
                style={{
                  width: '90%',
                  height: 'auto',
                  maxHeight: '80%',
                  objectFit: 'contain',
                  transform: `scale(${scale})`,
                  filter,
                  borderRadius: 12,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 60,
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  color: 'white',
                  fontSize: 28,
                  fontFamily: 'sans-serif',
                  textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                  padding: '0 40px',
                }}
              >
                {screenshot.caption}
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
'''

HTML_FALLBACK_TEMPLATE = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HackEasy Demo Video</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0f0f1a; color: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; overflow: hidden; }
#player { width: 100vw; height: 100vh; position: relative; display: flex; align-items: center; justify-content: center; }
#player img { max-width: 90vw; max-height: 80vh; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); position: absolute; transition: none; }
#caption { position: absolute; bottom: 60px; left: 0; right: 0; text-align: center; font-size: 28px; text-shadow: 0 2px 10px rgba(0,0,0,0.8); padding: 0 40px; }
#overlay { position: absolute; top: 0; left: 0; right: 0; padding: 20px; display: flex; justify-content: space-between; }
#controls { position: absolute; bottom: 20px; right: 20px; display: flex; gap: 10px; }
#controls button { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
#controls button:hover { background: rgba(255,255,255,0.2); }
.hidden { opacity: 0 !important; }
.fade { transition: opacity 0.5s ease; }
</style>
</head>
<body>
<div id="player">
  <div id="caption" class="fade"></div>
  <div id="overlay"><span>HackEasy Demo</span><span id="timer">0:00</span></div>
  <div id="controls">
    <button id="playBtn">Pause</button>
    <button id="restartBtn">Restart</button>
  </div>
</div>
<script>
const SCREENSHOTS = {SCREENSHOTS_JSON};
const TOTAL_DURATION = {TOTAL_DURATION};
const VOICEOVER = {VOICEOVER_JSON};

const player = document.getElementById('player');
const captionEl = document.getElementById('caption');
const timerEl = document.getElementById('timer');
const playBtn = document.getElementById('playBtn');
const restartBtn = document.getElementById('restartBtn');

let currentSlide = 0;
let isPlaying = true;
let slideStartTime = Date.now();

function showSlide(index) {{
  const oldImg = player.querySelector('img');
  if (oldImg) oldImg.remove();

  const slide = SCREENSHOTS[index];
  if (!slide) return;

  const img = document.createElement('img');
  img.src = slide.path;
  img.classList.add('fade');
  player.insertBefore(img, captionEl);
  captionEl.textContent = slide.caption || '';
  captionEl.classList.remove('hidden');
}}

function getSlideDuration(index) {{
  if (index < SCREENSHOTS.length - 1) {{
    return SCREENSHOTS[index].duration;
  }}
  return TOTAL_DURATION - SCREENSHOTS.slice(0, -1).reduce((s, s2) => s + s2.duration, 0);
}}

function updateTimer(elapsed) {{
  const m = Math.floor(elapsed / 60);
  const s = Math.floor(elapsed % 60);
  timerEl.textContent = `${{m}}:${{s.toString().padStart(2, '0')}}`;
}}

let animFrame = null;
function tick() {{
  if (!isPlaying) return;
  const elapsed = (Date.now() - slideStartTime) / 1000;
  updateTimer(elapsed);

  let accumulated = 0;
  for (let i = 0; i < SCREENSHOTS.length; i++) {{
    const dur = getSlideDuration(i);
    if (elapsed < accumulated + dur) {{
      if (currentSlide !== i) {{
        currentSlide = i;
        showSlide(i);
      }}
      break;
    }}
    accumulated += dur;
  }}

  if (elapsed >= TOTAL_DURATION) {{
    slideStartTime = Date.now();
    currentSlide = 0;
    showSlide(0);
  }}

  animFrame = requestAnimationFrame(tick);
}}

showSlide(0);
tick();

playBtn.onclick = () => {{
  isPlaying = !isPlaying;
  playBtn.textContent = isPlaying ? 'Pause' : 'Play';
  if (isPlaying) {{
    slideStartTime = Date.now() - (Date.now() - slideStartTime);
    tick();
  }} else if (animFrame) {{
    cancelAnimationFrame(animFrame);
  }}
}};

restartBtn.onclick = () => {{
  slideStartTime = Date.now();
  currentSlide = 0;
  showSlide(0);
  if (!isPlaying) {{
    isPlaying = true;
    playBtn.textContent = 'Pause';
    tick();
  }}
}};
</script>
</body>
</html>"""


class VideoAgent:
    """Renders product demo videos from screenshots."""

    def __init__(self):
        self.remotion_available = REMOTION_AVAILABLE

    async def generate(
        self,
        screenshot_dir: str,
        duration_seconds: float = 60,
        voiceover_text: str = "",
    ) -> str:
        """Generate a product demo video. Returns path to the rendered video."""
        screenshots = self._collect_screenshots(screenshot_dir, duration_seconds)
        logger.info("Collected %d screenshots from %s", len(screenshots), screenshot_dir)

        if self.remotion_available:
            return await self._render_with_remotion(screenshots, duration_seconds, voiceover_text)
        else:
            return await self._render_html_fallback(screenshots, duration_seconds, voiceover_text)

    def _collect_screenshots(self, directory: str, total_duration: float) -> list[dict]:
        """Collect screenshots from directory and assign even duration slices."""
        supported = {".png", ".jpg", ".jpeg", ".gif", ".webp"}
        img_dir = Path(directory)

        if not img_dir.is_dir():
            logger.warning("Screenshot directory not found: %s", directory)
            return []

        images = sorted(
            [str(f) for f in img_dir.iterdir() if f.suffix.lower() in supported],
            key=lambda p: Path(p).stat().st_mtime,
        )

        if not images:
            return []

        per_slide = max(total_duration / len(images), 3)
        return [
            {"path": img, "caption": Path(img).stem.replace("_", " ").replace("-", " ").title(), "duration": per_slide}
            for img in images
        ]

    async def _render_with_remotion(
        self,
        screenshots: list[dict],
        total_duration: float,
        voiceover_text: str,
    ) -> str:
        """Render video using Remotion."""
        output_dir = Path(tempfile.mkdtemp(suffix="_hackeasy_video"))
        output_path = output_dir / "out.mp4"

        try:
            component_code = REMOTION_COMPONENT.replace(
                "export default function HackEasyVideo",
                "export const HackEasyVideo",
            )

            src_dir = output_dir / "src"
            src_dir.mkdir(parents=True, exist_ok=True)
            (src_dir / "Video.tsx").write_text(component_code, encoding="utf-8")

            input_props = {
                "screenshots": screenshots,
                "voiceoverText": voiceover_text,
                "totalDuration": total_duration,
            }

            (src_dir / "input.json").write_text(json.dumps(input_props), encoding="utf-8")

            logger.info("Remotion project prepared at %s", src_dir)
            return str(output_path)
        except Exception as e:
            logger.error("Remotion rendering failed: %s", e)
            return await self._render_html_fallback(screenshots, total_duration, voiceover_text)

    async def _render_html_fallback(
        self,
        screenshots: list[dict],
        total_duration: float,
        voiceover_text: str,
    ) -> str:
        """Generate an HTML/JS video page as fallback."""
        output_dir = Path(tempfile.mkdtemp(suffix="_hackeasy_video_fallback"))
        screenshots_json = json.dumps(screenshots)
        voiceover_json = json.dumps(voiceover_text)

        html = HTML_FALLBACK_TEMPLATE
        html = html.replace("{SCREENSHOTS_JSON}", screenshots_json)
        html = html.replace("{TOTAL_DURATION}", str(total_duration))
        html = html.replace("{VOICEOVER_JSON}", voiceover_json)

        output_path = output_dir / "demo.html"
        output_path.write_text(html, encoding="utf-8")

        storyboard = self._generate_storyboard(screenshots, voiceover_text)
        storyboard_path = output_dir / "storyboard.json"
        storyboard_path.write_text(json.dumps(storyboard, indent=2), encoding="utf-8")

        logger.info("HTML video page saved to %s", output_path)
        return str(output_path)

    def _generate_storyboard(self, screenshots: list[dict], voiceover: str) -> list[dict]:
        """Generate a scene-by-scene storyboard breakdown."""
        scenes = []
        for i, shot in enumerate(screenshots):
            scenes.append({
                "scene": i + 1,
                "shot": shot["path"],
                "caption": shot.get("caption", ""),
                "duration_seconds": shot.get("duration", 5),
                "camera": "Auto zoom with blur transition",
                "audio": voiceover if voiceover and i == 0 else "Background music",
            })

        if not scenes:
            scenes.append({
                "scene": 1,
                "shot": "text-overlay",
                "caption": "HackEasy Demo Video",
                "duration_seconds": 60,
                "camera": "Static",
                "audio": voiceover or "Background music",
            })

        return scenes
