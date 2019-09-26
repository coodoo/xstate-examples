/* eslint-disable */
import { Machine, send, sendParent } from 'xstate'
import { updater, assign } from './xstateImmer'
import { compressionService } from './compressionService'

export default Machine(
	{
		id: 'WorkerMachine',
		initial: 'idle',
		context: {
			dumb: 'foo',
		},

		invoke: {
			id: 'CompressionService',
			src: compressionService,
		},

		states: {
			idle: {
				on: {
					addFile: {
						target: 'progress',
						actions: [
							assign((ctx, e) => {
								// console.log('單支 machine > addFile: ', e, ctx)
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
				},
			},

			progress: {
				on: {
					// 進度更新
					workerProgress: {
						target: '',
						actions: [
							assign((ctx, e) => {
								const { id, progress } = e.job
								// console.log( `收到 ${id}: ${progress}` )
								ctx.progress = progress
								return ctx
							}),
							'notifyProgress',
						],
					},

					// 進度完成
					workerDone: {
						target: 'completed',
						actions: [
							assign((ctx, e) => {
								// console.log( '\t完工:', ctx, e )
								const { id, progress } = e.job
								ctx.progress = progress
								return ctx
							}),
							'notifyProgress',
						],
					},

					// 工作暫停
					pauseFile: {
						target: 'paused',
						actions: [
							assign((ctx, e) => {
								console.log('\t暫停:', e.id)
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
				},
			},

			//
			paused: {
				on: {
					resumeFile: {
						target: 'progress',
						actions: [
							assign((ctx, e) => {
								console.log('\t繼續:', e.id, ctx.progress)
							}),
							send(
								(ctx, e) => ({
									type: 'resumeSong',
									data: { id: e.id, progress: ctx.progress },
								}),
								{ to: 'CompressionService' },
							),
						],
					},
				},
			},

			completed: {
				type: 'final',
			},

			cancelled: {
				type: 'final',
			},
		},

		// onEntry: assign((ctx, e) => console.log( '\n\n啟動時 ctx: ', ctx )),

		on: {
			// 取消工作
			cancelFile: {
				target: 'cancelled',
				actions: [
					assign((ctx, e) => {
						console.log('\t取消:', e.id)
					}),
					send(
						(ctx, e) => ({
							type: 'cancelSong',
							data: e.id,
						}),
						{ to: 'CompressionService' },
					),
					'notifyCancel',
				],
			},
		},
	},

	{
		// actions,
		// services,
		// guards,
		updater,
	},
)
