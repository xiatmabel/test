var sensorId;
$(document).ready(function() {
	loadBuildingsSchedule("buildings", "floors");
	$('#floors').combobox({
		onSelect: function(rec){
			var url = ctx + '/building/allZones?floorId='+rec.id;
            $('#zones').combobox('reload', url);
		},
		onLoadSuccess:function(){
			$('#floors').combobox('setValue','0').combobox('setText', '--'+msgFloorList+'--');
			$('#zones').combobox('setValue','0').combobox('setText', '--'+msgZoneList+'--');
		}
	});
	$('#zones').combobox({
		onLoadSuccess:function(){
			$('#zones').combobox('setValue','0').combobox('setText', '--'+msgZoneList+'--');
		}
	});
	$('#floors').combobox('setValue','0').combobox('setText', '--'+msgFloorList+'--');
	$('#zones').combobox('setValue','0').combobox('setText', '--'+msgZoneList+'--');

	$('#dlg_floors').combobox({
		onSelect: function(rec){
			var url = ctx + '/building/allZones?floorId='+rec.id;
            $('#dlg_zones').combobox('reload', url);
		},
		onLoadSuccess:function(){
			$('#dlg_floors').combobox('setValue','0').combobox('setText', '--'+msgFloorList+'--');
			$('#dlg_zones').combobox('setValue','0').combobox('setText', '--'+msgZoneList+'--');
		}
	});
	$('#dlg_zones').combobox({
		onLoadSuccess:function(){
			$('#dlg_zones').combobox('setValue','0').combobox('setText', '--'+msgZoneList+'--');
		}
	});
	getDevices(null, null, null);
});

function searchDevices() {
	
	var buildingId = $('#buildings').combobox('getValue');
	var floorId = $('#floors').combobox('getValue');
	var zoneId = $('#zones').combobox('getValue');	
	
	getDevices(buildingId, floorId, zoneId);
}

