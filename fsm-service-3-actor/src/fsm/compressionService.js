import { random } from '../utils/helpers'
import { WorkerTypes } from './workerMachine'
import { Enum } from 'enumify'

export class CompServiceTypes extends Enum {
	indexOf = (str) => this.name.indexOf(str);
}
CompServiceTypes.initEnum([
	'pauseSong',
	'cancelSong',
	'resumeSong',
	'compressSong',
])


export const compressionService = (ctx, e) => (cb, onReceive) => {
	let workers = {}

	onReceive(evt => {
		switch (evt.type) {
			case CompServiceTypes.pauseSong:
			case CompServiceTypes.cancelSong:
				const id = evt.data
				clearTimeout(workers[id])
				workers[id] = null
				// console.log( '[CompService pause|cancel song]', evt, workers )
				break

			case CompServiceTypes.resumeSong:
			case CompServiceTypes.compressSong:
				// console.log('[CompService initJob]', evt, workers)

				const { data } = evt

				// resume job by restoring last progress
				let progress = evt.type === 'compressSong' ? 0 : data.progress

				const run = () => {
					progress = Math.min(100, progress + random(5, 15))

					// console.log(`\n[Service] ${data.id}:${progress}`)

					if (progress < 100) {
						cb({
							type: WorkerTypes.workerProgress,
							job: { id: data.id, progress },
						})

						// random update time
						const time = 60
						workers[data.id] = setTimeout(run, random(time, time))
					} else {
						cb({
							type: WorkerTypes.workerDone,
							job: { id: data.id, progress },
						})
					}
				}

				run()
				break

			default:
				console.error('[CompService unhandled event]', evt.type)
		}
	})
}
