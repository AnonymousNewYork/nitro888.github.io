let contracts	= new function() {
	this.start		= function() {
		contracts.create('lotto953');
		contracts.create('lotto645');
		contracts.create('baccarat');
		contracts.create('dragonTiger');
		contracts.create('highLow');
	},
	this.create		= function(game) {
		for(let i=0;i<CONFIG[game]['address'].length;i++)
			CONFIG[game]['contracts'][CONFIG[game]['address'][i]]	= new wallet.web3.eth.Contract(CONFIG[game]['abi'],CONFIG[game]['address'][i]);
	},
	this.info		= function(game,address,callback) {
		if(CONFIG[game]['contracts'][address]!=null)
			CONFIG[game]['contracts'][address].methods.info1(storage.address).call((e,r)=>{
				if (!e){
					let lastState																			= CONFIG[game]['informations'][address]?[CONFIG[game]['informations'][address][0],CONFIG[game]['informations'][address][1]]:null;
					CONFIG[game]['informations'][address]							= r;
					CONFIG[game]['informations'][address]['lastState']= lastState;
					CONFIG[game]['contracts'][address].methods.info0().call((e,r)=>{if(!e){CONFIG[game]['informations'][address]['info0']=r;callback(game,address,CONFIG[game]['informations'][address]);}})
				}
			});
	},
	this.infoArray	= function(game,address,callback) {
		for(let i=0;i<address.length;i++)
			contracts.info(game,address[i],callback);
	},
	this.bet	= function(game,address,slots,password,callback) {
		if(CONFIG[game]['contracts'][address]!=null) {
			let amount= wallet.web3.utils.fromWei((parseInt(CONFIG[game]['informations'][address]['info0'][1])*slots.length).toString(),'ether');
			let data	= CONFIG[game]['contracts'][address].methods.bet(slots).encodeABI();
			if(!wallet.sendTransaction(address,password,amount,data)) {
				callback();
				modal.alert('<div class="alert alert-warning" role="alert">Password is wrong</div>');
			}
		}
	}
}

