/* eslint-disable */
import { assign } from './xstateImmer'

import {
	divideByZero,
	doMath,
	isNumber,
	isOperator,
} from './helpers'

export const noop = () => {}

export const log = assign((ctx, e) => {
	console.log( '[Log]', ctx, e )
})
