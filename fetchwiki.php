<?php

$endpoint = isset($_GET['endpoint']) && $_GET['endpoint'] === '0' ? 0 : 1;

$url = $endpoint === 0 ? 'https://wiki.gtaconnected.com/Server/Functions' : 'https://wiki.gtaconnected.com/Client/Functions';
$urlContent = loadUrl($url);
$items = parseUrlContent($urlContent);

$url = $endpoint === 0 ? 'https://wiki.gtaconnected.com/Server/Events' : 'https://wiki.gtaconnected.com/Client/Events';
$urlContent = loadUrl($url);
$events = parseUrlContent($urlContent);

$urls = [
	'https://wiki.gtaconnected.com/Defines/III',
	'https://wiki.gtaconnected.com/Defines/VC',
	'https://wiki.gtaconnected.com/Defines/SA',
	'https://wiki.gtaconnected.com/Defines/IV'
];
$defines = [];
foreach($urls as &$url)
{
	$urlContent = loadUrl($url);
	$defines[] = parseDefines($urlContent);
}

echo json_encode([
	'items' => $items,
	'events' => $events,
	'defines' => $defines
]);

function loadUrl(&$url)
{
	$opts = array(
		'http' => array(
			'method' => 'GET',
			'header' => 'Accept-language: en'."\r\n"
		)
	);
	$context = stream_context_create($opts);
	$urlContent = file_get_contents($url, false, $context);
	if(strlen($urlContent) == 0)
		exit('URL download failed.');
	
	return $urlContent;
}

function parseUrlContent(&$urlContent)
{
	// parse page html
	$doc = new DOMDocument();
	$result = $doc->loadHTML($urlContent);
	if(!$result)
		exit('Parse HTML failed.');

	// find div container element
	$divs = $doc->getElementsByTagName('div');
	$divContainer = null;
	foreach($divs as $div)
	{
		if($div->getAttribute('class') == 'mw-parser-output')
		{
			$divContainer = $div;
			break;
		}
	}
	if(!$divContainer)
		exit('Div container not found in HTML.');
	
	// find items
	$items = [];
	$pTags = $divContainer->getElementsByTagName('p');
	foreach($pTags as $pTag)
	{
		$aTags = $pTag->getElementsByTagName('a');
		foreach($aTags as $aTag)
		{
			if(empty($aTag->getAttribute('title')))
			{
				continue;
			}
			
			$itemName = trim($aTag->nodeValue);
			if(strpos($itemName, ' ', 0) === false)
			{
				$items[] = $itemName;
			}
		}
	}
	
	return $items;
}

function parseDefines(&$urlContent)
{
	// parse page html
	$doc = new DOMDocument();
	$result = $doc->loadHTML($urlContent);
	if(!$result)
		exit('Parse HTML failed.');

	// find div container element
	$divs = $doc->getElementsByTagName('div');
	$divContainer = null;
	foreach($divs as $div)
	{
		if($div->getAttribute('class') == 'mw-parser-output')
		{
			$divContainer = $div;
			break;
		}
	}
	if(!$divContainer)
		exit('Div container not found in HTML.');
	
	// find items
	$items = [];
	$tableTags = $divContainer->getElementsByTagName('table');
	foreach($tableTags as $tableTag)
	{
		if($tableTag->getAttribute('class') != 'wikitable sortable')
		{
			continue;
		}
		
		$thCount = count($tableTag->getElementsByTagName('tr')[0]->getElementsByTagName('th'));
		
		$tdTags = $tableTag->getElementsByTagName('td');
		$tdIndex = 0;
		foreach($tdTags as $tdTag)
		{
			if(($tdIndex % $thCount) != 0)
			{
				$tdIndex++;
				continue;
			}
			
			$itemName = trim($tdTag->nodeValue);
			
			$spaceIndex = strpos($itemName, ' ', 0);
			if($spaceIndex !== false)
			{
				$itemName = substr($itemName, 0, $spaceIndex);
			}
			
			$items[] = $itemName;
			
			$tdIndex++;
		}
	}
	
	return $items;
}