let page		= new function() {
	this.start				= function() {
		page.startLotto('lotto953','#historyLotto935',6,3,3);
		page.startLotto('lotto645','#historyLotto645',3,7,7);
		page.startCasino('baccarat','#historyBaccarat');
		page.startCasino('dragonTiger','#historyDragonTiger');
		page.startCasino('highLow','#historyHighLow');
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
	this.updateBtn			= function(game,address) {
		let btn		= '<button data-toggle="modal" data-target="#modlg" type="button" class="btn btn-link btn-sm text-secondary" onClick="page.openInfo(\''+game+'\',\''+address+'\')"><i class="material-icons" style="font-size:20px;">announcement</i></button>';

		// todo : for more lotto
		switch(game) {
		case 'lotto953':
		case 'lotto645':
			let maxMark = util.getLottoMaxMarkCol(game);
			btn	='<button data-toggle="modal" data-target="#modlg" type="button" class="btn btn-link btn-sm text-secondary" onClick="page.showLottoHistory(\''+game+'\',\''+address+'\')"><i class="material-icons" style="font-size:20px;">history</i></button>'+btn;
			if(wallet.state()==2)
				btn	='<button data-toggle="modal" data-target="#modlg" type="button" class="btn btn-link btn-sm text-secondary" onClick="page.ticket(\''+game+'\',\''+address+'\','+maxMark.max+','+maxMark.mark+')"><i class="material-icons" style="font-size:20px;">create</i></button>'+btn;
			break;
		default:
			if(wallet.state()==2)
				btn	='<button type="button" class="btn btn-link btn-sm text-secondary" onClick="page.play(\''+game+'\',\''+address+'\')"><i class="material-icons" style="font-size:20px;">create</i></button>'+btn;
			break;
		}
		// todo : for more lotto

		return	btn;
	},
	this.openInfo		= function(game,address) {
		modal.update(CONFIG[game]['name'],'Now Loading...');
		contracts.info(game,address,util.updateInformationModal);
	},
	this.updateLottoHistory	= function(game,address,callback) {
		wallet.getLogs(address,(logs)=>{
			let list = new Array();
			for(let i=0;i<logs.length;i++)
				list.push(wallet.web3.eth.abi.decodeLog(CONFIG[game]['abi'][6]['inputs'],logs[i].data,logs[i].topics));
			callback(list);
		});
	},
	this.splitLottoNumber	= function (number) {
		let temp0	= (new wallet.web3.utils.BN(number)).toString(2);
		let temp1	= temp0.substring(0,temp0.length-64);
		let temp2	= temp0.substring(temp0.length-64,temp0.length);
		return [temp1,temp2];
	},
	this.showLottoHistory	= function (game,address) {
		page.updateLottoHistory(game,address,(logs)=>{
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
	this.updateLotto		= function(game,address,data) {
		$('#rnd_'+game+'_'+address).html("Round "+parseInt(data[0])+'<small> ('+util.getGameState(parseInt(data[1]))+')</small>');
		$('#btn_'+game+'_'+address).html(page.updateBtn(game,address));
		$('#price_'+game+'_'+address).html("Ticket : "+wallet.web3.utils.fromWei(parseInt(data['info0'][1]).toString(),'ether')+" E");
		$('#bal_'+game+'_'+address).html("Balance : "+wallet.web3.utils.fromWei(parseInt(data['info0'][0]).toString(),'ether')+" E");

		if(data.lastState&&(parseInt(data.lastState[0])==parseInt(data[0])))
			return;

		page.updateLottoHistory(game,address,(logs)=>{

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
	this.updateCasino	= function(game,address,data) {
		$('#btn_'+game+'_'+address).html(page.updateBtn(game,address));
		$('#price_'+game+'_'+address).html("Bet : "+wallet.web3.utils.fromWei(parseInt(data['info0'][1]).toString(),'ether')+" E");
		$('#bal_'+game+'_'+address).html("Balance : "+wallet.web3.utils.fromWei(parseInt(data['info0'][0]).toString(),'ether')+" E");
		util.updateCasino(game,address,data);
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
			modal.alert('<div class="alert alert-warning" role="alert">Password is empty</div>');
		else if (buyTicket.length==0)
			modal.alert('<div class="alert alert-warning" role="alert">Marking please.</div>');
		else {
			let privateKey	= wallet.getPrivateKeyString(password);
			if(privateKey==null)
				modal.alert('<div class="alert alert-warning" role="alert">Password is wrong</div>');
			else {
				wallet.updateBalance(()=>{

					let address	= CONFIG[game]['address'][0];
					let price 	= parseInt(CONFIG[game]['informations'][address]['info0'][1]);

					if(wallet.balance<(buyTicket.length*price))
						modal.alert('<div class="alert alert-warning" role="alert">Balance is too low</div>');
					else
						contracts.info(game,address,(_game,_address,_data)=>{
							if((parseInt(_data[1])!=1)) {
								modal.alert('<div class="alert alert-warning" role="alert">Counter is not open!</div>');
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
	contracts.infoArray('lotto953',		CONFIG['lotto953']['address'],	(_game,_contract,_data)=>{page.updateLotto(_game,_contract,_data);});
	contracts.infoArray('lotto645',		CONFIG['lotto645']['address'],	(_game,_contract,_data)=>{page.updateLotto(_game,_contract,_data);});
	contracts.infoArray('baccarat',		CONFIG['baccarat']['address'],	(_game,_contract,_data)=>{page.updateCasino(_game,_contract,_data);});
	contracts.infoArray('dragonTiger',CONFIG['dragonTiger']['address'],(_game,_contract,_data)=>{page.updateCasino(_game,_contract,_data);});
	contracts.infoArray('highLow',		CONFIG['highLow']['address'],		(_game,_contract,_data)=>{page.updateCasino(_game,_contract,_data);});
}
$.getJSON('config.json', (data)=>{
	if(data!=null) {
		CONFIG	= data;
		page.start();
		wallet.start(UPDATE);
		contracts.start();
	}
});
//main
