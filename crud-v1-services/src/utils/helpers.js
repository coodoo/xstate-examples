
export const uuid = () => {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		// eslint-disable-next-line
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

export const randomId = () => Math.floor(Math.random()*999)

export const noop = () => {}

// dump state tree in string format
export const dumpState = (item, depth = 1) => {
	// if (depth == 1) console.log('\n')

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
		dumpState(item[key], depth + 1)
		console.groupEnd()
	}
}

// for fsm test
export const dump = svc => {
	if(svc.state){
		console.log(
			'\n--------------------------------------\n[state]',
			svc.state.value,
			'\n  [ctx]',
			svc.state.context,
			'\n--------------------------------------',
		)
	}else{
		console.log( 'empty: ', svc )
	}
}


export const current = state => state.toStrings().pop()

export const timer = time => {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, time)
	})
}

export const randomFloat = (min=0, max=999) => {
    return Math.random() * (max - min) + min;
}

export const random = (min=0, max=999) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
