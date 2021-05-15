<!doctype html>

<html>

<head>
	<meta charset='utf-8'>
	<title>GTAC Wiki Tool</title>
	<link rel=stylesheet href='index.css'>
	<script src='index.js'></script>
</head>

<body>
	<table class=xml_table>
		<tr>
			<th>XML - Server</th>
			<th>XML - Client III</th>
			<th>XML - Client VC</th>
			<th>XML - Client SA</th>
			<th>XML - Client IV</th>
		</tr>
		<tr>
			<?php
			for($i=0; $i<5; $i++)
			{
				?>
				<td>
					<input type='file' multiple oninput='dumpdoc.onChooseXML(event, this, <?php echo $i; ?>)'><br><br>
					
					<span id='item_count_<?php echo $i ?>'>0</span> vars, funcs, props, or methods<br>
					<span id='event_count_<?php echo $i ?>'>0</span> events<br>
					<span id='define_count_<?php echo $i ?>'>0</span> defines<br><br>
					<!--
					<span id='command_count_<?php echo $i ?>'>0</span> commands<br><br>
					-->
					
					<span id='function_count_<?php echo $i ?>'>0</span> functions or methods<br>
					<span id='variable_count_<?php echo $i ?>'>0</span> variables or properties<br>
					<span id='namespace_count_<?php echo $i ?>'>0</span> namespaces<br>
					<span id='class_count_<?php echo $i ?>'>0</span> classes
				</td>
				<?php
			}
		?>
		</tr>
		<tr>
			<th>Wiki - Server</th>
			<th colspan='4'>Wiki - Client</th>
		</tr>
		<tr>
		<?php
			for($i2=0; $i2<2; $i2++)
			{
				$attr1 = $i2 == 1 ? " colspan='4'" : "";
				$i = $i2 == 0 ? 5 : 6;
				?>
				<td<?php echo $attr1; ?>>
					<input type='button' value='Fetch Wiki' onclick='dumpdoc.onClickFetchWiki(event, this, <?php echo $i2; ?>)'><br><br>
					
					<span id='item_count_<?php echo $i ?>'>0</span> vars, funcs, props, or methods<br>
					<span id='event_count_<?php echo $i ?>'>0</span> events<br>
					<span id='define_count_<?php echo $i ?>'>0</span> defines<br>
					<!--
					<span id='command_count_<?php echo $i ?>'>0</span> commands
					-->
				</td>
				<?php
			}
			?>
		</tr>
		<tr>
			<th colspan='5'>Convert All XMLs to Format</th>
		</tr>
		<tr>
			<th colspan='5'>
				<div>
					<input type='button' value='CSV' onclick='dumpdoc.viewCSV()'>
					<input type='button' value='HTML' onclick='dumpdoc.viewHTML()'>
					<input type='button' value='INI' onclick='dumpdoc.viewINI()'>
					<input type='button' value='JSON' onclick='dumpdoc.viewJSON()'>
					<input type='button' value='TSV' onclick='dumpdoc.viewTSV()'>
					<input type='button' value='XML' onclick='dumpdoc.viewXML()'>
					<!--
					|
					<input type='button' value='JSDoc'>
					<input type='button' value='Notepad++'>
					-->
				</div>
				<div>
					<textarea id='format_output'></textarea>
				</div>
			</th>
		</tr>
		<tr>
			<th colspan='5'>Compare XMLs with Wiki</th>
		</tr>
		<tr>
			<td colspan='2'>
				<input type='button' value='Compare Server XML with Wiki' onclick='dumpdoc.onClickCompare(0)'>
				<div class='compare_container'>
					<input type='button' value='List' onclick='dumpdoc.showCompareView(0, 0)'>
					<input type='button' value='MediaWiki Syntax' onclick='dumpdoc.showCompareView(0, 1)'>
					<div id='compare_0_list'></div>
					<textarea id='compare_0_wiki'></textarea>
				</div>
			</td>
			<td colspan='2'>
				<input type='button' value='Compare Client XML with Wiki' onclick='dumpdoc.onClickCompare(1)'>
				<div class='compare_container'>
					<input type='button' value='List' onclick='dumpdoc.showCompareView(1, 0)'>
					<input type='button' value='MediaWiki Syntax' onclick='dumpdoc.showCompareView(1, 1)'>
					<div id='compare_1_list'></div>
					<textarea id='compare_1_wiki'></textarea>
				</div>
			</td>
			<td></td>
		</tr>
	</table>
</body>

</html>