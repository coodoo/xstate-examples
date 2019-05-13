/* eslint-disable */
import { Machine, send } from 'xstate'
import { updater, assign } from './xstateImmer'
import { Enum } from 'enumify'
import { compressionService } from './compressionService'

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
				initial: 'idle',
				invoke: {
					id: 'CompressionService',
					src: compressionService,
				},
				states: {
					idle: {},
					running: {},
					completed: {},
				},
				on: {
					//
					addFile: {
						target: '.running',
						actions: [
							assign((ctx, e) => {
								ctx.songs.push(e.data)
								return ctx
							}),
							send(
								(ctx, e) => ({
									type: 'compressSong',
									data: e.data,
								}),
								{ to: 'CompressionService' },
							),
						],
					},

					//
					workerProgress: {
						target: '',
						actions: [
							assign((ctx, e) => {
								const { id, progress } = e.job
								ctx.songs = ctx.songs.map(it => {
									if (it.id === id) it.progress = progress
									return it
								})
								return ctx
							}),
						],
					},

					//
					workerDone: {
						// target: '.completed',
						actions: [
							assign((ctx, e) => {
								// console.log( '\t完工:', ctx.songs, e )
								const { id, progress } = e.job
								ctx.songs = ctx.songs.map(it => {
									if (it.id === id) it.progress = progress
									return it
								})
								return ctx
							}),
						],
					},

					cancelFile: {
						// target: '.completed',
						actions: [
							assign((ctx, e) => {
								ctx.songs = ctx.songs.filter(it => it.id !== e.id)
								return ctx
							}),
							send(
								(ctx, e) => ({
									type: 'cancelSong',
									data: e.id,
								}),
								{ to: 'CompressionService' },
							),
						],
					},

					pauseFile: {
						// target: '.completed',
						actions: [
							assign((ctx, e) => {
								// ctx.songs = ctx.songs.filter( it => it.id !== e.id )
								// return ctx
							}),
							send(
								(ctx, e) => ({
									type: 'pauseSong',
									data: e.id,
								}),
								{ to: 'CompressionService' },
							),
						],
					},

					resumeFile: {
						// target: '.completed',
						actions: [
							assign((ctx, e) => {
								// console.log( '\t接續:', e.id )
								// ctx.songs = ctx.songs.filter( it => it.id !== e.id )
								// return ctx
							}),
							send(
								(ctx, e) => ({
									type: 'resumeSong',
									data: { id: e.id, progress: e.progress },
								}),
								{ to: 'CompressionService' },
							),
						],
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
