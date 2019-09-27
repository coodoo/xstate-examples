export const fsm = {
	id: 'MyApp',
	initial: 'main',

	context: {
		items: [],
		selectedItemId: null,
		modalData: null,
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
					src: 'itemService',
				},
			],

			states: {

				//
				loading: {
					// when entrying 'entry' state, run 'reloadItems' action
					// which will send an event to 'ItemService' to fetch data via API
					entry: 'reloadItems',
				},

				//
				'loadFailed': {
					on: {
						modalDataErrorClose: {
							target: 'master',
							actions: 'modalErrorDataClose',
						},
						modalDataErrorRetry: {
							target: 'loading',
							actions: 'modalErrorDataRetry',
						},
					}
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

				// for transient state, which will be transferred to next state immediately
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
					target: '.loading',
				},

				// shared by both 'loading' and 'master' states, hence moved up one level here
				itemLoadSuccess: {
					target: '.master',
					actions: 'listDataSuccess',
				},
				itemLoadFail: {
					target: '.loadFailed',
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

