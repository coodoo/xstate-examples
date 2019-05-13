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

export const App = () => {

	// fsm hook - 這是唯一用到 useState 的地方
	const [state, send ] = useMachine( machine, {log: true} )

	// 畫面顯示用的變數
	const input = useRef([])
	const resetInput = useRef(false)

	// 是否要改顯示 fsm 返還的計算結果
	const useAns = useRef(false)

	// console.log( '\n[現在狀態] = ', state.value, '\n[context] = ', state.context )

	// console.log( '顯示答案嗎？', useAns.current )

	// divideByZero 時要顯示錯誤訊息
	if( current(state) === 'alert' ){
		console.log( '強迫顯示 fsm 狀態',  )
		useAns.current = true
	}

	// fsm 有返還計算後的答案，就要改顯示它
	if( useAns.current ){
		// 用 fsm.context.display 內容取代本地 input 變數
		input.current = [state.context.display]
		// 重置這個變數
		useAns.current = false
	}

	const handleNumber = item => {

		// 如在 'operator' 狀態就要清空 input 內容值來存 operand2
		if( current(state) === 'operator' ){

			input.current = [item]
			resetInput.current = false

		}	else {

			// 只準有一個 dot, 要判斷是 1.1 或 1.1.2 不可出現兩個 dot
	  	if(item === '.' && input.current.indexOf('.') != -1 ) return

			// 1+2=3 接著輸入數字時，要先清空 3 這個舊值
			if( resetInput.current === true ){
				input.current = []
				resetInput.current = false
			}

			// 如果當前 input 值為 0，將其移除並用 [] 取代
			if( +input.current[0] === 0) {
				input.current = []
			}

			input.current.push(item)
		}

		send({ type: 'NUMBER', value: +input.current.join('') })
	}

	const handleOperator = item => {

  	useAns.current = true

  	// send() 一定要放在設定完區域變數後面才能執行
  	if( item === '-'){
	  	send({ type: 'OPERATOR_MINUS', value: item })
  	} else {
	  	send({ type: 'OPERATOR_OTHERS', value: item })
  	}
	}

	const handleEqual = item => {
  	useAns.current = true
	  resetInput.current = true
	  send({ type: 'EQUAL', value: null })
	}

	const handleC = item => {
  	useAns.current = true
	  send({ type: 'C', value: null })
	}

	const handleAC = item => {
  	useAns.current = true
	  send({ type: 'AC', value: null })
	}

	const handleInput = item => {
		// console.log( 'button 拿到: ', item  )

	  if ( isNumber(+item) || item === '.' ) {
	  	handleNumber(item)
	  // } else if ( item === '.' ) {
	  	// handleDot(item)
	  } else if (isOperator(item)) {
	  	handleOperator(item)
	  } else if (item === '=' || item === 'enter') {
		  handleEqual(item)
	  } else if (item === 'C') {
	  	// C 是清楚最後一次的輸入值
		  handleC(item)
	  } else if (item === 'AC' || item === 'escape') {
		  // AC = all clear 重設一切
		  handleAC(item)
	  } else if (item === "%") {
	  	// not implemented
	  } else {
	  	console.log( '未知鍵: ', item  )
	  }
	}

	// 處理 mouse
	const handleClick = item => {
		// console.log( 'click 按了: ', item )
		handleInput(item)
	}

	// 處理 keyboard
	const handleKeyDown = evt => {
		const { key } = evt
		// console.log( '鍵盤: ', key.toLowerCase()  )
		handleInput( key.toLowerCase() )
	}

	const calcButtons = () => {
	  //
	  const buttons = [
	    "C",
	    "AC",
	    "/",
	    "7",
	    "8",
	    "9",
	    "*",
	    "4",
	    "5",
	    "6",
	    "-",
	    "1",
	    "2",
	    "3",
	    "+",
	    "0",
	    ".",
	    "=",
	    "%"
	  ];

	  return buttons.map((itm, idx) => {
	    let classNames = "calc-button";

	    if (itm === "C") {
	      classNames += " two-span";
	    }

	    return (
	      <button
	        onClick={() => handleClick(itm)}
	        className={classNames}
	        key={idx}
	        id={ 'key_'+itm }
	      >
	        {itm}
	      </button>
	    );
	  });
	}

	const display = () => {
		let val = input.current.join('')
		// console.log( '顯示:', val, ' > ', input.current )
		return val.length == 0 ? '0' : val
	}

	useEffect(() => {
		// 讓 focus 自動放在 container 身上，可接收鍵盤事件
		window.addEventListener('keydown', handleKeyDown )
	  return () => window.removeEventListener('keydown', handleKeyDown )
	});

	return (
	  <div
	  	className="container"
	  	onKeyDown={ handleKeyDown }
	  >
	    <input
	    	className="readout"
	    	value={display()}
	    	disabled
	    />
	    <div id='foo' onClick={ handleClick }/>
	    <div className="button-grid">{calcButtons()}</div>
	  </div>
	)
}
