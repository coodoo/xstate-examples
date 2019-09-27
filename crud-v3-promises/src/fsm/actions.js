import { send, assign } from 'xstate'
import { getItemById } from '../utils/helpers'
import toaster from 'toasted-notes'
import 'toasted-notes/src/styles.css'

// helper: toaster invocation as a side effect
const notify = msg => toaster.notify(msg, {
	position: 'bottom-right',
})

/* read item
-------------------------------------------------- */

export const reloadItems = send(
	{ type: 'SERVICE.LOAD.ITEMS' }, // the event to be sent
	{ to: 'ItemService' }, // the target servcie to receive that event
)

export const listDataSuccess = assign((ctx, evt) => {
	ctx.items = evt.data
})

export const listDataError = assign((ctx, e) => {
	ctx.modalData = {
		title: 'Fetching list data failed.',
		content: `Details: ${e.data}`,
		data: e.data,
	}
})

/* delete item
-------------------------------------------------- */

export const deleteItem = assign((ctx, e) => {
	const selectedItem = getItemById(ctx.items, ctx.selectedItemId)
	ctx.modalData = {
		title: 'Item Removal Confirmation',
		content: `Are you sure to delete ${selectedItem.label}?`,
		data: selectedItem,
	}
	ctx.opFrom = e.from
})

//
export const cancelItemDelete = assign((ctx, e) => {
	ctx.modalData = null
})

// ok
export const restoreOptimisticDeleteItem = assign((ctx, e) => {
	const { info, payload } = e.data
	const restoreItem = payload
	ctx.items.push(restoreItem)
	notify(info)
})

// ok
export const deleteOptimisticItemSuccess = assign((ctx, e) => {
	const { info } = e.data
	notify(info)
})


/* create item
-------------------------------------------------- */

// ok
export const createItem = assign((ctx, e) => {
	const { from } = e
	// config which screen to exit to from creating new item screen
	ctx.opFrom = from
})

// ok, optimistic update, insert the item with local id
export const localCreateNewItem = assign((ctx, e) => {
	const newItem = e.payload
	ctx.items.push(newItem)
	ctx.selectedItemId = newItem.id
})

// ok, then invoke service to persist new item via external api call
export const remoteCreateNewItem = send(
	(ctx, e) => ({
		type: 'SERVICE.CREATE.ITEM',
		payload: e.payload,
	}),
	{ to: 'ItemService' },
)

// ok, update item with server returned from server when optimistic adding succeeded
export const createOptimisticItemSuccess = assign((ctx, e) => {
	const { info, serverItem, localItem } = e.result
	notify(info)
	ctx.items = ctx.items.map(it => (it.id === localItem.id ? serverItem : it))
	ctx.selectedItemId = serverItem.id
	ctx.opFrom = null
})

// ok, resotre item when optimistic adding new item failed
export const restoreOptimisticNewItem = assign((ctx, e) => {
	const { info, localItem } = e.error
	ctx.items = ctx.items.filter(it => it.id !== localItem.id)
	notify(info)
	ctx.selectedItemId = null
	ctx.opFrom = null
})


/* edit item
-------------------------------------------------- */

// ok
export const editItem = assign((ctx, e) => {
	const { from } = e
	// config which screen to exit to from creating new item screen
	ctx.opFrom = from
})

// ok, optimistic update, insert the item with local id
export const localEditItem = assign((ctx, e) => {
	const edited = e.payload
	ctx.items = ctx.items.map(it => (it.id === edited.id ? edited : it))
	ctx.selectedItemId = edited.id
	ctx.opFrom = null
})

// ok: then invoke service to persist new item via external api call
export const remoteEditItem = send(
	(ctx, e) => ({
		type: 'SERVICE.EDIT.ITEM',
		editedItem: e.payload,
		oldItem: e.oldItem,
	}),
	{ to: 'ItemService' },
)

// ok: update item with server returned from server when optimistic adding succeeded
export const editOptimisticItemSuccess = assign((ctx, e) => {
	const { info, editedItem } = e.result
	notify(info)
	// replace local item with the one from server, maybe some of it's content had changed
	ctx.items = ctx.items.map(it => (it.id === editedItem.id ? editedItem : it))
	ctx.selectedItemId = editedItem.id
	ctx.opFrom = null
})

// ok: resotre item when optimistic adding new item failed
export const restoreOptimisticEditItem = assign((ctx, e) => {
	const { info, oldItem } = e.error
	ctx.items = ctx.items.map(it => it.id === oldItem.id ? oldItem : it)
	notify(info)
	ctx.selectedItemId = oldItem.id
	ctx.opFrom = null
})


/* misc
-------------------------------------------------- */

// ok
export const selectItem = assign((ctx, e) => {
	ctx.selectedItemId = e.item.id
})

// ok
export const modalReset = assign((ctx, e) => {
	ctx.modalData = null
})
