/* eslint-disable */
import React, { useEffect, useState, useMemo, useRef, useContext } from 'react'
import ReactDOM from 'react-dom'
import { useMachine } from '@xstate/react'
import CompressMachine from './machine'
import { dump } from './helpers'

import { StateChart } from '@statecharts/xstate-viz'

import './styles.css'

import whyDidYouRender from '@welldone-software/why-did-you-render'
whyDidYouRender(React)

const MyContext = React.createContext()

let uid = 0

const App = () => {
	const { state, send } = useContext(MyContext)

	const { songs } = state.context

	// console.log('\n[State] = ', state.value, '\n[context] = ', state.context)

	// console.log( '\n changed:', state )
	// dump(state.value)
	// console.log('\n[context] = ', state.context)

	if (state.matches('main.running')) {
		// dump(state.value)
		// console.log('\ncontext:', state.context.songs)
	}

	let cnt = 0

	const rows = songs.map( (it,idx) => {
		if (it.progress === 100) cnt++
		const rowDone = it.progress === 100
		const jobStyle = {
			backgroundColor: rowDone  ? 'green' : 'yellow',
			color: rowDone ? 'white' : 'black',
		}
		return (
			<div
				style={ jobStyle }
				key={idx}>
				{it.id + ':' + it.progress}
				<button onClick={() => handleCancel(it.id)}>❌</button>
				<button onClick={() => handlePause(it.id)}>⏸</button>
				<button onClick={() => handleResume(it.id, it.progress)}>▶</button>
			</div>
		)
	})

	const allDone = cnt == rows.length
	// console.log( 'cnt:', cnt, allDone)

	const handleAddFile = () => {
		send({
			type: 'addFile',
			data: {
				id: ++uid,
				name: `Song_${uid}.flac`,
				progress: 0,
			},
		})
	}

	const handleCancel = id => {
		send({
			type: 'cancelFile',
			id
		})
	}

	const handlePause = id => {
		send({
			type: 'pauseFile',
			id
		})
	}
	const handleResume = (id, progress) => {
		send({
			type: 'resumeFile',
			id, progress
		})
	}

	useEffect(() => {
		handleAddFile()
		// handleAddFile()
		// handleAddFile()
		// handleAddFile()
		// handleAddFile()
	}, [])

	const jobStyle = {
		border: allDone ? '10px solid red' : null,
		width: 150,
	}

	// return <StateChart machine={CompressMachine} />

	return (
		<div>
			<button onClick={handleAddFile}>Add Job</button>
			<div style={jobStyle}>
				{ rows }
			</div>
		</div>
	)
}

export const Wrap = () => {
	const [state, send] = useMachine(CompressMachine, { log: true })

	return (
		<MyContext.Provider value={{ state, send }}>
			<App />
		</MyContext.Provider>
	)
}
