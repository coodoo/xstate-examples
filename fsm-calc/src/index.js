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
