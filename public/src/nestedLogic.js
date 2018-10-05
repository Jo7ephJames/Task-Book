/* Data Arrays
------------------------------------------*/
var primeFolder = [] //Array for editing tasks
var taskPad = [] // Array to retrieve data from server


/*Server Functions/Console
----------------------------------------------------*/
var dataFn = {
	newTaskSheet: function(keyString) {
		taskPad.push([keyString, null]);
		var key = document.createElement('OPTION');
		key.textContent = taskPad[taskPad.length-1][0];
		htmlElements.taskSheets.appendChild(key);
		htmlElements.taskSheets.selectedIndex = taskPad.length;
		serverConsole.appDataLoaded = true;
		htmlElements.plusIcon.click();
		primeFolder = [];
		viewScripts.renderPrimeTasks(primeFolder);
	},
	deleteTaskSheet: function() {
		var position = htmlElements.taskSheets.selectedIndex-1
		if(position > -1) {
			taskPad.splice(position, 1)
			htmlElements.taskSheets.remove(position + 1);
			primeFolder = [];
			viewScripts.renderPrimeTasks(primeFolder);
			inputPrimeScripts.stealth(inputPrime)
		}
	},
	update: function() { //Called on viewScripts.renderPrimeTasks method
		var position = htmlElements.taskSheets.selectedIndex - 1; 
		if(position > -1) {
			taskPad[position][1] = JSON.stringify(primeFolder);
		}
	},
	loadTaskSheets: function() {
		taskPad.forEach(function(sheet, i) {
			var key = document.createElement('OPTION');
			key.textContent = taskPad[i][0];
			htmlElements.taskSheets.appendChild(key);
			htmlElements.taskSheets.selectedIndex = taskPad.length;	
		})
	}
}

/*Data Tests
-------------------------*/



var serverFn = {
	updateServer: function() {
		return new Promise(function(resolve, reject) {
			var request = new XMLHttpRequest();
			request.open('POST', '/users/taskbook');

			request.onload = function() {
				response = request.response;
				resolve(response);
				serverConsole.saveAvailable = true;
				alert(response);
			}
			encodedTaskPad = JSON.stringify(taskPad);

			request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			request.send(JSON.stringify(taskPad));
		})
	},
	loadTaskPad: function() {
		return new Promise(function(resolve, reject) {
			var request = new XMLHttpRequest();
			request.open('POST', '/users/taskbook');
				
				request.onload = function() {
					response = request.response;
					taskPad = JSON.parse(response);
					resolve(response);
					dataFn.loadTaskSheets();
					alert("Tasks Retieved From DataBase");
					htmlElements.taskSheets.selectedIndex = 0
				}
			request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			request.send('newTaskSheet');
		})
	}
}


/*-----Events------*/



/* Initialization
------------------------------------------------------------*/
function init() {
	htmlElements.plusIcon.attributes.taskRef = primeFolder;
	htmlElements.plusIcon.attributes.fuseLoc = htmlElements.dashBoard;
	htmlElements.plusIcon.attributes.taskReference = 'main';
	//inputPrimeScripts.fuse(htmlElements.plusIcon);
}


