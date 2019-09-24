import { send, assign, spawn } from 'xstate'
export const fsm = {
	id: 'Root',

	context: {
		items: [],
		selectedItemId: null,
		opFrom: null, // master|details
		modalData: null,
	},

	type: 'parallel',

	states: {

		//
		main: {

			invoke: [
				{
					id: 'ItemService',
					src: 'itemService',
				},
			],

			// Root.main
			on: {
				ITEM_NEW: [
					{
						target: ['#Root.main.newItem'],
						actions: ['createItem'],
					},
				],
				ITEM_EDIT: [
					{
						target: ['#Root.main.editItem'],
						actions: ['editItem'],
					},
				],
				ITEM_DELETE: [
					{
						target: ['#Root.main.master', '#Root.global.modal.confirmation'],
						cond: 'cancelToMaster',
						actions: ['deleteItem'],
					},
					{
						target: ['#Root.main.details', '#Root.global.modal.confirmation'],
						cond: 'cancelToDetails',
						actions: ['deleteItem'],
					},
				],
			},

			initial: 'loading',

			states: {

				//
				loading: {
					entry: 'reloadItems',

					on: {

						// Example 3 - spawnd Machine

						'CHILD.INIT': {
							actions: [

								// 接下孩傳來的事件
								assign((ctx, evt) => {
									console.log( '\n下面傳來值: ', evt.msg, ctx )

									// 對小孩廣播方法 1 - 操作 ref.send()
									// ctx.ref.send({
									// 	type: 'WAKE',
									// 	msg: 'old: ' + evt.msg
									// })
								}),


								// 對小孩廣播方法 2 - 用全域 send() 指令
								send(
									// 第一參數：要廣播給小孩的事件，同樣可拿到 ctx 等參數
									(ctx, evt) => {
										return {
											type: 'WAKE', // 重要：故意傳錯誤事件，但小孩 machine 沒報錯
											msg: 'old: ' + evt.msg,
										}
									},

									// 第二參數：指定廣播對象 to
									// {to: 'barbar'} // 寫死法
									{ to: (ctx, evt) => ctx.ref } // 動態參數法可讀 ctx, evt
								),

							]
						},

						'REMOTE.READY': {
							actions: (ctx, evt) => {
								console.log( '小孩傳來: ', evt, ctx )
							}
						},


						// Example 2 - spawnd Callback
						/*
						'COUNT.UPDATE': {
							actions: [

								// 接下孩傳來的事件
								assign((ctx, evt) => {
									console.log( '\n下面傳來值: ', evt.count )

									// 對小孩廣播方法 1 - 直接包在 assign() 內話，就操作 ref.send()
									// ctx.ref.send({
									// 	type: 'INC',
									// 	msg: 'old: ' + evt.count
									// })
								}),


								// 對小孩廣播方法 2 - 如果不用 assign 而用全域 send() 包住的話
								send(
									// 第一參數：要廣播給小孩的事件，同樣可拿到 ctx 等參數
									(ctx, evt) => {
										return {
											type: 'INC',
											msg: 'old: ' + evt.count,
										}
									},

									// 第二參數：指定廣播對象 to
									// {to: 'barbar'} // 寫死法
									{ to: (ctx, evt) => ctx.ref } // 動態參數法可讀 ctx, evt
								),

							]
						},
						*/

						// Example 1 - spawned Promise
						/*'done.invoke.foobar': {
							target: 'master',
							actions: (ctx, evt) => {
								console.log( '撈到資料: ', evt.data )
								debugger	//
							}
						},

						'error.platform.foobar': {
							actions: (ctx, evt, meta) => {
								debugger	//
							}
						},*/

						LOAD_ITEM_FAIL: [
							{
								target: [ '#Root.main.master', '#Root.global.modal.error'],
								actions: ['listDataError'],
							},
						],
						LOAD_ITEM_SUCCESS: [
							{
								target: ['#Root.main.master'],
								actions: ['listDataSuccess'],
							},
						],
					},
					states: {},
				},

				//
				master: {
					on: {
						ITEM_RELOAD: [
							{
								target: ['#Root.main.loading'],
								actions: [],
							},
						],
						ITEM_DETAILS: [
							{
								target: ['#Root.main.details'],
								actions: [],
							},
						],
					},
				},

				//
				details: {
					on: {
						ITEM_BACK: [
							{
								actions: [],
								target: ['#Root.main.master'],
							},
						],
					},
				},

				//
				newItem: {
					on: {
						NEW_ITEM_CANCEL: [
							{
								actions: [],
								cond: 'backToMaster',
								target: ['#Root.main.master'],
							},
							{
								target: ['#Root.main.details'],
								actions: [],
								cond: 'backToDetails',
							},
						],
						NEW_ITEM_SUBMIT: [
							{
								target: ['#Root.main.master'],
								actions: ['localCreateNewItem', 'remoteCreateNewItem'],
							},
						],
					},
				},

				//
				editItem: {
					on: {
						ITEM_EDIT_CANCEL: [
							{
								actions: [],
								cond: 'backToMaster',
								target: ['#Root.main.master'],
							},
							{
								target: ['#Root.main.details'],
								actions: [],
								cond: 'backToDetails',
							},
						],
						ITEM_EDIT_SUBMIT: [
							{
								target: ['#Root.main.master'],
								actions: ['localEditItem', 'remoteEditItem'],
							},
						],
					},
				},
			},
		},

		global: {

			type: 'parallel',

			states: {

				// 目前看來沒有 state，只需 event
				optimisticPending: {
					on: {
						// optimistic result - delete item
						OPTIMISTIC_DELETE_ITEM_SUCCESS: [
							{
								target: ['#Root.main.master', '#Root.global.selection.unSelected'],
								actions: 'deleteOptimisticItemSuccess',
							},
						],
						OPTIMISTIC_DELETE_ITEM_FAIL: [
							{
								target: ['#Root.main.master', '#Root.global.selection.selected'],
								actions: 'restoreOptimisticDeleteItem',
							},
						],

						// optimistic result - create item
						OPTIMISTIC_CREATE_ITEM_SUCCESS: [
							{
								target: ['#Root.main.master'],
								actions: 'createOptimisticItemSuccess',
							},
						],
						OPTIMISTIC_CREATE_ITEM_FAIL: [
							{
								target: ['#Root.main.master'],
								actions: 'restoreOptimisticNewItem',
							},
						],

						// optimistic result - edit item
						OPTIMISTIC_EDIT_ITEM_SUCCESS: [
							{
								target: ['#Root.main.master'],
								actions: 'editOptimisticItemSuccess',
							},
						],
						OPTIMISTIC_EDIT_ITEM_FAIL: [
							{
								target: ['#Root.main.master'],
								actions: 'restoreOptimisticEditItem',
							},
						],
					}
				},

				// error or confirmation
				modal: {
					initial: 'idle',
					//
					states: {
						idle: {},

						// ok
						error: {
							on: {
								MODAL_ERROR_CLOSE: [
									{
										target: ['#Root.main.master', '#Root.global.modal.idle'],
										actions: ['modalReset'],
									},
								],
								MODAL_ERROR_RETRY: [
									{
										target: ['#Root.main.loading', '#Root.global.modal.idle'],
										actions: ['modalReset'],
									},
								],
							},
						},

						//
						confirmation: {
							on: {
								MODAL_ITEM_DELETE_CONFIRM: [
									{
										target: ['#Root.main.master', '#Root.global.selection.unSelected', '#Root.global.modal.idle'],
										actions: ['modalReset', 'localDeleteItem', 'remoteDeleteItem'],
									},
								],
								MODAL_ITEM_DELETE_CANCEL: [
									{
										target: ['#Root.main.master', '#Root.global.modal.idle'],
										cond: 'backToMaster',
										actions: ['modalReset'],
									},
									{
										target: ['#Root.main.details', '#Root.global.modal.idle'],
										cond: 'backToDetails',
										actions: ['modalReset'],
									},
								],
							}

						},
					}
				},

				//
				selection: {
					initial: 'unSelected',
					states: {
						selected: {},
						unSelected: {},
					},
					on: {
						ITEM_SELECT: {
							target: '.selected',
							actions: 'selectItem',
						},
					},
				},
			},
		},
	},
}
