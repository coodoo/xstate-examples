/* eslint-disable*/
import React, { useEffect, useState, useRef, useContext, memo } from 'react'
import toaster from 'toasted-notes'
import 'toasted-notes/src/styles.css'

import { interpret } from 'xstate'
import { machine, } from '../fsm/machine'
import { useMachineEx } from '../utils/useMyHooks'
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

			<button onClick={e => send({ type: 'modalDataErrorRetry' })}>
				Retry
			</button>

			<button onClick={e => send({ type: 'modalDataErrorClose' })}>
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
						type: 'modalDeleteItemCancel',
					})
				}
			>
				Cancel
			</button>

			<button
				onClick={() =>
					send({
						type: 'modalDeleteItemConfirm',
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
			type: 'newItemSubmit',
			payload: newItem,
		})
	}

	const handleCancel = () => {
		send({ type: 'newItemCancel' })
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
			type: 'editSubmit',
			payload: { id, label: content },
		})
	}

	const handleCancel = () => {
		send({ type: 'editCancel' })
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
		// prepare modal data to be displayed
		const modalData = {
			type: 'MODAL_DELETE',
			title: 'Item Removal Confirmation',
			content: `Are you sure to delete ${selectedItem.label}?`,
			data: selectedItem,
			exitModalTo: 'details',
		}

		// then dispatch the modal data
		send({
			type: 'itemDelete',
			modalData,
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
						type: 'itemNew',
						exitTo: 'details', // click 'cancel' will go back to detail screen
					})
				}
			>
				New
			</button>
			<button onClick={() => send({ type: 'itemEdit', exitTo:'details' })}>Edit</button>
			<button onClick={() => send({ type: 'itemBack' })}>Back</button>
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
		const modalData = {
			type: 'MODAL_DELETE',
			title: 'Item Removal Confirmation',
			content: `Are you sure to delete ${target.label}?`,
			data: target,
			exitModalTo: 'master',
		}
		//
		send({
			type: 'itemDelete',
			modalData,
		})
	}

	const handleViewDetails = itm => {
		send({
			type: 'itemDetails',
			item: itm,
			exitTo: 'master',
		})
	}

	const rows = items.map(itm => (
		<div key={itm.id}>
			<span
				style={itm.id === selectedItemId ? { backgroundColor: 'pink' } : null}
				onClick={e => {
					send({
						type: 'itemSelect',
						item: itm,
					})
				}}
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
						type: 'itemNew',
						exitTo: 'master', // click 'cancel' will go back to listing screen
					})
				}
			>
				New
			</button>

			<button
				id='btnEdit'
				onClick={() => send({ type: 'itemEdit', exitTo: 'master' })}
				disabled={!btnEnabled}
			>
				Edit
			</button>

			<button
				id='btnRemove'
				onClick={() => handleDelete(null)}
				disabled={!btnEnabled}
			>
				Remove
			</button>

			<button
				id='btnReload'
				onClick={() => send({ type: 'itemReload' })}
			>
				Reload
			</button>

			{/*<button
				id='btnTest'
				onClick={() => {

					// this is to show request could be cancelled any time, using one of following two approaches

					// might as well use DOM api
					// if(signal.current)
					// 	signal.current.abort()
					// const controller = new AbortController()
					// signal.current = controller
					// send({ type: test, signal: signal.current.signal })

					// cancel previous request first
					if(signal.current)
						signal.current.cancel = true

					// then send next request
					signal.current = { cancel: false }
					send({ type: 'test', signal: signal.current })
				}}
			>
				Test
			</button>*/}
		</div>
	)
}

//
const getModal = () => {

	const { state } = useContext(MyContext)
	const { modalData } = state.context

	// early bailout
	if (!modalData) return null

	let modal = null

	switch (modalData.type) {
		case 'MODAL_DELETE':
			modal = <ModalDelete {...modalData} />
			break
		case 'MODAL_ERROR':
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

	console.log( '\nApp',  )

	// console.log('\n[State] = ', state.value, '\n[context] = ', state.context)
	// console.log('\n[context] = ', state.context)

	const { notifications } = state.context

	const listing = !state.matches('main.master') ? null : <Listing />

	const itemEdit = !state.matches('main.edit') ? null : <ItemEdit />

	const itemNew = !state.matches('main.new') ? null : <ItemNew />

	const details = !state.matches('main.details') ? null : <Details />

	// demonstrating that ui and fsm not necessaryily a 1:1 relationship
	const loading =
		!state.matches('main.loading') && !state.matches('main.error') ? null : (
			<h3>LOADING...</h3>
		)

	const modal = getModal()

	// didMount
	// useEffect(() => {
	// 	return () => {}
	// }, [])

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

	const notify = msg => toaster.notify(msg, {
		position: 'bottom-right',
	})

	const machineRef = useRef(machine.withContext({
			...machine.context,
			notify, // passing side effect command to fsm
		}))

	const [ state, send ] = useMachineEx(machineRef.current, { debug: true, name: 'Parent'})

	return (
		<MyContext.Provider value={{
			state: state,
			send: send
		}}>
			<App />
		</MyContext.Provider>
	)
}

// App.whyDidYouRender = true
// Wrap.whyDidYouRender = true
