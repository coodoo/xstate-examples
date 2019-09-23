export const backToMaster = ctx => ctx.opFrom === 'master'
export const backToDetails = ctx => ctx.opFrom === 'details'
export const cancelToMaster = ctx => ctx.from === 'master'
export const cancelToDetails = ctx => ctx.from === 'details'
