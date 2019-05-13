/* eslint-disable */
import { uuid, randomFloat, random } from './helpers'

export const compressionService = (ctx, e) => (cb, onReceive) => {

	let workers = {}

	onReceive(evt => {

		switch( evt.type ){

			case 'pauseSong':
			case 'cancelSong':

				const id = evt.data
				clearTimeout(workers[id])
				workers[id] = null
				// console.log( '取消壓縮:', evt, workers, workers )
				break

			case 'resumeSong':
			case 'compressSong':

				console.log( '請求啟動:', evt, workers )

				const { data } = evt

				if( evt.type === 'resumeSong' && workers[data.id] !== null ){
					console.log( '\n\t已在跑，不可 resume', workers )
					return
				}

				// resume 就是將上次 progress 值還原即可
				let progress = evt.type === 'compressSong' ? 0 : data.progress

				const run = () => {

					progress = Math.min(100, progress + random(5, 15) )

					// console.log(`[${data.id}] ${progress} >>`, workers)

					if(progress < 100){

						cb({
							type: 'workerProgress',
							job: { id: data.id, progress}
						})

						// 排下次進度
						workers[data.id] = setTimeout( run, random(200, 1000) )
					}else{
						cb({
							type: 'workerDone',
							job: { id: data.id, progress}
						})
					}

				}

				run()
				break

			default:
				console.log( '沒人接的 method call=', evt.type  )
		}
	})

}
