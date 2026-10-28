import React from 'react';
import {
	AbsoluteFill,
	Audio,
	Easing,
	Sequence,
	interpolate,
	staticFile,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Kanit';

const {fontFamily} = loadFont('normal', {
	weights: ['700'],
	subsets: ['thai', 'latin'],
});

const PINK = '#FF4D8D';
const YELLOW = '#FFD93D';
const SKIN_Z = '#7FB069';
const GROUND = 1450;

// Timeline (frames @30fps)
const WALK_END = 150; // zombie reaches the human
const SCREAM_END = 240; // human screams
const PAN_END = 390; // zombie walks past to the grill
const EAT_END = 510; // zombie eats; then end card until 660

const ZombieChar: React.FC<{x: number; walking: boolean; happy: boolean}> = ({
	x,
	walking,
	happy,
}) => {
	const frame = useCurrentFrame();
	const step = walking ? Math.sin(frame * 0.25) : 0;
	const bob = walking ? Math.abs(step) * 14 : happy ? Math.abs(Math.sin(frame * 0.4)) * 10 : 0;
	const armSwing = walking ? step * 6 : happy ? Math.sin(frame * 0.5) * 10 : 0;

	return (
		<g transform={`translate(${x}, ${GROUND - bob})`}>
			<rect x={-30} y={-230} width={44} height={230} rx={20} fill="#3d2f59" transform={`rotate(${-step * 20}, -8, -220)`} />
			<rect x={6} y={-230} width={44} height={230} rx={20} fill="#4b3b6b" transform={`rotate(${step * 20}, 28, -220)`} />
			<g transform={`rotate(${8 + step * 3}, 10, -220)`}>
				<rect x={40} y={-460} width={210} height={48} rx={24} fill={SKIN_Z} transform={`rotate(${armSwing - 4}, 40, -436)`} />
				<rect x={-60} y={-480} width={140} height={280} rx={34} fill="#8a6f4e" />
				<polygon points="-60,-215 -35,-180 -10,-215 15,-178 40,-215 65,-182 80,-215 80,-200 -60,-200" fill="#8a6f4e" />
				<rect x={-20} y={-420} width={30} height={22} rx={6} fill="#6b5338" />
				<rect x={30} y={-440} width={210} height={48} rx={24} fill="#6f9c5b" transform={`rotate(${-armSwing + 4}, 30, -416)`} />
				<circle cx={20} cy={-560} r={100} fill={SKIN_Z} />
				<path d="M -40 -640 l 20 15 l 15 -15 l 20 15" stroke="#3d5a2e" strokeWidth={6} fill="none" />
				<circle cx={60} cy={-575} r={30} fill="white" />
				<circle cx={68} cy={-570} r={10} fill="#222" />
				<circle cx={0} cy={-570} r={16} fill="white" />
				<circle cx={4} cy={-568} r={6} fill="#222" />
				{happy ? (
					<>
						<path d="M -5 -515 Q 50 -460 100 -515" stroke="#3d2f2f" strokeWidth={10} fill="#5a1e1e" />
						<ellipse cx={85} cy={-485} rx={8} ry={16 + Math.sin(frame * 0.3) * 6} fill="#9ad7ff" />
					</>
				) : (
					<path d="M 0 -505 L 15 -520 L 30 -505 L 45 -520 L 60 -505 L 75 -520 L 90 -505" stroke="#3d2f2f" strokeWidth={8} fill="none" />
				)}
			</g>
		</g>
	);
};

const Human: React.FC<{x: number; scared: boolean; confused: boolean}> = ({x, scared, confused}) => {
	const frame = useCurrentFrame();
	const shake = scared ? Math.sin(frame * 3) * 10 : 0;
	const armAngle = scared ? -150 : 0;

	return (
		<g transform={`translate(${x + shake}, ${GROUND})`}>
			<rect x={-40} y={-220} width={36} height={220} rx={16} fill="#222" />
			<rect x={4} y={-220} width={36} height={220} rx={16} fill="#222" />
			<rect x={-90} y={-450} width={34} height={170} rx={16} fill="#F6C9A0" transform={`rotate(${-armAngle}, -73, -440)`} />
			<rect x={56} y={-450} width={34} height={170} rx={16} fill="#F6C9A0" transform={`rotate(${armAngle}, 73, -440)`} />
			<rect x={-65} y={-470} width={130} height={260} rx={30} fill="#3A86FF" />
			<circle cx={0} cy={-560} r={90} fill="#F6C9A0" />
			<path d="M -90 -580 Q 0 -700 90 -580 Q 40 -620 -90 -580" fill="#2b1d14" />
			<circle cx={-30} cy={-560} r={scared ? 18 : 10} fill="white" stroke="#222" strokeWidth={4} />
			<circle cx={30} cy={-560} r={scared ? 18 : 10} fill="white" stroke="#222" strokeWidth={4} />
			<circle cx={-30} cy={-558} r={5} fill="#222" />
			<circle cx={30} cy={-558} r={5} fill="#222" />
			{scared ? (
				<ellipse cx={0} cy={-505} rx={24} ry={32} fill="#5a1e1e" />
			) : confused ? (
				<path d="M -20 -505 Q 0 -520 20 -500" stroke="#222" strokeWidth={6} fill="none" />
			) : (
				<path d="M -20 -510 Q 0 -495 20 -510" stroke="#222" strokeWidth={6} fill="none" />
			)}
			{scared && <path d="M 95 -620 q 15 30 0 40 q -15 -10 0 -40" fill="#9ad7ff" />}
		</g>
	);
};

// Thai-style pork grill (หมูกระทะ) with rising smoke.
const Grill: React.FC<{x: number}> = ({x}) => {
	const frame = useCurrentFrame();
	return (
		<g transform={`translate(${x}, ${GROUND})`}>
			<path d="M -110 0 L -140 -200 L 140 -200 L 110 0 Z" fill="#b5651d" />
			<rect x={-150} y={-215} width={300} height={30} rx={12} fill="#8b4513" />
			<ellipse cx={0} cy={-225} rx={170} ry={30} fill="#555" />
			<path d="M -120 -230 Q 0 -360 120 -230 Z" fill="#333" />
			{[-60, 0, 60, -30, 30].map((dx, i) => (
				<ellipse key={i} cx={dx} cy={-270 - (i > 2 ? 40 : 0)} rx={32} ry={12} fill="#ff8fab" stroke="#c9184a" strokeWidth={4} />
			))}
			{[0, 1, 2].map((i) => {
				const t = (frame + i * 20) % 60;
				return <circle key={i} cx={-40 + i * 40 + Math.sin(t * 0.2) * 15} cy={-340 - t * 5} r={30 + t * 0.6} fill="white" opacity={1 - t / 60} />;
			})}
		</g>
	);
};

const Caption: React.FC<{text: string; sub?: string}> = ({text, sub}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame, fps, config: {damping: 9}});
	return (
		<AbsoluteFill style={{alignItems: 'center', paddingTop: 220, fontFamily, textAlign: 'center'}}>
			<div style={{transform: `scale(${pop})`}}>
				<div style={{fontSize: 130, color: 'white', WebkitTextStroke: `12px ${PINK}`, paintOrder: 'stroke fill', lineHeight: 1.3}}>
					{text}
				</div>
				{sub && <div style={{fontSize: 70, color: PINK, marginTop: 20}}>{sub}</div>}
			</div>
		</AbsoluteFill>
	);
};

