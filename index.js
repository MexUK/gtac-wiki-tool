// data
dumpdoc = {};

dumpdoc.UNKNOWN_FILE_TYPE	= 0;
dumpdoc.FUNCTIONS			= 1;
dumpdoc.EVENTS				= 2;
dumpdoc.DEFINES				= 3;
dumpdoc.COMMANDS			= 4;

dumpdoc.xmlFileNames = [
	'Documentation.xml',
	'EventTypes.xml',
	'Defines.xml',
	'Commands.xml'
];

dumpdoc.xmlItems = [
	[ [], [], [], [] ],
	[ [], [], [], [] ],
	[ [], [], [], [] ],
	[ [], [], [], [] ],
	[ [], [], [], [] ],
	[ [], [], [], [] ],	// wiki server
	[ [], [], [], [] ]	// wiki client
];

dumpdoc.xmlItemsMerged = [
	[ [], [], [], [] ],
	[ [], [], [], [] ]
];


dumpdoc.xmlItemsVariableNames = [ [], [], [], [], [], [], [] ];
dumpdoc.xmlItemsFunctionNames = [ [], [], [], [], [], [], [] ];
dumpdoc.xmlItemsNamespaceNames = [ [], [], [], [], [], [], [] ];
dumpdoc.xmlItemsClassNames = [ [], [], [], [], [], [], [] ];

dumpdoc.gtac = {};
dumpdoc.gtac.types = {
	Blip: 			['Transformable', 'Element'],
	Building:		['Entity', 'Transformable', 'Element'],
	Civilian:		['Ped', 'Physical', 'Entity', 'Transformable', 'Element'],
	Marker:			['Transformable', 'Element'],
	['Object']:		['Physical', 'Entity', 'Transformable', 'Element'],
	Pickup:			['Transformable', 'Element'],
	Player:			['Ped', 'Physical', 'Entity', 'Transformable', 'Element'],
	Train:			['Vehicle', 'Physical', 'Entity', 'Transformable', 'Element'],
	
	Ped:			['Physical', 'Entity', 'Transformable', 'Element'],
	Vehicle:		['Physical', 'Entity', 'Transformable', 'Element'],
	Physical:		['Entity', 'Transformable', 'Element'],
	Entity:			['Transformable', 'Element'],
	Transformable:	['Element']
};

// on page load
(() => {
	dumpdoc.xmlFileNames = arrayFlip2(dumpdoc.xmlFileNames);
})();

// utility
function arrayFlip2(arr)
{
	return Object.entries(arr).reduce((obj, [key, value]) => ({ ...obj, [value.toLowerCase()]: (parseInt(key) + 1) }), {});
}

function arrayFlip3(arr)
{
	return Object.entries(arr).reduce((obj, [key, value]) => ({ ...obj, [value.toLowerCase()]: true }), {});
}

function mergeArrayNoDuplicate(arr1, arr2)
{
	var keys1 = arrayFlip3(arr1);
	
	for(var i in arr2)
	{
		if(!keys1[arr2[i].toLowerCase()])
		{
			arr1.push(arr2[i]);
		}
	}
	
	return arr1;
}

function loadAjax(path, onload)
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function()
	{
		if (this.readyState == 4 && this.status == 200)
		{
			onload(xhttp);
		}
	};
	xhttp.open("GET", path, true);
	xhttp.send();
}

// form inputs
dumpdoc.onChooseXML = function(event, input, gameIndex)
{
	var endpointIndex = gameIndex >= 2 && gameIndex <= 4 ? 1 : gameIndex;
	
	dumpdoc.clearGame({
		gameIndex: gameIndex,
		endpointIndex: endpointIndex
	});
	
	let files = event.target.files;
	for(let i=0; i<files.length; i++)
	{
		let file = files[i];
		let fileIndex = dumpdoc.xmlFileNames[file.name.toLowerCase()];
		
		if(fileIndex)
		{
			const reader = new FileReader();
			reader.onload = event => {
				let fileData = event.target.result;
				
				let data = {
					gameIndex: gameIndex,
					fileIndex: fileIndex,
					endpointIndex: endpointIndex
				};
				
				dumpdoc.parseFile(fileData, data);
			};
			reader.onerror = error => reject(error);
			reader.readAsText(file);
		}
	}
}

