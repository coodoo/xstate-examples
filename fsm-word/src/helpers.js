/* eslint-disable */

import { sprintf } from 'sprintf-js'

export const dump = (item, depth) => {
	const MAX_DEPTH = 100
	depth = depth || 0
	let isString = typeof item === 'string'
	let isDeep = depth > MAX_DEPTH

	if (isString || isDeep) {
		console.log(item)
		return
	}

	for (var key in item) {
		console.group(key)
		dump(item[key], depth + 1)
		console.groupEnd()
	}
}

// 取得目前 state 的字串，例如 'main.start'
export const current = state => state.toStrings().pop()

export const doMath = ctx => {
	const { operand1, operand2, operator } = ctx

	let result = 0

	switch (operator) {
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
	if (isNaN(val)) {
		// console.warn(`Number required, but got '${val}', did you pass in an operator?`)

		return false
	}

	return true
}

export const isOperator = val => {
	if (!['+', '-', '*', '/'].includes(val)) {
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
