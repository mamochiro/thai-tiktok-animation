import React from 'react';
import {
	AbsoluteFill,
	Audio,
	Sequence,
	interpolate,
	interpolateColors,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Kanit';

const {fontFamily} = loadFont('normal', {
	weights: ['400', '700'],
	subsets: ['thai', 'latin'],
});

const PINK = '#FF4D8D';
const YELLOW = '#FFD93D';
const BG = '#0d0a14';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Narration (George, ElevenLabs eleven_v3) lengths in seconds, measured with ffprobe.
// ponytail: hardcoded; re-measure if public/voice/l*.mp3 are regenerated.
const VOICE = [5.84, 4.72, 6.72, 4.0, 4.32, 3.04];
const RATE = 1.12; // narration sped up to fit the 30s limit
const SUBS = [
	'ณ บริษัทแห่งหนึ่ง ใจกลางกรุงเทพฯ... ทีม dev กำลังจะเจอกับสิ่งที่น่ากลัวที่สุด',
	'คืนนั้น... การ์ด Jira ใบใหม่ ปรากฏขึ้นบนบอร์ด',
	'Story owner ให้ AI เขียนมา... ยาวสามหน้า แต่ไม่มีใครรู้ว่าต้องทำอะไร',
	'dev คนแรกที่อ่าน... ไม่เคยกลับมาเป็นคนเดิมอีกเลย',
	'เขาไปถามคนเขียน... แต่คำตอบที่ได้ น่ากลัวกว่าเดิม',
	'สุดท้าย... เขาเอาไปให้ AI อ่าน...',
];
const END_FRAMES = 60;
const DUR = VOICE.map((s, i) => Math.ceil((s / RATE + (i === 5 ? 1.3 : 0.15)) * 30));
const START = DUR.map((_, i) => DUR.slice(0, i).reduce((a, b) => a + b, 0));
export const JIRA_HORROR_FRAMES = START[5] + DUR[5] + END_FRAMES;
const REPLY_AT = DUR[5] - 39; // AI answers right after the last line

const Flash: React.FC<{at: number}> = ({at}) => {
	const frame = useCurrentFrame();
	const o = interpolate(frame, [at, at + 2, at + 4, at + 6, at + 14], [0, 0.9, 0.15, 0.7, 0], clamp);
	return <AbsoluteFill style={{background: 'white', opacity: o}} />;
};

const Pop: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({at, children, style}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - at, fps, config: {damping: 12}});
	return <div style={{transform: `scale(${s})`, opacity: s, ...style}}>{children}</div>;
};

// Scene 1: Bangkok skyline at night, ROBOWEALTH tower.
const City: React.FC = () => {
	const frame = useCurrentFrame();
	const zoom = interpolate(frame, [0, 180], [1, 1.12], clamp);
	const buildings = Array.from({length: 9}, (_, i) => ({x: i * 125 - 30, w: 140, h: 380 + ((i * 137) % 420)}));
	return (
		<AbsoluteFill style={{background: BG}}>
			<svg width={1080} height={1920} style={{transform: `scale(${zoom})`}}>
				<defs>
					<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#05030a" />
						<stop offset="1" stopColor="#2a1838" />
					</linearGradient>
				</defs>
				<rect width={1080} height={1920} fill="url(#sky)" />
				<circle cx={820} cy={330} r={90} fill="#e8e3d0" opacity={0.85} />
				{buildings.map((b, i) => (
					<g key={i}>
						<rect x={b.x} y={1500 - b.h} width={b.w} height={b.h} fill="#15111f" />
						{Array.from({length: Math.floor(b.h / 70)}, (_, r) =>
							[0, 1, 2].map((c) => (
								<rect key={`${r}-${c}`} x={b.x + 20 + c * 40} y={1500 - b.h + 30 + r * 70} width={22} height={32} fill={YELLOW} opacity={(i * 7 + r * 3 + c + Math.floor(frame / 20)) % 5 === 0 ? 0.8 : 0.08} />
							)),
						)}
					</g>
				))}
				<rect x={390} y={480} width={300} height={1020} fill="#1d1729" />
				{Array.from({length: 13}, (_, r) =>
					[0, 1, 2, 3].map((c) => <rect key={`t${r}-${c}`} x={420 + c * 65} y={640 + r * 65} width={35} height={38} fill={YELLOW} opacity={r === 7 && c === 2 ? 0.9 : 0.06} />),
				)}
				<text x={540} y={590} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={54} fill={PINK} style={{filter: `drop-shadow(0 0 14px ${PINK})`}} opacity={frame % 47 < 3 ? 0.3 : 1}>
					ROBOWEALTH
				</text>
				<rect y={1500} width={1080} height={420} fill="#07050c" />
			</svg>
			<Flash at={2} />
			<Flash at={110} />
		</AbsoluteFill>
	);
};

