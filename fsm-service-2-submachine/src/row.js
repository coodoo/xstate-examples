/* eslint-disable */
import React, { useEffect, useState, useRef, useContext, memo } from 'react'
import { useMachine } from '@xstate/react'
import WorkerMachine from './workerMachine'

const Row = props => {

	const { item, onUpdate, onCancel } = props

	const [state, send, service] = useMachine(

		// notice how react functions are hooked into fsm as an action
		WorkerMachine.withConfig(
			{
				actions: {
					notifyProgress: (ctx, e) => {
						onUpdate(ctx)
					},
					notifyCancel: (ctx, e) => {
						onCancel(ctx)
					},
				},
			},
			item,
		),
	)

	// console.log('\n[Child State] = ', state.value, '\n[context] = ', state.context)

	const rowDone = state.context.progress === 100
	const jobStyle = {
		backgroundColor: rowDone ? 'green' : 'yellow',
		color: rowDone ? 'white' : 'black',
	}

	const handleCancel = id => {
		send({
			type: 'cancelFile',
			id,
		})
	}

	const handlePause = id => {
		send({
			type: 'pauseFile',
			id,
		})
	}
	const handleResume = (id, progress) => {
		send({
			type: 'resumeFile',
			id,
			progress,
		})
	}

	useEffect(() => {
		send({
			type: 'addFile',
			data: item,
		})
	}, [item])

	//
	return (
		<div style={jobStyle}>
			{item.id + ':' + state.context.progress}
			<button onClick={() => handleCancel(item.id)}>❌</button>
			<button onClick={() => handlePause(item.id)}>⏸</button>
			<button onClick={() => handleResume(item.id, item.progress)}>▶</button>
		</div>
	)
}

Row.whyDidYouRender = true

export default memo(Row)
