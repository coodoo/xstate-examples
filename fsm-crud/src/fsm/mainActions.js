import { send, assign } from 'xstate'

export const reloadItems = send(
	{ type: 'loadItems' },
	{ to: 'ItemService' },
)

export const listDataSuccess = assign((ctx, evt) => {
	// console.log( '[listDataSuccess]', evt )
	ctx.items = evt.data
	ctx.notifications.push('Fake news 1', 'Fake news 2', 'Fake news 3')
	return ctx
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
	return ctx
})

export const selectItem = assign((ctx, e) => {
	ctx.selectedItemId = e.item.id
	ctx.exitNewItemTo = e.exitTo
	return ctx
})

export const setExitTo = assign((ctx, e) => {
	ctx.exitNewItemTo = e.exitTo
	return ctx
})

export const confirmItemDelete = send(
	//
	(ctx, e) => {
		return {
			type: 'itemDeleteConfirm',
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
	return ctx
})

//
export const cancelItemDelete = assign((ctx, e) => {
	ctx.modalData = null
	return ctx
})

export const modalDeleteItemFail = assign((ctx, e) => {
	const { info, payload } = e.error
	const restoreItem = payload
	// console.log( '[MODAL_DELETE_ITEM_FAIL]', info )
	ctx.items.push(restoreItem)
	ctx.notifications.push(info)
	return ctx
})

export const modalDeleteItemSuccess = assign((ctx, e) => {
	console.log('[MODAL_DELETE_ITEM_RESULT]', e)
	const { result } = e
	ctx.notifications.push(result.info)
	return ctx
})

export const modalErrorDataClose = assign((ctx, e) => {
	ctx.modalData = null
	ctx.notifications.push('Loading Error dismissed')
	return ctx
})

export const createNewItem = assign((ctx, e) => {
	// config which screen to exit to from creating new item screen
	ctx.exitNewItemTo = e.exitTo
	return ctx
})

// optimistic update
export const preSubmitNewItem = assign((ctx, e) => {
	const newItem = e.payload
	ctx.items.push(newItem)
	ctx.selectedItemId = newItem.id
	return ctx
})

// invoke service to persist new item via external api call
export const submitNewItem = send(
	(ctx, e) => ({
		type: 'createItems',
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

	ctx.notifications.push(info)

	ctx.selectedItemId = serverItem.id

	ctx.exitNewItemTo = null

	return ctx
})

export const newItemFail = assign((ctx, e) => {
	const { info, localItem } = e.error
	// console.log('NEW_ITEM_FAIL', info)
	ctx.items = ctx.items.filter(it => it.id !== localItem.id)
	ctx.notifications.push(info)
	ctx.selectedItemId = null
	ctx.exitNewItemTo = null
	return ctx
})

export const editSubmit = assign((ctx, e) => {
	const edited = e.payload
	ctx.items = ctx.items.map(it => (it.id === edited.id ? edited : it))
	return ctx
})

export const clearNotification = assign((ctx, e) => {
	ctx.notifications = ctx.notifications.filter(it => !e.popped.includes(it))
	return ctx
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
	return ctx
})