dumpdoc.onClickFetchWiki = function(event, input, endpointId)
{
	dumpdoc.clearGame({
		gameIndex: 5 + endpointId,
		endpointIndex: endpointId
	});
	
	loadAjax("fetchwiki.php?endpoint="+endpointId, x => {
		//console.log(x.responseText);
		var json = JSON.parse(x.responseText);
		console.log(json);
		
		var gameId = 5 + endpointId;
		
		dumpdoc.parseWikiContent(gameId, json);
	});
}

dumpdoc.onClickCompare = function(endpointId)
{
	var endpointName = endpointId == 0 ? 'Server' : 'Client';
	var gameIds = [endpointId, 5 + endpointId];
	
	if(endpointId == 0)
	{
		if(dumpdoc.xmlItems[0][dumpdoc.FUNCTIONS - 1].length == 0)
		{
			alert('Please choose server XML files before comparing.');
			return;
		}
		if(dumpdoc.xmlItems[5][dumpdoc.FUNCTIONS - 1].length == 0)
		{
			alert('Please click server "Fetch Wiki" before comparing.')
			return;
		}
	}
	else
	{
		if(dumpdoc.xmlItems[1][dumpdoc.FUNCTIONS - 1].length == 0)
		{
			alert('Please choose client XML files for III before comparing.');
			return;
		}
		if(dumpdoc.xmlItems[2][dumpdoc.FUNCTIONS - 1].length == 0)
		{
			alert('Please choose client XML files for VC before comparing.');
			return;
		}
		if(dumpdoc.xmlItems[3][dumpdoc.FUNCTIONS - 1].length == 0)
		{
			alert('Please choose client XML files for SA before comparing.');
			return;
		}
		if(dumpdoc.xmlItems[4][dumpdoc.FUNCTIONS - 1].length == 0)
		{
			alert('Please choose client XML files for IV before comparing.');
			return;
		}
		if(dumpdoc.xmlItems[6][dumpdoc.FUNCTIONS - 1].length == 0)
		{
			alert('Please click client "Fetch Wiki" before comparing.')
			return;
		}
	}
	
	var [itemsMissingFromWiki, itemsMissingFromXml] = dumpdoc.compare(dumpdoc.xmlItemsMerged[endpointId][dumpdoc.FUNCTIONS - 1], dumpdoc.xmlItems[5 + endpointId][dumpdoc.FUNCTIONS - 1]);
	var [eventsMissingFromWiki, eventsMissingFromXml] = dumpdoc.compare(dumpdoc.xmlItemsMerged[endpointId][dumpdoc.EVENTS - 1], dumpdoc.xmlItems[5 + endpointId][dumpdoc.EVENTS - 1]);
	var [definesMissingFromWiki, definesMissingFromXml] = dumpdoc.compare(dumpdoc.xmlItemsMerged[endpointId][dumpdoc.DEFINES - 1], dumpdoc.xmlItems[5 + endpointId][dumpdoc.DEFINES - 1]);
	var [commandsMissingFromWiki, commandsMissingFromXml] = [[],[]];//dumpdoc.compare(dumpdoc.xmlItemsMerged[endpointId][dumpdoc.COMMANDS - 1], dumpdoc.xmlItems[5 + endpointId][dumpdoc.COMMANDS - 1]);
	
	var text = "";
	var mw = "";
	
	if(itemsMissingFromWiki.length > 0)
	{
		text += "<br><b>Missing from Wiki:<br>(vars, funcs, props, methods)</b><br><br>";
		for(var i in itemsMissingFromWiki)
			text += itemsMissingFromWiki[i]+"<br>";
		
		mw += 'Missing from Wiki:\n';
		mw += '(vars, funcs, props, methods)\n\n';
		for(var i in itemsMissingFromWiki)
			mw += '[['+itemsMissingFromWiki[i]+'|'+itemsMissingFromWiki[i]+"]]\n";
	}
	if(eventsMissingFromWiki.length > 0)
	{
		text += "<br><b>Missing from Wiki:<br>(events)</b><br><br>";
		for(var i in eventsMissingFromWiki)
			text += eventsMissingFromWiki[i]+"<br>";
		
		mw += '\n\nMissing from Wiki:\n';
		mw += '(events)\n\n';
		for(var i in eventsMissingFromWiki)
			mw += '[['+eventsMissingFromWiki[i]+'|'+eventsMissingFromWiki[i]+"]]\n";
	}
	if(definesMissingFromWiki.length > 0)
	{
		text += "<br><b>Missing from Wiki:<br>(defines)</b><br><br>";
		for(var i in definesMissingFromWiki)
			text += definesMissingFromWiki[i]+"<br>";
		
		mw += '\n\nMissing from Wiki:\n';
		mw += '(defines)\n\n';
		for(var i in definesMissingFromWiki)
			mw += definesMissingFromWiki[i]+"\n";
	}
	if(commandsMissingFromWiki.length > 0)
	{
		text += "<br><b>Missing from Wiki:<br>(commands)</b><br><br>";
		for(var i in commandsMissingFromWiki)
			text += commandsMissingFromWiki[i]+"<br>";
		
		mw += '\n\nMissing from Wiki:\n';
		mw += '(commands)\n\n';
		for(var i in commandsMissingFromWiki)
			mw += commandsMissingFromWiki[i]+"\n";
	}
	
	if(itemsMissingFromXml.length > 0)
	{
		text += "<br><b>Missing from XML:<br>(vars, funcs, props, methods)</b><br><br>";
		for(var i in itemsMissingFromXml)
			text += itemsMissingFromXml[i]+"<br>";
	}
	if(eventsMissingFromXml.length > 0)
	{
		text += "<br><b>Missing from XML:<br>(events)</b><br><br>";
		for(var i in eventsMissingFromXml)
			text += eventsMissingFromXml[i]+"<br>";
	}
	if(definesMissingFromXml.length > 0)
	{
		text += "<br><b>Missing from XML:<br>(defines)</b><br><br>";
		for(var i in definesMissingFromXml)
			text += definesMissingFromXml[i]+"<br>";
	}
	if(commandsMissingFromXml.length > 0)
	{
		text += "<br><b>Missing from XML:<br>(commands)</b><br><br>";
		for(var i in commandsMissingFromXml)
			text += commandsMissingFromXml[i]+"<br>";
	}
	
	if(text.length == 0)
		text = '100% match!';
	
	document.getElementById('compare_'+endpointId+'_list').innerHTML = text;	
	document.getElementById('compare_'+endpointId+'_wiki').value = mw;
};

