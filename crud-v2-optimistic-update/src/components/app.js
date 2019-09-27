/* eslint-disable*/
import React, { useEffect, useState, useRef, useContext, memo } from 'react'

import { useMachineEx } from '../utils/useMyHooks'
import { interpret } from 'xstate'
import { machine, } from '../fsm/machine'
import { randomId, dumpState, stateValuesEqual } from '../utils/helpers'

import styled, { createGlobalStyle } from 'styled-components'

import '../components/styles.css'

// import whyDidYouRender from '@welldone-software/why-did-you-render'
// whyDidYouRender(React)


// to store { state, send } from fsm
const MyContext = React.createContext()

const StyledModal = styled.div`
	margin: 20px auto;
	border: 4px solid black;
	width: 200px;
	height: 100px;
	background: #ffff0059;
`

//
const ModalError = props => {
	const { send } = useContext(MyContext)
	const { title, content } = props

	return (
		<StyledModal>
			<div>Title: {title}</div>
			<div>{content}</div>

			<button onClick={e => send({ type: 'MODAL_ERROR_RETRY' })}>
				Retry
			</button>

			<button onClick={e => send({ type: 'MODAL_ERROR_CLOSE' })}>
				Close
			</button>
		</StyledModal>
	)
}

//
const ModalDelete = props => {
	const { send } = useContext(MyContext)
	const { title, content, data } = props

	return (
		<StyledModal>
			<div>Title: {title}</div>
			<div>{content}</div>

			<button
				onClick={() =>
					send({
						type: 'MODAL_ITEM_DELETE_CANCEL',
					})
				}
			>
				Cancel
			</button>

			<button
				onClick={() =>
					send({
						type: 'MODAL_ITEM_DELETE_CONFIRM',
						data,
					})
				}
			>
				Confirm
			</button>
		</StyledModal>
	)
}

//
const ItemNew = props => {
	const { send } = useContext(MyContext)
	const [content, setContent] = useState('')

	const handleSubmit = () => {
		const newItem = {
			id: `tmp_${randomId()}`,
			label: `Label_${content}`,
		}

		send({
			type: 'NEW_ITEM_SUBMIT',
			payload: newItem,
		})
	}

	const handleCancel = () => {
		send({ type: 'NEW_ITEM_CANCEL' })
	}

	const handleChange = e => {
		setContent(e.target.value)
	}

	return (
		<form>
			<label>
				Label:
				<input type="text" value={content} onChange={handleChange} />
			</label>
			<button id='btnSubmit' type="button" onClick={handleSubmit}>
				Submit
			</button>
			<button id='btnCancel' type="button" onClick={handleCancel}>
				Cancel
			</button>
		</form>
	)
}

//
const ItemEdit = props => {
	const { state, send } = useContext(MyContext)
	const { items, selectedItemId } = state.context
	const { id, label } = getItemById(items, selectedItemId)
	const [content, setContent] = useState(label)

	const handleSubmit = () => {
		send({
			type: 'ITEM_EDIT_SUBMIT',
			payload: { id, label: content },
		})
	}

	const handleCancel = () => {
		send({ type: 'ITEM_EDIT_CANCEL' })
	}

	const handleChange = e => {
		setContent(e.target.value)
	}

	return (
		<form>
			<label>
				Label:
				<input type="text" value={content} onChange={handleChange} />
			</label>
			<button id="btnSubmit" type="button" onClick={handleSubmit}>
				Submit
			</button>
			<button id="btnCancel" type="button" onClick={handleCancel}>
				Cancel
			</button>
		</form>
	)
}

//
const Details = props => {
	const { state, send } = useContext(MyContext)
	const { items, selectedItemId } = state.context
	const selectedItem = getItemById(items, selectedItemId)

	// safe check and early bailout
	if (!selectedItem) return 'Nothing To Show'

	const { id, label } = selectedItem

	const handleDelete = () => {
		send({
			type: 'ITEM_DELETE',
			from: 'details',
		})
	}

	return (
		<div>
			Item Details
			<h2>ID: {id}</h2>
			<h2>Content: {label}</h2>
			<button
				onClick={() =>
					send({
						type: 'ITEM_NEW',
						from: 'details', // click 'cancel' will go back to detail screen
					})
				}
			>
				New
			</button>
			<button onClick={() => send({ type: 'ITEM_EDIT', from:'details' })}>Edit</button>
			<button onClick={() => send({ type: 'ITEM_BACK' })}>Back</button>
			<button onClick={handleDelete}>Delete</button>
		</div>
	)
}