function getDevices(buildingId, floorId, zoneId){
	var sensor;	
	$.ajaxSetup({async: false});
	$.post(ctx+'/device/searchDevices.json', {buildingId:buildingId,floorId:floorId,zoneId:zoneId},
			function(result){
		$("#devices tbody tr").remove();
		sensor = result;

	});
	
	for(var i = 0; i < Object.keys(sensor).length; i++){
//		$.each(result, function(line, value) {
			if(sensor[i].device.type == 2 && sensor[i].device.subtype==2 ){
				var sensorDelay = 0;
				$.post(ctx+'/device/getDelayBySensorIdAndDeviceId', {deviceId:-1, sensorId:sensor[i].device.id},
						function(result){
					sensorDelay = result;
				});
				$("#sensorButtonSaveDelay").empty();
				$('#sensor-location').html(sensor[i].location);
				var sensorRow = '<tr bgcolor = "#00B005";font-weight:bold;>';				
				sensorRow += '<td>' + sensor[i].device.name
				        + "</td><td>"
						+ "</td><td>" + sensor[i].device.shortId
						+ "</td><td>" + sensor[i].location
						+ "</td><td></td><td></td><td></td><td></td><td></td></tr>";
				$("#devices tbody").append(sensorRow);
				var trCtrl = $("#devices tbody tr:last");
				trCtrl.data("deviceId", sensor[i].device.id);
				getDeviceProps(sensor[i].device.macAddress, trCtrl);
				var img = $("<img/>");
				img.css("width", "30px").css("height", "30px");
				img.attr("src", ctx + "/images/sensor.png");
				trCtrl.find("td").eq(4).append(img).addClass("pic_align");
				var button = $('<a/>');
				trCtrl.find("td").eq(6).append(button);
				button.linkbutton({
					plain:true,
					iconCls:'icon-add',
				});
				button.bind('click', showItems);
				trCtrl.find("td").eq(8).append(sensorDelay);
				trCtrl.find("td").eq(8).append("  ");
				
				var sensorButtonDelay = $('<a/>');
				trCtrl.find("td").eq(8).append(sensorButtonDelay);
				sensorButtonDelay.linkbutton({
					text:msgChange,
				});
				sensorButtonDelay.bind('click', changeSensorDelayTime);
				var sensorButtonSaveDelay = $('<a/>');
				sensorButtonSaveDelay.linkbutton({
					text:msgSave,
				});
				$("#sensorButtonSaveDelay").append(sensorButtonSaveDelay);
				sensorButtonSaveDelay.bind('click', saveSensorDelayTime);
				var devices;
								
				$.post(ctx+'/device/getDevicesBySensorId', {sensorId:sensor[i].device.id},
						function(result){
					devices = result;

				});
//				$.ajaxSetup({async: true});

				for(var j = 0; j < Object.keys(devices).length; j++){
					var delayTime = 0;
					var brightness = 0;
					$.post(ctx+'/device/getDelayBySensorIdAndDeviceId', {deviceId:devices[j].device.id, sensorId:sensor[i].device.id},
							function(result){
						delayTime = result;
					});
					$.post(ctx+'/device/getBrightnessBySensorIdAndDeviceId', {deviceId:devices[j].device.id, sensorId:sensor[i].device.id},
							function(result){
						brightness = result;
					});
							if (j%2==1){
								var deviceRow = '<tr class="odd" loaded="false">';
								deviceRow += '<td>' + devices[j].device.name
								+ "</td><td>" + sensor[i].device.shortId
								+ "</td><td>" + devices[j].device.shortId
								+ "</td><td>" + devices[j].location
								+ "</td><td></td><td></td><td></td><td></td><td></td><</tr>";	
							} else {
								var deviceRow = '<tr class="even" loaded="false">';
								deviceRow += '<td>' + devices[j].device.name
								+ "</td><td>" + sensor[i].device.shortId
								+ "</td><td>" + devices[j].device.shortId
								+ "</td><td>" + devices[j].location
								+ "</td><td></td><td></td><td></td><td></td><td></td></tr>";	
							}
							
							$("#devices tbody").append(deviceRow);

							var trCtrl2 = $("#devices tbody tr:last");
							trCtrl2.data("deviceId", devices[j].device.id);
							getDeviceProps(devices[j].device.macAddress, trCtrl2);

							var imgDevice = $("<img/>");
							imgDevice.css("width", "30px").css("height", "30px");
							imgDevice.attr("src", ctx + "/images/bulb.png");
							trCtrl2.find("td").eq(4).append(imgDevice).addClass("pic_align");
//							if (devices[j].device.type == 2 && devices[j].device.subtype==4) {
								trCtrl2.find("td").eq(7).append(brightness);
								trCtrl2.find("td").eq(7).append("  ");
								var buttonBrightness = $('<a/>');
								trCtrl2.find("td").eq(7).append(buttonBrightness);
								buttonBrightness.linkbutton({
									text:msgChange,
								});
								buttonBrightness.bind('click', changeBrightnessLinkedToSensor);
								var buttonSaveBrightness = $('<a/>');
								buttonSaveBrightness.linkbutton({
									text:msgSave,
								});
								$("#buttonSaveBrightness").append(buttonSaveBrightness);
								buttonSaveBrightness.bind('click',saveBrightness);
//							}
							trCtrl2.find("td").eq(8).append(delayTime);
							trCtrl2.find("td").eq(8).append("  ");
//							trCtrl.attr("deviceId", value.device.id).attr("title",
//									value.device.macAddress).attr("zoneId",
//									value.device.zoneId);
//							trCtrl.find("td").eq(3).append(img).addClass(
//									"pic_align");
//
//							$("#devices tbody tr:odd").addClass("odd");
//							$("#devices tbody tr:even").addClass("even");
							
							var buttonDelay = $('<a/>');
							trCtrl2.find("td").eq(8).append(buttonDelay);
							buttonDelay.linkbutton({
								text:msgChange,
							});
							buttonDelay.bind('click', changeDelayTime);
							var buttonSaveDelay = $('<a/>');
							buttonSaveDelay.linkbutton({
								text:msgSave,
							});
							$("#buttonSaveDelay").append(buttonSaveDelay);
							buttonSaveDelay.bind('click',saveDelayTime);

					}
				device = null;
				}
			
	}
	
	$.post(ctx+'/device/getUnlinkedDevices', {buildingId:buildingId,floorId:floorId,zoneId:zoneId},
			function(result){
		$("#unlinkedDevices tbody tr").remove();
				$.each(result, function(index, item){
					$("#buttonSaveDelay").empty();
					$("#buttonSaveBrightness").empty();
					var delayTime = 0;
					var brightness = 0;
					$.post(ctx+'/device/getDelayBySensorIdAndDeviceId', {deviceId:item.device.id, sensorId:-1},
							function(result){
						delayTime = result;
					});
					$.post(ctx+'/device/getBrightnessBySensorIdAndDeviceId', {deviceId:item.device.id, sensorId:-1},
							function(result){
						brightness = result;
					});
						if (index%2==1){
							var deviceRow = '<tr class="odd" loaded="false">';
							deviceRow += '<td>' + item.device.name
							+ "</td><td>"
							+ "</td><td>" + item.device.shortId
							+ "</td><td>" + item.location
							+ "</td><td></td><td></td><td></td><td></td><td></td></tr>";	
						} else {
							var deviceRow = '<tr class="even" loaded="false">';
							deviceRow += '<td>' + item.device.name
							+ "</td><td>"
							+ "</td><td>" + item.device.shortId
							+ "</td><td>" + item.location
							+ "</td><td></td><td></td><td></td><td></td><td></td></tr>";	
						}
						$("#unlinkedDevices tbody").append(deviceRow);

						var trCtrl2 = $("#unlinkedDevices tbody tr:last");
						trCtrl2.data("deviceId", item.device.id);
						getDeviceProps(item.device.macAddress, trCtrl2);
						var imgDevice = $("<img/>");
						imgDevice.css("width", "30px").css("height", "30px");
						imgDevice.attr("src", ctx + "/images/bulb.png");
						trCtrl2.find("td").eq(4).append(imgDevice).addClass("pic_align");
//						if (item.device.type == 2 && item.device.subtype==4) {
							trCtrl2.find("td").eq(7).append(brightness);
							trCtrl2.find("td").eq(7).append("  ");
							var buttonBrightness = $('<a/>');
							trCtrl2.find("td").eq(7).append(buttonBrightness);
							buttonBrightness.linkbutton({
								text:msgChange,
							});
							buttonBrightness.bind('click', changeBrightnessLinkedToSensor);
							var buttonSaveBrightness = $('<a/>');
							buttonSaveBrightness.linkbutton({
								text:msgSave,
							});
							$("#buttonSaveBrightness").append(buttonSaveBrightness);
							buttonSaveBrightness.bind('click',saveBrightness);						
//						}
						trCtrl2.find("td").eq(8).append(delayTime);
						trCtrl2.find("td").eq(8).append("  ");
						
						var buttonDelay = $('<a/>');
						trCtrl2.find("td").eq(8).append(buttonDelay);
						buttonDelay.linkbutton({
							text:msgChange,
						});
						buttonDelay.bind('click', changeDelayTime);
						var buttonSaveDelay = $('<a/>');
						buttonSaveDelay.linkbutton({
							text:msgSave,
						});
						
						var root = $(this).parent().parent();

						$("#buttonSaveDelay").append(buttonSaveDelay);
						buttonSaveDelay.bind('click',saveDelayTime); 
						
					});
				});


	
	
	
	$("#map-dialog").dialog({
		onClose: function(){
			sensorId = 0;
			searchDevices();
		}
	});
	
}

