
$("#submit").on("click", function(event){

	
	    event.preventDefault();
		event.stopPropagation();
		$.ajax({
			url : "/submitaddr",
			type: "POST",
			contentType: "application/json",
			data: JSON.stringify({addr: $("#addr").val()}),
			beforeSend:function(){
				$("#loaderDiv").show()
				$("#submit").attr("disabled", "disabled")
				$("#addr").attr("disabled", "disabled")
			},
			success: function(){
				$("#loaderDiv").hide()
				$("#submit").removeAttr("disabled")
				$("#addr").removeAttr("disabled")
			}
		}).done(function(result){
						
			analyze(result, $("#addr").val())
		}).fail(function(err){
			console.log(err);
		})
	
	
})

function analyze(data, addr){
	let days = constructProfitDates()
	getProfitByDate(data, addr, days)
	//getProfitByChannelAndDate(data, addr, days)
	getProfitByChannel(data, addr)
}

function constructProfitDates(){
	let daysArray =[]
	let d = new Date();
	let endDay = d.getUTCDate()
	if(endDay.toString().length ===1){
		endDay= '0'+endDay
	}
	let endMonth = d.getUTCMonth() +1
	if(endMonth.toString().length ===1){
		endMonth= '0'+endMonth
	}
	let endYear = d.getUTCFullYear()

	let endDate = endYear+'-'+endMonth+'-'+endDay
	daysArray.push(endDate)
	for(i=0;i<30;i++){
		d.setDate(d.getDate() -1);
		endDay = d.getUTCDate()
		if(endDay.toString().length ===1){
			endDay= '0'+endDay
		}
		endMonth = d.getUTCMonth() +1
		if(endMonth.toString().length ===1){
			endMonth= '0'+endMonth
			
		}
		endYear = d.getUTCFullYear()
		endDate = endYear+'-'+endMonth+'-'+endDay
		daysArray.push(endDate)

	}
	return daysArray
}


function getProfitByDate(data, addr, daysArray){
	let profitByDate ={}
	for(day of daysArray){
		profitByDate[day]={profit:0}
	}
	for (elem of data){
		if(elem.type ==='paymentChannelClaim' && 
			elem.outcome.result ==='tesSUCCESS' && 
			elem.outcome.balanceChanges[addr] &&
			daysArray.includes(elem.outcome.timestamp.split('T')[0])){

			for(tx of elem.outcome.balanceChanges[addr]){
				if(tx['currency'] === 'XRP' &&  parseFloat(tx['value']) <9){
					let val = parseFloat(tx['value'])
					profitByDate[elem.outcome.timestamp.split('T')[0]]['profit']+=val
				}
			}
			

		}
	}
	populateProfitByDateChart(profitByDate)
}

function getProfitByChannelAndDate(data, addr, daysArray){
	let profitByChannelAndDate ={}
	for(day of daysArray){
		profitByChannelAndDate[day]={}
	}
	for (elem of data){
		if(elem.type ==='paymentChannelClaim' && 
			elem.outcome.result ==='tesSUCCESS' && 
			elem.outcome.balanceChanges[addr] &&
			daysArray.includes(elem.outcome.timestamp.split('T')[0])){

			for(tx of elem.outcome.balanceChanges[addr]){
				if(tx['currency'] === 'XRP' &&  parseFloat(tx['value']) <9){
					let val = parseFloat(tx['value'])
					if(!profitByChannelAndDate[elem.outcome.timestamp.split('T')[0]].hasOwnProperty(elem.outcome.channelChanges.channelId)){
						profitByChannelAndDate[elem.outcome.timestamp.split('T')[0]][elem.outcome.channelChanges.channelId]={profit:0}
					}
					profitByChannelAndDate[elem.outcome.timestamp.split('T')[0]][elem.outcome.channelChanges.channelId]['profit']+=val
				}
			}
			

		}
	}
	populateProfitByChannelAndDateChart(profitByChannelAndDate)
	
}

