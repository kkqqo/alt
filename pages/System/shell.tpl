<div>
	<p>
		example:<br/>
		尋找text: grep text * -r
	</p>

</div>

<div>
	<input class='form-control' type='text' id='command' size='60' placeholder='輸入command,然後按enter'/>
</div>

<textarea class='form-control' id='result' style='width:100%' rows='40'></textarea>

<!-- START IGNORE -->
<script language="javascript">
$('#command').bind('keypress',function(e){
	var code = e.keyCode || e.which;
	if(code == 13) {
		$("#result").html("loading...");
		$.ajax({
			url:"System/shell/run",
			data:{cmd:$("#command").val()}
		}).done(function(result){
			$("#result").text(result);
		});
	}
});
</script>
<!-- END IGNORE -->