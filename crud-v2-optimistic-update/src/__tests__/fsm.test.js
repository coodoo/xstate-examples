import { interpret } from 'xstate'
import { MainMachine, MainTypes } from '../fsm/mainMachine'

// const current = svc => svc.state.toStrings().pop()
const dump = svc =>
	console.log(
		'\n--------------------------------------\n[state]',
		svc.state.value,
		'\n  [ctx]',
		svc.state.context,
		'\n--------------------------------------',
	)


let svc
const init = () => {
	svc = interpret(MainMachine)
		.onTransition(state => {
			// console.log( '[trans] ', state.changed, '|', state.value, state.context, )

			if (state.changed == false) {
				console.error(
					`\n\n★ ☆ ★ [UNKNOWN EVENT]\nEvent=`,
					state.event,

					'\nState=',
					state.value,

					'\nContext=',
					state.context,
					'\n\n',
				)

				// console.log( 'state:', state )

				// throw new Error('BOOM')
			}
		})
		.onEvent(e => {
			// console.log( '\n[event] ', e  )
		})
	svc.start()
}

// reset fsm
beforeEach(() => {
	init()
})

describe('Load initial data', () => {
	it('load listData success', () => {
		svc.send({
			type: MainTypes.itemLoadSuccess,
			data: [1, 2, 3],
		})
		// dump(svc)

		expect(svc.state.matches('main.master')).toEqual(true)
		expect(svc.state.context.items.length).toEqual(3)
		expect(svc.state.context.items).toEqual([1, 2, 3])
	})

	it('load listData fail', () => {
		const msg = 'failed message for testing'
		svc.send({
			type: MainTypes.itemLoadFail,
			data: msg,
		})
		// dump(svc)

		expect(svc.state.matches('main.master')).toEqual(true)
		expect(svc.state.context.modalData).not.toBeNull()
		expect(svc.state.context.modalData.data).toEqual(msg)
	})
})

describe('create new item', () => {
	it('new item create screen', () => {
		svc.send({ type: MainTypes.itemNew, exitTo: 'test' })
		// dump(svc)

		expect(svc.state.matches('main.new')).toEqual(true)
		expect(svc.state.context.exitNewItemTo).toEqual('test')
	})

	it('new item create op - optimistic update', () => {
		const payload = {
			id: `tmp_1111`,
			label: `test content`,
		}

		svc.send({ type: MainTypes.itemNew, exitTo: 'test' })
		svc.send({ type: MainTypes.newItemSubmit, payload })
		// dump(svc)

		const { context } = svc.state
		const { items, selectedItemId } = context
		expect(svc.state.matches('main.master')).toEqual(true)
		expect(selectedItemId).toEqual('tmp_1111')
		expect(items[items.length - 1]).toEqual(payload)
	})

	it('create new item - server update - success', () => {
		// trigger local optimistic update
		const payload = {
			id: `tmp_1111`,
			label: `test content`,
		}
		svc.send({ type: MainTypes.itemNew, exitTo: 'test' })
		svc.send({ type: MainTypes.newItemSubmit, payload })

		// then trigger server update
		const result = {
			info: 'test info',
			serverItem: { ...payload, id: 'server_888' },
			localItem: payload,
		}

		svc.send({
			type: MainTypes.newItemSuccess,
			result,
		})

		// dump(svc)

		// check id returned from server is persisted in ctx.items[]
		const { context } = svc.state
		const { items, selectedItemId } = context

		// should go back to master screen
		expect(svc.state.matches('main.master')).toEqual(true)

		// local data should be gone
		expect(items.find(it => it.id === payload.id)).toBeUndefined()

		// and instead replaced by server id
		expect(items.find(it => it.id === result.serverItem.id)).not.toBeUndefined()

		expect(selectedItemId).toEqual(result.serverItem.id)
	})

	it('create new item - server update - fail', () => {

		const payload = {
			id: `tmp_1111`,
			label: `test content`,
		}
		svc.send({ type: MainTypes.itemNew, exitTo: 'test' })
		svc.send({ type: MainTypes.newItemSubmit, payload })

		// dump(svc)

		const error = {
			info: 'create item fail',
			localItem: payload,
		}

		svc.send({
			type: MainTypes.newItemFail,
			error,
		})

		// dump(svc)

		const { context } = svc.state
		const { items, selectedItemId } = context

		expect(svc.state.matches('main.master')).toEqual(true)
		expect(items.find(it => it.id === payload.id)).toBeUndefined()
		expect(selectedItemId).toBeNull()
	})
})

