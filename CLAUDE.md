# Thai TikTok Animation

Funny Thai TikTok animations built with [Remotion](https://www.remotion.dev/) (React + TypeScript).

## Video specs

- Size: **1080x1920** (vertical 9:16)
- Frame rate: **30fps**
- Length: **15–30 seconds** (450–900 frames)

## Content

- All on-screen text is in **Thai** (English tech words like dev, Jira, AI are fine, as Thai people say them).
- Font: always **Kanit**, loaded with `loadFont()` from `@remotion/google-fonts/Kanit` and the `thai` subset.
- Brand colors: pink `#FF4D8D`, yellow `#FFD93D`. Dark horror scenes use them as glow/accent colors.
- Characters and props are drawn in code (SVG/HTML), no image assets.
- Add Thai subtitles to narrated videos, many viewers watch muted.

## Project layout

- `src/index.ts`: registers all compositions (one per video).
- `src/<Name>.tsx`: one file per video. Current: `Snooze`, `Zombie`, `JiraHorror`.
- `public/sfx/`: sound effects. `public/voice/`: narration clips. Load with `staticFile()`.
- `out/`: rendered videos (gitignored).

## Commands

```bash
npm run dev                                          # Remotion Studio preview
npx remotion render src/index.ts <Id> out/<name>.mp4 # render a video to out/
npx remotion still src/index.ts <Id> /tmp/f.png --frame=<n> --scale=0.3  # check a frame
```

Check a few frames with `remotion still` before rendering the full video.

## Audio (ElevenLabs)

The API key is `ELEVENLABS_API_KEY` in `.env` (gitignored, never commit it). Call the API with `curl`:

- Sound effects: `POST https://api.elevenlabs.io/v1/sound-generation` with `{"text", "duration_seconds", "prompt_influence"}`.
- Thai narration: `POST https://api.elevenlabs.io/v1/text-to-speech/<voice_id>` with `{"text", "model_id": "eleven_v3", "language_code": "th"}`. Audio tags like `[whispers]`, `[dramatic]` work.
- Narrator voice: **George** (`JBFqnCBsd6RMkjVDRZzb`), chosen by the user.

Scene timing is driven by narration length: measure each clip with `ffprobe` and update the durations in the video file. If narration pushes a video past 30s, speed it up with `playbackRate` on `<Audio>`.
