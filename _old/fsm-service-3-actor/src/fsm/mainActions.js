import { assign } from '../xstate-custom/xstateImmer'
import { send, spawn } from 'xstate'
import { WorkerMachine, WorkerTypes } from './workerMachine'

export const addJobAssign = assign((ctx, e) => {
	const { song } = e
	// feeding in inital context for the child actor
	// notice it's not `machine.withConfig()`
	song.actor = spawn( WorkerMachine.withContext(song) )
	ctx.songs.push(song)
	return ctx
})

export const addFileSend = send(
	{ type: WorkerTypes.startJob },
	{ to: (ctx, e) => ctx.songs.find(it => it.id === e.song.id).actor },
)

export const updateJob = assign((ctx, e) => {
	ctx.completed.push(e.song.id)
	return ctx
})

// fix: when songs were completed and deleted, they need to be removed from `completed[]` too
export const cancelJob = assign((ctx, e) => {
	ctx.songs = ctx.songs.filter(it => it.id !== e.id)
	ctx.completed = ctx.completed.filter(it => it !== e.id)
	return ctx
})

export const onUpdate = assign((ctx, e) => {
	// console.log( '[onUpdate]', e)
})
