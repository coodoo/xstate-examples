import { Machine } from 'xstate'
import { updater } from '../xstate-custom/xstateImmer'
import * as actions from '../fsm/workerActions'
import { compressionService } from '../fsm/compressionService'
import { Enum } from 'enumify'

export class WorkerTypes extends Enum {}
WorkerTypes.initEnum([
	'startJob',
	'workerProgress',
	'workerDone',
	'pauseFile',
	'resumeFile',
	'cancelFile',
])

/*
	Create a standalone actor machine for each song,
	each actor starts an internal service as a side effect to do the compression job
*/
export const WorkerMachine = Machine(
	{
		id: 'WorkerMachine',
		initial: 'idle',

		//
		context: {
			id: null,
			name: null,
			progress: null,
		},

		invoke: {
			id: 'CompressionService',
			src: compressionService,
		},

		states: {

			idle: {
				onEntry: 'onEntry',
				on: {
					[WorkerTypes.startJob]: {
						target: 'progress',
						actions: [
							'startJobAssign',
							'startJobSend',
						],
					},
				},
			},

			progress: {
				on: {
					//
					[WorkerTypes.workerProgress]: {
						actions: [
							'workerProgressAssign',
							// 'workerProgressSend',
						],
					},

					//
					[WorkerTypes.workerDone]: {
						target: 'completed',
						actions: [
							'workerDoneAssign',
							'workerDoneSend',
						],
					},

					//
					[WorkerTypes.pauseFile]: {
						target: 'paused',
						actions: [
							'pauseFileAssign',
							'pauseFileSend'
						],
					},
				},
			},

			//
			paused: {
				on: {
					[WorkerTypes.resumeFile]: {
						target: 'progress',
						actions: [
							'resumeFileSend',
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

		// onEntry: 'onEntry',

		on: {

			// cancel job
			[WorkerTypes.cancelFile]: {
				target: 'cancelled',
				actions: [
					'cancelFileSend',
					'cancelFileSendParent',
				],
			},
		},
	},

	{
		actions,
		// services,
		// guards,
		updater,
	},
)