// Scene 2: the Jira board, RW-404 arrives glowing red.
const Board: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const drop = spring({frame: frame - 20, fps, config: {damping: 10}});
	const glow = 25 + Math.sin(frame * 0.3) * 15;
	const col = (title: string, cards: number, extra?: React.ReactNode) => (
		<div style={{flex: 1, background: '#1b1726', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 14}}>
			<div style={{color: '#8f89a3', fontSize: 30}}>{title}</div>
			{extra}
			{Array.from({length: cards}, (_, i) => <div key={i} style={{height: 90, background: '#2a2538', borderRadius: 10}} />)}
		</div>
	);
	return (
		<AbsoluteFill style={{background: BG, justifyContent: 'center', alignItems: 'center', fontFamily}}>
			<div style={{width: 960, height: 820, border: '18px solid #2b2638', borderRadius: 28, background: '#100d18', padding: 24, display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 0 120px rgba(80,140,255,0.25)'}}>
				<div style={{color: 'white', fontSize: 40, fontWeight: 700}}>บอร์ดทีม dev</div>
				<div style={{display: 'flex', gap: 16, flex: 1}}>
					{col('ต้องทำ', 2, (
						<div style={{transform: `translateY(${(1 - drop) * -500}px)`, height: 130, background: '#3a0d1c', border: '4px solid #ff2a4d', borderRadius: 10, boxShadow: `0 0 ${glow}px #ff2a4d`, color: 'white', padding: 12, fontSize: 30, fontWeight: 700}}>
							RW-404
							<div style={{fontSize: 22, fontWeight: 400, color: '#ff9db0'}}>ยกระดับ Synergy ด้วย AI</div>
						</div>
					))}
					{col('กำลังทำ', 3)}
					{col('เสร็จแล้ว', 1)}
				</div>
			</div>
		</AbsoluteFill>
	);
};

// Scene 3: the AI-written card scrolls on forever.
const WALL =
	'เพื่อยกระดับ synergy ของ ecosystem อย่าง seamless เราจะ leverage ศักยภาพของ AI-powered solution แบบ scalable และ end-to-end ซึ่งจะ empower ทุก stakeholder ให้เกิด value อย่างยั่งยืน โดยคำนึงถึง holistic approach และ best practice ระดับ world-class ทั้งนี้ต้อง align กับ vision และ roadmap ในทุกมิติ ';
const CardWall: React.FC = () => {
	const frame = useCurrentFrame();
	const page = Math.min(3, 1 + Math.floor(frame / (DUR[2] / 3)));
	return (
		<AbsoluteFill style={{background: BG, justifyContent: 'center', alignItems: 'center', fontFamily}}>
			<div style={{width: 940, height: 1150, marginTop: -200, background: '#1b1726', borderRadius: 24, padding: 44, display: 'flex', flexDirection: 'column'}}>
				<div style={{display: 'flex', justifyContent: 'space-between'}}>
					<div style={{color: PINK, fontSize: 52, fontWeight: 700}}>RW-404</div>
					<div style={{color: YELLOW, fontSize: 40, fontWeight: 700}}>หน้า {page}/3</div>
				</div>
				<div style={{color: 'white', fontSize: 40, fontWeight: 700, marginBottom: 24}}>ยกระดับ Synergy ด้วย AI</div>
				<div style={{flex: 1, overflow: 'hidden', position: 'relative'}}>
					<div style={{color: '#b9b3c9', fontSize: 36, lineHeight: 1.7, transform: `translateY(${-frame * 5}px)`}}>{WALL.repeat(8)}</div>
					<div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(transparent, #1b1726)'}} />
				</div>
			</div>
		</AbsoluteFill>
	);
};

// Scene 4: the first dev reads it and turns into a zombie.
const Turn: React.FC = () => {
	const frame = useCurrentFrame();
	const t = interpolate(frame, [15, DUR[3] - 20], [0, 1], clamp);
	const skin = interpolateColors(t, [0, 1], ['#F6C9A0', '#7FB069']);
	const shake = t > 0.8 ? Math.sin(frame * 3) * 8 : 0;
	const eye = (cx: number) => (
		<g transform={`rotate(${frame * 12}, ${cx}, 820)`}>
			<circle cx={cx} cy={820} r={70} fill="white" />
			{[55, 38, 21].map((r) => <circle key={r} cx={cx} cy={820} r={r} fill="none" stroke="#222" strokeWidth={7} strokeDasharray={`${r * 2} ${r}`} />)}
		</g>
	);
	return (
		<AbsoluteFill style={{background: BG}}>
			<svg width={1080} height={1920} style={{transform: `translateX(${shake}px)`}}>
				<defs>
					<radialGradient id="screen" cx="0.5" cy="0.4" r="0.6">
						<stop offset="0" stopColor="#4a7dff" stopOpacity={0.45} />
						<stop offset="1" stopColor="#4a7dff" stopOpacity={0} />
					</radialGradient>
				</defs>
				<rect width={1080} height={1920} fill="url(#screen)" />
				<rect x={340} y={1150} width={400} height={500} rx={60} fill="#3A86FF" />
				<circle cx={540} cy={860} r={330} fill={skin} />
				<path d="M 220 760 Q 540 380 860 760 Q 700 600 220 760" fill="#2b1d14" />
				{eye(420)}
				{eye(660)}
				<path d={t < 0.5 ? 'M 450 1020 Q 540 1040 630 1020' : 'M 440 1020 L 470 1000 L 500 1020 L 530 1000 L 560 1020 L 590 1000 L 620 1020 L 650 1000'} stroke="#3d2f2f" strokeWidth={12} fill="none" />
				<text x={540} y={300} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={64} fill="#ff2a4d" opacity={0.8}>RW-404</text>
			</svg>
		</AbsoluteFill>
	);
};

// Scene 5: zombie dev asks the story owner.
const Person: React.FC<{x: number; skin: string; shirt: string; zombie?: boolean}> = ({x, skin, shirt, zombie}) => (
	<g transform={`translate(${x}, 1300)`}>
		<rect x={-80} y={-260} width={160} height={260} rx={36} fill={shirt} />
		{zombie && <rect x={60} y={-230} width={200} height={44} rx={22} fill={skin} />}
		<circle cx={0} cy={-350} r={100} fill={skin} />
		<circle cx={-35} cy={-360} r={zombie ? 22 : 12} fill="white" stroke="#222" strokeWidth={4} />
		<circle cx={35} cy={-360} r={zombie ? 14 : 12} fill="white" stroke="#222" strokeWidth={4} />
		<circle cx={-35} cy={-358} r={5} fill="#222" />
		<circle cx={35} cy={-358} r={5} fill="#222" />
		{zombie ? (
			<path d="M -40 -300 L -25 -312 L -10 -300 L 5 -312 L 20 -300 L 35 -312" stroke="#3d2f2f" strokeWidth={7} fill="none" />
		) : (
			<path d="M -30 -300 Q 0 -290 30 -305" stroke="#222" strokeWidth={6} fill="none" />
		)}
	</g>
);
const Bubble: React.FC<{at: number; text: string; side: 'left' | 'right'; top: number}> = ({at, text, side, top}) => (
	<div style={{position: 'absolute', top, [side]: 50, maxWidth: 640}}>
		<Pop at={at}>
			<div style={{background: 'white', color: '#111', fontFamily, fontWeight: 700, fontSize: 48, padding: '24px 34px', borderRadius: 36}}>{text}</div>
		</Pop>
	</div>
);
const Ask: React.FC = () => (
	<AbsoluteFill style={{background: '#16121f'}}>
		<svg width={1080} height={1920}>
			<rect y={1300} width={1080} height={620} fill="#0b0912" />
			<rect x={640} y={1150} width={380} height={30} fill="#3b3349" />
			<rect x={700} y={1030} width={200} height={120} rx={10} fill="#2b2638" />
			<Person x={260} skin="#7FB069" shirt="#3A86FF" zombie />
			<Person x={830} skin="#F6C9A0" shirt={PINK} />
		</svg>
		<Bubble at={8} text="พี่ครับ task นี้คืออะไรครับ" side="left" top={480} />
		<Bubble at={55} text="...พี่ก็ไม่รู้ AI เขียน 😅" side="right" top={680} />
	</AbsoluteFill>
);

// Scene 6: the twist, even the AI can't read it.
const Chat: React.FC = () => {
	const frame = useCurrentFrame();
	const typing = frame > 30 && frame < REPLY_AT;
	return (
		<AbsoluteFill style={{background: BG, fontFamily, padding: 60, paddingTop: 200, gap: 40}}>
			<div style={{color: '#8f89a3', fontSize: 40, textAlign: 'center'}}>🤖 AI Assistant</div>
			<Pop at={5} style={{alignSelf: 'flex-end', maxWidth: 760}}>
				<div style={{background: PINK, color: 'white', fontSize: 46, fontWeight: 700, padding: '26px 34px', borderRadius: 36}}>
					ช่วยสรุปการ์ดนี้หน่อย 🙏
					<div style={{marginTop: 14, background: 'rgba(0,0,0,0.25)', borderRadius: 14, padding: '10px 18px', fontSize: 34}}>📎 RW-404 (3 หน้า)</div>
				</div>
			</Pop>
			{typing && (
				<div style={{alignSelf: 'flex-start', background: '#2a2538', color: 'white', fontSize: 60, padding: '10px 36px', borderRadius: 36}}>
					{'•'.repeat(1 + (Math.floor(frame / 8) % 3))}
				</div>
			)}
			<Pop at={REPLY_AT} style={{alignSelf: 'flex-start', maxWidth: 800}}>
				<div style={{background: '#2a2538', color: 'white', fontSize: 50, fontWeight: 700, padding: '26px 34px', borderRadius: 36, border: `4px solid ${YELLOW}`}}>
					ขออภัย... ฉันก็ไม่เข้าใจเหมือนกัน 😵
				</div>
			</Pop>
			<Flash at={REPLY_AT} />
		</AbsoluteFill>
	);
};

const EndCard: React.FC = () => (
	<AbsoluteFill style={{background: 'black', justifyContent: 'center', alignItems: 'center', fontFamily, textAlign: 'center', gap: 40}}>
		<Pop at={0}>
			<div style={{fontSize: 100, fontWeight: 700, color: PINK, textShadow: `0 0 30px ${PINK}`}}>เรื่องจริงจากทีม dev 👻</div>
		</Pop>
		<Pop at={12}>
			<div style={{fontSize: 64, fontWeight: 700, color: YELLOW}}>คุณเคยเจอการ์ดแบบนี้ไหม?</div>
		</Pop>
	</AbsoluteFill>
);

const Subtitle: React.FC<{text: string}> = ({text}) => (
	<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 230}}>
		<div style={{maxWidth: 940, background: 'rgba(0,0,0,0.7)', color: 'white', fontFamily, fontSize: 48, lineHeight: 1.5, padding: '18px 32px', borderRadius: 20, textAlign: 'center'}}>{text}</div>
	</AbsoluteFill>
);

