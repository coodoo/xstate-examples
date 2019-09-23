export const fsm = {
	id: 'Root',

	context: {
		items: [],
		selectedItemId: null,
		modalData: null,
	},

	type: 'parallel',

	states: {
		main: {

			invoke: [
				{
					id: 'ItemService',
					src: 'itemService',
				},
			],

			// meta: {
			// 	// 由於 meta 只能存於 stateNode 身上，因此可用每個元素的 uid 為 key 來存 event/guard/action 的 meta 內容呀
			// 	"#root.main:ITEM_NEW": {
			// 		pos: [10, 20],
			// 		line: [1, 22, 32, 44],
			// 		notes: ['第一行文字唷'],
			// 	}
			// },

			on: {
				ITEM_NEW: [
					{
						actions: [],
						target: ['#Root.main.newItem'],
					},
				],
				ITEM_EDIT: [
					{
						actions: [],
						target: ['#Root.main.editItem'],
					},
				],
				ITEM_DELETE: [
					{
						target: ['#Root.main.deleteItem'],
						actions: [],
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
						ITEM_LOAD_FAIL: [
							{
								actions: ['listDataError'],
								target: ['#Root.main.loadFailed'],
							},
						],
						ITEM_LOAD_SUCCESS: [
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
						// ITEM_SELECT: [
						// 	{
						// 		target: ['#Root.main.master'],
						// 		actions: ['selectItem'],
						// 	},
						// ],
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
				optimisticPending: {
					on: {
						NEW_ITEM_SUCCESS: [
							{
								actions: [
									{
										type: 'updateItem',
									},
								],
								target: ['#Root.main.optimisticPending'],
							},
						],
						NEW_ITEM_FAIL: [
							{
								actions: [
									{
										type: 'restoreItem',
									},
								],
								target: ['#Root.main.master'],
							},
						],
						EDIT_ITEM_SUCCESS: [
							{
								actions: [
									{
										type: 'updateItem',
									},
								],
								target: ['#Root.main.optimisticPending'],
							},
						],
						EDIT_ITEM_FAIL: [
							{
								actions: [
									{
										type: 'restoreItem',
									},
								],
								target: ['#Root.main.optimisticPending'],
							},
						],
						DELETE_ITEM_SUCCESS: [
							{
								actions: [],
								target: ['#Root.main.optimisticPending'],
							},
						],
						DELETE_ITEM_FAIL: [
							{
								actions: [
									{
										type: 'restoreItem',
									},
								],
								target: ['#Root.main.optimisticPending'],
							},
						],
					},
					states: {},
					order: 0,
				},

				//
				newItem: {
					on: {
						NEW_ITEM_CANCEL: [
							{
								actions: [],
								cond: {
									name: 'backToMaster',
									predicate: undefined,
								},
								target: ['#Root.main.master'],
							},
							{
								target: ['#Root.main.details'],
								actions: [],
								cond: {
									name: 'backToDetails',
									predicate: undefined,
								},
							},
						],
						NEW_ITEM_SUBMIT: [
							{
								actions: [],
								target: ['#Root.main.optimisticPending'],
							},
						],
					},
					states: {},
					order: 4,
				},

				//
				editItem: {
					on: {
						EDIT_ITEM_CANCEL: [
							{
								actions: [],
								cond: {
									name: 'backToMaster',
									predicate: undefined,
								},
								target: ['#Root.main.master'],
							},
							{
								target: ['#Root.main.details'],
								actions: [],
								cond: {
									name: 'backToDetails',
									predicate: undefined,
								},
							},
						],
						EDIT_ITEM_SUBMIT: [
							{
								actions: [],
								target: ['#Root.main.optimisticPending'],
							},
						],
					},
					states: {},
					order: 6,
				},

				//
				deleteItem: {
					on: {
						MODAL_ITEM_DELETE_CONFIRM: [
							{
								target: ['#Root.main.optimisticPending'],
								actions: ['modalReset'],
							},
						],
						MODAL_ITEM_DELETE_CANCEL: [
							{
								cond: {
									name: 'backToMaster',
									predicate: undefined,
								},
								target: ['#Root.main.master'],
								actions: ['modalReset'],
							},
							{
								target: ['#Root.main.details'],
								cond: {
									name: 'backToDetails',
									predicate: undefined,
								},
								actions: ['modalReset'],
							},
						],
					},
					states: {},
					order: 7,
				},

			},
			order: 2,
			initial: 'loading',
		},

		global: {
			initial: 'selection',
			states: {
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
