$().ready(function(){
	
		$.ajax({
			url : "/loadrating",
			type: "GET",
			contentType: "application/json",
			
			beforeSend:function(){
				
			},
			success: function(){
				
			}
		}).done(function(result){
			if(result){
				populateRatingTable(result)
			}
				
		}).fail(function(err){
			console.log(err);
		})
	
	
})


function populateRatingTable(data){
	let totalBody = document.getElementById('total-body')
	let monthBody = document.getElementById('month-body')
	let weekBody = document.getElementById('week-body')
	$("#total-body tr").remove(); 
	$("#month-body tr").remove(); 
	$("#week-body tr").remove(); 
	for(i=1;i<11;i++){
		let totaltr=document.createElement("tr")
		let monthtr=document.createElement("tr")
		let weektr=document.createElement("tr")
		let totalpos = document.createElement("td")
		let monthpos = document.createElement("td")
		let weekpos = document.createElement("td")
		let totalValue = document.createElement("td")
		let monthValue = document.createElement("td")
		let weekValue = document.createElement("td")

		totalpos.innerHTML =i
		monthpos.innerHTML =i
		weekpos.innerHTML =i
		totalValue.innerHTML = data.total[i-1]
		monthValue.innerHTML = data.month[i-1]
		weekValue.innerHTML = data.week[i-1]

		totaltr.append(totalpos)
		totaltr.append(totalValue)
		totalBody.append(totaltr)

		monthtr.append(monthpos)
		monthtr.append(monthValue)
		monthBody.append(monthtr)

		weektr.append(weekpos)
		weektr.append(weekValue)
		weekBody.append(weektr)
	}
}