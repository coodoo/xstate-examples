export const fsm = {
	id: 'MyApp',
	initial: 'main',

	context: {
		items: [],
		selectedItemId: null,
		modalData: null,
		notifications: [],
	},

	// main | global
	type: 'parallel',

	// top level
	states: {
		main: {
			initial: 'loading',

			invoke: [
				{
					id: 'ItemService',
					src: 'itemService', // from './services'
				},
				// test: showing how to cancel request
				{
					id: 'CancelService',
					src: 'cancelService',
				},
			],

			states: {
				//
				loading: {
					onEntry: 'reloadItems',
				},

				//
				master: {
					on: {
						itemDetails: {
							target: 'details',
							actions: 'selectItem',
						},
						itemEdit: {
							target: 'edit',
							actions: 'setExitTo',
						},

						// Test: multiple request and cancellation
						test: {
							actions: 'testAction',
						},
						testResult: {
							actions: 'testResultAction',
						},
						testError: {
							actions: '',
						},
					},
				},

				//
				details: {
					on: {
						itemEdit: {
							target: 'edit',
							actions: 'setExitTo',
						},
						itemBack: {
							target: 'master',
						},
					},
				},

				//
				new: {
					on: {
						// cancel an edit might lead back to master or detail screen, hence using a guard state to tell
						newItemCancel: {
							target: 'unknown',
						},
						newItemSubmit: {
							target: 'master',
							actions: ['preSubmitNewItem', 'submitNewItem'],
						},
					},
				},

				//
				edit: {
					on: {
						editCancel: {
							target: 'unknown',
						},
						editSubmit: {
							target: 'details',
							actions: 'editSubmit',
						},
					},
				},

				unknown: {
					on: {
						'': [
							{
								target: 'master',
								cond: 'unknownMaster',
							},
							{
								target: 'details',
								cond: 'unknownDetails',
							},
						],
					},
				},
			},

			// main - top level events
			on: {
				itemReload: {
					actions: 'reloadItems',
				},

				itemLoadSuccess: {
					target: '.master',
					actions: 'listDataSuccess',
				},

				itemLoadFail: {
					target: '',
					actions: 'listDataError',
				},

				itemNew: {
					target: '.new',
					actions: 'createNewItem',
				},

				newItemSuccess: {
					actions: 'newItemSuccess',
				},

				newItemFail: {
					actions: 'newItemFail',
				},

				modalDeleteItemConfirm: {
					target: '.master',
					actions: ['confirmItemDelete', 'preDeleteItem'],
				},

				modalDeleteItemSuccess: {
					actions: 'modalDeleteItemSuccess',
				},

				modalDeleteItemFail: {
					actions: 'modalDeleteItemFail',
				},

				modalDataErrorClose: {
					target: '.master',
					actions: 'modalErrorDataClose',
				},

				modalDataErrorRetry: {
					target: '',
					actions: 'reloadItems',
				},

				clearNotification: {
					actions: 'clearNotification',
				},

				testMe: {
					actions: 'testMe',
				},
			},
		},

		global: {
			type: 'parallel',
			states: {
				// p1 - selection
				selection: {
					initial: 'unSelected',
					states: {
						selected: {},
						unSelected: {},
					},
					on: {
						itemSelect: {
							target: '.selected',
							actions: 'selectItem',
						},
						modalDeleteItemConfirm: '.unSelected',
					},
				},

				// p2 - modal
				modal: {
					initial: 'hide',
					states: {
						show: {},
						hide: {},
					},
					on: {
						itemDelete: {
							target: '.show',
							actions: 'itemDelete',
						},
						modalDeleteItemConfirm: '.hide',
						modalDeleteItemCancel: {
							target: '.hide',
							actions: ['cancelItemDelete'],
						},
					},
				},
			},
		},
	},
}

