import 'jest-dom/extend-expect'
import 'react-testing-library/cleanup-after-each'
import React from 'react'
import { render, fireEvent } from 'react-testing-library'
import { App } from './App'

let container, elemDot, elem0, elem1, elem2, elem3, elem4, elemAdd, elemMultiply, elemDivide, elemEqual, elemAC, readout

beforeEach(() => {
	const dom = render(<App />)
	container = dom.container
	elemDot = container.querySelector('#key_\\.')
	elem0 = container.querySelector('#key_0')
	elem1 = container.querySelector('#key_1')
	elem2 = container.querySelector('#key_2')
	elem3 = container.querySelector('#key_3')
	elem4 = container.querySelector('#key_4')
	elemAdd = container.querySelector('#key_\\+')
	elemMultiply = container.querySelector('#key_\\*')
	elemDivide = container.querySelector('#key_\\/')
	elemEqual = container.querySelector('#key_\\=')
	elemAC = container.querySelector('#key_AC')
	readout = container.querySelector('.readout')
	// const t = container.querySelector('#foo')
})

describe('click test', () => {

	test('1+1=2', () => {

	  fireEvent.click( elem1 )
	  fireEvent.click( elemAdd )
	  fireEvent.click( elem1 )
	  fireEvent.click( elemEqual )

	  expect(readout).toHaveAttribute( 'value', '2')
	})

	test('3/2=1.5', () => {

	  fireEvent.click( elem3 )
	  fireEvent.click( elemAC )
	  expect(readout).toHaveAttribute( 'value', '0')

	  fireEvent.click( elem3 )
	  fireEvent.click( elemDivide )
	  fireEvent.click( elem2 )
	  fireEvent.click( elemEqual )

	  expect(readout).toHaveAttribute( 'value', '1.5')
	  // expect(readout).toHaveAttribute( 'value', '2')
	})

	test('3/0 要顯示 divideByZero ERROR', () => {

	  fireEvent.click( elem3 )
	  fireEvent.click( elemDivide )
	  fireEvent.click( elem0 )
	  fireEvent.click( elemEqual )

	  expect(readout).toHaveAttribute( 'value', 'ERROR')
	})

	test('0.1+0.2=0.3', () => {

	  fireEvent.click( elemDot )
	  fireEvent.click( elem1 )
	  fireEvent.click( elemAdd )
	  fireEvent.click( elemDot )
	  fireEvent.click( elem2 )
	  fireEvent.click( elemEqual )

	  expect(readout).toHaveAttribute( 'value', '0.3')

	})

	test('2 * .2 = 0.4', () => {

	  fireEvent.click( elem2 )
	  fireEvent.click( elemMultiply )
	  fireEvent.click( elemDot )
	  fireEvent.click( elem2 )
	  fireEvent.click( elemEqual )

	  expect(readout).toHaveAttribute( 'value', '0.4')

	})

	test('2 * . . 2 = 0.4 測輸入多個 dot 能成功擋掉', () => {

	  fireEvent.click( elem2 )
	  fireEvent.click( elemMultiply )
	  fireEvent.click( elemDot )
	  fireEvent.click( elemDot )
	  fireEvent.click( elem2 )
	  fireEvent.click( elemEqual )

	  expect(readout).toHaveAttribute( 'value', '0.4')

	})

	test('1+2=3, 再輸入 .1 此時顯示 1，應是 .1', () => {

	  fireEvent.click( elem1 )
	  fireEvent.click( elemAdd )
	  fireEvent.click( elem2 )
	  fireEvent.click( elemEqual )
	  expect(readout).toHaveAttribute( 'value', '3')

	  fireEvent.click( elemDot )
	  fireEvent.click( elem1 )
	  fireEvent.click( elemEqual )
	  expect(readout).toHaveAttribute( 'value', '.1')

	})

	test('1+2=3, 再輸入 *.1，該顯示 0.1', () => {

	  fireEvent.click( elem1 )
	  fireEvent.click( elemAdd )
	  fireEvent.click( elem2 )
	  fireEvent.click( elemEqual )
	  expect(readout).toHaveAttribute( 'value', '3')

	  fireEvent.click( elemMultiply )
	  fireEvent.click( elemDot )
	  fireEvent.click( elem1 )
	  expect(readout).toHaveAttribute( 'value', '.1')

	  fireEvent.click( elemEqual )
	  expect(readout).toHaveAttribute( 'value', '0.3')

	})

	test('.2 + .3 輸入第二個 . 後會得到 3，應顯示 0.3', () => {

	  fireEvent.click( elemDot )
	  fireEvent.click( elem2 )
	  fireEvent.click( elemAdd )
	  fireEvent.click( elemDot )
	  fireEvent.click( elem3 )
	  expect(readout).toHaveAttribute( 'value', '.3')

	  fireEvent.click( elemEqual )
	  expect(readout).toHaveAttribute( 'value', '0.5')

	})

	test('[bug] 鍵入 1. 顯示 10. 應是 1.', () => {

	  // console.log( 'test 有貨:', elemMultiply )

	  fireEvent.click( elem1 )
	  fireEvent.click( elemDot )

	  expect(readout).toHaveAttribute( 'value', '1.')

	})

})

describe('keyboard', () => {
	/*

		https://testing-library.com/docs/dom-testing-library/api-events#fireevent

		fireEvent.keyDown(domNode, { key: 'Enter', code: 13 })

		// note: you should set the charCode or it will be fallback to 0
		// will Fire an KeyboardEvent with charCode = 0
		fireEvent.keyDown(domNode, { key: 'Enter', code: 13 })

		// will Fire an KeyboardEvent with charCode = 65
		fireEvent.keyDown(domNode, { key: 'A', code: 65, charCode: 65 })

	*/

	test('1+2=3', () => {
	  fireEvent.keyDown( container, { key: '1'} )
	  fireEvent.keyDown( container, { key: '+'} )
	  fireEvent.keyDown( container, { key: '2'} )
	  expect(readout).toHaveAttribute( 'value', '2')

	  fireEvent.keyDown( container, { key: '='} )
	  expect(readout).toHaveAttribute( 'value', '3')

	})

	test('3/0 = ERROR', () => {
	  fireEvent.keyDown( container, { key: '3'} )
	  fireEvent.keyDown( container, { key: '/'} )
	  fireEvent.keyDown( container, { key: '0'} )
	  expect(readout).toHaveAttribute( 'value', 'ERROR')

	  fireEvent.keyDown( container, { key: '='} )
	  expect(readout).toHaveAttribute( 'value', 'ERROR')

	})

	test('1111+2222=3333', () => {
	  fireEvent.keyDown( container, { key: '1'} )
	  fireEvent.keyDown( container, { key: '1'} )
	  fireEvent.keyDown( container, { key: '1'} )
	  fireEvent.keyDown( container, { key: '1'} )
	  fireEvent.keyDown( container, { key: '+'} )
	  fireEvent.keyDown( container, { key: '2'} )
	  fireEvent.keyDown( container, { key: '2'} )
	  fireEvent.keyDown( container, { key: '2'} )
	  fireEvent.keyDown( container, { key: '2'} )
	  fireEvent.keyDown( container, { key: '='} )
	  expect(readout).toHaveAttribute( 'value', '3333')

	})
})
