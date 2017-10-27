var Agriweather;
var defaultSensorName = 'FieldSensorV2.1-003';

Agriweather = (function(){
    if (!window.jQuery) { throw new Error("LikeButtonModule requires jQuery") }
    // this line declares the module dependency and
    // gives the global variable a local reference.
    var $ = window.jQuery;
    var hostName = location.hostname;
    // hostName += ":8080";
    var drawing = false;
    // var BASE_URL = 'http://52.175.204.58/MobileV2/GetAgriSensorData';
    var BASE_URL = "http://" + hostName + "/MobileV2/Monitor";
    var sensorData , weatherboxData, sensorDataQueue, weatherboxDataQueue;

    var myChart1, myChart2, myChart3, myChart4, myChart5, myChart6, myChart8, myChart9;
    var sensorTimeHandle = null, weatherboxTimeHandle = null, monitorTimeHandle;
    var directionMap = {};
    
    /**
     * 初始化
     */
    var initialize = function(){
        
        sensorData = {
            recTime: [],
            deepTmpData: [],
            surfaceTmpData: [],
            deepHmData: [],
            surfaceHmData: [],
            snapshot: []
        }
    
        weatherboxData = {
            recTime: [],
            temperature: [],
            humidity: [],
            illuminance: [],
            rainfall:[],
            windspeed:[],
            winddirection:[],
			atmo:[]
        }
    
        sensorDataQueue = {
            recTime: [],
            deepTmpData: [],
            surfaceTmpData: [],
            deepHmData: [],
            surfaceHmData: [],
            snapshot: []
        }
    
        weatherboxDataQueue = {
            recTime: [],
            temperature: [],
            humidity: [],
            illuminance: [],
            rainfall:[],
            windspeed:[],
            winddirection:[],
			atmo:[]
        }

        myChart1 = echarts.init(document.getElementById('main1'), 'dark');
        myChart2 = echarts.init(document.getElementById('main2'), 'dark');
        myChart3 = echarts.init(document.getElementById('main3'), 'dark');
        myChart4 = echarts.init(document.getElementById('main4'), 'dark');
        myChart5 = echarts.init(document.getElementById('main5'), 'dark');
        myChart6 = echarts.init(document.getElementById('main6'), 'dark');
        myChart8 = echarts.init(document.getElementById('main8'), 'dark');
		myChart9 = echarts.init(document.getElementById('main9'), 'dark');
		

        echarts.util.each(
            ['W', 'WSW', 'SW', 'SSW', 'S', 'SSE', 'SE', 'ESE', 'E', 'ENE', 'NE', 'NNE', 'N', 'NNW', 'NW', 'WNW'],
            function (name, index) {
                directionMap[name] = Math.PI / 8 * index;
            }
        );
    }

    var drawMonitor = function(sensorName){
        var jqxhr = $.ajax({
            method: 'POST',
            url: BASE_URL,
            data: {
                sensorName: sensorName,
				limit: 5
            }
        }).done(function(rtnData){
            // console.log(rtnData.data.row);
            console.log(rtnData);
            $.each(rtnData.data.row, function(index, rowData){
                if($.inArray(rowData.cd, sensorData.recTime) >= 0){
                    console.log('Exist!');
                } else {
                    sensorData.recTime.push(rowData.cd);
                    sensorData.deepTmpData.push(rowData.data[4]);
                    sensorData.surfaceTmpData.push(rowData.data[4]);
                    sensorData.deepHmData.push(rowData.data[5]);
                    sensorData.surfaceHmData.push(rowData.data[5]);
                    sensorData.snapshot.push(rowData.data[9]);

                    weatherboxData.recTime.push(rowData.cd);
                    weatherboxData.temperature.push({value: [rowData.cd, rowData.data[0]]});
                    weatherboxData.humidity.push({value: [rowData.cd, rowData.data[1]]});
                    weatherboxData.illuminance.push(rowData.data[3]);
                    weatherboxData.rainfall.push({value: [rowData.cd, !rowData.data[8]?0:rowData.data[8]]});
					weatherboxData.atmo.push({value: [rowData.cd, rowData.data[2]]});

                    var winddirection = rowData.data[6];
                    var targetKey = 'W';
                    var rotate = 0;
                    for(var key in directionMap) {
                        rotate = directionMap[key] === 0 ? 0 : (directionMap[key] * 50)
                        if (winddirection === 0 || winddirection === 360 || winddirection <= rotate) {
                            targetKey = key;
                            break;
                        }
                    }

                    weatherboxData.winddirection.push(targetKey);
                    weatherboxData.windspeed.push(rowData.data[7]);
                    //weatherboxData.windspeed.push(11);
                }
            });
            drawing = true;
            _drawSoilTemperature(sensorData);
            _drawSoilHumidity(sensorData);
            _drawFieldSnapshot(sensorData);

            _drawWeatherTemperature(weatherboxData);
            _drawWeatherHumidity(weatherboxData);
            _drawIlluminance(weatherboxData);
            _drawRainfall(weatherboxData);
            _drawWindspendAnddirection(weatherboxData);
			_drawAtmo(weatherboxData);
            drawing = false;
            // console.log(sensorData);
        }).fail(function(){

        }).always(function(){
//            _drawSoilTemperature(sensorData);
//            _drawSoilHumidity(sensorData);
//            _drawFieldSnapshot(sensorData);
//
//            _drawWeatherTemperature(weatherboxData);
//            _drawWeatherHumidity(weatherboxData);
//            _drawIlluminance(weatherboxData);
//            _drawRainfall(weatherboxData);
        	$('#lunar-date').text(moment().format('YYYY-MM-DD HH:mm:ss'));
        });
    }

    /**
     * 畫出田間感測器資料
     * 
     * @param {Object} sensorName 
     * @param {string} startTime - 起始時間
     * @param {string} endTime - 結束時間
     */
    var drawSensor = function(sensorName, startTime, endTime){
        var jqxhr = $.ajax({
            method: 'POST',
            url: BASE_URL,
            data: {
                sensorName: sensorName,
				limit: 5
                //start: startTime,
                //end: endTime
            }
        }).done(function(rtnData){
            // console.log(rtnData.data.row);
            $.each(rtnData.data.row, function(index, rowData){
                // console.log(rowData.cd);
                if($.inArray(rowData.cd, sensorData.recTime) >= 0){
                    console.log('Exist!');
                } else {
                    sensorData.recTime.push(rowData.cd);
                    sensorData.deepTmpData.push(rowData.data[4]);
                    sensorData.surfaceTmpData.push(rowData.data[4]);
                    sensorData.deepHmData.push(rowData.data[5]);
                    sensorData.surfaceHmData.push(rowData.data[5]);
                    sensorData.snapshot.push(rowData.data[9]);
                }
            });
            // console.log(sensorData);
        }).fail(function(){

        }).always(function(){
            _drawSoilTemperature(sensorData);
            _drawSoilHumidity(sensorData);
            _drawFieldSnapshot(sensorData);
        });
    }

    /**
     * 畫出氣象盒子資料
     * 
     * @param {object} boxName 
     * @param {string} startTime - 起始時間
     * @param {string} endTime - 結束時間
     */
    var drawWeatherbox = function(boxName, startTime, endTime){
        var jqxhr = $.ajax({
            method: 'POST',
            url: BASE_URL,
            data: {
                sensorName: boxName,
				limit: 5
                //start: startTime,
                //end: endTime
            }
        }).done(function(rtnData){
            $.each(rtnData.data.row, function(index, rowData){
                // console.log(rowData.cd);
                if($.inArray(rowData.cd, weatherboxData.recTime) >= 0){
                    console.log('Exist!');
                } else {
                    weatherboxData.recTime.push(rowData.cd);
                    weatherboxData.temperature.push({value: [rowData.cd, rowData.data[0]]});
                    weatherboxData.humidity.push({value: [rowData.cd, rowData.data[1]]});
                    weatherboxData.illuminance.push(rowData.data[3]);
                    weatherboxData.rainfall.push({value: [rowData.cd, !rowData.data[8]?0:rowData.data[8]]});				
					weatherboxData.atmo.push({value: [rowData.cd, rowData.data[2]]});
                }
            });
        }).fail(function(){

        }).always(function(){
            _drawWeatherTemperature(weatherboxData);
            _drawWeatherHumidity(weatherboxData);
            _drawIlluminance(weatherboxData);
            _drawRainfall(weatherboxData);
			_drawAtmo(weatherboxData);
        });
    }

    /**
     * 繪製「大氣溫度」圖形
     * 
     * @param {object} weatherboxData 
     */
    var _drawWeatherTemperature = function(weatherboxData){
        var lastValue = weatherboxData.temperature.reverse()[weatherboxData.temperature.length - 1];
        $('#wt').text(Math.round(lastValue.value[1]));
    
        option1 = {
            title: {
                //text: '动态数据 + 时间坐标轴'
            },
            tooltip: {
                trigger: 'axis',
                // formatter: function (params) {
                //     params = params[0];
                //     var date = new Date(params.name);
                //     return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
                // },
                axisPointer: {
                    animation: false
                }
            },
            xAxis: {
                type: 'time',
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
				max:60,
                boundaryGap: [0, '100%'],
                splitLine: {
                    show: false
                }
            },
            series: [{
                name: 'temperature',
                type: 'line',
                showSymbol: false,
                hoverAnimation: false,
                data: weatherboxData.temperature.reverse()
            }]
        };
        
        myChart1.setOption(option1);
    }

    /**
     * 繪製「大氣濕度」圖形
     * 
     * @param {Object} weatherboxData 
     */
    var _drawWeatherHumidity = function(weatherboxData){
        var lastValue = weatherboxData.humidity.reverse()[weatherboxData.humidity.length - 1];
        $('#wh').text(Math.round(lastValue.value[1]));
    
        option2 = {
            title: {
                //text: '动态数据 + 时间坐标轴'
            },
            tooltip: {
                trigger: 'axis',
                // formatter: function (params) {
                //     params = params[0];
                //     var date = new Date(params.name);
                //     return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
                // },
                axisPointer: {
                    animation: false
                }
            },
            itemStyle: {
                normal: {
                    color: '#33FFFF',
                    lineStyle: {        // 系列级个性化折线样式
                        width: 2,
                        type: 'dashed'
                    }
                },
                emphasis: {
                    color: 'white'
                }
            },
            xAxis: {
                type: 'time',
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
				min:0,
				max:120,
                boundaryGap: [0, '100%'],
                splitLine: {
                    show: false
                }
            },
            series: [{
                name: 'humidity',
                type: 'line',
                showSymbol: false,
                hoverAnimation: false,
                data: weatherboxData.humidity.reverse()
            }]
        };
        
        myChart2.setOption(option2);
    }

    /**
     * 繪製「光照強度」圖形
     * 
     * @param {object} weatherboxData 
     */
    var _drawIlluminance = function(weatherboxData){
        lastValue = weatherboxData.illuminance[weatherboxData.illuminance.length - 1]
        option3 = {
            //backgroundColor: '#1b1b1b',
            tooltip: {
                formatter: "{a} <br/>{c} {b}"
            },
            /**
            toolbox: {
                show : true,
                feature : {
                    mark : {show: true},
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            **/
            series: [
                {
                    name: 'shine',
                    type: 'gauge',
                    min: 0,
                    max: 10000,
                    splitNumber: 8,
                    radius: '85%',
                    axisLine: {            // 坐标轴线
                        lineStyle: {       // 属性lineStyle控制线条样式
                            color: [[0.09, 'lime'], [0.82, '#1e90ff'], [1, '#ff4500']],
                            width: 3,
                            shadowColor: '#fff', //默认透明
                            shadowBlur: 10
                        }
                    },
                    axisLabel: {            // 坐标轴小标记
                        textStyle: {       // 属性lineStyle控制线条样式
                            fontWeight: 'bolder',
                            color: '#fff',
                            shadowColor: '#fff', //默认透明
                            shadowBlur: 10
                        }
                    },
                    axisTick: {            // 坐标轴小标记
                        length: 15,        // 属性length控制线长
                        lineStyle: {       // 属性lineStyle控制线条样式
                            color: 'auto',
                            shadowColor: '#fff', //默认透明
                            shadowBlur: 10
                        }
                    },
                    splitLine: {           // 分隔线
                        length: 25,         // 属性length控制线长
                        lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                            width: 3,
                            color: '#fff',
                            shadowColor: '#fff', //默认透明
                            shadowBlur: 10
                        }
                    },
                    pointer: {           // 分隔线
                        shadowColor: '#fff', //默认透明
                        shadowBlur: 5
                    },
                    title: {
                        textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            fontWeight: 'bolder',
                            fontSize: 20,
                            fontStyle: 'italic',
                            color: '#fff',
                            shadowColor: '#fff', //默认透明
                            shadowBlur: 10
                        }
                    },
                    detail: {
                        backgroundColor: 'rgba(30,144,255,0.8)',
                        borderWidth: 1,
                        borderColor: '#fff',
                        shadowColor: '#fff', //默认透明
                        shadowBlur: 5,
                        offsetCenter: [0, '50%'],       // x, y，单位px
                        textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            fontWeight: 'bolder',
                            color: '#fff'
                        }
                    },
                    data: [{ value: Math.round(lastValue), name: '' }]
                }
            ]
        };
        
        myChart3.setOption(option3);
    }

    /**
     * 繪製「降雨量」圖形
     * 
     * @param {object} weatherboxData 
     */
    var _drawRainfall = function(weatherboxData){
		var lastValue = weatherboxData.rainfall[weatherboxData.rainfall.length - 1];
		if(Math.round(lastValue.value[1])==0 || Math.round(lastValue.value[1])==null){
			$('#rf').text("NO RAIN");
		}else if(Math.round(lastValue.value[1])<=3){
			$('#rf').text("Drizzle");
		}else if(Math.round(lastValue.value[1])<=15){
			$('#rf').text("Light Rain");
		}else if(Math.round(lastValue.value[1])<=40){
			$('#rf').text("Moderate Rain");
		}else if(Math.round(lastValue.value[1])<=80){
			$('#rf').text("Heavy Rain");
		}else if(Math.round(lastValue.value[1])<=200){
			$('#rf').text("Pouring Rain");
		}else{
			$('#rf').text("Torrential Rain");
		}			
		
        option4 = {
            title: {
                //text: '柱状图动画延迟'
            },
            tooltip: {},
            xAxis: {
                data: weatherboxData.recTime.reverse(),
                silent: false,
                splitLine: {
                    show: false
                }
            },
            yAxis: {
            },
            series: [{
                name: '降雨量',
                type: 'bar',
                data: weatherboxData.rainfall.reverse(),
                animationDelay: function (idx) {
                    return idx * 10;
                }
            }],
            animationEasing: 'elasticOut',
            animationDelayUpdate: function (idx) {
                return idx * 5;
            }
        };

        myChart4.setOption(option4);
    }

    /**
     * 繪製「土壤溫度」圖形
     * 
     * @param {object} sensorData 
     */
    var _drawSoilTemperature = function(sensorData){
        var dataY = [];
        
        var option5 = {
            title: {
                //text: 'temperature of soil chagne',
                // subtext: '最後更新時間：2017-07-01 11:06:29'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['shallow layer temperature']
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: sensorData.recTime.reverse(),
            },
            yAxis: {
                type: 'value',
				min:0,
                max:60,
                axisLabel: {
                    formatter: '{value} °C'
                }
            },
            series: [
                {
                    name: 'shallow layer temperature',
                    type: 'line',
                    data: sensorData.surfaceTmpData.reverse(),
                    markPoint: {
                        data: [
                            { type: 'max', name: 'max' },
                            { type: 'min', name: 'min' }
                        ]
                    },
                    markLine: {
                        data: [
                            { type: 'average', name: 'average' }
                        ]
                    }
                }
            ]
        };
        
        myChart5.setOption(option5);
    }

    /**
     * 繪製「土壤濕度」圖形
     * 
     * @param {object} sensorData 
     */
    var _drawSoilHumidity = function(sensorData){
        var option6 = {
            title: {
                //text: 'moisture contents change',
                // subtext: '最後更新時間：2017-07-01 11:06:29'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['shallow layer humidity']
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: sensorData.recTime
            },
            yAxis: {
                type: 'value',
				min:0,
                max:120,
                axisLabel: {
                    formatter: '{value} rh'
                }
            },
            itemStyle: {
                normal: {
                    color: '#33FFFF',
                    lineStyle: {        // 系列级个性化折线样式
                        width: 2,
                        type: 'dashed'
                    }
                },
                emphasis: {
                    color: 'white'
                }
            },
            series: [
                {
                    name: 'shallow layer humidity',
					color: '#33FFFF',
                    type: 'line',
                    data: sensorData.surfaceHmData.reverse(),
                    markPoint: {
                        data: [
                            { type: 'max', name: 'max' },
                            { type: 'min', name: 'min' }
                        ]
                    },
                    markLine: {
                        data: [
                            { type: 'average', name: 'average' }
                        ]
                    }
                }
            ]
        };
        
        myChart6.setOption(option6);
    }

    /**
     * 繪製「田間視野」圖形
     * 
     * @param {object} sensorData 
     */
    var _drawFieldSnapshot = function(sensorData) {
        var carousel = $('#main7 div.carousel-inner');
        //carousel.empty();

        $.each(sensorData.snapshot, function(index, snapshot){
			if(snapshot.length>100){
				console.log("has image");
				carousel.empty();
				var image = new Image();
				image.src = 'data:image/png;base64,' + snapshot;
				image.style.width = '100%';
				document.body.appendChild(image);
				
				var divCarouselCaption =  document.createElement('div');
				divCarouselCaption.className = 'carousel-caption';
				divCarouselCaption.style.bottom = '-40px';
				//divCarouselCaption.innerHTML = '<h5>' + sensorData.recTime[index] + '</h5>';

				divItem.appendChild(image);
				divItem.appendChild(divCarouselCaption);

				carousel.append(divItem);     
			}else{
				console.log("no image");
			}
			
			/** old
            var divItem = document.createElement('div');
            if (index === 0) {
                divItem.className = 'item active';
            } else divItem.className = 'item';
                        
            var image = new Image();
            image.src = 'data:image/png;base64,' + snapshot;
            image.style.width = '100%';
            document.body.appendChild(image);

            var divCarouselCaption =  document.createElement('div');
            divCarouselCaption.className = 'carousel-caption';
            divCarouselCaption.style.bottom = '-40px';
            divCarouselCaption.innerHTML = '<h5>' + sensorData.recTime[index] + '</h5>';

            divItem.appendChild(image);
            divItem.appendChild(divCarouselCaption);

            carousel.append(divItem);     
			**/			
        });
    }

    /**
     * 繪製「風向風速圖」圖形
     * 
     * @param {object} weatherboxData 
     */
    var _drawWindspendAnddirection = function(weatherboxData) {
        var data = [];

        echarts.util.each(weatherboxData.recTime, function (time, index) {
            data.push([time, weatherboxData.windspeed.reverse()[index], weatherboxData.winddirection.reverse()[index]]);
        });
    
        var dims = {
            time: 0,
            windSpeed: 1,
            R: 2
        };
        
        var arrowSize = 18;
    
        function renderArrow(param, api) {
            var point = api.coord([
                api.value(dims.time),
                api.value(dims.windSpeed)
            ]);
    
            return {
                type: 'path',
                shape: {
                    pathData: 'M31 16l-15-15v9h-26v12h26v9z',
                    x: -arrowSize / 2,
                    y: -arrowSize / 2,
                    width: arrowSize,
                    height: arrowSize
                },
                rotation: directionMap[api.value(dims.R)],
                position: point,
                style: api.style({
                    stroke: '#555',
                    lineWidth: 1
                })
            };
        }
    
    
        option8 = {
            title: {
                //text: '天气 风向 风速 海浪 预报',
                //subtext: '示例数据源于 www.seabreeze.com.au',
                //left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    return [
                        echarts.format.formatTime('yyyy-MM-dd', params[0].value[dims.time])
                        + ' ' + echarts.format.formatTime('hh:mm', params[0].value[dims.time]),
                        'speed：' + params[0].value[dims.windSpeed],
                        'direction：' + params[0].value[dims.R],
                    ].join('<br>');
                }
            },
            grid: {
                top: 70,
                bottom: 125
            },
            xAxis: {
                type: 'time',
                maxInterval: 3600 * 1000 * 24,
                splitLine: {
                    lineStyle: {
                        color: '#ddd'
                    }
                }
            },
            yAxis: [{
                name: 'wind speed（kt）',
                nameLocation: 'middle',
                nameGap: 35,
                axisLine: {
                    lineStyle: {
                        color: '#666'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#ddd'
                    }
                }
            }, {
                axisLine: {show: false},
                axisTick: {show: false},
                axisLabel: {show: false},
                splitLine: {show: false}
            }],
            visualMap: {
                type: 'piecewise',
                // show: false,
                orient: 'horizontal',
                left: 'center',
                bottom: 10,
				textStyle: {
					color: 'white'
				},
                pieces: [{
                    gte: 17,
                    color: '#18BF12',
                    label: 'Fresh（>= 17 kt）'
                }, {
                    gte: 11,
                    lt: 17,
                    color: '#f4e9a3',
                    label: 'Moderate（11  ~ 17 kt）'
                }, {
                    lt: 11,
                    color: '#D33C3E',
                    label: 'Light（< 11 kt）'
                }],
                seriesIndex: 1,
                dimension: 1
            },
            dataZoom: [{
                type: 'inside',
                xAxisIndex: 0,
                minSpan: 5
            }, {
                type: 'slider',
                xAxisIndex: 0,
                minSpan: 5,
                height: 20,
                bottom: 50,
                handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '120%'
            }],
            series: [{
                type: 'line',
                yAxisIndex: 1,
                showSymbol: false,
                hoverAnimation: false,
                symbolSize: 10,
				textStyle: {
					color: 'white'
				},
                areaStyle: {
                    normal: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: 'rgba(88,160,253,1)'
                            }, {
                                offset: 0.5, color: 'rgba(88,160,253,0.7)'
                            }, {
                                offset: 1, color: 'rgba(88,160,253,0)'
                            }]
                        }
                    }
                },
                lineStyle: {
                    normal: {
                        color: 'rgba(88,160,253,1)'
                    }
                },
                itemStyle: {
                    normal: {
                        color: 'rgba(88,160,253,1)'
                    }
                },
                encode: {
                    x: dims.time,
                    y: dims.windSpeed
                },
                data: data,
                z: 2
            }, {
                type: 'custom',
                renderItem: renderArrow,
                encode: {
                    x: dims.time,
                    y: dims.windSpeed
                },
                data: data,
                z: 10
            }]
        };
    
        myChart8.setOption(option8);
    }
    
	/**
     * 繪製「氣壓」圖形
     * 
     * @param {object} weatherboxData 
     */
    var _drawAtmo = function(weatherboxData){
		var lastValue = weatherboxData.atmo.reverse()[weatherboxData.atmo.length - 1];
		//console.log(lastValue);
		$('#at').text(Math.round(lastValue.value[1]));
        var option9 = {
            title: {
                //text: '动态数据 + 时间坐标轴'
            },
            tooltip: {
                trigger: 'axis',
                // formatter: function (params) {
                //     params = params[0];
                //     var date = new Date(params.name);
                //     return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
                // },
                axisPointer: {
                    animation: false
                }
            },
            itemStyle: {
                normal: {
                    color: '#33FFFF',
                    lineStyle: {        // 系列级个性化折线样式
                        width: 2,
                        type: 'dashed'
                    }
                },
                emphasis: {
                    color: 'white'
                }
            },
            xAxis: {
                type: 'time',
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
                boundaryGap: [0, '100%'],
                splitLine: {
                    show: false
                }
            },
            series: [{
                name: 'atmospheric',
                type: 'line',
                showSymbol: false,
                hoverAnimation: false,
                data: weatherboxData.atmo.reverse()
            }]
        };
        
        myChart9.setOption(option9);
    }
	
    /**
     * 更新田間感測器圖形
     */
    var _updateSensorChart = function(){
        var option5 = {
            series: [
                {
                    data: sensorData.surfaceTmpData,
                },
                {
                    data: sensorData.deepTmpData,
                }
            ]
        };      
        
        var option6 = {
            series: [
                {
                    data: sensorData.surfaceHmData,
                },
                {
                    data: sensorData.deepHmData,
                }
            ]
        };

        myChart5.setOption(option5);
        myChart6.setOption(option6);

        _drawFieldSnapshot(sensorData);
    }

    var _updateWeatherboxChart = function(){
        var lastTemperature = weatherboxData.temperature[weatherboxData.temperature.length - 1];
        //$('#wt').text(Math.round(lastTemperature.value[1]));
        $('#wt').text(Math.round(lastTemperature));
        option1 = {
            series: [{
                data: weatherboxData.temperature
            }]
        };
        myChart1.setOption(option1);

        var lastHumidity = weatherboxData.humidity[weatherboxData.humidity.length - 1];
        // $('#wh').text(Math.round(lastHumidity.value[1]));
        $('#wh').text(Math.round(lastHumidity));
        option2 = {
            series: [{
                data: weatherboxData.humidity
            }]
        };
        myChart2.setOption(option2);

        lastIlluminance = weatherboxData.illuminance[weatherboxData.illuminance.length - 1]
        option3 = {
            series: [
                {
                    data: [{ value: Math.round(lastIlluminance), name: '' }]
                }
            ]
        };
        myChart3.setOption(option3);

        option4 = {
            series: [{
                data: weatherboxData.rainfall
            }]
        };
        myChart4.setOption(option4);
    }

    var _getContinueSensor = function(sensorName){
        // console.log(sensorData);
        //var lastTime = sensorData.recTime[sensorData.recTime.length - 1];
        //var nextTime = moment(lastTime).add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
        var jqxhr = $.ajax({
            method: 'POST',
            url: BASE_URL,
            data: {
                sensorName: sensorName,
                limit: 5,
                //start: lastTime,
                //end: nextTime
            }
        }).done(function(rtnData){
            // console.log(rtnData.data.row);
            $.each(rtnData.data.row, function(index, rowData){
                // console.log(rowData.cd);
                if($.inArray(rowData.cd, sensorDataQueue.recTime) >= 0){
                    console.log('Exist!');
                } else {
                    sensorDataQueue.recTime.push(rowData.cd);
                    sensorDataQueue.deepTmpData.push(rowData.data[1]);
                    sensorDataQueue.surfaceTmpData.push(rowData.data[0]);
                    sensorDataQueue.deepHmData.push(rowData.data[3]);
                    sensorDataQueue.surfaceHmData.push(rowData.data[2]);
                    sensorDataQueue.snapshot.push(rowData.data[9]);
                }
            });
            // console.log(sensorData);
        }).fail(function(){

        });
    }

    var _getContinueWeatherbox = function(sensorName){
            // console.log(sensorData);
            //var lastTime = weatherboxData.recTime[weatherboxData.recTime.length - 1];
            //var nextTime = moment(lastTime).add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
            var jqxhr = $.ajax({
                method: 'POST',
                url: BASE_URL,
                data: {
                    sensorName: sensorName,
                    limit: 5,
                    //start: lastTime,
                    //end: nextTime
                }
            }).done(function(rtnData){
                // console.log(rtnData.data.row);
                $.each(rtnData.data.row, function(index, rowData){
                    // console.log(rowData.cd);
                    if($.inArray(rowData.cd, weatherboxDataQueue.recTime) >= 0){
                        console.log('Exist!');
                    } else {
                        weatherboxDataQueue.recTime.push(rowData.cd);
                        weatherboxDataQueue.temperature.push({value: [rowData.cd, rowData.data[0]]});
                        weatherboxDataQueue.humidity.push({value: [rowData.cd, rowData.data[1]]});
                        weatherboxDataQueue.illuminance.push(rowData.data[4]);
                        weatherboxDataQueue.rainfall.push(!rowData.data[3]?0:rowData.data[3]);
                    }
                });
                // console.log(sensorData);
            }).fail(function(){
    
            });
    }

    var _playMonitor = function() {
		console.log(defaultSensorName);
        if(!monitorTimeHandle){
            monitorTimeHandle = setInterval(function(){
            	console.log('drawing:' + drawing);
            	if (!drawing) {
            		Agriweather.initialize();
            		Agriweather.drawMonitor(defaultSensorName);
            	}
            }, 10000);
        }
    }

    var _playSensor = function(){
        if(!sensorTimeHandle){
            sensorTimeHandle = setInterval(function(){
                console.log(sensorDataQueue.recTime.length);
                if(sensorDataQueue.recTime.length < 5){
                    _getContinueSensor(defaultSensorName);
                }
                //remove first data
                sensorData.recTime.shift();
                sensorData.deepTmpData.shift();
                sensorData.surfaceTmpData.shift();
                sensorData.deepHmData.shift();
                sensorData.surfaceHmData.shift();
                sensorData.snapshot.shift();

                sensorData.recTime.push(sensorDataQueue.recTime.shift());
                sensorData.deepTmpData.push(sensorDataQueue.deepTmpData.shift());
                sensorData.surfaceTmpData.push(sensorDataQueue.surfaceTmpData.shift());
                sensorData.deepHmData.push(sensorDataQueue.deepHmData.shift());
                sensorData.surfaceHmData.push(sensorDataQueue.surfaceHmData.shift());
                sensorData.snapshot.push(sensorDataQueue.snapshot.shift());

                _updateSensorChart();
            }, 5000);
        }
    }

    var _playWeatherbox = function(){
        if(!weatherboxTimeHandle){
            weatherboxTimeHandle = setInterval(function(){
                console.log(weatherboxDataQueue.recTime.length);
                if(weatherboxDataQueue.recTime.length < 5){
                    _getContinueWeatherbox(defaultSensorName);
                }
                //remove first data
                weatherboxData.recTime.shift();
                weatherboxData.temperature.shift();
                weatherboxData.humidity.shift();
                weatherboxData.illuminance.shift();
                weatherboxData.rainfall.shift();
    
                weatherboxData.recTime.push(weatherboxDataQueue.recTime.shift());
                weatherboxData.temperature.push(weatherboxDataQueue.temperature.shift());
                weatherboxData.humidity.push(weatherboxDataQueue.humidity.shift());
                weatherboxData.illuminance.push(weatherboxDataQueue.illuminance.shift());
                weatherboxData.rainfall.push(weatherboxDataQueue.rainfall.shift());
    
                _updateWeatherboxChart();
            }, 10000);
        }
    }

    var playChart = function(){
        console.log('click play!');
        //_playSensor();
        //_playWeatherbox();
        _playMonitor();
    }

    var pauseChart = function(){
        console.log('click pause!');
        // clearInterval(sensorTimeHandle);
        // sensorTimeHandle = null;

        // clearInterval(weatherboxTimeHandle);
        // weatherboxTimeHandle = null;
        clearInterval(monitorTimeHandle);
        monitorTimeHandle = null;
    }

    var converLunar = function(strdate){
        // var spliteDate = strdate.split();
        var objMnt = moment(strdate);
        var Y = objMnt.year();
        var M = objMnt.month() + 1;
        var D = objMnt.date();
        return LunarDate.GetLunarDay(Y, M, D);
    }

    return {
        initialize: initialize,
        drawSensor: drawSensor,
        drawWeatherbox: drawWeatherbox,
        playChart: playChart,
        pauseChart: pauseChart,
        converLunar: converLunar,
        drawMonitor: drawMonitor
    }

}());