/* taskPanel Object
----------------------------------------------------*/
var taskPanel = {
	idArray: [],
	addTask: function(target, taskValue, reference) {
		if(arguments.length < 3) {
			target.push({
				task: taskValue,
				id: taskPanel.refGen(),
				subtasks: [],
				expanded: true,
				selected: false,
				completed: false
			})
 		}
 		if(arguments.length === 3) {
			target.forEach(function(task) {
				if(task.id === reference) {
					taskPanel.addTask(task.subtasks, taskValue);
				} else {
					taskPanel.addTask(task.subtasks, taskValue, reference);
				}
			})
		}
		viewScripts.renderPrimeTasks(target);
	},
	deleteTask: function(target, reference) {
		target.forEach(function(task, i) {
			if(task.id === reference) {
				target.splice(i, 1)
			} else {
				taskPanel.deleteTask(task.subtasks, reference)
			}
		})
		viewScripts.renderPrimeTasks(target);
	},
	changeTask: function(target, taskValue, reference) {
		target.forEach(function(task, i) {
			if(task.id === reference) {
				target[i].task = taskValue
			} else {
				taskPanel.changeTask(task.subtasks, taskValue, reference);
			}
		})
		viewScripts.renderPrimeTasks(target);
	},
	expandCollapse: function(target, reference, set) {
		if(set === false) {
			target.forEach(function(task, i) {
				if(task.id === reference) {
					target[i].expanded = false;
				} else {
					taskPanel.expandCollapse(task.subtasks, reference);
				}
			})
		}
		if(set === true) {
			target.forEach(function(task, i) {
				if(task.id === reference) {
					target[i].expanded = true;
				} else {
					taskPanel.expandCollapse(task.subtasks, reference);
				}
			})
		}
		target.forEach(function(task, i) {
			if(task.id === reference) {
				target[i].expanded = !target[i].expanded
			} else {
				taskPanel.expandCollapse(task.subtasks, reference);
			}
		})
		viewScripts.renderPrimeTasks(target);
	},
	indicateSelected: function(target, reference) {
		if(!reference) {
			htmlElements.plusIcon.classList.add('fusedtask')
			target.forEach(function(task, i) {
				target[i].selected = false;
				if(task.subtasks.length > 0) {
					taskPanel.indicateSelected(task.subtasks)
				}
			})
		} else {
			htmlElements.plusIcon.classList.remove('fusedtask')
			target.forEach(function(task, i) {
				if(task.id !== reference) {
					target[i].selected = false;
				}
				if(task.id === reference) {
					target[i].selected = true;
				}
				if(task.subtasks.length > 0) {
					taskPanel.indicateSelected(task.subtasks, reference)
				}
			})
		}
		viewScripts.renderPrimeTasks(target);
	},
	toggleCompleted: function(target, reference, set) {
		target.forEach(function(task, i) {
			if(task.id === reference) {
				target[i].completed = !target[i].completed;
				taskPanel.toggleSubtasks(task);
			} else {
				taskPanel.toggleCompleted(task.subtasks, reference);
				taskPanel.toggleDefaultStatus(primeFolder);
			}
		})
		viewScripts.renderPrimeTasks(target);
	},
	toggleSubtasks: function(task) {
		task.subtasks.forEach(function(subtask, i) {
			subtask.completed = task.completed;
			if(subtask.subtasks.length > 0) {
				taskPanel.toggleSubtasks(subtask);
			}
		})
	},
	toggleDefaultStatus: function(target) {
		target.forEach(function(task, i) {
			if(task.subtasks.length > 0) {
					var counter = 0;
				task.subtasks.forEach(function(subtask, x) {
					if(subtask.completed === true) {
						counter++;
					}
				})
				if(counter === task.subtasks.length) {
					task.completed = true;
				} else {
					task.completed = false;
				}
				taskPanel.toggleDefaultStatus(task.subtasks);
			}
		})
	},
	refGen: function getRandom() { //creates unique id for each task
		var a, b, c, d, e, f, g
		function get(max) {
  			return Math.floor(Math.random() * Math.floor(max));
		}
		a = get(10);
		b = get(10);
		c = get(10);
		d = get(10); 
		e = get(10); 
		f = get(10);
		g = get(10);
		var newRef = [a, b, c, d, e, f, g].join('');
		if(taskPanel.idArray.includes(newRef) ) {
			taskPanel.refGen();
		} else {
			taskPanel.idArray.push(newRef)
			return newRef;
		}
	}
}

/*
TaskPanel Tests
---------------------------------------------------------------------*/
// function taskPanelTests(target) {
// 	console.log('Add four tasks to')
// 	taskPanel.addTask(target, 'First Task');
// 	taskPanel.addTask(target, 'Second Task');
// 	taskPanel.addTask(target, 'Third Task');
// 	taskPanel.addTask(target, 'Fourth Task');
	
