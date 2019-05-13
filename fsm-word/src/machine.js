import { Machine, assign } from 'xstate'
import * as actions from './actions'

export default Machine(
	{
		id: 'word',
		context: {
			test: 'test',
		},
		type: 'parallel',
		states: {

			// 這模擬主程式 screen 切換狀態
			main: {
				initial: 'editor',
				states: {
					loading: {},
					editor: {
						initial: 'aa',
						states: {
							aa: {
								initial: 'bb',
								states: {
									bb: {
										on: {
											BBB1: {
												actions: assign((c, e) => console.log('BBB > bb 跑了')),
											},
										},
									},
								},
								on: {
									BBB: {
										actions: assign((c, e) => console.log('BBB > aa 跑了')),
									},
								},
							},
						},
						on: {
							BBB3: {
								actions: assign((c, e) => console.log('BBB > editor 跑了')),
							},
						},
					},
				},
				on: {
					BBB4: {
						actions: assign((c, e) => console.log('BBB > main 跑了')),
					},
				},
			},

			// 全域狀態控制
			globals: {
				initial: 'selection',
				type: 'parallel',
				states: {

					selection: {
						initial: 'notSelected',
						states: {
							selected: {
								type: 'parallel',
								states: {
									bold: {
										initial: 'off',
										states: {
											on: {
												on: {
													'toggleBold': {
														target: 'off',
														actions: 'log',
													},
												},
											},
											off: {
												on: {
													'toggleBold': {
														target: 'on',
														actions: 'log',
													},
													BBB: {
														actions: assign((c, e) => console.log('BBB > globals.bold.off 跑了')),
													},
												},
											},
										},
									},
									italic: {
										initial: 'off',
										states: {
											on: {
												on: {
													'toggleItalic': {
														target: 'off',
														actions: 'log',
													},
												},
											},
											off: {
												on: {
													'toggleItalic': {
														target: 'on',
														actions: 'log',
													},
												},
											},
										},
									},
									underline: {
										initial: 'off',
										states: {
											on: {
												on: {
													'toggleUnderline': {
														target: 'off',
														actions: 'log',
													},
												},
											},
											off: {
												on: {
													'toggleUnderline': {
														target: 'on',
														actions: 'log',
													},
												},
											},
										},
									},
								},
								on: {
									'textUnselected': 'notSelected',
								}
							},
							notSelected: {
								on: {
									'textSelected': 'selected'
								}
							}
						}
					},

					clipboard: {
						initial: 'notFilled',
						states: {
							filled: {
								// 要用到，但不需放東西
							},
							notFilled: {
								on: {
									'setClipboardContent': {
										target: 'filled',
										actions: 'log',
									},
								},
							},
						},
					},

				},
			},
		},

		// 頂層全域事件
		on: {
			BBB: {
				actions: assign((c, e) => console.log('BBB > TOP 跑了')),
			},
			'set.bold.on': {
				target: 'bold.on',
				actions: 'log',
			},
			RESET: '#word', // TODO: this should be 'word' or [{ internal: false }]
		},
	},
	{ actions },
)
