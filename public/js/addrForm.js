$().ready(function(){
	$("#addrForm").validate({
		rules:{
			addr:{
				required:true,
				addrValid:true
			}
		},
		messages:{
			addr: "Invalid XRP address"
		}
	})
})

jQuery.validator.addMethod("addrValid", function(addr){
	return WAValidator.validate($("#addr").val(), 'XRP')
}, "Invalid XRP address")