// 	console.log('Add task to each previous task in',target)
// 	taskPanel.addTask(target, 'In first', taskPanel.idArray[0]);
// 	taskPanel.addTask(target, 'In second', taskPanel.idArray[1]);
// 	taskPanel.addTask(target, 'In third', taskPanel.idArray[2]);
// 	taskPanel.addTask(target, 'In fourth', taskPanel.idArray[3]);
	

// 	console.log('Add two tasks to previous group added')
// 	taskPanel.addTask(target, 'Bottom of First', taskPanel.idArray[4]);
// 	taskPanel.addTask(target, 'Bottom of First', taskPanel.idArray[4]);
// 	taskPanel.addTask(target, 'Bottom of second', taskPanel.idArray[5]);
// 	taskPanel.addTask(target, 'Bottom of second', taskPanel.idArray[5]);
// 	taskPanel.addTask(target, 'Bottom of third', taskPanel.idArray[6]);
// 	taskPanel.addTask(target, 'Bottom of third', taskPanel.idArray[6]);
// 	taskPanel.addTask(target, 'Bottom of fourth', taskPanel.idArray[7]);
// 	taskPanel.addTask(target, 'Bottom of fourth', taskPanel.idArray[7]);
	
// 	console.log('Delete fourth task from primeFolder');
// 	taskPanel.deleteTask(target, taskPanel.idArray[3]);
	
// 	console.log('Delete a bottom level task from the third task in PrimeFolder');
// 	taskPanel.deleteTask(target, taskPanel.idArray[13]);

// 	console.log('change a task in the primeFolder')
// 	taskPanel.changeTask(target,'CHANGED!',taskPanel.idArray[0]);

// 	console.log('Change a bottom level task from the seconds task in primeFolder to "CHANGED!" ')
// 	taskPanel.changeTask(target,'CHANGED!',taskPanel.idArray[10]);

// 	console.log('Check Id Array:', taskPanel.idArray);
// }


/*HTML Elements and scripts to make HTML Elements
-------------------------------------------------------------------*/

var htmlElements = { // Elements, and functions to create Elements
	dashBoard: document.getElementById('dashBoard'),
	taskPanel: document.getElementById('taskPanel'),
	plusIcon: document.getElementById('dashIcon'),
	addnewIcon: document.getElementById('addnewIcon'),
	deleteIcon: document.getElementById('deleteIcon'),
	taskSheets: document.getElementById('taskSheets'),
	saveIcon: document.getElementById('saveIcon'),
	createLabel: function(id, text, taskReference, isExpanded, subCount, selected, completed) {
		//Create Div 
		var newDiv = document.createElement('DIV');
		newDiv.id = 'div'+id;
		newDiv.classList.add('primeTask');
		newDiv.attributes.expanded = true;
		 
		//Link for expand
		var newLink = document.createElement('A');
		newLink.id = 'link'+id;
		newLink.attributes.folder = taskReference.id; 
		isExpanded ? newLink.textContent = '- ' : newLink.textContent = '+ '
		newLink.attributes.fuseLoc = newDiv;
		newLink.attributes.folder = taskReference;
		//Label with text content
		var newLabel = document.createElement('LABEL');
		newLabel.classList.add('primelabel');
		newLabel.classList.add('major');
		newLabel.id = 'label'+id;
		newLabel.textContent = text;
		selected ? newLabel.classList.add('fusedtask') : newDiv.classList.remove('fusedtask');

		var newChkbox = document.createElement('IMG');
		newChkbox.id = 'chk'+id;
		newChkbox.classList.add('chkBoxMajor');
		completed ? newChkbox.classList.add('checked') : newChkbox.classList.remove('checked'); 
		
		var newDelbutton = document.createElement('A');
		newDelbutton.classList.add('delete');
		newDelbutton.id = 'del'+id;
		newDelbutton.textContent = 'X';
		//Attach label to link and wrap in div
		newDiv.appendChild(newLink);
		newDiv.appendChild(newLabel);
		newDiv.appendChild(newChkbox);
		newDiv.appendChild(newDelbutton);
		if(subCount === 0) {
			inputPrimeScripts.stealth(newLink)
		}
		return newDiv;
	},
	createSubTaskLabel: function(id, text, taskReference, isExpanded, subCount, selected, completed) {
		//Div 
		var newDiv = document.createElement('DIV');
		newDiv.id = 'div'+id;
		newDiv.classList.add('sublabel');
		isExpanded ? newDiv.classList.add('ifBorder') : newDiv.classList.remove('ifBorder')
		//Link for expand
		var newLink = document.createElement('A');
		newLink.id = 'link'+id;
		newLink.attributes.folder = taskReference; 
		isExpanded ? newLink.textContent = '- ' : newLink.textContent = '+ '
		//Label with text content
		var newLabel = document.createElement('LABEL');
		newLabel.classList.add('minor');
		newLabel.id = 'label'+id
		newLabel.textContent = text;
		selected ? newLabel.classList.add('fusedtask') : newDiv.classList.remove('fusedtask');

		var newChkbox = document.createElement('IMG');
		newChkbox.id = 'chk'+id;
		newChkbox.classList.add('chkBoxMinor') 
		completed ? newChkbox.classList.add('checked') : newChkbox.classList.remove('checked');

		var newDelbutton = document.createElement('A');
		newDelbutton.classList.add('delete');
		newDelbutton.id = 'del'+id;
		newDelbutton.textContent = 'X';
		//var newPlus = document.createElement('') 
		//Attach label to link and wrap in div
		newDiv.appendChild(newLink);
		newDiv.appendChild(newLabel);
		newDiv.appendChild(newChkbox);
		newDiv.appendChild(newDelbutton);
		if(subCount === 0) {
			inputPrimeScripts.stealth(newLink)
			newDiv.classList.remove('ifBorder')
		}
		return newDiv;
	},

}

