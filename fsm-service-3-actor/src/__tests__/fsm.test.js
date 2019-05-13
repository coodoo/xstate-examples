import { interpret } from 'xstate'
import { MainMachine, MainTypes } from '../fsm/mainMachine'
import { WorkerMachine, WorkerTypes } from '../fsm/workerMachine'
import { dump } from '../utils/helpers'

let svc
const debug = false

const init = () => {
	svc = interpret(MainMachine)
		.onTransition(state => {
			// console.log( '[trans] ', state.changed, '|', state.value, state.context, )

			if ( debug && state.changed == false) {
				console.error(
					`\n\n★ ☆ ★ [UNKNOWN EVENT]\nEvent=`,
					state.event,

					'\nState=',
					state.value,

					'\nContext=',
					state.context,
					'\n\n',
				)

				// console.log( 'state:', state )

				// throw new Error('BOOM')
			}
		})
		.onEvent(e => {
			// console.log( '\n[event] ', e  )
		})
	svc.start()
}

// reset fsm
beforeEach(() => {
	init()
})

describe('Add song', () => {

	it('add song', () => {
		let uid = 0
		const song = {
			id: ++uid,
			name: `Song_${uid}.flac`,
			progress: 0,
		}

		svc.send({
			type: MainTypes.addFile,
			song,
		})

		expect(svc.state.matches('main.progress')).toEqual(true)
		expect(svc.state.context.songs.length).toEqual(1)
		const item = svc.state.context.songs[0]
		expect(item.id).toEqual(song.id)
		expect(item.name).toEqual(song.name)
		// dump(svc)
	})

	it('add song - actor', () => {

		let uid = 0
		const song = {
			id: ++uid,
			name: `Song_${uid}.flac`,
			progress: 0,
		}

		svc.send({
			type: MainTypes.addFile,
			song,
		})

		const actor = svc.state.context.songs[0].actor
		const { state: { context, value }, send } = actor
		// dump(actor)

		expect(context.id).toEqual(song.id)
		expect(context.name).toEqual(song.name)
		expect(value).toEqual('progress')
	})
})

describe('Complete song', () => {

	it('complete one song', () => {

		let uid = 0
		const song = {
			id: ++uid,
			name: `Song_${uid}.flac`,
			progress: 0,
		}

		svc.send({
			type: MainTypes.addFile,
			song,
		})

		const actor = svc.state.context.songs[0].actor

		actor.send({
			type: WorkerTypes.workerDone,
			job: { progress: 100 }
		})

		// dump(actor)
		const { state: { context, value }, send } = actor
		expect(value).toEqual('completed')

		// dump(svc)
		expect(svc.state.context.completed).toContain(song.id)
		expect(svc.state.matches('main.completed')).toEqual(true)
	})

	it('complete many song', () => {

		const song1 = { id: 1, name: `Song_1.flac`, progress: 0 }
		const song2 = { id: 2, name: `Song_2.flac`, progress: 0 }

		svc.send({
			type: MainTypes.addFile,
			song: song1,
		})

		svc.send({
			type: MainTypes.addFile,
			song: song2,
		})

		// should have two songs to be processed
		expect(svc.state.context.songs.length).toEqual(2)

		// complete song1 first
		const actor1 = svc.state.context.songs[0].actor
		actor1.send({
			type: WorkerTypes.workerDone,
			job: { progress: 100 }
		})

		expect(actor1.state.value).toEqual('completed')
		expect(svc.state.context.completed).toContain(song1.id)
		expect(svc.state.matches('main.progress')).toEqual(true)

		// then complete song2
		const actor2 = svc.state.context.songs[1].actor
		actor2.send({
			type: WorkerTypes.workerDone,
			job: { progress: 100 }
		})

		expect(actor2.state.value).toEqual('completed')
		expect(svc.state.context.completed).toContain(song2.id)
		expect(svc.state.matches('main.completed')).toEqual(true)

	})


})

describe('Delete song', () => {

	it('delete song', () => {

		const song = {
			id: 1,
			name: `Song_1.flac`,
			progress: 0,
		}

		// add a song
		svc.send({
			type: MainTypes.addFile,
			song,
		})

		// verify it exists in parent context
		const item = svc.state.context.songs[0]
		expect(item.id).toEqual(song.id)
		expect(item.name).toEqual(song.name)
		// dump(svc)

		// get child actor
		const actor = svc.state.context.songs[0].actor

		// cancel the file from child actor
		actor.send({
			type: WorkerTypes.cancelFile,
			song,
		})

		const { state: { context, value }, send } = actor
		// dump(actor)

		// verify child actor state
		expect( value ).toEqual('cancelled')

		// dump(svc)

		// verify parent state has updated
		expect(svc.state.context.songs.length).toEqual(0)
		expect(svc.state.context.completed).not.toContain(song.id)
	})
})

describe('Pause song', () => {

	it('pause song', () => {

		const song = {
			id: 1,
			name: `Song_1.flac`,
			progress: 0,
		}

		// add a song
		svc.send({
			type: MainTypes.addFile,
			song,
		})

		// get child actor
		const actor = svc.state.context.songs[0].actor

		// cancel the file from child actor
		actor.send({
			type: WorkerTypes.pauseFile,
			song,
		})

		const { state: { context, value }, send } = actor
		// dump(actor)

		// verify child actor state
		expect( value ).toEqual('paused')

		// dump(svc)

		// verify parent state has updated
		expect(svc.state.context.songs.length).toEqual(1)
	})

})

describe('resume song', () => {

	it('resume song', () => {

		const song = {
			id: 1,
			name: `Song_1.flac`,
			progress: 0,
		}

		// add a song
		svc.send({
			type: MainTypes.addFile,
			song,
		})

		// get child actor
		const actor = svc.state.context.songs[0].actor

		// cancel the file from child actor
		actor.send({
			type: WorkerTypes.pauseFile,
			song,
		})

		expect( actor.state.value ).toEqual('paused')

		actor.send({
			type: WorkerTypes.resumeFile,
			song,
		})

		expect( actor.state.value ).toEqual('progress')
	})
})