function showItems(){
	loadBuildingsSchedule("mbuildings", "mfloors");
	$('#mfloors').combobox({
		onSelect: function(rec){
			var url = ctx + '/building/allZones?floorId='+rec.id;
            $('#mzones').combobox('reload', url);
		},
		onLoadSuccess:function(){
			$('#mfloors').combobox('setValue','0').combobox('setText', '--'+msgFloorList+'--');
			$('#mzones').combobox('setValue','0').combobox('setText', '--'+msgZoneList+'--');
		}
	});
	$('#mzones').combobox({
		onLoadSuccess:function(){
			$('#mzones').combobox('setValue','0').combobox('setText', '--'+msgZoneList+'--');
		}
	});
	$('#mfloors').combobox('setValue','0').combobox('setText', '--'+msgFloorList+'--');
	$('#mzones').combobox('setValue','0').combobox('setText', '--'+msgZoneList+'--');
	var root = $(this).parent().parent();
	var shortId = root.find('td:eq(2)').html();
	var name = root.find('td:eq(0)').html();
	var zoneId = root.attr('zoneId');
	$('#sensor-shortId').html(shortId);
	$('#map-dialog-sensor').val($(this).parent().parent().data("deviceId"));
	if(!sensorId)
		sensorId = $('#map-dialog-sensor').attr('value');
	$('#sensor-name').html(name);
	showItemsDetail();
	$('#map-dialog').dialog('open');
}

