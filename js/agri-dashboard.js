var Agriweather;

Agriweather = (function(){
    if (!window.jQuery) { throw new Error("LikeButtonModule requires jQuery") }
    // this line declares the module dependency and
    // gives the global variable a local reference.
    var $ = window.jQuery;
    var hostName = location.hostname;
    hostName += ":8080";
    // var BASE_URL = 'http://52.175.204.58/MobileV2/GetAgriSensorData';
    var BASE_URL = "http://" + hostName + "/MobileV2/Monitor";
    var sensorData , weatherboxData, sensorDataQueue, weatherboxDataQueue;

    var myChart1, myChart2, myChart3, myChart4, myChart5, myChart6;
    var sensorTimeHandle = null, weatherboxTimeHandle = null;

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
        }
    
        weatherboxData = {
            recTime: [],
            temperature: [],
            humidity: [],
            illuminance: [],
            rainfall:[],
        }
    
        sensorDataQueue = {
            recTime: [],
            deepTmpData: [],
            surfaceTmpData: [],
            deepHmData: [],
            surfaceHmData: [],
        }
    
        weatherboxDataQueue = {
            recTime: [],
            temperature: [],
            humidity: [],
            illuminance: [],
            rainfall:[],
        }

        myChart1 = echarts.init(document.getElementById('main1'), 'dark');
        myChart2 = echarts.init(document.getElementById('main2'), 'dark');
        myChart3 = echarts.init(document.getElementById('main3'), 'dark');
        myChart4 = echarts.init(document.getElementById('main4'), 'dark');
        myChart5 = echarts.init(document.getElementById('main5'), 'dark');
        myChart6 = echarts.init(document.getElementById('main6'), 'dark');
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
                }
            });
            // console.log(sensorData);
        }).fail(function(){

        }).always(function(){
            _drawSoilTemperature(sensorData);
            _drawSoilHumidity(sensorData);
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
                    weatherboxData.rainfall.push(!rowData.data[8]?0:rowData.data[8]);
                }
            });
        }).fail(function(){

        }).always(function(){
            _drawWeatherTemperature(weatherboxData);
            _drawWeatherHumidity(weatherboxData);
            _drawIlluminance(weatherboxData);
            _drawRainfall(weatherboxData);
        });
    }

    /**
     * 繪製「大氣溫度」圖形
     * 
     * @param {object} weatherboxData 
     */
    var _drawWeatherTemperature = function(weatherboxData){
        var lastValue = weatherboxData.temperature[weatherboxData.temperature.length - 1];
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
                boundaryGap: [0, '100%'],
                splitLine: {
                    show: false
                }
            },
            series: [{
                name: '大氣溫度',
                type: 'line',
                showSymbol: false,
                hoverAnimation: false,
                data: weatherboxData.temperature
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
        var lastValue = weatherboxData.humidity[weatherboxData.humidity.length - 1];
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
                boundaryGap: [0, '100%'],
                splitLine: {
                    show: false
                }
            },
            series: [{
                name: '大氣溼度',
                type: 'line',
                showSymbol: false,
                hoverAnimation: false,
                data: weatherboxData.humidity
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
                    name: '光照',
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
        option4 = {
            title: {
                //text: '柱状图动画延迟'
            },
            tooltip: {},
            xAxis: {
                data: weatherboxData.recTime,
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
                data: weatherboxData.rainfall,
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
                text: '土溫變化',
                // subtext: '最後更新時間：2017-07-01 11:06:29'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['淺層土温', '深層土温']
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: sensorData.recTime,
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value} °C'
                }
            },
            series: [
                {
                    name: '淺層土温',
                    type: 'line',
                    data: sensorData.surfaceTmpData,
                    markPoint: {
                        data: [
                            { type: 'max', name: '最大值' },
                            { type: 'min', name: '最小值' }
                        ]
                    },
                    markLine: {
                        data: [
                            { type: 'average', name: '平均值' }
                        ]
                    }
                },
                {
                    name: '深層土温',
                    type: 'line',
                    data: sensorData.deepTmpData,
                    markPoint: {
                        data: [
                            { name: '最低', value: -2, xAxis: 1, yAxis: -1.5 }
                        ]
                    },
                    markLine: {
                        data: [
                            { type: 'average', name: '平均值' },
                            [{
                                symbol: 'none',
                                x: '90%',
                                yAxis: 'max'
                            }, {
                                symbol: 'circle',
                                label: {
                                    normal: {
                                        position: 'start',
                                        formatter: '最大值'
                                    }
                                },
                                type: 'max',
                                name: '最高点'
                            }]
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
                text: '濕度變化',
                // subtext: '最後更新時間：2017-07-01 11:06:29'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['淺層濕度', '深層濕度']
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: sensorData.recTime
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value} rh'
                }
            },
            series: [
                {
                    name: '淺層濕度',
                    type: 'line',
                    data: sensorData.surfaceHmData,
                    markPoint: {
                        data: [
                            { type: 'max', name: '最大值' },
                            { type: 'min', name: '最小值' }
                        ]
                    },
                    markLine: {
                        data: [
                            { type: 'average', name: '平均值' }
                        ]
                    }
                },
                {
                    name: '深層濕度',
                    type: 'line',
                    data: sensorData.deepHmData,
                    markPoint: {
                        data: [
                            { name: '最低', value: -2, xAxis: 1, yAxis: -1.5 }
                        ]
                    },
                    markLine: {
                        data: [
                            { type: 'average', name: '平均值' },
                            [{
                                symbol: 'none',
                                x: '90%',
                                yAxis: 'max'
                            }, {
                                symbol: 'circle',
                                label: {
                                    normal: {
                                        position: 'start',
                                        formatter: '最大值'
                                    }
                                },
                                type: 'max',
                                name: '最高点'
                            }]
                        ]
                    }
                }
            ]
        };
        
        myChart6.setOption(option6);
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
    }

    var _updateWeatherboxChart = function(){
        var lastTemperature = weatherboxData.temperature[weatherboxData.temperature.length - 1];
        $('#wt').text(Math.round(lastTemperature.value[1]));
        option1 = {
            series: [{
                data: weatherboxData.temperature
            }]
        };
        myChart1.setOption(option1);

        var lastHumidity = weatherboxData.humidity[weatherboxData.humidity.length - 1];
        $('#wh').text(Math.round(lastHumidity.value[1]));
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
        var lastTime = sensorData.recTime[sensorData.recTime.length - 1];
        var nextTime = moment(lastTime).add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
        var jqxhr = $.ajax({
            method: 'POST',
            url: BASE_URL,
            data: {
                sensorName: sensorName,
                start: lastTime,
                end: nextTime
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
                }
            });
            // console.log(sensorData);
        }).fail(function(){

        });
    }

    var _getContinueWeatherbox = function(sensorName){
            // console.log(sensorData);
            var lastTime = weatherboxData.recTime[weatherboxData.recTime.length - 1];
            var nextTime = moment(lastTime).add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
            var jqxhr = $.ajax({
                method: 'POST',
                url: BASE_URL,
                data: {
                    sensorName: sensorName,
                    start: lastTime,
                    end: nextTime
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

    var _playSensor = function(){
        if(!sensorTimeHandle){
            sensorTimeHandle = setInterval(function(){
                console.log(sensorDataQueue.recTime.length);
                if(sensorDataQueue.recTime.length < 5){
                    _getContinueSensor('AgriWeather1');
                }
                //remove first data
                sensorData.recTime.shift();
                sensorData.deepTmpData.shift();
                sensorData.surfaceTmpData.shift();
                sensorData.deepHmData.shift();
                sensorData.surfaceHmData.shift();
    
                sensorData.recTime.push(sensorDataQueue.recTime.shift());
                sensorData.deepTmpData.push(sensorDataQueue.deepTmpData.shift());
                sensorData.surfaceTmpData.push(sensorDataQueue.surfaceTmpData.shift());
                sensorData.deepHmData.push(sensorDataQueue.deepHmData.shift());
                sensorData.surfaceHmData.push(sensorDataQueue.surfaceHmData.shift());
    
                _updateSensorChart();
            }, 3000);
        }
    }

    var _playWeatherbox = function(){
        if(!weatherboxTimeHandle){
            weatherboxTimeHandle = setInterval(function(){
                console.log(weatherboxDataQueue.recTime.length);
                if(weatherboxDataQueue.recTime.length < 5){
                    _getContinueWeatherbox('WeatherBox');
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
        _playSensor();
        _playWeatherbox();
    }

    var pauseChart = function(){
        console.log('click pause!');
        clearInterval(sensorTimeHandle);
        sensorTimeHandle = null;

        clearInterval(weatherboxTimeHandle);
        weatherboxTimeHandle = null;
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
        converLunar: converLunar
    }

}());


$(document).ready(function(){
    $('#start-time').val(moment().format('YYYY-MM-DD HH:mm:ss'));
    var initStartTime = $('#start-time').val();
    var initEndTime = moment(initStartTime).add(2, 'hour').format('YYYY-MM-DD HH:mm:ss');
    Agriweather.initialize();
    Agriweather.drawSensor('FieldSensorV2.1-001', initStartTime, initEndTime);
    Agriweather.drawWeatherbox('FieldSensorV2.1-001', initStartTime, initEndTime);
    $('#lunar-date').text(Agriweather.converLunar(initStartTime));

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
        var initStartTime = $(this).val();
        var initEndTime = moment(initStartTime).add(2, 'hour').format('YYYY-MM-DD HH:mm:ss');
        Agriweather.initialize();
        Agriweather.drawSensor('FieldSensorV2.1-001', initStartTime, initEndTime);
        Agriweather.drawWeatherbox('FieldSensorV2.1-001', initStartTime, initEndTime);
        $('#lunar-date').text(Agriweather.converLunar(initStartTime));
    });

});

setInterval(function() {
    console.log('interval call')
    var initStartTime = $('#start-time').val();
    Agriweather.initialize();
    Agriweather.drawSensor('FieldSensorV2.1-001', null, null);
    Agriweather.drawWeatherbox('FieldSensorV2.1-001', null, null);
    $('#lunar-date').text(Agriweather.converLunar(initStartTime));
}, 3000)