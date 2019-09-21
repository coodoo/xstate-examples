/* eslint-disable */
import { Machine, send, assign } from 'xstate'
import * as actions from './actions'
import * as services from './services'
import * as guards from './guards'
import { fsm } from './fsm'

export const machine = Machine(
	fsm,
	{
		actions,
		services,
		guards,
	},
)
