/* eslint-disable */
import { assign } from './xstateImmer'

import {
	divideByZero,
	doMath,
	isNumber,
	isOperator,
} from './helpers'

export const noop = () => {}

export const calculate = assign((ctx, e) => {
	ctx.operand1 = doMath(ctx)
	ctx.operand2 = null
	ctx.operator = e.value
	ctx.display = ctx.operand1
	return ctx
})

export const setNegative = assign((ctx, e) => {
	ctx.operand1 = 0
	ctx.display = ctx.operand1
	return ctx
})

// export const setStart = assign((ctx, e) => {
// 	ctx.operand1 = 0
// 	ctx.display = ctx.operand1
// 	return ctx
// })

export const setOperator = assign((ctx, e) => {
	isOperator(e.value)
	ctx.operator = e.value
	return ctx
})

export const setOperand1 = assign((ctx, e) => {
	isNumber( e.value )
	ctx.operand1 = e.value
	ctx.display = ctx.operand1
	return ctx
})

export const setOperand2 = assign((ctx, e) => {
	isNumber( e.value )
	ctx.operand2 = e.value
	ctx.display = ctx.operand2
	return ctx
})

export const setOperand1Negative = assign((ctx, e) => {
	isNumber( e.value )
	ctx.operand1 = e.value * -1
	ctx.display = ctx.operand1
	return ctx
})

export const resetOperand1 = assign((ctx, e) => {
	ctx.operand1 = 0
	ctx.display = ctx.operand1
	return ctx
})

export const resetOperand2 = assign((ctx, e) => {
	ctx.operand2 = 0
	ctx.display = ctx.operand2
	return ctx
})

export const setError = assign((ctx, e) => {
	ctx.display = 'ERROR'
	return ctx
})

// 這是清除所有資料
export const setAC = assign((ctx, e) => {
	ctx.operand1 = 0
	ctx.operand2 = 0
	ctx.operator = null
	ctx.display = 0
	return ctx
})

// 這是清除上一筆輸入
// export const setC = assign((ctx, e) => {
// 	ctx.operand1 = 0
// 	ctx.operand2 = null
// 	ctx.operator = null
// 	ctx.display = 0
// 	return ctx
// })

