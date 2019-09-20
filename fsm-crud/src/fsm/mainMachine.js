/* eslint-disable */
import { Machine, send, assign } from 'xstate'
import * as actions from './mainActions'
import * as services from './services'
import * as guards from './guards'
import { cancelService } from './cancelService'
import { fsm } from './fsm'

export const MainMachine = Machine(
	fsm,
	{
		actions,
		services: {...services, cancelService},
		guards,
	},
)
