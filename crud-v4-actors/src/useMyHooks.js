import { useState, useRef, useEffect } from 'react'
import {
	interpret,
} from 'xstate'

// machine is raw state machine, will run it with the interpreter
export const useMachineEx = (machine, { debug=false, name='', interpreterOptions={}}) => {

	// eslint-disable-next-line
	const [_, force] = useState(0)
	const machineRef = useRef(null)
	const serviceRef = useRef() // started Interpreter

	if(machineRef.current !== machine){

		machineRef.current = machine

		serviceRef.current = interpret(machineRef.current, interpreterOptions)
		.onTransition( state => {

			if(state.event.type === 'xstate.init') {
				// debugger	//
				return
			}
			//
			if( state.changed === false && debug === true ){
				console.error(
					`\n\n💣💣💣 [UNHANDLED EVENT][useMachine]💣💣💣\nEvent=`,
					state.event,

					'\nState=',
					state.value, state,

					'\nContext=',
					state.context,
					'\n\n' )

				return
			}

			if( debug === true ){
				console.group(`%c[useMachine ${name}]`, 'color: darkblue')
				dumpState(state.value)
				console.log( 'ctx=', state.context )
				console.log( 'evt=', state.event )
				console.log( '\n',  )
				console.groupEnd()
			}

			// re-render if the state changed
			force(x => x+1)
		})

		// start immediately, as it's in the constructor
		serviceRef.current.start()
	}

	// didMount
	useEffect(() => {
	  return () => {
	  	debugger	//
	  	console.log( 'useMachine unload 了',  )
	  	serviceRef.current.stop()
	  }
	}, [])

	return [serviceRef.current.state, serviceRef.current.send, serviceRef.current]
}

// service is Interpreter, already started
export const useServiceEx = (service, { debug=false, name=''}) => {
	const lastRef = useRef(null)

	// eslint-disable-next-line
	const [_, force] = useState(0)

	if(lastRef.current !== service){

		lastRef.current = service

		service.onTransition( state => {

			// unhandled events
			if( state.changed === false && debug === true ){
				console.error(
					`\n\n💣💣💣 [UNHANDLED EVENT][useService]💣💣💣\nEvent=`,
					state.event,

					'\nState=',
					state.value, state,

					'\nContext=',
					state.context,
					'\n\n' )

				return
			}

			if( debug === true ){
				console.group(`%c[useService ${name}]`, 'color: green')
				console.log(state.value)
				console.log( `ctx=`, state.context )
				console.log( 'evt=', state.event )
				console.log( '\n',  )
				console.groupEnd()
			}

			force(x => x+1)
		})
	}

	return [service.state, service.send, service]

}

// +TBD
export const useActorEx = p => {}

// helper
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
