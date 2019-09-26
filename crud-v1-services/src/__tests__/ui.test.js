import 'jest-dom/extend-expect'
import 'react-testing-library/cleanup-after-each'
import React from 'react'
import { render, cleanup, fireEvent, prettyDOM } from 'react-testing-library'
import { Wrap } from '../components/App'
import { timer } from '../utils/helpers'

let dom, container

beforeEach(() => {
	dom = render(<Wrap />)
	container = dom.container
})

afterEach(cleanup)

describe('fetch data and display', () => {

	it('has rows of data', () => {
		const rows = document.querySelector('#rows')
	  expect(rows.children.length).toEqual(3)
	  expect(rows.children.length).not.toEqual(0)
	})

	it('add button click', () => {

		const btn = document.querySelector('#btnAdd')
	  fireEvent.click( btn )

	  const form = document.querySelector('form')
		const input = document.querySelector('form input')
		const btnSubmit = document.querySelector('#btnSubmit')
		const btnCancel = document.querySelector('#btnCancel')

	  expect(form).not.toBeNull()
	  expect(input).toHaveAttribute('value', '')
	  expect(btnSubmit).not.toBeNull()
	  expect(btnCancel).not.toBeNull()
	})

	it('add new item', async () => {

		const btn = document.querySelector('#btnAdd')
	  fireEvent.click( btn )

		const input = document.querySelector('form input')
		const btnSubmit = document.querySelector('#btnSubmit')
		const value = 'foobar'

		fireEvent.change(input, { target: {value: 'foobar'}})
		expect(input).toHaveAttribute('value', value)

		fireEvent.click( btnSubmit )

		const newElem = dom.getByText(/foobar/i).textContent
		expect( newElem ).not.toBeUndefined()

		const a = await dom.findByText(/label_foobar/i)
		expect(a).toBeTruthy()
		console.log( 'aaa:', a.textContent )
	})

	it('select item to have bg color and edit button enabled ', () => {

		// div.span
		const row1 = document.querySelector('#rows').firstChild.firstChild
	  fireEvent.click( row1 )

		const row2 = document.querySelector('[style*="background-color"]')
		expect(row2).not.toBeNull()
		expect(row2).toHaveAttribute('style', 'background-color: pink;')

		const btn = document.querySelector('#btnEdit')
		expect(btn).not.toHaveAttribute('disabled')

	})

	it('edit item - display', () => {

		// div.span
		const row1 = document.querySelector('#rows').firstChild.firstChild
	  fireEvent.click( row1 )

		const btn = document.querySelector('#btnEdit')
	  fireEvent.click( btn )

	  const value = row1.textContent.split('-')[1].trim()
	  const t = dom.getByDisplayValue( new RegExp(value, 'i') )
	  expect(t).not.toBeNull()
	})

	it('edit item - submit', () => {

		// div.span
		const row1 = document.querySelector('#rows').firstChild.firstChild
	  fireEvent.click( row1 )
	  console.log( 'row1:', row1.textContent )
		const btn = document.querySelector('#btnEdit')
	  fireEvent.click( btn )

	  const input = document.querySelector('form input')
	  const val = 'foobar'

	  fireEvent.change(input, { target: {value: 'foobar'}})
	  expect(input).toHaveAttribute('value', val)

	  fireEvent.click( document.querySelector('#btnSubmit') )

	  const result = document.querySelectorAll('h2')[1]
	  console.log( 'result: ', result.textContent )
	  expect(result.textContent).toEqual(`Content: ${val}`)

	  // console.log( prettyDOM(container) )
	})

	it('edit item - cancel', () => {

		const row1 = document.querySelector('#rows').firstChild.firstChild
	  fireEvent.click( row1 )
	  // console.log( 'row1:', row1.outerHTML )

	  fireEvent.click( document.querySelector('#btnEdit') )

	  fireEvent.click( document.querySelector('#btnCancel') )

	  const oldItem = document.querySelector('[style*="background-color"')
	  expect(oldItem.outerHTML).toBe(row1.outerHTML)

	  // console.log( prettyDOM(container) )
	})

})

