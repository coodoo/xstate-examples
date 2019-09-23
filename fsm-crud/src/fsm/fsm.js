export const fsm = {
	id: 'Root',

	context: {
		items: [],
		selectedItemId: null,
		modalData: null,
	},

	initial: 'main',
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
						cond: undefined,
						target: ['#Root.main.newItem'],
					},
				],
				ITEM_EDIT: [
					{
						actions: [],
						cond: undefined,
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
				loadFailed: {
					on: {
						MODAL_CLOSE: [
							{
								actions: [],
								cond: undefined,
								target: ['#Root.main.master'],
							},
						],
						MODAL_RETRY: [
							{
								actions: [],
								cond: undefined,
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
								actions: [],
								cond: undefined,
								target: ['#Root.main.loading'],
							},
						],
						ITEM_DETAILS: [
							{
								actions: [],
								cond: undefined,
								target: ['#Root.main.master'],
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
								cond: undefined,
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
										exec: undefined,
									},
								],
								cond: undefined,
								target: ['#Root.main.optimisticPending'],
							},
						],
						NEW_ITEM_FAIL: [
							{
								actions: [
									{
										type: 'restoreItem',
										exec: undefined,
									},
								],
								cond: undefined,
								target: ['#Root.main.master'],
							},
						],
						EDIT_ITEM_SUCCESS: [
							{
								actions: [
									{
										type: 'updateItem',
										exec: undefined,
									},
								],
								cond: undefined,
								target: ['#Root.main.optimisticPending'],
							},
						],
						EDIT_ITEM_FAIL: [
							{
								actions: [
									{
										type: 'restoreItem',
										exec: undefined,
									},
								],
								cond: undefined,
								target: ['#Root.main.optimisticPending'],
							},
						],
						DELETE_ITEM_SUCCESS: [
							{
								actions: [],
								cond: undefined,
								target: ['#Root.main.optimisticPending'],
							},
						],
						DELETE_ITEM_FAIL: [
							{
								actions: [
									{
										type: 'restoreItem',
										exec: undefined,
									},
								],
								cond: undefined,
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
								cond: undefined,
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
								cond: undefined,
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
						modalConfirm: [
							{
								actions: [],
								cond: undefined,
								target: ['#Root.main.optimisticPending'],
							},
						],
						modalCancel: [
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
					},
					states: {},
					order: 7,
				},

				//
				loading: {
					on: {
						ITEM_LOAD_FAIL: [
							{
								actions: [],
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
					order: 1,
					entry: [
						{
							type: 'reloadItems',
							exec: undefined,
						},
					],
				},
			},
			order: 2,
			initial: 'loading',
		},
	},
	on: {},
}