function showItemsDetail(){
	$('#map-devices-ul').empty();
	$('#map-devices-ul-added').empty();	
	$.post(ctx+'/device/getDevicesBySensorId', {sensorId:sensorId}, function(result){
		$.each(result, function(index, item){
			if (item.device.type != 2 || item.device.subtype!=2) {
				var li = $('<li/>').attr('shortId', item.device.shortId);
				var img = $('<img/>');
				img.attr('src', ctx+'/images/bulb.png');
				li.append(img);
				li.append($('<label/>').append(item.device.shortId).append($('<span/>').html(item.location)));
				$('#map-devices-ul-added').append(li);
				var unlinkButton = $('<a/>');
				li.append(unlinkButton);
				unlinkButton.linkbutton({
					plain:true,
					text:"Unlink",
					iconCls:'icon-remove',
				});
				unlinkButton.bind('click', function(){  
					  $.messager.confirm(msgDeviceMappingOperationMessage, msgDeviceMappingDeleteConfirm, function (r) {
						  if (r) {
				                $.post(ctx+'/device/unlinkDevice', {deviceId: item.device.id, sensorId: sensorId}, function (result) {
				                    if (result.commonData.status == 200) {
				                    	$.messager.show({
				                    		title:msgSuccess,
				                    		msg: msgDeviceMappingDeleteSuccess,
				                    		timeout:3000
				                    	});				                    	 
				                    	showItems();
				                    } else {
				                        $.messager.show({     
				                            title: msgError,
				                            msg: msgDeviceMappingDeleteFail
				                        });
				                    }
				                }, 'json');
				            }
					  });
				});
			}
		});
	});
}

function addDevice() {
	$('#dialog').dialog('open');
	loadBuildingsSchedule("dlg_buildings", "dlg_floors");
	$('#dlg_floors').combobox('setValue','0').combobox('setText', '--'+msgFloorList+'--');
	$('#dlg_zones').combobox('setValue','0').combobox('setText', '--'+msgZoneList+'--');
	$("#zIdHint").hide();
}

function saveDevices() {
	$('#form').form('submit', {
		url : ctx+'/device/saveDevices.json',
		onSubmit : function() {
			if ($('#dlg_zones').combobox('getValue')==0){
				$("#zIdHint").show();
				return false;
			}
			if ($('#devices-ul li.highlight').length==0){
				$("#zIdHint").show();
				return false;
			}
			return $(this).form('validate');
		},
		success : function(result) {
			console.log(result);
			result = eval('(' + result + ')');
			if (result.commonData.status == 200) {
				$('#dialog').dialog('close');
				searchDevices(); // reload the user data
				$.messager.show({ 
					title :  msgSuccess,
					msg : msgDeviceAddSuccess
				});
			} else {
				$.messager.show({
					title : msgError,
					msg : result.errorMessage
				});
			}
			$('#devices-ul').empty();
		}
	});
}

