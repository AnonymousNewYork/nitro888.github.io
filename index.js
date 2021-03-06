let contracts	= new function() {
	this.start		= function() {
		contracts.create('nitrotoken');	// todo : temp
		contracts.create('jackpot649');
		contracts.create('lotto49');
		contracts.create('lotto525');
		contracts.create('baccarat');
		contracts.create('dragontiger');
		contracts.create('highlow');
	},
	this.create		= function(game) {
		for(let i=0;i<CONFIG[game]['address'].length;i++) {
			CONFIG[game]['contracts'][CONFIG[game]['address'][i]]	= new wallet.web3.eth.Contract(CONFIG[game]['abi'],CONFIG[game]['address'][i]);
			if(WALLET['type']!="http")
				CONFIG[game]['contracts'][CONFIG[game]['address'][i]].events.eventUpdate(console.log); // todo : test
		}
	},
	this.information		= function(game,address,callback) {
		if(CONFIG[game]['contracts'][address]!=null)
			CONFIG[game]['contracts'][address].methods.information().call((e,r)=>{
				if (!e){
					CONFIG[game]['prices'][address]	= parseInt(r[4]);
					if(game=='jackpot649')
						callback(game,address,r,0);
					else
						CONFIG['nitrotoken']['contracts'][CONFIG['nitrotoken']['address'][0]].methods.serviceState(address).call((e,rate)=>{	// todo : temp
								callback(game,address,r,rate);
						});
				}
			});
	},
	this.historyLotto				= function(game,address,callback) {
		let index		= (game=='jackpot649'?17:16);
		let topic0	= CONFIG[game]['abi'][index]['signature'];

		wallet.getLogs(address,topic0,(logs)=>{
			let list 	= new Array();

			for(let i=0;i<logs.length;i++)
				list.push(wallet.web3.eth.abi.decodeLog(CONFIG[game]['abi'][index]['inputs'],logs[i].data,logs[i].topics));
			callback(list);
		});
	},
	this.bet	= function(game,address,slots,password,callback) {
		if(CONFIG[game]['contracts'][address]!=null) {
			let amount= CONFIG[game]['prices'][address]*slots.length;
			let data	= CONFIG[game]['contracts'][address].methods.bet(slots).encodeABI();
			if(!wallet.sendTransaction(address,password,amount,data)) {
				callback();
				modal.alert('Password is wrong.');
			}
		}
	}
}

