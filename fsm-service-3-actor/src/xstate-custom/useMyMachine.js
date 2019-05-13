import { useState, useRef, useEffect } from 'react'
import { interpret } from 'xstate'

export function useMachine(machine, options={}) {

	// Keep track of the current machine state
	const [current, setCurrent] = useState(machine.initialState)

	// Reference the service
	const serviceRef = useRef(null)

	if (serviceRef.current === null) {

		serviceRef.current = interpret(machine, options)

		//
		.onTransition( state => {
			if (state.changed) {
				setCurrent(state)
			}

			const { debug = false } = options

			// DEBUG
			if( debug === true && state.changed === false ){
				console.error(
					`\n\n💣💣💣 [UNHANDLED EVENT]💣💣💣\nEvent=`,
					state.event,

					'\nState=',
					state.value, state,

					'\nContext=',
					state.context,
					'\n\n' )

				// console.log( 'state:', state )
			}

		})

		//
		.onEvent( e => {
			const { debug = false } = options
			if( debug === true ) console.log( '\t[Event]', e )
		})

	}

	const service = serviceRef.current

	useEffect(() => {
		// Start the service when the component mounts
		service.start()

		return () => {
			// Stop the service when the component unmounts
			service.stop()
		}
	}, [])

	return [current, service.send, service]
}

export function useService(service) {
	const [current, setCurrent] = useState(service.state)

	useEffect(() => {
		const listener = state => {
			if (state.changed) {
				setCurrent(state)
			}
		}

		service.onTransition(listener)

		return () => {
			service.off(listener)
		}
	}, [])

	return [current, service.send, service]
}
