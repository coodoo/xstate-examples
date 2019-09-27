import { randomId, random } from '../utils/helpers'

// A Callback service
// cb() let's up dispatch event to the parent
// onReceive() allows us to receive events from the parent while the service is running
export const itemService = (ctx, e) => (cb, onReceive) => {
	//
	onReceive(evt => {
		switch (evt.type) {

			//
			case 'ServiceLoadItems':

				const fakeItem = () => {
					const id = randomId()
					const d = {
						id,
						label: `Label_${id}`,
					}
					return d
				}

				// instead of fetching data via API, we fake them here
				const arr = [fakeItem(), fakeItem(), fakeItem()]

				console.log( '\nfetched: ', arr )

				// eslint-disable-next-line
				const t = random(300, 2000)

				setTimeout(() => {

					// for test only
					// randomly trigger happy and sorrow path to test both scenarios
					// if((t % 2) == 0 ){
					if(true){
					// if(false){
						// if fetching succeeded
						cb({
							type: 'itemLoadSuccess',
							data: arr,
						})
					} else {
						// if fetching failed, we trigger the sorrow path
						cb({
							type: 'itemLoadFail',
							data: 'network error',
						})
					}
				}, random(100, 1000))

				break

			case 'ServiceItemDeleteConfirm':
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

			// create new item
			case 'ServiceCreateItems':
				const localItem = evt.payload

				// async side effect
				return new Promise((resolve, reject) => {

					// simulate id generated from server, to replace the temp local id
					const serverId = 'server_' + localItem.id.split('tmp_')[1]
					setTimeout(() => {
						resolve({
							info: `item: ${localItem.id} - ${localItem.label} created succesfully`,
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

			default:
				console.log('unhandled method call=', evt.type)
		}
	})
}