const SCENES = [City, Board, CardWall, Turn, Ask, Chat];

export const JiraHorror: React.FC = () => (
	<AbsoluteFill style={{background: BG}}>
		{SCENES.map((Scene, i) => (
			<Sequence key={i} from={START[i]} durationInFrames={DUR[i]}>
				<Scene />
				<Subtitle text={SUBS[i]} />
				<Audio src={staticFile(`voice/l${i + 1}.mp3`)} playbackRate={RATE} />
			</Sequence>
		))}
		<Sequence from={START[5] + DUR[5]}>
			<EndCard />
		</Sequence>
		{/* Sound effects generated with ElevenLabs into public/sfx/ */}
		<Audio src={staticFile('sfx/drone.mp3')} volume={0.35} loop />
		<Audio src={staticFile('sfx/thunder.mp3')} />
		<Sequence from={START[1] + 20}>
			<Audio src={staticFile('sfx/glitch.mp3')} volume={0.7} />
		</Sequence>
		<Sequence from={START[3]}>
			<Audio src={staticFile('sfx/transform.mp3')} volume={0.6} />
		</Sequence>
		<Sequence from={START[5] + REPLY_AT}>
			<Audio src={staticFile('sfx/stinger.mp3')} volume={0.8} />
		</Sequence>
	</AbsoluteFill>
);
