import { randomId } from '../utils/helpers'

export const itemService = (ctx, e) => (cb, onReceive) => {
	let cnt = 0
	let cancelled = false

	onReceive(evt => {
		switch (evt.type) {
			case 'loadItems':
				const newItem = () => {
					const id = randomId()
					const d = {
						id,
						label: `Label_${id}`,
					}
					return d
				}
				const arr = [newItem(), newItem(), newItem()]

				cb({
					type: 'itemLoadSuccess',
					data: arr,
				})

				// cb({
				// 	type: itemLoadFail,
				// 	data: 'network error',
				// })

				break

			case 'itemDeleteConfirm':
				const item = evt.data

				new Promise((resolve, reject) => {
					setTimeout(() => {
						resolve({
							info: `item: ${item.id} deleted succesfully`,
						})

						// reject({
						// 	info: `item: ${item.id} removal failed`,
						// 	payload: item,
						// })
					}, 1200)
				})

					.then(result => {
						// console.log( '\tconfirmHandler completed: ', result )
						cb({
							type: 'modalDeleteItemSuccess',
							result,
						})
					})

					.catch(error => {
						cb({
							type: 'modalDeleteItemFail',
							error,
						})
					})

				break

			case 'createItems':
				const localItem = evt.payload

				// 操作 async side effect
				return new Promise((resolve, reject) => {
					const serverId = 'server_' + localItem.id.split('tmp_')[1]

					setTimeout(() => {
						resolve({
							info: `item: ${localItem.id} - ${
								localItem.label
							} created succesfully`,
							serverItem: { ...localItem, id: serverId },
							localItem,
						})
						// reject({
						// 	info: `Create item: ${localItem.id} failed`,
						// 	localItem,
						// })
					}, 1000)
				})
					.then(result => {
						cb({
							type: 'newItemSuccess',
							result,
						})
					})
					.catch(error => {
						cb({
							type: 'newItemFail',
							error,
						})
					})

			// demo: multiple requests with cancellation
			case 'test':
				const requestId = ++cnt

				console.log('[test request started]', requestId)

				return new Promise((resolve, reject) => {
					setTimeout(() => {
						resolve({
							info: `Request ${requestId} completed`,
						})
						// reject({
						// 	info: `Request ${requestId} failed`,
						// })
					}, 1500)
				})

					.then(result => {
						console.log('cancelled?', cancelled)
						cb({
							type: 'modalDeleteItemSuccess',
							result,
						})
					})

					.catch(error => {
						cb({
							type: 'modalDeleteItemFail',
							error,
						})
					})

			default:
				console.log('unhandled method call=', evt.type)
		}
	})
}
