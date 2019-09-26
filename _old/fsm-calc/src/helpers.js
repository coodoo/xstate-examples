/* eslint-disable */

import { sprintf } from 'sprintf-js'

// 取得目前 state 的字串，例如 'main.start'
export const current = state => state.toStrings().pop()

export const doMath = ctx => {
	const { operand1, operand2, operator } = ctx

	let result = 0

	switch( operator ) {
		case '+':
			result = operand1 + operand2
			break
		case '-':
			result = operand1 - operand2
			break
		case '*':
			result = operand1 * operand2
			break
		case '/':
			result = operand1 / operand2
			break
	}

	// 解決 float point 問題
	result = +sprintf('%.6f', result)
	// console.log( '\t計算結果:', result )
	return result
}

export const isNumber = val => {

	if(isNaN(val)){
		// console.warn(`Number required, but got '${val}', did you pass in an operator?`)

		return false
	}

	return true
}

export const isOperator = val => {
	if( !['+', '-', '*', '/'].includes(val) ){
		// console.warn(`Operator required, but got '${val}'`)
		return false
	}
	return true
}

export const timer = time => {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, time)
	})
}
