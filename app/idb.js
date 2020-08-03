import {$svg, update_def_style} from './dom.js'
import {diff_match_patch} from 'diff-match-patch'

if (!indexedDB) {
	window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
	if (!indexedDB) throw new Error('no indexedDB')
	window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}
	window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
}

const dmp = new diff_match_patch()
const req = indexedDB.open('time-machine', 1)

req.onerror = evt => {
	console.log(evt.target.errorCode)
}

let db = null
let queue = []

req.onsuccess = evt => {
	db = evt.target.result
	db.onerror = e => console.log(e.error)
	for (const ff of queue) {
		const [fn, args] = ff
		fn.call(args)
	}
	queue = []
	
	const svg = db.transaction(['svg'], 'readwrite').objectStore('svg')
	// add serialized svg as base
	const svg_unmodified = new XMLSerializer().serializeToString($svg)
	svg.put({id: 1, svg: svg_unmodified})
}

req.onupgradeneeded = e => {
	const db = e.target.result

	let patchStore = db.createObjectStore('undo', {keyPath: 'id', autoIncrement: true})
	patchStore.createIndex('id', 'id', {unique: true})
	patchStore.createIndex('undo', 'undo', {unique: true})
	
	patchStore = db.createObjectStore('redo', {keyPath: 'id', autoIncrement: true})
	patchStore.createIndex('id', 'id', {unique: true})
	patchStore.createIndex('redo', 'redo', {unique: true})
	
	db.createObjectStore('svg', {keyPath: 'id', autoIncrement: true})
}

export function add_patch() {
	const tx = db.transaction(['undo', 'svg', 'redo'], 'readwrite')
	const store_svg = tx.objectStore('svg')
	const x = store_svg.get(1)
	x.onsuccess = evt => {
		const svg_before = evt.target.result.svg
		const svg_after = serialize_without_ants()
		let diff = dmp.diff_main(svg_after, svg_before, false)
		let pp = dmp.patch_make(svg_after, diff)
		if (pp.length === 0) return

		const store_patch = tx.objectStore('undo')
		store_patch.add({patch: pp})

		store_svg.put({id:1, svg:svg_after})

		const r = tx.objectStore('redo')
		const req_r = r.count()
		req_r.onsuccess = () => r.clear()
	}
}

export function serialize_without_ants() {
		const $cloned = $svg.cloneNode(true)
		Array.from($cloned.querySelectorAll('[data-ants]')).forEach($el => {
			$el.remove()
		})
		return new XMLSerializer().serializeToString($cloned)
}

export function apply_last_patch() {
	const tx = db.transaction(['undo', 'redo', 'svg'], 'readwrite')
	const store_patch = tx.objectStore('undo')
	const c = store_patch.openCursor(null, 'prev')
	c.onsuccess = e => {
		const cursor = e.target.result
		if (!cursor) return
		const store_svg = tx.objectStore('svg')
		const x = store_svg.get(1)
		x.onsuccess = evt => {
			const p = cursor.value.patch
			const svg_after = evt.target.result.svg
			let [svg_patched] = dmp.patch_apply(p, svg_after)
		
			// redo patch
			let diff = dmp.diff_main(svg_patched, svg_after, false)
			let pp = dmp.patch_make(svg_patched, diff)
			const store_redo = tx.objectStore('redo')
			store_redo.add({patch: pp})
			
			const parser = new DOMParser()
			const doc = parser.parseFromString(svg_patched, 'image/svg+xml')
			// remove last patch
			cursor.delete()

			store_svg.put({id:1, svg:svg_patched})
			
			update_svg(doc)
		}
	}
}

export function redo() {
	let tx = db.transaction(['redo', 'svg', 'undo'], 'readwrite')
	const store_patch = tx.objectStore('redo')
	const c = store_patch.openCursor(null, 'prev')
	c.onsuccess = e => {
		const cursor = e.target.result
		if (!cursor) return
		const store_svg = tx.objectStore('svg')
		const x = store_svg.get(1)
		x.onsuccess = evt => {
			const p = cursor.value.patch
			const svg_after = evt.target.result.svg
			let [svg_patched] = dmp.patch_apply(p, svg_after)
		
			const parser = new DOMParser()
			const doc = parser.parseFromString(svg_patched, 'image/svg+xml')
			// remove last patch
			cursor.delete()

			store_svg.put({id:1, svg:svg_patched})
			
			update_svg(doc)

			const ffid = dmp.diff_main(svg_patched, svg_after, false)
			const pz = dmp.patch_make(svg_patched, ffid)
			if (pz.length === 0) return

			const store_undo = tx.objectStore('undo')
			store_undo.add({patch: pz})
		}
	}
}

function update_svg(doc) {
		Array.from($svg.attributes).forEach($attr => $svg.removeAttributeNode($attr))
		Array.from(doc.documentElement.attributes).forEach($attr => $svg.setAttributeNode($attr.cloneNode(true)))
		$svg.innerHTML = doc.documentElement.innerHTML
		update_def_style()
}

export function clear_patch(clear_svg=false) {
	if (!db) {
		queue.push([clear_patch, clear_svg])
		return
	}

	const tx = db.transaction(['undo', 'redo', 'svg'], 'readwrite')
	
	const u = tx.objectStore('undo')
	u.clear()
	const r = tx.objectStore('redo')
	r.clear()
	if (clear_svg) {
		const s = tx.objectStore('svg')
		s.clear()
	}
}

// if you need context use fn.bind(ctx)
export function with_undo(fn, ...args) {
	return () => {
		fn(...args)
		add_patch()
	}
}

export function addEventListenerUndo($target, evt_name, fn, evt_name_undo=null) {
	if (evt_name_undo === null) {
		$target.addEventListener(evt_name, with_undo(fn))
		return
	}

	$target.addEventListener(evt_name, fn)
	$target.addEventListener(evt_name_undo, add_patch)
}
