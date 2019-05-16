/* eslint-disable */
import React, { useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useMachine } from '@xstate/react'
import { interpret } from 'xstate'
import machine from './machine'
import './styles.css'
import { isNumber, isOperator, current, dump } from './helpers'
import classNames from 'classnames'

import { StateChart } from '@statecharts/xstate-viz'

function insertMetachars(oMsgInput, sStartTag, sEndTag) {
	var bDouble = arguments.length > 1,
		// oMsgInput = document.myForm.myTxtArea,
		nSelStart = oMsgInput.selectionStart,
		nSelEnd = oMsgInput.selectionEnd,
		sOldText = oMsgInput.value
	oMsgInput.value =
		sOldText.substring(0, nSelStart) +
		(bDouble
			? sStartTag + sOldText.substring(nSelStart, nSelEnd) + sEndTag
			: sStartTag) +
		sOldText.substring(nSelEnd)
	oMsgInput.setSelectionRange(
		bDouble || nSelStart === nSelEnd ? nSelStart + sStartTag.length : nSelStart,
		(bDouble ? nSelEnd : nSelStart) + sStartTag.length,
	)
	oMsgInput.focus()
}

export const App = () => {
	const [state, send] = useMachine(machine, { log: true })

	console.clear()
	dump(state.value, 3)
	// console.log('\n[State] = ', state.toStrings(), '\n[context] = ', state.context)

	const ta = useRef()
	const sel = useRef(null)
	const clip = useRef(null)

	useEffect(() => {
		window.addEventListener('keydown', handleKey )
		 return () => window.removeEventListener('keydown', handleKey )
	})

	const handleKey = evt => {
		if( evt.metaKey == true && evt.key == 'b'){
			handleBold()
		} else if ( evt.metaKey == true && evt.key == 'u'){
			handleUnderline()
		} else if ( evt.metaKey == true && evt.key == 'i'){
			handleItalic()
		} else if ( evt.metaKey == true && evt.key == 'c'){
			handleCopy()
		} else if ( evt.metaKey == true && evt.key == 'p'){
			handlePaste()
		}
	}

	const handleBold = () => {
		send('toggleBold')
		insertMetachars(ta.current, '<strong>', '</strong>')
	}

	const handleItalic = () => {
		send('toggleItalic')
		insertMetachars(ta.current, '<i>', '</i>')
	}

	const handleUnderline = () => {
		send('toggleUnderline')
		insertMetachars(ta.current, '<u>', '</u>')
	}

	const handleCopy = () => {
		document.execCommand('copy')
		const txt = navigator.clipboard
			.readText()
			.then(res => clip.current = res)
			.catch(e => console.log( 'Failed accessing clipboard: ', e ))
		ta.current.focus()
		send('setClipboardContent')
	}

	const handlePaste = () => {
		ta.current.focus()
		ta.current.setRangeText( clip.current, sel.current.start, sel.current.end)
	}

	const handleSelection = () => {
		const start = ta.current.selectionStart
		const end = ta.current.selectionEnd
		// console.log( 'select change:', start, end )
		if (start === end) {
			send('textUnselected')
		} else {
			send('textSelected')
		}
		sel.current = {
			start,
			end,
		}
	}

	const btnDisabled = state.matches('globals.selection.notSelected')
	const pasteDisabled = state.matches('globals.clipboard.notFilled')

	// return <StateChart machine={machine} />

	return (
		<div>
			<button
				disabled={btnDisabled}
				className={`btn btn-down ${btnDisabled ? 'btn:disabled' : null}`}
				onClick={handleBold}
			>
				bold
			</button>

			<button
				disabled={btnDisabled}
				className={`btn btn-down ${btnDisabled ? 'btn:disabled' : null}`}
				onClick={handleItalic}
			>
				italic
			</button>

			<button
				disabled={btnDisabled}
				className={`btn btn-down ${btnDisabled ? 'btn:disabled' : null}`}
				onClick={handleUnderline}
			>
				underline
			</button>

			<button
				disabled={btnDisabled}
				className={`btn btn-down ${btnDisabled ? 'btn:disabled' : null}`}
				onClick={handleCopy}
			>
				copy
			</button>
			<button
				disabled={pasteDisabled}
				className={`btn btn-down ${btnDisabled ? 'btn:disabled' : null}`}
				onClick={handlePaste}
			>
				paste
			</button>

			<textarea
				name="myTxtArea"
				className="container"
				onMouseUp={handleSelection}
				ref={ta}
				defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut facilisis, arcu vitae adipiscing placerat."
			/>
			<div>{JSON.stringify(state.value)}</div>
		</div>
	)
}