function populateProfitByDateChart(profitByDate){
	let chartData=[]
	for(key in profitByDate){
		chartData.push([key.slice(5), profitByDate[key].profit])
	}
	chartData.push(['Date', 'Profit'])
	chartData =chartData.reverse()
	
	google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(()=>{
    	var data = google.visualization.arrayToDataTable(chartData)
    	var options = {
          curveType: 'function',
          height: 340,
          legend: { position: 'bottom' }
        };
    	var chart = new google.visualization.LineChart(document.getElementById('profitByDate_chart'));
    	 chart.draw(data, options);
    });
}

function populateProfitByChannelAndDateChart(profitByChannelAndDate){
	let chartData=[]
	let channels=[]
	for(elem in profitByChannelAndDate){
		
		for(channel in profitByChannelAndDate[elem]){
			if(!channels.includes(channel) && profitByChannelAndDate[elem][channel]['profit'] >0){
				channels.push(channel)
			}
		}

	}
	console.log(channels)
	
	/*google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(()=>{
    	var data = google.visualization.arrayToDataTable(chartData)
    	var options = {
          curveType: 'function',
          height: 340,
          legend: { position: 'bottom' }
        };
    	var chart = new google.visualization.LineChart(document.getElementById('profitByCahnnelAndDate_chart'));
    	 chart.draw(data, options);
    }); */
}

function getProfitByChannel(data, addr){
	let profitByChannel ={}
	  	for (elem of data){
	  		if(elem.type ==='paymentChannelCreate' && elem.outcome.result ==='tesSUCCESS'){
	  			profitByChannel[elem.outcome.channelChanges.channelId]={profit:0,
	  															max:-Infinity,
	  															min:Infinity,
	  			 												timestamp: elem.outcome.timestamp}
	  		}

	  	}
	  	for(elem of data){
	  		if(elem.type ==='paymentChannelClaim' && elem.outcome.result ==='tesSUCCESS' &&elem.outcome.balanceChanges[addr]){
	  			for(tx of elem.outcome.balanceChanges[addr]){
	  				if(tx['currency'] === 'XRP'){
	  					let val = parseFloat(tx['value'])
	  					profitByChannel[elem.specification.channel]['profit']+= val
	  					if(val > profitByChannel[elem.specification.channel]['max']){
	  						profitByChannel[elem.specification.channel]['max'] =val
	  					}else if(val < profitByChannel[elem.specification.channel]['min']){
	  						profitByChannel[elem.specification.channel]['min'] =val
	  					}
	  				}
	  			}
	  		}
	  	}

	  	for (channel in profitByChannel){
	  		if(profitByChannel[channel].profit ===0 || profitByChannel[channel].max >9){
	  			delete profitByChannel[channel]
	  		}

	  	}
	  	let totalProfit=0
	  	for (channel in profitByChannel){
	  		totalProfit += profitByChannel[channel].profit
	  	}
	  	document.getElementById('total-profit').innerHTML=totalProfit.toFixed(6)
	
	populateChannelsTable(profitByChannel)
}

function populateChannelsTable(data){
	var tableBody = document.getElementById('channels')
	$("#channels tr").remove(); 
    for(key in data){
    	var tr=document.createElement("tr")
    	var channeltd = document.createElement("td")
    	var timestamptd = document.createElement("td")
    	var profittd = document.createElement("td")
    	var maxtd = document.createElement("td")
    	var mintd = document.createElement("td")


    	channeltd.innerHTML = '...'+key.slice(-5)
    	timestamptd.innerHTML =  data[key].timestamp.split('.')[0].replace('T',' ')
    	profittd.innerHTML = data[key].profit.toFixed(6)
    	maxtd.innerHTML = data[key].max
    	mintd.innerHTML = data[key].min

    	tr.appendChild(channeltd)
    	tr.appendChild(timestamptd)
    	tr.appendChild(profittd)
    	tr.appendChild(maxtd)
    	tr.appendChild(mintd)
    	tableBody.appendChild(tr)

    }

}