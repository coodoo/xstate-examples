import { Machine } from 'xstate'
import { updater } from '../xstate-custom/xstateImmer'
import * as actions from './mainActions'
// import * as services from './services'
// import * as guards from './guards'
import { Enum } from 'enumify'

export class MainTypes extends Enum {}
MainTypes.initEnum([
	'addFile',
	'updateJob',
	'cancelJob',
])

export const MainMachine = Machine(
	{
		id: 'Compressor',
		type: 'parallel',
		context: {
			songs: [],
			completed: [],
		},
		states: {
			main: {
				initial: 'idle',
				states: {
					idle: {},
					progress: {},
					completed: {},
					unknown: {
						on: {
							'': [
								{
									target: '#Compressor.main.progress',
									cond: ctx => ctx.completed.length !== ctx.songs.length
								},
								{
									target: '#Compressor.main.completed',
									cond: ctx => ctx.completed.length === ctx.songs.length
								}
							]
						}
					}
				},

				// global event
				on: {
					//
					[MainTypes.addFile]: {
						target: '.progress',
						actions: [
							'addJobAssign', // fire up a child actor
							'addFileSend', // then kick start the actor with an init event
						],
					},

					[MainTypes.updateJob]: {
						actions: 'updateJob',
						target: '.unknown',
					},

					[MainTypes.cancelJob]: {
						actions: 'cancelJob',
					},
				},

				// onUpdate: '',
			},
			global: {
				initial: 'modal',
				states: {
					modal: {},
				},
			},
		},
	},

	{
		actions,
		// services,
		// guards,

		// immer version of updater
		updater,
	},
)
