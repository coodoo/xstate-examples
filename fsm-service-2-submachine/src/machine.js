/* eslint-disable */
import { Machine, send } from 'xstate'
import { updater, assign } from './xstateImmer'
import { Enum } from 'enumify'

export class Types extends Enum {}
Types.initEnum(['itemSelect'])

export default Machine(
	{
		id: 'Compressor',
		type: 'parallel',
		context: {
			songs: [],
		},
		states: {
			main: {
				initial: 'main',
				states: {
					main: {},
					running: {},
					completed: {},
				},
				on: {
					//
					addFile: {
						target: '',
						actions: [
							assign((ctx, e) => {
								ctx.songs.push(e.data)
								return ctx
							}),
						],
					},

					update: {
						actions: assign((ctx, e) => {
							ctx.songs = ctx.songs.map(it => {
								if (it.id === e.data.id) it.progress = e.data.progress
								return it
							})
							return ctx
						}),
					},

					cancel: {
						actions: assign((ctx, e) => {
							ctx.songs = ctx.songs.filter(it => it.id !== e.data.id)
							// console.log( '\n\n刪完:', ctx.songs )
							return ctx
						}),
					},
				},
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
		updater,
	},
)