dumpdoc.showCompareView = function(endpointId, viewId)
{
	var viewToShow = ['list','wiki'][viewId];
	var viewToHide = ['wiki','list'][viewId];
	document.getElementById('compare_'+endpointId+'_'+viewToHide).style.display = 'none';
	document.getElementById('compare_'+endpointId+'_'+viewToShow).style.display = 'block';
};

// view as format
dumpdoc.viewCSV = function()
{
	var types = ['Function', 'Event', 'Define', 'Command'];
	var lines = [];
	
	for(var endpointId=0; endpointId<2; endpointId++)
	{
		var endpointName = endpointId == 0 ? 'Server' : 'Client';
		
		for(var typeId=0; typeId<4; typeId++)
		{
			for(var i3 in dumpdoc.xmlItemsMerged[endpointId][typeId])
			{
				lines.push([
					endpointName,
					types[typeId],
					dumpdoc.xmlItemsMerged[endpointId][typeId][i3]
				].join(', '));
			}
		}
	}
	
	document.getElementById('format_output').value = lines.join("\n");
};

dumpdoc.viewTSV = function()
{
	var types = ['Function', 'Event', 'Define', 'Command'];
	var lines = [];
	
	for(var endpointId=0; endpointId<2; endpointId++)
	{
		var endpointName = endpointId == 0 ? 'Server' : 'Client';
		
		for(var typeId=0; typeId<4; typeId++)
		{
			for(var i3 in dumpdoc.xmlItemsMerged[endpointId][typeId])
			{
				lines.push([
					endpointName,
					types[typeId],
					dumpdoc.xmlItemsMerged[endpointId][typeId][i3]
				].join("\t"));
			}
		}
	}
	
	document.getElementById('format_output').value = lines.join("\n");
};

