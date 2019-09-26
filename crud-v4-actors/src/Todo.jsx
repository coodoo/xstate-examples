import React, { useEffect, useRef } from 'react'
import { useServiceEx } from './useMyHooks'
import cn from 'classnames'

export const Todo = ({ todoRef }) => {

  const [state, send] = useServiceEx(todoRef, { debug: true, name: 'Todo_Child'})
	const inputRef = useRef(null)

  const { id, title, completed } = state.context
  const isEditing = state.matches('editing')

  useEffect(() => {
  	// only select the text when first entering `editing` state
  	if(isEditing && state.history.value !== state.value) {
  		inputRef.current.select()
  	}
  }, [state, isEditing])

	console.log( '\nChild render')

	return (
		<li
			className={cn({
				editing: isEditing,
				completed
			})}
			data-todo-state={completed ? 'completed' : 'active'}
			key={id}
		>

			<div className="view">
				<input
					className="toggle"
					type="checkbox"
					onChange={_ => todoRef.send('TOGGLE_COMPLETE')}
					value={completed}
					checked={completed}
				/>
				<label
					onDoubleClick={e => send('EDIT')}
				>
					{title}
				</label>{' '}
				<button className="destroy" onClick={() => send('DELETE')} />
			</div>

			<input
				className="edit"
				value={title}

				onBlur={_ => {
					// when hitting ESC, 'CANCEL' event will be triggered first and switch to `reading.pending`
					// so when later 'BLUR' event happens there will be no one there to handle it
					// hence we check it's the correct state before dispatching the event
					state.matches('editing') && send('BLUR')
				}}

				onChange={e => send('CHANGE', { value: e.target.value })}

				onKeyPress={e => {
					if (e.key === 'Enter') {
						send('COMMIT')
					}
				}}

				onKeyDown={e => {
					if (e.key === 'Escape') send('CANCEL')
				}}

				ref={inputRef}
			/>
		</li>
	)
}
