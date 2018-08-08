$().ready(function(){
	
		$.ajax({
			url : "/loadaccounts",
			type: "GET",
			contentType: "application/json",
			
			beforeSend:function(){
				
			},
			success: function(){
				
			}
		}).done(function(result){
			if(result){
				prepareRatingTable(result)
				prepareDistributionChart(result)
				
			}
				
		}).fail(function(err){
			console.log(err);
		})
	
	
})

function prepareRatingTable(data){
	let rating = {total:[], month:[], week:[]}
	for(i=1;i<11;i++){
		for (elem of data){
			
			if(elem.total.rating === i){
				rating.total.push(elem.total.profit.toFixed(6))
			}
			if(elem.month.rating === i){
				rating.month.push(elem.month.profit.toFixed(6))
			}
			if(elem.week.rating === i){
				rating.week.push(elem.week.profit.toFixed(6))
			}
		}
	}
	populateRatingTable(rating)
}


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

function prepareDistributionChart(data){
	
	let totalTable=[['Accounts']]
	let monthTable=[['Accounts']]
	let weekTable=[['Accounts']]
	for(i=0;i<data.length;i++){
		totalTable.push([data[i].total.profit])
		monthTable.push([data[i].month.profit])
		weekTable.push([data[i].week.profit])
	}
	
	populateDistributionChart(totalTable, 0)
	populateDistributionChart(monthTable, 1)
	populateDistributionChart(weekTable, 2)
	
}

function populateDistributionChart(dataTable, id){
	google.charts.load("current", {packages:["corechart"]});
	let chartId
	switch(id){
		case 0: chartId = document.getElementById('total-hist')
		break
		case 1: chartId = document.getElementById('month-hist')
		break
		case 2: chartId = document.getElementById('week-hist')
		break
	}
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
    

        var options = {
        	colors: ['#4285F4'],
			histogram: {
				
				maxNumBuckets: 50,
			},
			
			hAxis: {
				title: 'Profit, XRP'
			},
			vAxis: {
				title: 'Users (count)'
			},
			legend: { position: 'none' },
        }

        var chart = new google.visualization.Histogram(chartId);
        chart.draw(google.visualization.arrayToDataTable(dataTable), options);
      }
}