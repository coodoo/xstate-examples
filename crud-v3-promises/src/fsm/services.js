import { randomId, random, getItemById } from '../utils/helpers'

// A Callback service
// cb() let's up dispatch event to the parent
// onReceive() allows us to receive events from the parent while the service is running
export const itemService = (ctx, e) => (cb, onReceive) => {

	onReceive(evt => {
		switch (evt.type) {

			// create new item
			case 'SERVICE.CREATE.ITEM':
				const localItem = evt.payload

				// async side effect
				return new Promise((resolve, reject) => {

					// simulate id generated from server, to replace the temporary local id
					const serverId = 'server_' + localItem.id.split('tmp_')[1]
					setTimeout(() => {

						// happy path
						resolve({
							info: `${localItem.id} - ${localItem.label} created succesfully on the server`,
							serverItem: { ...localItem, id: serverId },
							localItem,
						})

						// sorrow path
						// reject({
						// 	info: `Create item: ${localItem.id} on server failed, data restored`,
						// 	localItem,
						// })
					}, 1000)
				})
				.then(result => {
					cb({
						type: 'OPTIMISTIC_CREATE_ITEM_SUCCESS',
						result,
					})
				})
				.catch(error => {
					cb({
						type: 'OPTIMISTIC_CREATE_ITEM_FAIL',
						error,
					})
				})

			// edit item
			case 'SERVICE.EDIT.ITEM':

				// eslint-disable-next-line
				const { editedItem, oldItem } = evt

				// async side effect
				return new Promise((resolve, reject) => {

					setTimeout(() => {
						// happy path
						// simulating itm returned from server has added props
						editedItem.modifiedDate = new Date()
						resolve({
							info: `${editedItem.id} - ${editedItem.label} edited succesfully on the server`,
							editedItem,
						})

						// sorrow path
						// reject({
						// 	info: `Edit item: ${oldItem.id} on server failed, data restored`,
						// 	oldItem,
						// })
					}, 1000)
				})
				.then(result => {
					cb({
						type: 'OPTIMISTIC_EDIT_ITEM_SUCCESS',
						result,
					})
				})
				.catch(error => {
					cb({
						type: 'OPTIMISTIC_EDIT_ITEM_FAIL',
						error,
					})
				})

			default:
				console.log('unhandled method call=', evt.type)
		}
	})
}

export const loadItems = (ctx, e) => {

	const t = random(300, 1000)

	return new Promise((resolve, reject) => {
		setTimeout(() => {

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

			// for test only
			// randomly trigger happy and sorrow path to test both scenarios
			// if((t % 2) == 0 ){
			if(true){
			// if(false){
				resolve(arr)
			} else {
				reject('network error')
			}
		}, t)
	})
}

//
export const deleteItem = (ctx, e) => {
	const { selectedItemId } = ctx

	// eslint-disable-next-line
	const item = getItemById(ctx.items, selectedItemId)

	// delete local item immediately
	ctx.items = ctx.items.filter(it => it.id !== selectedItemId)
	ctx.selectedItemId = null

	return new Promise((resolve, reject) => {
		setTimeout(() => {

			// happy path
			resolve({
				info: `${selectedItemId} deleted succesfully from the server`,
			})

			// sorrow path
			// reject({
			// 	info: `Delete ${selectedItemId} from server failed, data restored.`,
			// 	payload: item,
			// })
		}, 1200)
	})
}
