import React from 'react';
import {
	AbsoluteFill,
	Sequence,
	interpolate,
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

const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');
const clock = (minutes: number) => `${pad(minutes / 60)}:${pad(minutes % 60)}`;

const Beat: React.FC<{
	emoji: string;
	text: string;
	sub?: string;
	bg: string;
	shake?: number;
}> = ({emoji, text, sub, bg, shake = 0}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame, fps, config: {damping: 9}});
	const dx = Math.sin(frame * 2.5) * shake;
	const fg = bg === PINK ? YELLOW : PINK;

	return (
		<AbsoluteFill
			style={{
				background: bg,
				fontFamily,
				justifyContent: 'center',
				alignItems: 'center',
				textAlign: 'center',
				padding: 80,
			}}
		>
			<div style={{transform: `translateX(${dx}px) scale(${pop})`}}>
				<div style={{fontSize: 360, lineHeight: 1.1}}>{emoji}</div>
				<div
					style={{
						fontSize: 130,
						fontWeight: 700,
						color: 'white',
						lineHeight: 1.25,
						WebkitTextStroke: `10px ${fg}`,
						paintOrder: 'stroke fill',
					}}
				>
					{text}
				</div>
				{sub && (
					<div style={{fontSize: 80, fontWeight: 700, color: 'white', marginTop: 40}}>
						{sub}
					</div>
				)}
			</div>
		</AbsoluteFill>
	);
};

const Alarm: React.FC<{minutes: number}> = ({minutes}) => (
	<Beat emoji="⏰" text={clock(minutes)} sub="กริ๊งงงงง!!" bg={YELLOW} shake={25} />
);

// Clock races from 06:10 to 08:47, then panic.
const Panic: React.FC = () => {
	const frame = useCurrentFrame();
	const minutes = interpolate(frame, [0, 40], [370, 527], {extrapolateRight: 'clamp'});
	return frame < 40 ? (
		<Beat emoji="⏩" text={clock(minutes)} bg={YELLOW} />
	) : (
		<Beat emoji="😱" text={`${clock(527)}\nตายแล้ว!!!`} sub="สายแล้วววว" bg={PINK} shake={40} />
	);
};

export const Snooze: React.FC = () => (
	<AbsoluteFill style={{whiteSpace: 'pre-line'}}>
		<Sequence durationInFrames={90}>
			<Alarm minutes={360} />
		</Sequence>
		<Sequence from={90} durationInFrames={75}>
			<Beat emoji="😴" text="ขออีก 5 นาที..." bg={PINK} />
		</Sequence>
		<Sequence from={165} durationInFrames={60}>
			<Alarm minutes={365} />
		</Sequence>
		<Sequence from={225} durationInFrames={60}>
			<Beat emoji="😪" text="อีก 5 นาทีน้า..." bg={PINK} />
		</Sequence>
		<Sequence from={285} durationInFrames={60}>
			<Alarm minutes={370} />
		</Sequence>
		<Sequence from={345} durationInFrames={60}>
			<Beat emoji="🥱" text={'5 นาทีสุดท้าย\nจริงๆ นะ'} bg={PINK} />
		</Sequence>
		<Sequence from={405} durationInFrames={90}>
			<Panic />
		</Sequence>
		<Sequence from={495}>
			<Beat emoji="🙋" text={'ใครเป็นแบบนี้\nบ้าง?'} sub="แท็กเพื่อนมาเลย 👇" bg={YELLOW} />
		</Sequence>
	</AbsoluteFill>
);