let page		= new function() {
	this.start				= function() {
		page.startLotto('jackpot649','#historyJackpot649',3,7,7);
		page.startLotto('lotto49','#historyLotto49',6,3,3);
		page.startLotto('lotto525','#historyLotto525',4,5,5);
		page.startCasino('baccarat','#historyBaccarat');
		page.startCasino('dragontiger','#historyDragonTiger');
		page.startCasino('highlow','#historyHighLow');
	},
	this.startLotto			= function(game,id,col,x,y) {
		let body		= '';
		let address	= CONFIG[game]['address'][0];

		body	+='<table style="width:100%"><tr><td id="rnd_'+game+'_'+address+'" class="h4">Round</td><td style="float:right;"><small id="btn_'+game+'_'+address+'"></small></td></tr></table>';
		body	+="<div class='row'>";
		for(let i=0 ; i < col ; i++) {
			body		+='<div class="col-md-'+(12/col)+' panel"><div><small id="round_'+game+'_'+address+'_'+i+'">Round</small></div><div class="card-text">';
			body		+='<table class="border border-secondary" style="width:100%;border-collapse: collapse;">';
			for(let j=0 ; j < y ; j++) {
				body+='<tr>';
				for(let k=0 ; k < x ; k++)
					if((j*x+k)%2==0)
						body+="<td style='align-middle;' bgcolor='#DEDEDE'><div align='center' valign='middle' id='"+game+'_'+address+"_"+i+"_"+(j*x+k)+"'>"+util.getNumCircle('&nbsp',0)+"</div></td>";
					else
						body+="<td style='align-middle;' class='bg-light'><div align='center' valign='middle' id='"+game+'_'+address+"_"+i+"_"+(j*x+k)+"'>"+util.getNumCircle('&nbsp',0)+"</div></td>";
				body+='</tr>';
			}
			body	+='</table></div></div>';
		}
		body	+='</div>';
		body	+='<div><table style="width:100%"><tr><td><small id="bal_'+game+'_'+address+'"></small></td><td style="float:right;"><small style="float:right;" id="price_'+game+'_'+address+'"></small></td></tr></table></div>';

		$(id).html(body);
	},
	this.startCasino			= function(game,id) {
		let body		= '';

		for(let k=0;k<CONFIG[game]['address'].length;k++) {
			let address	= CONFIG[game]['address'][k];

			body	+='<table style="width:100%"><tr><td id="rnd_'+game+'_'+address+'" class="h4">Round</td><td style="float:right;"><small id="btn_'+game+'_'+address+'"></small></td></tr></table>';
			body	+="<div style='overflow-x:auto;'><table class='border border-secondary'>";
			for(let i = 0 ; i < util.historyRow ; i ++){
				body +="<tr>";
				for(let j = 0 ; j < util.historyCol ; j++)
					if((i*3+j)%2==0)
						body	+="<td class='align-middle' bgcolor='#DEDEDE'><div style='width:16px;' id='history_"+game+'_'+address+"_"+j+"_"+i+"' align='center'>&nbsp</div></td>";
					else
						body	+="<td class='align-middle bg-light'><div style='width:16px;' id='history_"+game+'_'+address+"_"+j+"_"+i+"' align='center'>&nbsp</div></td>";
				body	+="</tr>";
			}
			body	+="</table></div>";
			body	+='<div><table style="width:100%"><tr><td><small id="bal_'+game+'_'+address+'"></small></td><td style="float:right;"><small style="float:right;" id="price_'+game+'_'+address+'"></small></td></tr></table></div>';
		}

		$(id).html(body);
	},
	this.openInfo		= function(game,address) {
		modal.update(CONFIG[game]['name'],'Now Loading...');
		contracts.information(game,address,util.updateInformation);
	},
	this.splitLottoNumber	= function (number) {
		let temp0	= (new wallet.web3.utils.BN(number)).toString(2);
		let temp1	= temp0.substring(0,temp0.length-64);
		let temp2	= temp0.substring(temp0.length-64,temp0.length);
		return [temp1,temp2];
	},
	this.openLottoHistory	= function (game,address) {
		contracts.historyLotto(game,address,(logs)=>{
			if(logs.length==0) {
				modal.update('History','History is empty...');
			} else {
				let table	= "<div style='overflow-x:auto;'><table class='table table-striped table-hover'><tbody>";

				for(let i = logs.length-1; i >-1  ;i--) {

					let temp	= page.splitLottoNumber(logs[i][1]);
					let prize	= '';
					let bonus	= '';

					for(let j = temp[0].length-1,k=1 ; j >=0 ; j--,k++ )
						prize += temp[0][j]=='1'?util.getNumCircle(k):'';
					for(let j = temp[1].length-1,k=1 ; j >=0 ; j--,k++ )
						bonus += temp[1][j]=='1'?util.getNumCircle(k,1,true):'';

					table	+="<tr><td><div><center><small>R."+parseInt(logs[i][0])+"</small></center></div><div><td>"+prize+"&nbsp"+bonus+"</td></tr>";
				}
				table		+= "</tbody></table></div>";
				modal.update('History',table);
			}
		});
		wallet.updateTimer(true);
	},
	this.updateLottoHistory		= function(game,address,data) {
		let coin	= (game=='jackpot649'?wallet.coins[1]['name']:wallet.coins[0]['name']);

		$('#bal_'+game+'_'+address).html("Balance : "+wallet.web3.utils.fromWei(parseInt(data[3]).toString(),'ether')+wallet.coins[0]['name']);

		if(!util.stateBackup[address]) {
			$('#btn_'+game+'_'+address).html(util.updateBtn(game,address));
			$('#price_'+game+'_'+address).html("Bet : "+wallet.web3.utils.fromWei(parseInt(data[4]).toString(),'ether')+coin);
			util.stateBackup[address]	= {'round':data[0],'state':data[1],'wallet':wallet.state()};
		}
		else if(util.stateBackup[address]['round']	== data[0] && util.stateBackup[address]['state']	== data[1] && util.stateBackup[address]['wallet']	== wallet.state())
			return;

		$('#btn_'+game+'_'+address).html(util.updateBtn(game,address));
		$('#price_'+game+'_'+address).html("Bet : "+wallet.web3.utils.fromWei(parseInt(data[4]).toString(),'ether')+coin);
		$('#rnd_'+game+'_'+address).html("Round "+parseInt(data[0])+'<small> ('+util.getGameState(parseInt(data[1]))+')</small>');

		contracts.historyLotto(game,address,(logs)=>{
			let maxCol		= util.getLottoMaxMarkCol(game);
			for(let i = (logs.length>maxCol.col ? logs.length-maxCol.col : 0), k = 0 ; i < logs.length ; i++,k++)  {
				$('#round_'+game+'_'+address+'_'+k).html("Round "+logs[i][0]);
				let temp	= page.splitLottoNumber(logs[i][1]);
				for(let j = 0 ; j < maxCol.max ; j++)
					$('#'+game+'_'+address+'_'+k+'_'+j).html(util.getNumCircle(1+j,0.2));
				for(let j = temp[0].length-1,l=0 ; j >=0  ; j--,l++ )
					temp[0][j]=='1'?$('#'+game+'_'+address+'_'+k+'_'+l).html(util.getNumCircle(1+l)):'';
				for(let j = temp[1].length-1,l=0 ; j >=0  ; j--,l++ )
					temp[1][j]=='1'?$('#'+game+'_'+address+'_'+k+'_'+l).html(util.getNumCircle(1+l,1,true)):'';
			}
		});
	},
	this.ticket	= function (game,address,max,mark) {
		let col			= 4;

		let tickets	= '<table class="table">';
		tickets			+='<thead><tr>';
		for(let i=0;i<col;i++)
			tickets		+='<th scope="col"><center>Ticket '+(i+1)+'</center></th>';
		tickets			+='</tr></thead>';

		tickets			+='<tbody>';
		for(let j=0;j<max+1;j++) {
			tickets			+='</tr>';
			for(let k=0;k<col;k++)
				if(j==max)
					tickets		+='<td><center><button type="button" class="btn btn-secondary btn-sm" onClick="util.ticketLottoRandom('+k+','+max+','+mark+')">RANDOM</button></center></td>';
				else
					tickets		+='<td><center><div class="checkbox"><input type="checkbox" id="t'+k+'_'+j+'" onClick="return util.ticketLottoMark('+k+','+max+','+mark+')"> '+(j+1)+'</div></center></td>';
			tickets		+='</tr>';
		}
		tickets	+='</tbody>';
		tickets	+='</table>';

		tickets	+='<div class="input-group"><div class="input-group-prepend"><span class="input-group-text"><i class="material-icons">lock</i></span></div><input id="buyTicketPass-'+game+'" type="password" class="form-control" placeholder="Password" aria-label="Buy Ticket Password"></div>';

		modal.update('Ticket '+CONFIG[game]['name'],tickets,'page.ticketBuy(\''+game+'\','+col+','+max+','+mark+')');
		wallet.updateTimer(true);
	},
	this.ticketBuy=function(game,col,max,mark) {
		modal.alert('');
		wallet.updateTimer(true);

		let buyTicket = [];

		for(let i=0;i<col;i++) {
			if(util.ticketLottoMarkCount(i,max)==mark) {
				buyTicket.push(Array());
				for(let j=0;j<max;j++)
					if($('#t'+i+'_'+j).prop('checked'))
						buyTicket[buyTicket.length-1].push(j);
			}
		}

		let password		= $('#buyTicketPass-'+game).val();
		let contract		= CONFIG[game]['contracts'][CONFIG[game]['address'][0]];

		if(password=='')
			modal.alert('Password is empty.');
		else if (buyTicket.length==0)
			modal.alert('Marking please.');
		else {
			let privateKey	= wallet.getPrivateKeyString(password);
			if(privateKey==null)
				modal.alert('Password is wrong.');
			else {
				let coin		= (game=='jackpot649'?1:0);

				wallet.updateBalance(coin,()=>{

					let address	= CONFIG[game]['address'][0];
					let price 	= CONFIG[game]['prices'][address];

					if(wallet.coins[coin]['balance']<(buyTicket.length*price))
						modal.alert('Balance is too low.');
					else
						contracts.information(game,address,(_game,_address,_data)=>{
							if((parseInt(_data[1])!=1)) {
								modal.alert('Counter is not open!');
							} else {
								let tickets	= [];
								for(let i=0;i<buyTicket.length;i++) {
									let t = 0;
									for(let j=0;j<buyTicket[i].length;j++)
										t	+= (1<<buyTicket[i][j]);
									tickets.push(t);
								}
								contracts.bet(_game,_address,tickets,password,()=>{});
							}
						});
				});
			}
		}
	},
	this.play		= function(game,address) {
		wallet.updateTimer(true);
		location.href	= location.origin+'/game/?g='+game+'&a='+address;
	}
}

