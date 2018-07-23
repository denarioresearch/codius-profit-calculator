
let profitByChannel ={}
let profitByDate ={}
let data =[]
let addr=''
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
			if(result){
				data =result
				addr= $("#addr").val()		
				analyze()
			}
			
		}).fail(function(err){
			console.log(err);
		})
	
	
})

function analyze(){
	let days = constructProfitDates()
	getProfitByDate(days)
	getProfitByChannel()
	getProfitByChannelAndDate()
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


function getProfitByDate(daysArray){
	
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

function getProfitByChannelAndDate(){
	$('#channels-list').empty()
	for(channel in profitByChannel){
		let li = document.createElement("li")
		li.innerHTML = '<a href="#channels-list" id="'+channel+'"onClick="prepareProfitByChannelAndDateChart(this.id)">...'+channel.slice(-5)+'</a>'
		li.setAttribute("class", 'list-inline-item')
		document.getElementById('channels-list').appendChild(li)
	}

	prepareProfitByChannelAndDateChart(Object.keys(profitByChannel)[0])
	
	
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

function prepareProfitByChannelAndDateChart(channel){
	let profitByChannelAndDate={}
	let daysArray = constructProfitDates()
	for(day of daysArray){
		profitByChannelAndDate[day]={profit:0}
	}
	for (elem of data){
		if(elem.type ==='paymentChannelClaim' && 
			elem.outcome.result ==='tesSUCCESS' && 
			elem.outcome.balanceChanges[addr] &&
			daysArray.includes(elem.outcome.timestamp.split('T')[0]) &&
			elem.outcome.channelChanges.channelId === channel){

			for(tx of elem.outcome.balanceChanges[addr]){
				if(tx['currency'] === 'XRP' &&  parseFloat(tx['value']) <9){
					let val = parseFloat(tx['value'])
					profitByChannelAndDate[elem.outcome.timestamp.split('T')[0]]['profit']+=val
				}
			}
			

		}
	}
	populateProfitByChannelAndDateChart(channel, profitByChannelAndDate)
	
}
function populateProfitByChannelAndDateChart(channel, profitByChannelAndDate){
	let chartData=[]
	for(key in profitByChannelAndDate){
		chartData.push([key.slice(5), profitByChannelAndDate[key].profit])
	}
	chartData.push(['Date', 'channel# ...'+channel.slice(-5)])
	chartData =chartData.reverse()
	google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(()=>{
    	var data = google.visualization.arrayToDataTable(chartData)
    	var options = {
    		
	    	curveType: 'function',
	    	height: 340,
	    	legend: { position: 'bottom' }
        };
    	var chart = new google.visualization.LineChart(document.getElementById('profitByCahnnelAndDate_chart'));
    	 chart.draw(data, options);
    });
}
function getProfitByChannel(){
	
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

function populateChannelsTable(profitByChannel){
	var tableBody = document.getElementById('channels')
	$("#channels tr").remove(); 
    for(key in profitByChannel){
    	var tr=document.createElement("tr")
    	var channeltd = document.createElement("td")
    	var timestamptd = document.createElement("td")
    	var profittd = document.createElement("td")
    	var maxtd = document.createElement("td")
    	var mintd = document.createElement("td")


    	channeltd.innerHTML = '...'+key.slice(-5)
    	timestamptd.innerHTML =  profitByChannel[key].timestamp.split('.')[0].replace('T',' ')
    	profittd.innerHTML = profitByChannel[key].profit.toFixed(6)
    	maxtd.innerHTML = profitByChannel[key].max
    	mintd.innerHTML = profitByChannel[key].min

    	tr.appendChild(channeltd)
    	tr.appendChild(timestamptd)
    	tr.appendChild(profittd)
    	tr.appendChild(maxtd)
    	tr.appendChild(mintd)
    	tableBody.appendChild(tr)

    }

}