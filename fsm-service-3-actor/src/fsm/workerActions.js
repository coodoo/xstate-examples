import { assign } from '../xstate-custom/xstateImmer'
import { send, sendParent } from 'xstate'
import { CompServiceTypes } from './compressionService'
import { MainTypes } from './mainMachine'

export const onEntry = assign((ctx, e) => {
	// console.log('[WorkerMachine ctx]', ctx.name)
})

export const startJobAssign = assign((ctx, e) => {
	// console.log('[SubMachine startJob]', e)
})

export const startJobSend = send(
	(ctx, e) => ({
		type: CompServiceTypes.compressSong,
		data: ctx,
	}),
	{ to: 'CompressionService' },
)


export const workerProgressAssign = assign((ctx, e) => {
	const { progress } = e.job
	// console.log( `workerMachine ${id}: ${progress}` )
	ctx.progress = progress
	return ctx
})

export const workerDoneAssign = assign((ctx, e) => {
	// console.log( '\t[workerDone]', ctx, e )
	const { progress } = e.job
	ctx.progress = progress
	return ctx
})

export const workerDoneSend = sendParent((ctx, e) => ({
	type: MainTypes.updateJob,
	song: ctx,
}))

export const pauseFileAssign = assign((ctx, e) => {
	// console.log('\t[pauseFile]', e.id)
})

export const pauseFileSend = send(
	(ctx, e) => ({
		type: CompServiceTypes.pauseSong,
		data: ctx.id,
	}),
	{ to: 'CompressionService' },
)

export const resumeFileSend = send(
	(ctx, e) => ({
		type: CompServiceTypes.resumeSong,
		data: { id: ctx.id, progress: ctx.progress },
	}),
	{ to: 'CompressionService' },
)

export const cancelFileSend = send(
	(ctx, e) => ({
		type: CompServiceTypes.cancelSong,
		data: ctx.id,
	}),
	{ to: 'CompressionService' },
)

export const cancelFileSendParent = sendParent((ctx, e) => ({
	type: MainTypes.cancelJob,
	id: ctx.id,
}))