function searchDevicesByShortId() {
	var shortId = $('#shortId').val();
	$("#devices-ul").empty();
	$.post(ctx+'/device/searchAllDevicesByShortId', {shortId:shortId}, function(result){
		$.each(result, function(index, item){
			var li = $('<li/>').attr('shortId', item.device.shortId);
			var checkbox = $('<input type="checkbox" name="shortIds"/>');
			checkbox.attr('value', item.device.shortId);
			checkbox.change(function() {
				if ($(this).attr('checked')=="checked"){
					$(this).parent().addClass('highlight');
				} else {
					$(this).parent().removeClass('highlight');
				}
			});
			li.append(checkbox);
			var img = $('<img/>');
			if (item.device.type==2 && item.device.subtype==2){
				img.attr('src', ctx+'/images/sensor.png');
			} else {
				img.attr('src', ctx+'/images/bulb.png');
			}
			li.append(img);
			li.append($('<label/>').append(item.device.shortId).append($('<span/>').html(item.location)));
			$('#devices-ul').append(li);
		});
	});
}

function saveSensorMappings() {
	$('#mapForm').form('submit', {
		url : ctx+'/device/saveSensorMappings.json',
		onSubmit : function() {
			if ($('#map-devices-ul li.highlight').length==0){
				$("#zIdHint").show();
				return false;
			}
			return $(this).form('validate');
		},
		success : function(result) {
			result = eval('(' + result + ')');
			if (result.commonData.status == 200) {
				searchDevices(); // reload the user data
				$.messager.show({ 
					title :  msgSuccess,
					msg : msgDeviceMapAddSuccess
				});
			} else {
				$.messager.show({
					title : msgError,
					msg : result.errorMessage
				});
			}
			$('#map-devices-ul').empty();
			$('#map-dialog').dialog('close');
		}
	});
}

