/* eslint-disable jsx-a11y/accessible-emoji */
import React, { memo } from 'react'
import { WorkerTypes } from '../fsm/workerMachine'
import { useService } from '../xstate-custom/useMyMachine'


const Row = props => {

	const { item } = props

	// console.log('\n[child item]', item)

	// hook up ui with actor using `useService`
	const [ state, send, service ] = useService( item.actor )

	// console.log('\n[Child State] = ', state.value, '\n[context] = ', state.context)

	const { id, name, progress } = state.context

	const rowDone = progress === 100
	const jobStyle = {
		backgroundColor: rowDone ? 'green' : 'yellow',
		color: rowDone ? 'white' : 'black',
	}

	const pauseStyle = {
		backgroundColor: state.value === 'paused' ? 'black' : 'white',
	}

	const handleCancel = () => {
		send({
			type: WorkerTypes.cancelFile,
		})
	}

	const handlePause = () => {
		send({
			type: WorkerTypes.pauseFile,
		})
	}
	const handleResume = () => {
		send({
			type: WorkerTypes.resumeFile,
		})
	}

	//
	return (
		<div id={`song_${id}`} style={jobStyle}>
			<span id='songId'>{id}</span>
			<span>:</span>
			<span id='songProgress'>{progress}</span>
			<button
				data-testid='btnCancel'
				onClick={() => handleCancel(id)}>
					❌
			</button>

			<button
				data-testid='btnPause'
				style={pauseStyle}
				onClick={() => handlePause(id)}>
					⏸
			</button>

			<button
				data-testid='btnResume'
				onClick={() => handleResume(id, progress)}>
					▶
			</button>
		</div>
	)
}

Row.whyDidYouRender = true

export default memo(Row)