describe('edit item', () => {

	it('enter edit item screen', () => {
		const item = svc.state.context.items[0]
		svc.send({ type: MainTypes.itemSelect, item })

		expect(svc.state.matches('main.master')).toEqual(true)
		expect(svc.state.matches('global.selection.selected')).toEqual(true)

		svc.send({ type: MainTypes.itemEdit, exitTo: 'master' })
		expect(svc.state.matches('main.edit')).toEqual(true)
		expect(svc.state.matches('global.selection.selected')).toEqual(true)
		expect(svc.state.context.modalData).toEqual(null)
		// dump(svc)
	})

	it('edit item submit', () => {
		const item = svc.state.context.items[0]
		svc.send({ type: MainTypes.itemSelect, item })
		svc.send({ type: MainTypes.itemEdit, exitTo: 'master' })
		expect(svc.state.matches('main.edit')).toEqual(true)

		svc.send({
			type: MainTypes.editSubmit,
			payload: { id: item.id, label: 'edited content' },
		})

		expect(svc.state.matches('main.details')).toEqual(true)
		expect(svc.state.matches('global.selection.selected')).toEqual(true)
		expect(svc.state.context.items[0].label).toEqual('edited content')
		expect(svc.state.context.items[0].id).toEqual(item.id)
		// dump(svc)
	})

	it('edit item cancel', () => {
		const item = svc.state.context.items[0]
		svc.send({ type: MainTypes.itemSelect, item })
		svc.send({ type: MainTypes.itemEdit, exitTo: 'master' })
		expect(svc.state.matches('main.edit')).toEqual(true)

		svc.send({ type: MainTypes.editCancel })
		expect(svc.state.matches('main.master')).toEqual(true)
		expect(svc.state.matches('global.selection.selected')).toEqual(true)
		expect(svc.state.context.items[0]).toEqual(item)
		// dump(svc)
	})
})

describe('delete item', () => {
	it('delete item confirm screen', () => {
		const modalData = {
			type: 'MODAL_DELETE',
			title: 'Item Removal Confirmation',
			content: `Are you sure to delete?`,
			data: 111,
			exitModalTo: 'master',
		}

		svc.send({ type: MainTypes.itemDelete, modalData })
		// dump(svc)

		expect(svc.state.matches('main.master')).toEqual(true)
		expect(svc.state.matches('global.modal.show')).toEqual(true)
		expect(svc.state.context.modalData).toEqual(modalData)
		expect(svc.state.context.modalData).not.toBeNull()
	})

	it('delete item cancel', () => {
		svc.send({ type: MainTypes.modalDeleteItemCancel })
		// dump(svc)

		expect(svc.state.matches('main.master')).toEqual(true)
		expect(svc.state.matches('global.modal.hide')).toEqual(true)
		expect(svc.state.context.modalData).toBeNull()
	})

	it('delete item - local success', () => {
		const itemToDelete = svc.state.context.items[0]

		svc.send({
			type: MainTypes.modalDeleteItemConfirm,
			data: itemToDelete,
		})

		// dump(svc)

		expect(svc.state.matches('main.master')).toEqual(true)

		expect(
			svc.state.context.items.find(it => it.id === itemToDelete.id),
		).toBeUndefined()
	})

	it('delete item - remote failed', () => {
		const beforeItems = svc.state.context.items
		const itemToDelete = svc.state.context.items[0]

		svc.send({
			type: MainTypes.modalDeleteItemConfirm,
			data: itemToDelete,
		})

		expect(svc.state.context.items.length).toEqual(beforeItems.length - 1)

		const error = {
			info: 'test delete fail',
			payload: itemToDelete,
		}

		svc.send({
			type: MainTypes.modalDeleteItemFail,
			error,
		})

		// dump(svc)

		expect(svc.state.matches('main.master')).toEqual(true)

		expect(
			svc.state.context.items.find(it => it.id === itemToDelete.id),
		).not.toBeUndefined()

		expect(svc.state.context.items.length).toEqual(beforeItems.length)
	})
})