function searchUnlinkedDevices(){
	$('#map-devices-ul').empty();
	var buildingId = $('#mbuildings').combobox('getValue');
	var floorId = $('#mfloors').combobox('getValue');
	var zoneId = $('#mzones').combobox('getValue');
	$.post(ctx+'/device/getUnlinkedDevicesBySensorId', {sensorId:sensorId, buildingId:buildingId, floorId:floorId, zoneId:zoneId}, function(result){
		$.each(result, function(index, item){
			if (item.device.type != 2 || item.device.subtype!=2) {
				var li = $('<li/>').attr('shortId', item.device.shortId);
				var img = $('<img/>');
				img.attr('src', ctx+'/images/bulb.png');
				li.append(img);
				li.append($('<label/>').append(item.device.shortId).append($('<span/>')).append(item.location));
				$('#map-devices-ul').append(li);
				var linkButton = $('<a/>');
				li.append(linkButton);
				linkButton.linkbutton({
					plain:true,
					text:"Link",
					iconCls:'icon-add',
				});
				linkButton.bind('click', function(){  
	                $.post(ctx+'/device/linkDevice', {deviceId: item.device.id, sensorId: sensorId}, function (result) {
	                    if (result.commonData.status == 200) {
	                    	$.messager.show({
	                    		title:msgSuccess,
	                    		msg: msgDeviceMapAddSuccess,
	                    		timeout:3000
	                    	});
	                    	showItemsDetail();
	                    	searchUnlinkedDevices();
	                    } else {
	                        $.messager.show({     
	                            title: msgError,
	                            msg: msgDeviceMapAddFail
	                        });
	                    }
	                }, 'json');
				});
			}
		});
	});
}

			
function getDeviceProps(macAddr,trCtrl) {
						var loaded = $(this).attr("loaded");
						var control = trCtrl.find("td").eq(5);
						var actionCtrl = trCtrl.find("td").eq(6);
						var id = trCtrl.find("td").eq(0).html().split(' ').join('');
						$.ajax({
								url : ctx + "/device/getDevicePropsByMac.json",
								type : "POST",
								async : true,
								data : {
									mac : macAddr
								},
								success:function(result) {
									var img = $("<img/>");
									img.css("width", "30px").css("height", "30px");
									
									
									if (result.response.online) {										
										if (result.response.type == 0x02
												&& result.response.subtype == 0x01) {
												
												if (!result.response.loading){
													control.empty();
													actionCtrl.empty();
													var button = $('<a/>');
													actionCtrl.append(button);
													button.bind('click', {mac : macAddr, index:1}, takeActionDevice);
													
													actionCtrl.attr("mac", macAddr);
													actionCtrl.attr("index", 1);
													if (result.response.switches[0]) {
														button.attr("action", "off");
														button.linkbutton({
															text:msgLabelOff,
														});
													} else {
														button.attr("action", "on");
														button.linkbutton({
															text:msgLabelOn,
														});
													}
											}
												
												img.attr("src", ctx + "/images/loading.gif");										
												if (result.response.loading){
													img.attr("src", ctx + "/images/loading.gif");
												}else if (result.response.switches[0]){
													img.attr("src", ctx + "/images/lamp1.png");
												}else {
													img.attr("src", ctx + "/images/lamp0.png");
												}
												control.append(img).addClass("pic_align");
											
										}
										else if (result.response.type == 0x02
												&& result.response.subtype == 0x03) {
												actionCtrl.empty();
												if (!result.response.loading){
													actionCtrl.empty();
													var buttonList= new Array(3);
													for (var i=0;i<result.response.switches.length;i++){
														buttonList[i] = $('<a/>');
														actionCtrl.append(buttonList[i]);
//														actionCtrl.append('<a href="javascript:void(0)" class="easyui-linkbutton" index="'+(i+1)+'"></a>');
														var aCtrl = actionCtrl.find("a[index='"+(i+1)+"']");
														buttonList[i].bind('click', {mac : macAddr, index:(i+1)}, takeActionDevice);
														actionCtrl.find("a").attr("mac", macAddr);
														if (result.response.switches[i]) {
															buttonList[i].attr("action", "off");
															buttonList[i].linkbutton({
																text:msgLabelOff,
															});
														} else {
															buttonList[i].attr("action", "on");
															buttonList[i].linkbutton({
																text:msgLabelOn,
															});
														}
													}
												}
												control.empty();
												$.each(result.response.switches,function(index,value){
													var imgStatus;
													if (result.response.loading){
														imgStatus = ctx + "/images/loading.gif";
													}else if (value){
														imgStatus = ctx + "/images/lamp1.png";
													}else {
														imgStatus = ctx + "/images/lamp0.png";
													}
													control.append('<img alt="'+msgDeviceStatus+'" src="'+imgStatus+'"/>');
												});
											}
										else if (result.response.type == 0x02
														&& result.response.subtype == 0x04) {
											control.empty();
											if (!result.response.loading){
												actionCtrl.html("<div id='slider_"+id+"' style='width:100px'></div>");
												
												$("#slider_"+id).slider({
													min:0,max:10,step:1,showTip:true,
													onComplete: function(value){
										            	changeBrightness(macAddr,value);
										            },
										            tipFormatter: function(value){
										                return value;
										            }
												});
												control.attr("loaded", "true");
											}
											
											$("#slider_"+id).slider('setValue', result.response.brightness);
											img.attr("src", ctx + "/images/dimmer0.png");
											trCtrl.find("td").eq(5).append(img).addClass("pic_align");
											}
											else if (result.response.type == 0x02
													&& result.response.subtype == 0x02) {
												control.empty();
												img.attr("src", ctx + "/images/sensor.png");
												control.append(img).addClass("pic_align");
											}
											else {
												control.empty();
												img = ctx + "online";
												control.append(img).addClass("pic_align");	
											}
										}
										else{
											control.empty();
											img.attr("src", ctx + "/images/offline.png");
											control.append(img).addClass("pic_align");
										}
									
								}
						});
			
	setTimeout(function(){getDeviceProps(macAddr, trCtrl)}, 3000);//get device properties every 3 seconds
}

function takeActionDevice(e){
	var url;
	var type = $(e.currentTarget).attr("action");
	if (type=="on"){
		url = ctx+"/device/takeOnDevice.json";
	} else{
		url = ctx+"/device/takeOffDevice.json";
	}
	//alert(e.data.index);
	$.post(url,
			
			{mac:e.data.mac,index:e.data.index},
			function(result){
				
			});
	//$(e.currentTarget).hide();
	$(e.currentTarget).linkbutton('disable');
}

