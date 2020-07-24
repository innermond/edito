import {$svg} from './dom.js'
import {diff_match_patch} from 'diff-match-patch'

if (!indexedDB) {
	window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
	if (!indexedDB) throw new Error('no indexedDB')
	window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}
	window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
}

const req = indexedDB.open('undo', 1)

req.onerror = evt => {
	console.log(evt.target.errorCode)
}

let db = null

req.onsuccess = evt => {
    console.log('success')
    db = evt.target.result
}

req.onupgradeneeded = evt => {
    console.log('upgrade')
	db = req.result
	const patchStore = db.createObjectStore('patch', {keyPath: 'id', autoIncrement: true})
	patchStore.createIndex('patch', 'patch', {unique: true})
	patchStore.createIndex('ref', 'ref', {unique: false})
	patchStore.transaction.oncomplete = () => {
		const patch = db.transaction(['patch'], 'readwrite').objectStore('patch')
        // add serialized svg as base
        const svg_unmodified = new XMLSerializer().serializeToString($svg)
		const add = patch.add({unmodified: svg_unmodified})
		add.onsuccess = evt => {
            console.log(evt.target.result)
        }
		add.onerror = evt => console.log(evt.target.result)
	}
}

export function add_patch(svg_before) {
	const svg_after = new XMLSerializer().serializeToString($svg)
	const dmp = new diff_match_patch()
	const diff = dmp.diff_main(svg_after, svg_before)
	let pp = dmp.patch_make(svg_after, diff)
    

    const tx_path = db.transaction(['patch'], 'readwrite')
	tx_path.oncomplete = evt => console.log(evt.target)
	tx_path.onerror = evt => console.log(evt.target.transaction.error)
	const store_patch = tx_path.objectStore('patch')
	const already = store_patch.index('patch').get(JSON.stringify(pp))
	already.onsuccess = evt => {
		console.log('already', already.result)
		const patch_add = already.result === undefined 
        ? store_patch.add({patch: pp})
        :store_patch.add({ref: evt.target.result.id})
        patch_add.success = evt => console.log(patch_add.result)
        patch_add.onerror = evt => console.log(pp, patch_add.error)
	}
	already.onerror = evt => {
		console.log('already error', evt)
	}
    return pp
}
