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
					invoke: {
						id: 'LoadSomeItems',
						src: 'loadItems',
						onError: [
							{
								target: [ '#Root.main.master', '#Root.global.modal.error'],
								actions: ['listDataError'],
							},
						],
						onDone: [
							{
								target: ['#Root.main.master'],
								actions: ['listDataSuccess'],
							},
						],
					},
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
										target: ['#Root.main.master', '#Root.global.modal.deletionInFligh'],
										actions: [],
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
							},
						},

						// need a new state to invoke deleteItem Promise
						deletionInFligh: {
							invoke: {
								src: 'deleteItem',
								onDone: [
									{
										target: [
											'#Root.main.master',
											'#Root.global.selection.unSelected',
											'#Root.global.modal.idle'],
										actions: ['deleteOptimisticItemSuccess', 'modalReset'],
									},
								],
								onError: [
									{
										target: [ '#Root.main.master', '#Root.global.modal.idle'],
										actions: ['restoreOptimisticDeleteItem', 'modalReset'],
									},
								],
							},
						}

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
