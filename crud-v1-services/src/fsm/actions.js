import { send, assign } from 'xstate'

export const reloadItems = send(
	{ type: 'ServiceLoadItems' }, // the event to be sent
	{ to: 'ItemService' }, // the target servcie to receive that event
)

export const listDataSuccess = assign((ctx, evt) => {
	// console.log( '[listDataSuccess]', evt )
	ctx.items = evt.data
	ctx.notify('Data fetched 1')
	ctx.notify('Data fetched 2')
	ctx.notify('Data fetched 3')
})

export const listDataError = assign((ctx, e) => {
	console.log('\n[listDataError]', e.data)
	//
	ctx.modalData = {
		type: 'MODAL_ERROR',
		title: 'ListData Fetching Failed',
		content: `Failed for reason: ${e.data}`,
		data: e.data,
	}
})

export const selectItem = assign((ctx, e) => {
	ctx.selectedItemId = e.item.id
	ctx.exitNewItemTo = e.exitTo
})

export const setExitTo = assign((ctx, e) => {
	ctx.exitNewItemTo = e.exitTo
})

export const confirmItemDelete = send(
	// notify ItemService to delete item and dispatch once the job is completed
	(ctx, e) => {
		return {
			type: 'ServiceItemDeleteConfirm',
			data: e.data,
		}
	},
	// this is 2nd arguement, not part of the Event{}
	{ to: 'ItemService' },
)

// optimistic update
export const preDeleteItem = assign((ctx, e) => {
	const selectedItemId = e.data.id
	const newItems = ctx.items.filter(it => it.id !== selectedItemId)
	ctx.items = newItems
	ctx.selectedItemId = null
	ctx.modalData = null
})

//
export const cancelItemDelete = assign((ctx, e) => {
	ctx.modalData = null
})

export const modalDeleteItemFail = assign((ctx, e) => {
	const { info, payload } = e.error
	const restoreItem = payload
	// console.log( '[MODAL_DELETE_ITEM_FAIL]', info )
	ctx.items.push(restoreItem)
	ctx.notify(info)
})

export const modalDeleteItemSuccess = assign((ctx, e) => {
	console.log('[MODAL_DELETE_ITEM_RESULT]', e)
	const { result } = e
	ctx.notify(result.info)
})

export const modalErrorDataClose = assign((ctx, e) => {
	ctx.modalData = null
	ctx.notify('Loading Error dismissed')
})

export const modalErrorDataRetry = assign((ctx, e) => {
	ctx.modalData = null
	ctx.notify('Loading Error dismissed')
})

export const createNewItem = assign((ctx, e) => {
	// config which screen to exit to from creating new item screen
	ctx.exitNewItemTo = e.exitTo
})

// optimistic update, insert the item with local id
export const preSubmitNewItem = assign((ctx, e) => {
	const newItem = e.payload
	ctx.items.push(newItem)
	ctx.selectedItemId = newItem.id
})

// then invoke service to persist new item via external api call
export const submitNewItem = send(
	(ctx, e) => ({
		type: 'ServiceCreateItems',
		payload: e.payload,
		forceFail: e.forceFail,
	}),
	{ to: 'ItemService' },
)

// after data was persisted to server, replace local item id with the official one sent back from the server
export const newItemSuccess = assign((ctx, e) => {
	const {
		result: { info, serverItem, localItem },
	} = e
	// console.log( '[NEW_ITEM_SUCCESS]', serverItem )

	ctx.items = ctx.items.map(it => (it.id === localItem.id ? serverItem : it))

	ctx.notify(info)

	ctx.selectedItemId = serverItem.id

	ctx.exitNewItemTo = null

})

export const newItemFail = assign((ctx, e) => {
	const { info, localItem } = e.error
	// console.log('NEW_ITEM_FAIL', info)
	ctx.items = ctx.items.filter(it => it.id !== localItem.id)
	ctx.notify(info)
	ctx.selectedItemId = null
	ctx.exitNewItemTo = null
})

export const editSubmit = assign((ctx, e) => {
	const edited = e.payload
	ctx.items = ctx.items.map(it => (it.id === edited.id ? edited : it))
})

export const clearNotification = assign((ctx, e) => {
	ctx.notifications = ctx.notifications.filter(it => !e.popped.includes(it))
})

export const testAction = send(
	(ctx, e) => ({
		type: 'test',
		signal: e.signal,
	}),
	{ to: 'CancelService' },
)

export const testResultAction = assign((ctx, e) => {
	console.log('[subMachine result]', e)
})

export const testMe = assign((ctx, e) => {
	console.log('[subMachine]', e)
})

export const itemDelete = assign((ctx, e) => {
	ctx.modalData = e.modalData
})

