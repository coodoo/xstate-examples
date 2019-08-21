import { uuid } from '../utils/helpers'
import { Enum } from 'enumify'
import { Types } from '../fsm/machine'

export class ServiceTypes extends Enum {
	indexOf = (str) => this.name.indexOf(str);
}
ServiceTypes.initEnum([
	'loadItems',
	'itemDeleteConfirm',
	'createItems',
])

// Not used, for demo purpose only
export const itemService = (ctx, e) => (cb, onReceive) => {

	onReceive(evt => {

		switch( evt.type ){

			case ServiceTypes.loadItems:

					const newItem = () => {
						const id = uuid()
						const d = {
							id,
							label: `Label_${id}`,
						}
						return d
					}
					const arr = [newItem(), newItem(), newItem()]

					cb({
						type: Types.itemLoadSuccess,
						data: arr,
					})

					// cb({
					// 	type: Types.itemLoadFail,
					// 	data: 'network error',
					// })

				break

			case ServiceTypes.itemDeleteConfirm:

				const item = evt.data

				new Promise((resolve, reject) => {
					setTimeout(() => {

						resolve({
							info: `item: ${item.id} deleted successfully`,
						})

						// reject({
						// 	info: `Delete item: ${item.id} failed`,
						// 	payload: item,
						// })
					}, 1200)
				})

				.then( result => {
					// console.log( '\tconfirmHandler 跑完了，返還: ', result )
					cb({
						type: Types.modalDeleteItemSuccess,
						result
					})
				})

				.catch( error => {
					cb({
						type: Types.modalDeleteItemFail,
						error
					})
				})

				break

			case ServiceTypes.createItems:

				const localItem = evt.payload

				return new Promise((resolve, reject) => {

					const serverId = 'server_' + localItem.id.split('tmp_')[1]

					setTimeout(() => {
						resolve({
							info: `item: ${localItem.id} - ${localItem.label} created successfully`,
							serverItem: { ...localItem, id: serverId },
							localItem,
						})
						// reject({
						// 	info: `Create item: ${localItem.id} failed`,
						// 	localItem,
						// })
					}, 1000)
				})
				.then( result => {
					console.log( '\tnewItem done: ', result )
					cb({
						type: Types.newItemSuccess,
						result,
					})
				})
				.catch( error => {
					console.log( 'newItem failed',  )
					cb({
						type: Types.newItemFail,
						error,
					})
				})

			default:
				console.log( 'unhandled method call=', evt.type  )
		}
	})

}
