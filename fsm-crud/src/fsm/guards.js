export const backToMaster = ctx => ctx.opFrom === 'master'
export const backToDetails = ctx => ctx.opFrom === 'details'
export const cancelToMaster = (_, e) => e.from === 'master'
export const cancelToDetails = (_, e) => e.from === 'details'

export const catchAll = (ctx, e) => {
	debugger	// should never be here
}
