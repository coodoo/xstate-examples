/* eslint-disable */

export const divideByZero = (ctx, e) => {
	const zero = ctx.operator === '/' && e.value === 0
	// console.log( 'divideByZero:', zero)
	// console.log( e  )
	// console.log( ctx  )
	return zero
}