dumpdoc.viewINI = function()
{
	var types = ['Function', 'Event', 'Define', 'Command'];
	var lines = [];
	
	for(var endpointId=0; endpointId<2; endpointId++)
	{
		var endpointName = endpointId == 0 ? 'Server' : 'Client';
		
		for(var typeId=0; typeId<4; typeId++)
		{
			var section = '['+endpointName+types[typeId]+']';
			lines.push(section);
			
			for(var i3 in dumpdoc.xmlItemsMerged[endpointId][typeId])
			{
				lines.push([
					(parseInt(i3) + 1) + '',
					dumpdoc.xmlItemsMerged[endpointId][typeId][i3]
				].join("="));
			}
		}
	}
	
	document.getElementById('format_output').value = lines.join("\n");
};

dumpdoc.viewJSON = function()
{
	var types = ['Function', 'Event', 'Define', 'Command'];
	var json = {};
	
	for(var endpointId=0; endpointId<2; endpointId++)
	{
		var endpointName = endpointId == 0 ? 'Server' : 'Client';
		
		json[endpointName] = {};
		
		for(var typeId=0; typeId<4; typeId++)
		{
			var type = types[typeId];
			json[endpointName][type] = [];
			
			for(var i3 in dumpdoc.xmlItemsMerged[endpointId][typeId])
			{
				json[endpointName][type][i3] = dumpdoc.xmlItemsMerged[endpointId][typeId][i3];
			}
		}
	}
	
	document.getElementById('format_output').value = JSON.stringify(json);
};

dumpdoc.viewXML = function()
{
	var types = ['Function', 'Event', 'Define', 'Command'];
	var lines = [];
	var line;
	
	line = '<?xml version="1.0" ?>';
	lines.push(line);
	
	for(var endpointId=0; endpointId<2; endpointId++)
	{
		var endpointName = endpointId == 0 ? 'Server' : 'Client';
		
		line = '<'+endpointName+'>';
		lines.push(line);
		
		for(var typeId=0; typeId<4; typeId++)
		{
			var type = types[typeId];
			
			line = '\t<'+type+'s>';
			lines.push(line);
			
			for(var i3 in dumpdoc.xmlItemsMerged[endpointId][typeId])
			{
				line = '\t\t<'+type+' Name="'+dumpdoc.xmlItemsMerged[endpointId][typeId][i3]+'" />';
				lines.push(line);
			}
			
			line = '\t</'+type+'s>';
			lines.push(line);
		}
		
		line = '</'+endpointName+'>';
		lines.push(line);
	}
	
	document.getElementById('format_output').value = lines.join("\n");
};

dumpdoc.viewHTML = function()
{
	var types = ['Function', 'Event', 'Define', 'Command'];
	var lines = [];
	var line;
	
	lines.push('<!doctype html>');
	lines.push('<html>');
	lines.push('<head>');
	lines.push("<meta charset='utf-8'>");
	lines.push("<title>GTAC API HTML</title>");
	lines.push("</head>");
	lines.push("<body>");
	
	for(var endpointId=0; endpointId<2; endpointId++)
	{
		var endpointName = endpointId == 0 ? 'Server' : 'Client';
		
		line = '<div>';
		lines.push(line);
		
		line = '\t<h1>'+endpointName+'</h1>';
		lines.push(line);
		
		for(var typeId=0; typeId<4; typeId++)
		{
			var type = types[typeId];
			
			line = '\t<h2>'+type+'s</h2>';
			lines.push(line);
			
			line = '\t<ul>';
			lines.push(line);
			
			for(var i3 in dumpdoc.xmlItemsMerged[endpointId][typeId])
			{
				line = '\t\t<li>'+dumpdoc.xmlItemsMerged[endpointId][typeId][i3]+'</li>';
				lines.push(line);
			}
			
			line = '\t</ul>';
			lines.push(line);
		}
		
		line = '</div>';
		lines.push(line);
	}
	
	lines.push("</body>");
	lines.push("</html>");
	
	document.getElementById('format_output').value = lines.join("\n");
};

