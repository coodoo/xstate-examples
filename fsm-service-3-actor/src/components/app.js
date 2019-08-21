import React, { useEffect, memo } from 'react'
import { useMachine } from '../xstate-custom/useMyMachine'
import { MainMachine, MainTypes } from '../fsm/mainMachine'
import Row from './row'

import './styles.css'

// import { StateChart } from '@statecharts/xstate-viz'

import whyDidYouRender from '@welldone-software/why-did-you-render'
whyDidYouRender(React)

let uid = 0

const App = () => {
	const [state, send] = useMachine(MainMachine, { debug: false })

	const { songs, completed } = state.context

	// console.log(
	// 	'\n\n[Parent State] = ',
	// 	state.value,
	// 	'\n[context] = ',
	// 	state.context,
	// )

	const rows = songs.map((it, idx) => {
		return <Row item={it} key={it.name} />
	})

	const allDone = songs.length === completed.length

	const handleAddFile = () => {
		send({
			type: MainTypes.addFile,
			song: {
				id: ++uid,
				name: `Song_${uid}.flac`,
				progress: 0,
			},
		})
	}

	// add some jobs to run
	useEffect(() => {
		// handleAddFile()
		// handleAddFile()
		// handleAddFile()
		// handleAddFile()
		// handleAddFile()
	}, [])

	const jobStyle = {
		border: allDone ? '10px solid red' : null,
		width: 150,
	}

	// return <StateChart machine={MainMachine} />

	return (
		<div>
			<button
				data-testid='btnAdd'
				onClick={handleAddFile}>Add Job</button>
			<div
				data-testid='rows'
				style={jobStyle}>
					{rows}
			</div>
		</div>
	)
}

App.whyDidYouRender = true
export default memo(App)
