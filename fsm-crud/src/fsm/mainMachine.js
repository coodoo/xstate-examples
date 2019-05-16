import { Machine, send } from 'xstate'
import { updater, assign } from '../xstate-custom/xstateImmer'
import * as actions from './mainActions'
import * as services from './services'
import * as guards from './guards'
import { Enum } from 'enumify'
import { ServiceTypes } from './services'
import { cancelService } from './cancelService'

export class MainTypes extends Enum {}
MainTypes.initEnum([
	'itemSelect',
	'itemDetails',
	'itemEdit',
	'itemBack',
	'newItemCancel',
	'newItemSubmit',
	'editCancel',
	'editSubmit',
	'itemReload',
	'itemLoadSuccess',
	'itemLoadFail',
	'itemNew',
	'newItemSuccess',
	'newItemFail',
	'itemDelete',
	'modalDeleteItemConfirm',
	'modalDeleteItemCancel',
	'modalDeleteItemSuccess',
	'modalDeleteItemFail',
	'modalDataErrorClose',
	'modalDataErrorRetry',
	'clearNotification',
	'testMe',
])

export const MainMachine = Machine(
	{
		id: 'MyApp',
		// initial: 'main',

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
						src: 'itemService',
					},
					// test: showing how to cancel request
					{
						id: 'CancelService',
						src: cancelService,
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
							[MainTypes.itemDetails]: {
								target: 'details',
								actions: 'selectItem',
							},
							[MainTypes.itemEdit]: {
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
							[MainTypes.itemEdit]: {
								target: 'edit',
								actions: 'setExitTo',
							},
							[MainTypes.itemBack]: {
								target: 'master',
							},
						},
					},

					//
					new: {
						on: {
							// cancel an edit might lead back to master or detail screen, hence using a guard state to tell
							[MainTypes.newItemCancel]: {
								target: 'unknown',
							},
							[MainTypes.newItemSubmit]: {
								target: 'master',
								actions: ['preSubmitNewItem', 'submitNewItem'],
							},
						},
					},

					//
					edit: {
						on: {
							[MainTypes.editCancel]: {
								target: 'unknown',
							},
							[MainTypes.editSubmit]: {
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
					[MainTypes.itemReload]: {
						actions: 'reloadItems',
					},

					[MainTypes.itemLoadSuccess]: {
						target: '.master',
						actions: 'listDataSuccess',
					},

					[MainTypes.itemLoadFail]: {
						target: '',
						actions: 'listDataError',
					},

					[MainTypes.itemNew]: {
						target: '.new',
						actions: 'createNewItem',
					},

					[MainTypes.newItemSuccess]: {
						actions: 'newItemSuccess',
					},

					[MainTypes.newItemFail]: {
						actions: 'newItemFail',
					},

					[MainTypes.modalDeleteItemConfirm]: {
						target: '.master',
						actions: ['confirmItemDelete', 'preDeleteItem'],
					},

					[MainTypes.modalDeleteItemSuccess]: {
						actions: 'modalDeleteItemSuccess',
					},

					[MainTypes.modalDeleteItemFail]: {
						actions: 'modalDeleteItemFail',
					},

					[MainTypes.modalDataErrorClose]: {
						target: '.master',
						actions: 'modalErrorDataClose',
					},

					[MainTypes.modalDataErrorRetry]: {
						target: '',
						actions: 'reloadItems',
					},

					[MainTypes.clearNotification]: {
						actions: 'clearNotification',
					},

					[MainTypes.testMe]: {
						actions: assign((ctx, e) => {
							console.log('[subMachine]', e)
						}),
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
							[MainTypes.itemSelect]: {
								target: '.selected',
								actions: 'selectItem',
							},
							[MainTypes.modalDeleteItemConfirm]: '.unSelected',
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
							[MainTypes.itemDelete]: {
								target: '.show',
								actions: assign((ctx, e) => {
									ctx.modalData = e.modalData
									return ctx
								}),
							},
							[MainTypes.modalDeleteItemConfirm]: '.hide',
							[MainTypes.modalDeleteItemCancel]: {
								target: '.hide',
								actions: ['cancelItemDelete'],
							},
						},
					},
				},
			},
		},
	},

	{
		actions,

		// Service
		services,

		guards,

		updater,
	},
)
