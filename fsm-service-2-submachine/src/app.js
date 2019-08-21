/* eslint-disable */
import React, { useEffect, useState, useRef, memo } from 'react'
import ReactDOM from 'react-dom'
import { useMachine } from '@xstate/react'
import CompressMachine from './machine'
import WorkerMachine from './workerMachine'
import { dump } from './helpers'
import Row from './row'

import './styles.css'

// import { StateChart } from '@statecharts/xstate-viz'

import whyDidYouRender from '@welldone-software/why-did-you-render'
whyDidYouRender(React)

const MyContext = React.createContext()

let uid = 0

const App = () => {

	const [state, send] = useMachine(CompressMachine)

	const { songs } = state.context

	const onUpdate = song => {
		send({
			type: 'update',
			data: song,
		})
	}

	const onCancel = song => {
		send({
			type: 'cancel',
			data: song,
		})
	}

	const rows = songs.map((it, idx) => {
		return (
			<Row
				item={it}
				key={it.name}
				onUpdate={onUpdate}
				onCancel={onCancel}
			/>)
	})

	const allDone = songs.every(it => it.progress == 100)

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

	useEffect(() => {
		handleAddFile()
		handleAddFile()
		handleAddFile()
		handleAddFile()
		handleAddFile()
	}, [])

	const jobStyle = {
		border: allDone ? '10px solid red' : null,
		width: 150,
	}

	// return <StateChart machine={WorkerMachine} />

	return (
		<div>
			<button onClick={handleAddFile}>Add Job</button>
			<div style={jobStyle}>{rows}</div>
		</div>
	)
}

App.whyDidYouRender = true
export default memo(App)
