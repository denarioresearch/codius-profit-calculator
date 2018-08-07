
let profitByChannel ={}
let profitByDate ={}
let data =[]
let addr=''
$().ready(function(){
	addr = window.location.href.split('analyze/')[1]
	if(addr.includes('#')){
		addr=addr.split('#')[0]
	}
	if(addr){
		document.getElementById('addr').value=addr
	
	
		$.ajax({
			url : "/loaddata",
			type: "GET",
			contentType: "application/json",
			data: {addr: addr},
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
				data =result.profitData	
				if(result.rating){
					setRating(result.rating)
				}
				analyze()
			}
				
		}).fail(function(err){
			console.log(err);
		})
	}
	
})


function analyze(){
	let days = constructProfitDates()
	getProfitByDate(days)
	getProfitByChannel()
	getProfitByChannelAndDate()
	getLargestAndSmallextTx()
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
	$('#chart-channels-list').empty()
	for(channel in profitByChannel){
		let li = document.createElement("li")
		li.innerHTML = '<a href="#chart-channels-list" id="'+channel+'"onClick="prepareProfitByChannelAndDateChart(this.id)">...'+channel.slice(-5)+'</a>'
		li.setAttribute("class", 'list-inline-item')
		document.getElementById('chart-channels-list').appendChild(li)
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
	if(channel){
		chartData.push(['Date', 'channel# ...'+channel.slice(-5)])
	}
	
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

function getLargestAndSmallextTx(){
	$('#table-channels-list').empty()
	for(channel in profitByChannel){
		let li = document.createElement("li")
		li.innerHTML = '<a href="#table-channels-list" id="'+channel+'"onClick="prepareLargestAndSmallextTxTable(this.id)">...'+channel.slice(-5)+'</a>'
		li.setAttribute("class", 'list-inline-item')
		document.getElementById('table-channels-list').appendChild(li)
	}
	prepareLargestAndSmallextTxTable(Object.keys(profitByChannel)[0])
}

function prepareLargestAndSmallextTxTable(channel){
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

	todayTx=[]
	for (elem of data){
		if(elem.type ==='paymentChannelClaim' && 
			elem.outcome.result ==='tesSUCCESS' && 
			elem.outcome.balanceChanges[addr] &&
			elem.outcome.timestamp.split('T')[0] ===endDate  &&
			elem.outcome.channelChanges.channelId === channel){

			for(tx of elem.outcome.balanceChanges[addr]){
				if(tx['currency'] === 'XRP' &&  parseFloat(tx['value']) <9){
					todayTx.push([elem.outcome.timestamp.split('T')[1].split('.')[0], parseFloat(tx['value'])])
					
				}
			}

		}
	}
	let topLargestTx = todayTx.sort(function(a,b){
	    return b[1] - a[1];
	});
	topLargestTx=topLargestTx.slice(0,5)

	let topSmallestTx = todayTx.sort(function(a,b){
	    return a[1] - b[1];
	});
	topSmallestTx =topSmallestTx.slice(0,5)
	populateLargestAndSmallextTxTable(channel, topLargestTx,topSmallestTx )

}

function populateLargestAndSmallextTxTable(channel, topLargestTx,topSmallestTx ){
	let tableBody = document.getElementById('tx-body')
	$("#tx-body tr").remove(); 
	if(channel){
		document.getElementById('tx-caption').innerHTML='channel# ...'+channel.slice(-5)
	}
	
	if(topLargestTx.length>0 && topSmallestTx.length>0){
		for(i=0;i<topLargestTx.length;i++){
			var tr=document.createElement("tr")
			var lTime = document.createElement("td")
			var lValue = document.createElement("td")
			var sTime = document.createElement("td")
			var sValue = document.createElement("td")

			lTime.innerHTML=topLargestTx[i][0]
			lValue.innerHTML=topLargestTx[i][1]
			sTime.innerHTML=topSmallestTx[i][0]
			sValue.innerHTML=topSmallestTx[i][1]

			tr.appendChild(lTime)
	    	tr.appendChild(lValue)
	    	tr.appendChild(sTime)
	    	tr.appendChild(sValue)
	    	
	    	tableBody.appendChild(tr)
		}
	}else{
		var tr=document.createElement("tr")
		var noData = document.createElement("td")
		noData.innerHTML='No data for this channel'
		noData.setAttribute('colspan', 4)
		tr.appendChild(noData)
    	
    	
    	tableBody.appendChild(tr)
	}

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

function setRating(rating){
	$("#personal-rating").show()
	document.getElementById('total-rating').innerHTML = rating.totalRating
	document.getElementById('month-rating').innerHTML = rating.monthRating
	document.getElementById('week-rating').innerHTML = rating.weekRating

	document.getElementById('total-perf').innerHTML = rating.totalPerf
	document.getElementById('month-perf').innerHTML = rating.monthPerf
	document.getElementById('week-perf').innerHTML = rating.weekPerf
}