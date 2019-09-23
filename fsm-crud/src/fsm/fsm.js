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
						target: ['#Root.main.deleteItem'],
						actions: ['deleteItem'],
					},
				],

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

			},

			states: {

				//
				loading: {
					entry: [
						{
							type: 'reloadItems',
						},
					],
					on: {
						LOAD_ITEM_FAIL: [
							{
								actions: ['listDataError'],
								target: ['#Root.main.loadFailed'],
							},
						],
						LOAD_ITEM_SUCCESS: [
							{
								actions: ['listDataSuccess'],
								target: ['#Root.main.master'],
							},
						],
					},
					states: {},
				},

				//
				loadFailed: {
					on: {
						MODAL_ERROR_CLOSE: [
							{
								target: ['#Root.main.master'],
								actions: ['modalReset'],
							},
						],
						MODAL_ERROR_RETRY: [
							{
								actions: ['modalReset'],
								target: ['#Root.main.loading'],
							},
						],
					},
					states: {},
					order: 0,
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
								target: ['#Root.main.master'],
								actions: [],
							},
						],
					},
					states: {},
					order: 2,
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
					states: {},
					order: 3,
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

				// show confirmation modal
				deleteItem: {
					on: {
						MODAL_ITEM_DELETE_CONFIRM: [
							{
								target: ['#Root.main.master'],
								actions: ['modalReset', 'localDeleteItem', 'remoteDeleteItem'],
							},
						],
						MODAL_ITEM_DELETE_CANCEL: [
							{
								target: ['#Root.main.master'],
								cond: 'backToMaster',
								actions: ['modalReset'],
							},
							{
								target: ['#Root.main.details'],
								cond: 'backToDetails',
								actions: ['modalReset'],
							},
						],
					},
				},

			},
			initial: 'loading',
		},

		global: {

			type: 'parallel',

			states: {
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
	on: {},
}
