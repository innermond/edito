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

req.onsuccess = evt => {
	const db = evt.target.result
	const tx_path = db.transaction(['patch'], 'readwrite')
	tx_path.oncomplete = evt_tx => console.log(evt_tx.target)
	tx_path.onerror = evt_tx => console.log(evt_tx.target.transaction.error)
	const store_path = tx_path.objectStore('patch')
	const already = store_path.index('diff_inx').get('one')
	already.onsuccess = evt => {
		console.log('already', evt.target.result)
		store_path.add({ref: evt.target.result.id})
	}
	already.onerror = evt_already => {
		console.log('already error', evt_already)
	}
	store_path.add({diff: 'three'})
}

req.onupgradeneeded = evt => {
	const db = evt.target.result
	const patchStore = db.createObjectStore('patch', {keyPath: 'id', autoIncrement: true})
	patchStore.createIndex('diff_inx', 'diff', {unique: true})
	patchStore.createIndex('ref_inx', 'ref', {unique: false})
	patchStore.transaction.oncomplete = () => {
		const path = db.transaction(['patch'], 'readwrite').objectStore('patch')
		const add = path.add({diff:'one'})
		add.onsuccess = evt_add => console.log(evt_add.target.result)
		add.onerror = evt_add => console.log(evt_add.target.result)
	}
}
