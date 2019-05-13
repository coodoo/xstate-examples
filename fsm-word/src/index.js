/* eslint-disable */
import React, { useRef, useEffect } from "react"
import ReactDOM from "react-dom"
import { useMachine } from "@xstate/react"
import { interpret } from 'xstate'
import machine from './machine'
import "./styles.css"
import {
	isNumber,
	isOperator,
	current,
} from './helpers'
import { App } from './App'

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);



/*
const svc = interpret(machine, {execute: true})
.onTransition( state => {
	// console.log( '[state] ', state.changed, '|', state.value, state.context, )

	if(state.changed == false){
		console.log( '有人送了沒人在聽的事件，可能是 ui 端寫錯事件名稱了',  )
		// 有人送了沒人在聽的事件，可能是 ui 端寫錯事件名稱了
		// debugger	//
	}
})
.onEvent( e => {
	// console.log( '\n[event] ', e  )
})
svc.start()

debugger	//
// const b = svc.send('GO')
*/