// main
let UPDATE = function () {
	for(let i = 0 ; i < CONFIG['jackpot649']['address'].length ; i++)	contracts.information('jackpot649',CONFIG['jackpot649']['address'][i],page.updateLottoHistory);
	for(let i = 0 ; i < CONFIG['lotto49']['address'].length ; i++)		contracts.information('lotto49',CONFIG['lotto49']['address'][i],page.updateLottoHistory);
	for(let i = 0 ; i < CONFIG['lotto525']['address'].length ; i++)		contracts.information('lotto525',CONFIG['lotto525']['address'][i],page.updateLottoHistory);
	for(let i = 0 ; i < CONFIG['baccarat']['address'].length ; i++)		contracts.information('baccarat',CONFIG['baccarat']['address'][i],util.updateCasino);
	for(let i = 0 ; i < CONFIG['dragontiger']['address'].length;i++)	contracts.information('dragontiger',CONFIG['dragontiger']['address'][i],util.updateCasino);
	for(let i = 0 ; i < CONFIG['highlow']['address'].length ; i++)		contracts.information('highlow',CONFIG['highlow']['address'][i],util.updateCasino);
}
$.getJSON('config.json', (data)=>{
	if(data!=null) {
		CONFIG							= data;

		wallet.start(UPDATE);
		page.start();
		contracts.start();

		UPDATE();
	}
});
//main