// data comparison
dumpdoc.compare = function(arr1, arr2)
{
	var keys1 = arrayFlip3(arr1);
	var keys2 = arrayFlip3(arr2);
	
	var missingFromArr1 = [];
	for(var i in arr2)
	{
		if(!keys1[arr2[i].toLowerCase()])
		{
			missingFromArr1.push(arr2[i]);
		}
	}
	
	var missingFromArr2 = [];
	for(var i in arr1)
	{
		if(!keys2[arr1[i].toLowerCase()])
		{
			missingFromArr2.push(arr1[i]);
		}
	}
	
	return [missingFromArr2, missingFromArr1];
};

// data parsing
dumpdoc.parseWikiContent = function(gameId, json)
{
	var items = dumpdoc.filterItems(json.items);
	for(var i in items)
	{
		dumpdoc.xmlItems[gameId][dumpdoc.FUNCTIONS - 1].push(items[i]);
	}
	//console.log(items);
	
	for(var i in json.events)
	{
		dumpdoc.xmlItems[gameId][dumpdoc.EVENTS - 1].push(json.events[i]);
	}
	
	var definesByName = {};
	for(var gameId2 in json.defines)
	{
		for(var i in json.defines[gameId2])
		{
			definesByName[json.defines[gameId2][i]] = true;
		}
	}
	for(var defineName in definesByName)
	{
		dumpdoc.xmlItems[gameId][dumpdoc.DEFINES - 1].push(defineName);
	}
	
	dumpdoc.updateServerStats({
		gameIndex: gameId
	});	
};

dumpdoc.filterItems = function(items)
{
	var itemsByName = {};
	for(var i in items)
	{
		itemsByName[items[i].toLowerCase()] = true;
	}
	
	return items.reduce((arr,item) => {
		var dotIndex = item.indexOf('.');
		if(dotIndex != -1)
		{
			var className = item.substr(0, dotIndex);
			var item2 = item.substr(dotIndex + 1);
			
			for(var derivedType in dumpdoc.gtac.types)
			{
				if(className.toLowerCase() == derivedType.toLowerCase())
				{
					var baseTypes = dumpdoc.gtac.types[derivedType];
					
					for(var i2 in baseTypes)
					{
						var baseType = baseTypes[i2];
						var item3 = baseType+'.'+item2;
						
						if(itemsByName[item3.toLowerCase()])
						{
							return arr;
						}
					}
				}
			}
		}
		
		arr.push(item);
		return arr;
	}, []);
};

dumpdoc.parseFile = function(fileData, data)
{
	//console.log(fileData);
	
	var parser = new DOMParser();
	var doc = parser.parseFromString(fileData, 'application/xml');
	
	dumpdoc.parseFile2(doc, data);
	
	dumpdoc.updateStats(data);
};

dumpdoc.parseFile2 = function(doc, data)
{
	switch(data.fileIndex)
	{
		case dumpdoc.FUNCTIONS:		return dumpdoc.parseDocumentationXML(doc, data);
		case dumpdoc.EVENTS:		return dumpdoc.parseEventsXML(doc, data);
		case dumpdoc.DEFINES:		return dumpdoc.parseDefinesXML(doc, data);
		case dumpdoc.COMMANDS:		return dumpdoc.parseCommandsXML(doc, data);
	}
};