//
const Listing = props => {
	const { state, send } = useContext(MyContext)
	const { items, selectedItemId } = state.context

	const handleDelete = itm => {
		const target = itm ? itm : getItemById(items, selectedItemId)

		//
		send({
			type: 'ITEM_DELETE',
			from: 'master'
		})
	}

	const handleViewDetails = itm => {
		send({
			type: 'ITEM_DETAILS',
			item: itm,
			from: 'master',
		})
	}

	const handleItemSelect = itm => {
		send({
			type: 'ITEM_SELECT',
			item: itm,
			from: 'master'
		})
	}

	const rows = items.map(itm => (
		<div key={itm.id}>
			<span
				style={itm.id === selectedItemId ? { backgroundColor: 'pink' } : null}
				onClick={evt => handleItemSelect(itm)}
				onDoubleClick={() => handleViewDetails(itm)}
			>
				{itm.id} - {itm.label}
			</span>
			{<button onClick={() => handleViewDetails(itm)}>🔎</button>}
		</div>
	))

	// test: showing requests could be cancelled
	const signal = useRef(null)

	const btnEnabled = state.matches('global.selection.selected')

	return (
		<div>

			<div id='rows'>
				{rows}
			</div>

			<button
				id='btnAdd'
				onClick={() =>
					send({
						type: 'ITEM_NEW',
						from: 'master', // click 'cancel' will go back to listing screen
					})
				}
			>
				New
			</button>

			<button
				id='btnEdit'
				onClick={() => send({ type: 'ITEM_EDIT', from: 'master' })}
				disabled={!btnEnabled}
			>
				Edit
			</button>

			<button
				id='btnRemove'
				onClick={() => handleDelete(null)}
				disabled={!btnEnabled}
			>
				Delete
			</button>

			<button
				id='btnReload'
				onClick={() => send({ type: 'ITEM_RELOAD' })}
			>
				Reload
			</button>
		</div>
	)
}

//
const getModal = () => {

	const { state } = useContext(MyContext)
	const { modalData } = state.context

	// early bailout
	if (state.matches('global.modal.idle')) return null

	let modal = null

	switch (true) {
		case state.matches('global.modal.confirmation'):
			modal = <ModalDelete {...modalData} />
			break
		case state.matches('global.modal.error'):
			modal = <ModalError {...modalData} />
			break
		default:
			modal = null
	}

	return modal
}

// helper
const getItemById = (items, id) => items.find(it => it.id === id)

// main app
const App = props => {
	const { state, send } = useContext(MyContext)

	const { notifications } = state.context

	const listing = !state.matches('main.master') ? null : <Listing />

	const itemEdit = !state.matches('main.editItem') ? null : <ItemEdit />

	const itemNew = !state.matches('main.newItem') ? null : <ItemNew />

	const details = !state.matches('main.details') ? null : <Details />

	// demonstrating that ui and fsm not necessaryily a 1:1 relationship
	const loading =
		!state.matches('main.loading') && !state.matches('main.error') ? null : (
			<h3>LOADING...</h3>
		)

	const modal = getModal()

	return (
		<div className="App">
			{listing}
			{loading}
			{details}
			{itemEdit}
			{itemNew}
			{modal}
		</div>
	)
}


export const Wrap = () => {

	// console.log( '\nWrap run'  )

	const [ state, send ] = useMachineEx(machine, { debug: true, name: 'Parent'})

	/*const [_, forceUpdate] = useState(0)
	const once = useRef(false)
	const service = useRef()

	// this is the constructur, make sure it only runs once
	if(once.current === false){
		once.current = true

		service.current = interpret(machine)
		.onTransition( state => {
			// init event
			// if(state.changed === undefined) return

			// DEBUG
			if( state.changed === false ){
				console.error(
					`\n\n💣💣💣 [UNHANDLED EVENT]💣💣💣\nEvent=`,
					state.event,

					'\nState=',
					state.value, state,

					'\nContext=',
					state.context,
					'\n\n' )

				return
			}

			console.log( '\n⬇️⬇️ - - - - - - - - - - -',  )
			dumpState(state.value)
			console.log( 'ctx=', state.context )
			console.log( 'evt=', state.event )
			console.log( '⬆️ - - - - - - - - - - -\n',  )

			// re-render if the state changed
			forceUpdate(x => x+1)
		})

		service.current.start()
	}

	// didMount
	useEffect(() => {
	  return () => {
	    service.stop()
	  }
	}, [service.current])*/

	return (
		<MyContext.Provider value={{
			state: service.current.state,
			send: service.current.send
		}}>
			<App />
		</MyContext.Provider>
	)
}

// App.whyDidYouRender = true
// Wrap.whyDidYouRender = true
