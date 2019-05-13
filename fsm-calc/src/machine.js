/* eslint-disable */
import { Machine, interpret, send } from 'xstate'
import { updater, assign } from './xstateImmer'
import * as actions from './actions'
import * as guards from './guards'

export default Machine({
	context: {
		operand1: null,
		operand2: null,
		operator: null,
		display: 0, // 這是計算後的結果，供 ui 顯示
	},

	initial: 'main',

	id: 'calc',

	states: {

		// group
		main: {

			initial: 'start',

			states: {

				//
				start: {
					on: {
						'OPERATOR_MINUS': {
							target: '#calc.negative1',
							actions: actions.setNegative,
						},
						'OPERATOR_OTHERS': {
							target: '#calc.operator',
							actions: actions.setOperator,
						},
					}
				},

				//
				result: {
					on: {
						'OPERATOR_OTHERS': {
							target: '#calc.operator',
							actions: actions.setOperator,
						},
						'OPERATOR_MINUS': {
							target: '#calc.operator',
							actions: actions.setOperator,
						},
						// placeholder, to not show warnings
						'C': {
							actions: actions.noop,
						},
					}
				},
			},

			//
			on: {
				'NUMBER': {
					target: 'operand1',
					actions: actions.setOperand1,
				},
			}
		},

		negative1: {
			on: {
				'C': {
					target: 'main.start',
					actions: actions.resetOperand1,
				},
				'NUMBER': {
					target: 'operand1',
					actions: actions.setOperand1Negative,
				},
			}
		},

		//
		operand1: {
			on: {
				'NUMBER': {
					target: 'operand1',
					actions: actions.setOperand1,
				},
				'C': {
					target: 'main.start',
					actions: actions.resetOperand1,
				},
				'OPERATOR_OTHERS': {
					target: 'operator',
					actions: actions.setOperator,
				},
				'OPERATOR_MINUS': {
					target: 'operator',
					actions: actions.setOperator,
				},
			}
		},

		//
		operator: {
			on: {
				'NUMBER': [
					{
						target: 'alert',
						cond: guards.divideByZero,
						actions: actions.setError,
					},
					{
						target: 'operand2',
						actions: actions.setOperand2,
					},
				],

				'OPERATOR_OTHERS': {
					target: 'operator',
					actions: actions.setOperator,
				},
				'OPERATOR_MINUS': {
					target: 'operator',
					actions: actions.setOperator,
				},
			}
		},

		operand2: {

			on: {

				//
				'NUMBER': {
					target: 'operand2',
					actions: actions.setOperand2,
				},

				//
				'C': {
					target: 'operator',
					actions: actions.resetOperand2,
				},

				//
				'OPERATOR_OTHERS': [
					{
						target: 'alert',
						cond: guards.divideByZero,
					},
					{
						target: 'operator',
						actions: actions.calculate,
					},
				],
				//
				'OPERATOR_MINUS': [
					{
						target: 'alert',
						cond: guards.divideByZero,
					},
					{
						target: 'operator',
						actions: actions.calculate,
					},
				],
				//
				'EQUAL': [
					{
						target: 'alert',
						cond: guards.divideByZero,
					},
					{
						target: 'main.result',
						actions: actions.calculate,
					},
				],
			}
		},

		alert: {
			on: {
				'C': {
					target: 'operand2',
					actions: actions.resetOperand2,
				},
			},
		},
	},

	on: {
		// 這是真正的 AC，其它地方都是 C
		'AC': {
			target: 'main.start',
			actions: actions.setAC,
		},
	},
},
{
	actions,
	updater,
})