dumpdoc.getResolvedItemName = function(item)
{
	var name = item.getAttribute('Name');
	item = item.parentNode;
	while(item)
	{
		if(!item.hasAttribute('Name'))
			break;
		var attr = item.getAttribute('Name');
		if(attr.toLowerCase() == 'global')
			break;
		
		name = item.getAttribute('Name')+'.'+name;
		
		if(item.tagName.toLowerCase() == 'class')
			break;
		
		item = item.parentNode;
	}
	return name;
};

dumpdoc.isSCM = function(name)
{
	if(name.substr(0, 4) != 'gta.')
		return false;
	
	name = name.substr(4);
	for(var i = 0, j = name.length; i < j; i++)
	{
		var chr = name.charCodeAt(i);
		
		if(!((chr >= 65 && chr <= 90) || chr == 95))
		{
			return false;
		}
	}
	
	return true;
};

dumpdoc.parseDocumentationXML = function(doc, data)
{
	var items = doc.querySelectorAll('Property,Function');
	var names;
	
	names = []
	for(var i in items)
	{
		if(items[i] instanceof Element)
		{
			var name = dumpdoc.getResolvedItemName(items[i]);
			
			if(!dumpdoc.isSCM(name))
				names.push(name);
		}
	}
	dumpdoc.xmlItems[data.gameIndex][data.fileIndex - 1] = names;
	dumpdoc.xmlItemsMerged[data.endpointIndex][data.fileIndex - 1] = mergeArrayNoDuplicate(dumpdoc.xmlItemsMerged[data.endpointIndex][data.fileIndex - 1], names);
	
	names = [];
	items = doc.querySelectorAll('Property');
	for(var i in items)
	{
		if(items[i] instanceof Element)
		{
			var name = dumpdoc.getResolvedItemName(items[i]);
			
			if(!dumpdoc.isSCM(name))
				names.push(name);
		}
	}
	dumpdoc.xmlItemsVariableNames[data.gameIndex] = names;
	
	names = []
	items = doc.querySelectorAll('Function');
	for(var i in items)
	{
		if(items[i] instanceof Element)
		{
			var name = dumpdoc.getResolvedItemName(items[i]);
			
			if(!dumpdoc.isSCM(name))
				names.push(name);
		}
	}
	dumpdoc.xmlItemsFunctionNames[data.gameIndex] = names;
	
	names = [];
	items = doc.querySelectorAll('Namespace');
	for(var i in items)
	{
		if(items[i] instanceof Element)
		{
			var name = items[i].getAttribute('Name');
			names.push(name);
		}
	}
	dumpdoc.xmlItemsNamespaceNames[data.gameIndex] = names;
	
	names = [];
	items = doc.querySelectorAll('Class');
	for(var i in items)
	{
		if(items[i] instanceof Element)
		{
			var name = items[i].getAttribute('Name');
			names.push(name);
		}
	}
	dumpdoc.xmlItemsClassNames[data.gameIndex] = names;
};

dumpdoc.parseEventsXML = function(doc, data)
{
	var events = doc.getElementsByTagName('EventTypes')[0].getElementsByTagName('EventType');
	var names = [];
	for(var i in events)
	{
		if(events[i] instanceof Element)
		{
			var name = events[i].getAttribute('Name');
			names.push(name);
		}
	}
	dumpdoc.xmlItems[data.gameIndex][data.fileIndex - 1] = names;
	dumpdoc.xmlItemsMerged[data.endpointIndex][data.fileIndex - 1] = mergeArrayNoDuplicate(dumpdoc.xmlItemsMerged[data.endpointIndex][data.fileIndex - 1], names);
};

dumpdoc.parseDefinesXML = function(doc, data)
{
	var defines = doc.getElementsByTagName('Defines')[0].getElementsByTagName('Define');
	var names = [];
	for(var i in defines)
	{
		if(defines[i] instanceof Element)
		{
			var name = defines[i].getAttribute('Name');
			names.push(name);
		}
	}
	dumpdoc.xmlItems[data.gameIndex][data.fileIndex - 1] = names;
	dumpdoc.xmlItemsMerged[data.endpointIndex][data.fileIndex - 1] = mergeArrayNoDuplicate(dumpdoc.xmlItemsMerged[data.endpointIndex][data.fileIndex - 1], names);
};

