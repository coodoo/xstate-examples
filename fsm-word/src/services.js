/* eslint-disable */
import { assign } from './xstateImmer'

// +TBD: 示範用
export const myService = (ctx, e) => (cb, onEvent) => {
	const a = setInterval(() => {
		console.log( '\n\nmyService 廣播',  )
		cb('FOO')
	}, 1000)

	onEvent( (e) => {
		console.log( '\n\n收到 parent: ', e)
	})

	return () => clearInterval(a)
}
