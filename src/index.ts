import {createElement, Fragment} from 'react';
import {Composition, registerRoot} from 'remotion';
import {Snooze} from './Snooze';
import {Zombie} from './Zombie';
import {JiraHorror, JIRA_HORROR_FRAMES} from './JiraHorror';

const video = {fps: 30, width: 1080, height: 1920};

registerRoot(() =>
	createElement(
		Fragment,
		null,
		createElement(Composition, {id: 'Snooze', component: Snooze, durationInFrames: 600, ...video}), // 20s
		createElement(Composition, {id: 'Zombie', component: Zombie, durationInFrames: 660, ...video}), // 22s
		createElement(Composition, {id: 'JiraHorror', component: JiraHorror, durationInFrames: JIRA_HORROR_FRAMES, ...video}),
	),
);
