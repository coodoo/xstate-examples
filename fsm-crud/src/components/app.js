/* eslint-disable*/
import React, { useEffect, useState, useRef, useContext, memo } from 'react'
import toaster from 'toasted-notes'
import 'toasted-notes/src/styles.css'

import { useMachine } from '../utils/useMyMachine'
import { MainMachine, } from '../fsm/mainMachine'
import { randomId } from '../utils/helpers'

import '../components/styles.css'

import whyDidYouRender from '@welldone-software/why-did-you-render'
whyDidYouRender(React)


// to store { state, send } from fsm
const MyContext = React.createContext()

const modalStyles = {
	border: '4px solid black',
	width: '200px',
	height: '100px',
	backgroundColor: '#ffff0059',
}

//
const ModalError = props => {
	const { send } = useContext(MyContext)
	const { title, content } = props

	return (
		<div style={modalStyles}>
			<div>Title: {title}</div>
			<div>{content}</div>

			<button onClick={e => send({ type: 'modalDataErrorRetry' })}>
				Retry
			</button>

			<button onClick={e => send({ type: 'modalDataErrorClose' })}>
				Close
			</button>
		</div>
	)
}

//
const ModalDelete = props => {
	const { send } = useContext(MyContext)
	const { title, content, data } = props

	return (
		<div style={modalStyles}>
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
		</div>
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
						exitTo: 'details',
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
			>
				{itm.id} - {itm.label}
			</span>
			{<button onClick={() => handleViewDetails(itm)}>🔎</button>}
			{/*
			{<button onClick={() => handleDelete(itm)}>❌</button>}
			*/}
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
						exitTo: 'master',
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

			<button
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
			</button>
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

const getItemById = (items, id) => items.find(it => it.id === id)

//
const notify = (items, send) => {

	if (items.length === 0) return

	// everything inside context is immutable, can only update it via sending an event
	items.forEach(it => {
		toaster.notify(it, {
			position: 'bottom-right',
		})
	})

	send({
		type: 'clearNotification',
		popped: items,
	})
}

const App = memo(() => {
	const { state, send } = useContext(MyContext)

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
	useEffect(() => {
		notify(notifications, send)
		return () => {}
	}, [])

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
})


export const Wrap = () => {
	const [state, send] = useMachine(MainMachine, { log: true })

	// so fsm and send in context so that it's easier to access within sub-components
	return (
		<MyContext.Provider value={{ state, send }}>
			<App />
		</MyContext.Provider>
	)
}

App.whyDidYouRender = true
Wrap.whyDidYouRender = true