function changeDelayTime(){
	var root = $(this).parent().parent();
	var shortId = root.find('td:eq(2)').html();
	var name = root.find('td:eq(0)').html();
	var location = root.find('td:eq(3)').html();
	var sensorShortId = root.find('td:eq(1)').html();
	$('#light-name').html(name);
	$('#light-shortId').html(shortId);
	$('#light-location').html(location);
	$('#sensor-name-delay2').html(sensorShortId);
	$("#delay-dialog").dialog('open');
	$("#delayTime").val("");
}

function saveDelayTime(){	
	var shortId = $('#light-shortId').html();
	var time = $("#delayTime").attr('value');
	var sensorId = $('#sensor-name-delay2').html();
	$.post(ctx+'/device/saveDelay', {deviceShortId:shortId, sensorShortId:sensorId, time: time},
			function(result){
				 if (result.commonData.status == 200) {
	               $.messager.show({
	            	   title:msgSuccess,
	            	   msg: msgDeviceDelayChangeSuccess,
	                	timeout:3000
	                });	
	                $("#delay-dialog").dialog('close');
	                $("#delayTime").val("");
	                searchDevices();

	               } else {
	                   $.messager.show({     
	                       title: msgError,
	                       msg: msgDeviceDelayChangeFail
	                   });
	               }
				
		}, 'json');
}

function changeSensorDelayTime(){
	var root = $(this).parent().parent();
	var shortId = root.find('td:eq(2)').html();
	var name = root.find('td:eq(0)').html();
	var location =  root.find('td:eq(3)').html();
	$('#sensor-name-delay').html(name);
	$('#sensor-shortId-delay').html(shortId);
	$('#sensor-location-delay').html(location);
	$("#sensor-delay-dialog").dialog('open');
	$("#sensorDelayTime").val("");
}

function saveSensorDelayTime(){
	var sensorId = $('#sensor-shortId-delay').html();
	var time = $("#sensorDelayTime").attr('value');
	var shortId = "";
	$.post(ctx+'/device/saveDelay', {deviceShortId:shortId, sensorShortId:sensorId, time: time},
			function(result){
				 if (result.commonData.status == 200) {
	               $.messager.show({
	            	   title:msgSuccess,
	            	   msg: msgDeviceDelayChangeSuccess,
	                	timeout:3000
	                });	
	                $("#sensor-delay-dialog").dialog('close');
	                $("#sensorDelayTime").val("");
	                searchDevices();

	               } else {
	                   $.messager.show({     
	                       title: msgError,
	                       msg: msgDeviceDelayChangeFail
	                   });
	               }
				
		}, 'json');
}

function changeBrightnessLinkedToSensor(){
	var root = $(this).parent().parent();
	var shortId = root.find('td:eq(2)').html();
	var name = root.find('td:eq(0)').html();
	var location = root.find('td:eq(3)').html();
	var sensorShortId = root.find('td:eq(1)').html();
	$('#light-name2').html(name);
	$('#light-shortId2').html(shortId);
	$('#light-location2').html(location);
	$('#sensor-brightness').html(sensorShortId);
	$("#brightness-dialog").dialog('open');
	$("#brightness").val("");
}

function saveBrightness(){	
	var shortId = $('#light-shortId2').html();
	var brightness = $("#brightness").attr('value');
	var sensorId = $('#sensor-brightness').html();
	$.post(ctx+'/device/saveBrightness', {deviceShortId:shortId, sensorShortId:sensorId, brightness: brightness},
			function(result){
				 if (result.commonData.status == 200) {
	               $.messager.show({
	            	   title:msgSuccess,
	            	   msg: msgDeviceBrightnessChangeSuccess,
	                	timeout:3000
	                });	
	                $("#brightness-dialog").dialog('close');
	                $("#brightness").val("");
	                searchDevices();

	               } else {
	                   $.messager.show({     
	                       title: msgError,
	                       msg: msgDeviceBrightnessChangeFail
	                   });
	               }
				
		}, 'json');
}