/*ViewScripts
----------------------------------------*/
	viewScripts = {
		renderPrimeTasks: function(target, elementId) {
			if(!elementId) {
				htmlElements.taskPanel.innerHTML = '';
			}
			target.forEach(function(task, i) {
				if(!elementId) {
					var taskLabel = htmlElements.createLabel(task.id, task.task, primeFolder, task.expanded, task.subtasks.length, task.selected, task.completed);
					task.div = taskLabel
					htmlElements.taskPanel.appendChild(taskLabel);
					if(task.subtasks.length > 0) {
						viewScripts.renderPrimeTasks(task.subtasks, task.div);
						//collapses task after rerender if expanded property is false
						if(task.expanded === false) {
							viewScripts.collapseElement(task.div.id)
						}
					}
				} else {
					var taskLabel = htmlElements.createSubTaskLabel(task.id, task.task, primeFolder, task.expanded, task.subtasks.length, task.selected, task.completed);
					task.div = taskLabel
					elementId.appendChild(taskLabel);
					if(task.subtasks.length > 0) {
						viewScripts.renderPrimeTasks(task.subtasks, task.div);
						//collapses task after rerender if expand property is false
						if(task.expanded === false) {
							viewScripts.collapseElement(task.div.id);
						}
					}
				}
			})
			dataFn.update();
		},
		collapseElement: function(elementId) {
			var parentDiv = document.getElementById('div'+elementId.replace(/\D/g,'') )
			for(var i = 0; i < parentDiv.children.length; i++) {
				if(parentDiv.children[i].nodeName === 'DIV') {
					var childDiv = parentDiv.children[i]
					var childId = childDiv.id
					viewScripts.collapseElement(childId);
					childDiv.classList.add('vanish');
				}
			}
		}
	}