const EndCard: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame, fps, config: {damping: 8}});
	return (
		<AbsoluteFill style={{background: PINK, justifyContent: 'center', alignItems: 'center', fontFamily, textAlign: 'center'}}>
			<div style={{transform: `scale(${pop})`}}>
				<div style={{fontSize: 300}}>🧟🔥</div>
				<div style={{fontSize: 130, color: 'white', WebkitTextStroke: `12px ${YELLOW}`, paintOrder: 'stroke fill', lineHeight: 1.3}}>
					ซอมบี้ไทย
					<br />
					ก็แบบนี้แหละ
				</div>
				<div style={{fontSize: 70, color: YELLOW, marginTop: 50}}>แท็กเพื่อนสายหมูกระทะ 👇</div>
			</div>
		</AbsoluteFill>
	);
};

export const Zombie: React.FC = () => {
	const frame = useCurrentFrame();
	const ease = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)} as const;
	const cam = interpolate(frame, [SCREAM_END, PAN_END], [0, 900], ease);
	const zombieX = interpolate(frame, [0, WALK_END, SCREAM_END, PAN_END], [-250, 420, 420, 1400], ease);
	const walking = frame < WALK_END || (frame >= SCREAM_END && frame < PAN_END);
	const scared = frame >= WALK_END && frame < SCREAM_END;
	const shakeY = scared ? Math.sin(frame * 4) * 12 : 0;

	return (
		<AbsoluteFill style={{background: YELLOW}}>
			<svg width={1080} height={1920} style={{transform: `translateY(${shakeY}px)`}}>
				<g transform={`translate(${-cam}, 0)`}>
					<rect x={-500} y={GROUND} width={3000} height={500} fill={PINK} />
					<Grill x={1760} />
					<Human x={760} scared={scared} confused={frame >= SCREAM_END} />
					<ZombieChar x={zombieX} walking={walking} happy={frame >= PAN_END} />
				</g>
			</svg>
			<Sequence durationInFrames={WALK_END}>
				<Caption text="สมองงง... 🧠" />
			</Sequence>
			<Sequence from={WALK_END} durationInFrames={SCREAM_END - WALK_END}>
				<Caption text="อย่ากินฉันนน!! 😭" />
			</Sequence>
			<Sequence from={SCREAM_END} durationInFrames={PAN_END - SCREAM_END}>
				<Caption text="...เอ๊ะ? 🤨" />
			</Sequence>
			<Sequence from={PAN_END} durationInFrames={EAT_END - PAN_END}>
				<Caption text="หมูกระทะะะ!!! 🤤" sub="สมองไว้ทีหลัง" />
			</Sequence>
			{/* Sound effects generated with ElevenLabs into public/sfx/ */}
			<Sequence durationInFrames={WALK_END}>
				<Audio src={staticFile('sfx/groan.mp3')} />
			</Sequence>
			<Sequence from={WALK_END} durationInFrames={SCREAM_END - WALK_END}>
				<Audio src={staticFile('sfx/scream.mp3')} />
			</Sequence>
			<Sequence from={SCREAM_END} durationInFrames={60}>
				<Audio src={staticFile('sfx/huh.mp3')} />
			</Sequence>
			<Sequence from={PAN_END} durationInFrames={EAT_END - PAN_END}>
				<Audio src={staticFile('sfx/sizzle.mp3')} />
			</Sequence>
			<Sequence from={EAT_END}>
				<Audio src={staticFile('sfx/tada.mp3')} />
			</Sequence>
			<Sequence from={EAT_END}>
				<EndCard />
			</Sequence>
		</AbsoluteFill>
	);
};
