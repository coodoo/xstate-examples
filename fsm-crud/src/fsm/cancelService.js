/* eslint-disable */
import { randomId } from '../utils/helpers'

export const cancelService = (ctx, e) => (cb, onReceive) => {

	let cnt = 0

	onReceive(evt => {

		switch( evt.type ){

			case 'test':

				const requestId = ++cnt
				const signal = evt.signal

				console.log( '[Service test]', requestId, evt )

				new Promise((resolve, reject) => {

					setTimeout(() => {
						resolve({
							info: `Request ${requestId} completed`,
						})
						// reject({
						// 	info: `Request ${requestId} failed`,
						// })
					}, 1000)
				})

				.then( result => {

					// using DOM api
					// if(signal.aborted === true){

					if(signal.cancel===true){
						console.log( '\n\n[Service cancelled]', requestId)
					}else{
						console.log( '\n\n[Service not cancelled]', requestId )
						cb({
							type: 'testResult',
							result
						})
					}

				})

				.catch( error => {
					return
					cb({
						type: 'testError',
						error
					})
				})

				break

			default:
				console.log( 'Unhandled method call=', evt.type  )
		}
	})

}