/*InputBox behaviour
------------------------------------------*/
var inputPrimeScripts = {
	genesis: function() {
		var inputPrime = document.createElement('INPUT');
		inputPrime.id = 'inputPrime';
		inputPrime.classList.add('inputPrime');
		inputPrime.classList.add('selected');
		folderDiv = 'noneOnInit';
		inputPrime.attributes.selectedFolder = 'NoneOnInit';
		inputPrime.placeholder = '   Enter your task   	';
		return inputPrime;
	},
	editGenesis: function() {
		var inputEdit = document.createElement('INPUT');
		inputEdit.id = 'inputEdit';
		inputEdit.classList.add('inputEdit');
		inputEdit.classList.add('vanish');
		folderDiv = 'noneOnInit';
		inputEdit.attributes.fusedTo = 'NoneOnInit'
		inputEdit.attributes.reference = 'NoneOnInit';
		inputEdit.placeholder = '   Edit your task   	';
		return inputEdit;
	},
	stealth: function(element) {
		element.classList.add('stealth');
	},
	vanish: function(element) {
		element.classList.add('vanish')
	},
	fuse: function(target) {
		if(target === htmlElements.plusIcon) {
			inputPrime.classList.remove('stealth');
			inputPrime.attributes.fusedTo = target.id; //task identifier
			target.attributes.fuseLoc.appendChild(inputPrime);
			inputPrime.attributes.taskReference = target.attributes.taskReference;
			inputPrime.focus();
		} else {
			inputPrime.attributes.fusedTo = target.id
			inputPrime.attributes.taskReference = target.attributes.taskReference;
			inputPrime.focus();
		}
	},
	clean: function(input) {
		var val = input.value.trim();
		return val
	},
	renderPrimeArray:  function(target, elementId) {
		elementId.innerHTML = '';
		target.forEach(function(task, i) {
			var taskLabel = htmlElements.createLabel(task.id, task.task, target[0].subtasks);
			elementId.appendChild(taskLabel);
		})
	},
	renderSubArray:  function(target, elementId) {
		target.forEach(function(task, i) {
			var taskLabel = htmlElements.createLabel(task.id, task.task, target[0][i].subtasks);
			elementId.appendChild(taskLabel);
		})
	},
	extractId: function() {
		var id = inputPrime.attributes.fusedTo.replace(/\D/g,'');
		return id;
	},	
	beFocus: function() {},
}

window.inputPrime = inputPrimeScripts.genesis();
window.inputEdit = inputPrimeScripts.editGenesis();
/* Eventlisteners to trigger server functions
-------------------------------------------------------------*/
var serverConsole = {
	appDataLoaded: false,
	controlArray: [htmlElements.plusIcon, htmlElements.addnewIcon, htmlElements.deleteIcon, htmlElements.taskSheets],
	saveAvailable: true
}

htmlElements.addnewIcon.addEventListener('click', function(event) {
	var keyString = prompt('Enter a reference for your new task sheet');
	if(keyString.trim() !== '') {
		dataFn.newTaskSheet(keyString);
		inputPrime.value = '';
	}
})

htmlElements.deleteIcon.addEventListener('click', function(event) {
	var position = htmlElements.taskSheets.selectedIndex-1
	if(position > -1) {
		var confirmDelete = confirm('Are you sure you want to delete task sheet: ' + htmlElements.taskSheets.value);
		if(confirmDelete === true) {
			dataFn.deleteTaskSheet();
			severConsole.appDataLoaded = false;
		}
	} else {
		alert('There is nothing to delete')
	}
})

htmlElements.saveIcon.addEventListener('click', function(event) {
	if(serverConsole.saveAvailable === true) {
		serverFn.updateServer();
		serverConsole.saveAvailable = false;
	}
})



htmlElements.taskSheets.addEventListener('change', function(event) {
	if(event.target.selectedIndex !== 0) {
		inputPrime.classList.remove('stealth')
		primeFolder = JSON.parse(taskPad[event.target.selectedIndex-1][1]);
		viewScripts.renderPrimeTasks(primeFolder);
		serverConsole.appDataLoaded = true;
		htmlElements.plusIcon.click();
    }
    if(event.target.selectedIndex === 0) {
    	inputPrimeScripts.stealth(inputPrime);
    }
})