$(document).ready(function(){
    $('#start-time').val(moment().format('YYYY-MM-DD HH:mm:ss'));
    var initStartTime = $('#start-time').val();
    var initEndTime = moment(initStartTime).add(2, 'hour').format('YYYY-MM-DD HH:mm:ss');
    Agriweather.initialize();
    Agriweather.drawMonitor(defaultSensorName);
	Agriweather.playChart();
    // Agriweather.initialize();
    // Agriweather.drawSensor(defaultSensorName, initStartTime, initEndTime);
    // Agriweather.drawWeatherbox(defaultSensorName, initStartTime, initEndTime);
    
    //$('#lunar-date').text(Agriweather.converLunar(initStartTime));
    
    
    $('#play-chart').on('click', function(){
        Agriweather.playChart();
        $(this).addClass('status-runing');
        $('#pause-chart').removeClass('status-runing');
    });

    $('#pause-chart').on('click', function(){
        Agriweather.pauseChart();
        $(this).addClass('status-runing');
        $('#play-chart').removeClass('status-runing');
    });

    $('#toggle-setting').click(function(){
       $('#agri-setting').toggle('slow'); 
    });

    $('#start-time').change(function(){
        //var initStartTime = $(this).val();
        //var initEndTime = moment(initStartTime).add(2, 'hour').format('YYYY-MM-DD HH:mm:ss');
        Agriweather.initialize();
        Agriweather.drawMonitor(defaultSensorName);
        //Agriweather.drawSensor(defaultSensorName, initStartTime, initEndTime);
        //Agriweather.drawWeatherbox(defaultSensorName, initStartTime, initEndTime);
        //$('#lunar-date').text(Agriweather.converLunar(initStartTime));

    });
	
	$('#sensorName').change(function(){
		console.log("sensor change:"+ $('#sensorName').val());
		defaultSensorName = $('#sensorName').val();
		Agriweather.drawMonitor(defaultSensorName);
		//Agriweather.playChart();
	});
	
});