dumpdoc.parseCommandsXML = function(doc, data)
{
	var commands = doc.getElementsByTagName('Commands')[0].getElementsByTagName('Command');
	var names = [];
	for(var i in commands)
	{
		if(commands[i] instanceof Element)
		{
			var name = commands[i].getAttribute('Name');
			names.push(name);
		}
	}
	dumpdoc.xmlItems[data.gameIndex][data.fileIndex - 1] = names;
	dumpdoc.xmlItemsMerged[data.endpointIndex][data.fileIndex - 1] = mergeArrayNoDuplicate(dumpdoc.xmlItemsMerged[data.endpointIndex][data.fileIndex - 1], names);
};

// reset
dumpdoc.clearGame = function(data)
{
	dumpdoc.xmlItems[data.gameIndex] = [ [], [], [], [] ];
	
	dumpdoc.xmlItemsVariableNames[data.gameIndex] = [ [], [], [], [] ];
	dumpdoc.xmlItemsFunctionNames[data.gameIndex] = [ [], [], [], [] ];
	dumpdoc.xmlItemsNamespaceNames[data.gameIndex] = [ [], [], [], [] ];
	dumpdoc.xmlItemsClassNames[data.gameIndex] = [ [], [], [], [] ];
	
	dumpdoc.xmlItemsMerged[data.endpointIndex] = [ [], [], [], [] ];
	
	dumpdoc.updateStats(dumpdoc.FUNCTIONS);
	dumpdoc.updateStats(dumpdoc.EVENTS);
	dumpdoc.updateStats(dumpdoc.DEFINES);
	dumpdoc.updateStats(dumpdoc.COMMANDS);
};

// stats
dumpdoc.updateStats = function(data)
{
	switch(data.fileIndex)
	{
		case dumpdoc.FUNCTIONS:
			document.getElementById('item_count_'+data.gameIndex).textContent = dumpdoc.xmlItems[data.gameIndex][data.fileIndex - 1].length;
			if(document.getElementById('function_count_'+data.gameIndex) != null)
			{
				document.getElementById('function_count_'+data.gameIndex).textContent = dumpdoc.xmlItemsFunctionNames[data.gameIndex].length;
				document.getElementById('variable_count_'+data.gameIndex).textContent = dumpdoc.xmlItemsVariableNames[data.gameIndex].length;
				document.getElementById('namespace_count_'+data.gameIndex).textContent = dumpdoc.xmlItemsNamespaceNames[data.gameIndex].length;
				document.getElementById('class_count_'+data.gameIndex).textContent = dumpdoc.xmlItemsClassNames[data.gameIndex].length;
			}
		break;
		case dumpdoc.EVENTS:
			document.getElementById('event_count_'+data.gameIndex).textContent = dumpdoc.xmlItems[data.gameIndex][data.fileIndex - 1].length;
		break;
		case dumpdoc.DEFINES:
			document.getElementById('define_count_'+data.gameIndex).textContent = dumpdoc.xmlItems[data.gameIndex][data.fileIndex - 1].length;
		break;
		case dumpdoc.COMMANDS:
			//document.getElementById('command_count_'+data.gameIndex).textContent = dumpdoc.xmlItems[data.gameIndex][data.fileIndex - 1].length;
		break;
	}
}

dumpdoc.updateServerStats = function(data)
{
	dumpdoc.updateStats({...data, fileIndex: dumpdoc.FUNCTIONS});
	dumpdoc.updateStats({...data, fileIndex: dumpdoc.EVENTS});
	dumpdoc.updateStats({...data, fileIndex: dumpdoc.DEFINES});
	dumpdoc.updateStats({...data, fileIndex: dumpdoc.COMMANDS});
}