/* InputBox Events
---------------------------------------------------------------*/
inputPrime.addEventListener('keyup', function(event) {
	val = inputPrimeScripts.clean(inputPrime);
	if(event.keyCode === 13 && inputPrime.value !== '') {
		if(inputPrime.attributes.taskReference === 'main' ) {
			taskPanel.addTask(primeFolder, val);
		} else {
			taskPanel.addTask(primeFolder, val, inputPrimeScripts.extractId())
		}
		inputPrime.value = '';
	} 
	if(event.keyCode === 27) {
		inputPrime.blur();
		inputPrime.value = '';
	}
})

inputEdit.addEventListener('keyup', function(event) {
	val = inputPrimeScripts.clean(inputEdit);
	var parent = inputEdit.attributes.fusedTo;
	if(event.keyCode === 13 && inputEdit.value !== '') {
		taskPanel.changeTask(primeFolder, val, inputEdit.attributes.reference);
		inputEdit.value = '';
		inputPrimeScripts.vanish(inputEdit);
		inputEdit.attributes.fusedTo = false;
		for(var i = 0; i < 3; i++) {
			parent.children[i].classList.remove('vanish')
		}
	} 
	if(event.keyCode === 27) {
		inputPrimeScripts.vanish(inputEdit);
		inputEdit.attributes.fusedTo = false;
		for(var i = 0; i < 3; i++) {
			parent.children[i].classList.remove('vanish')
		}
	}
})

inputEdit.addEventListener('blur', function(event) {
	var parent = inputEdit.attributes.fusedTo;
	inputPrimeScripts.vanish(inputEdit);
	for(var i = 0; i < 3; i++) {
		parent.children[i].classList.remove('vanish')
	}
	viewScripts.renderPrimeTasks(primeFolder);
	inputEdit.attributes.fusedTo = false;
})

/* Click Events
----------------------------------------------*/
htmlElements.plusIcon.addEventListener('click', function(event) {
	if(serverConsole.appDataLoaded === true) {
		console.log(event.target);
		inputPrimeScripts.fuse(event.target);
		taskPanel.indicateSelected(primeFolder)
	}
})

htmlElements.taskPanel.addEventListener('click', function(event) {
	if(event.target.id.includes('label') && event.target.classList.contains('fusedtask') === false) {
		console.log(event.target);
		var reference = event.target.id.replace(/\D/g,'');
		inputPrimeScripts.fuse(event.target);
		taskPanel.indicateSelected(primeFolder, reference);
	}
})

htmlElements.taskPanel.addEventListener('click', function(event) {
	if(event.target.id.includes('link') ) {
		var reference = event.target.id.replace(/\D/g,'');
		taskPanel.expandCollapse(primeFolder, reference)
	}
})

htmlElements.taskPanel.addEventListener('click', function(event) {
	if(event.target.id.includes('chk')) {
		var reference = event.target.id.replace(/\D/g,'');
		taskPanel.toggleCompleted(primeFolder, reference)
	}
})

htmlElements.taskPanel.addEventListener('click', function(event) {
	if(event.target.id.includes('del')) {
		var reference = event.target.id.replace(/\D/g,'');
		taskPanel.deleteTask(primeFolder, reference);
	}
})

htmlElements.taskPanel.addEventListener('dblclick', function(event) {
	if(event.target.id.includes('label') ) {
		console.log(event.target)
		var reference = event.target.id.replace(/\D/g,'');
		val = event.target.textContent;
		var parent = event.target.parentElement;
		
		for(var i = 0; i < 3; i++) {
			parent.children[i].classList.add('vanish');
		}
		
		viewScripts.collapseElement(reference)
		
		inputEdit.classList.remove('vanish');
		inputEdit.value = val;	
		inputEdit.attributes.fusedTo = parent;
		inputEdit.attributes.reference = reference;		
		parent.appendChild(inputEdit);
		inputEdit.focus();
	}
})


init();
serverFn.loadTaskPad();

console.log(taskPad);

// function runTestScript() {
// 	//folderPanel.addFolder()
// 	taskPanelTests(primeFolders[0]);
// 	viewScripts.renderPrimeTasks(primeFolder);
// }


//runTestScript()

