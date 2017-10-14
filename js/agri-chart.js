
function getAgriSensor() {
    var sensorData = {
        recTime: [],
        deepTmpData: [],
        surfaceTmpData: [],
        deepHmData: [],
        surfaceHmData: [],
    }

    var weatherboxData = {
        recTime: [],
        temperature: [],
        humidity: [],
        illuminance: [],
        rainfall:[],
    }

    var jqxhr = $.ajax({
        method: "POST",
        url: "http://demo.smartdog.com.tw/agri/mobile/AgriData",
        data: {
            length: "3600",
            start: "2017-06-30 16:00:00",
            end: "2017-06-30 23:59:59"
        }
    }).done(function (rtndata) {
        // console.log(data.data[2]);
        var srData = rtndata.data[2].Data;
        var wbData = rtndata.data[6].Data;

        $.each(srData, function(index, value){

            if($.inArray(value[0], sensorData.recTime) >= 0){
                console.log('Exist!');
            } else {
                sensorData.recTime.push(value[0]);
                sensorData.deepTmpData.push(value[1]);
                sensorData.surfaceTmpData.push(value[2]);
                sensorData.deepHmData.push(value[3]);
                sensorData.surfaceHmData.push(value[4]);
            }
        });

        $.each(wbData, function(index, value){
            if($.inArray(value[0], weatherboxData.recTime) >= 0){
                console.log('Weatherbox time Exist!');
            } else {
                weatherboxData.recTime.push(value[0]);
                weatherboxData.temperature.push({value: [value[0], value[1]]});
                weatherboxData.humidity.push({value: [value[0], value[2]]});
                weatherboxData.illuminance.push(value[3]);
                weatherboxData.rainfall.push(value[4]);
            }
        });
    }).fail(function () {
        alert("error");
    }).always(function () {
        drawSoilTemperature(sensorData);
        drawSoilHumidity(sensorData);
        // console.log(deepTmpData);
        drawWeatherTemperature(weatherboxData);
        drawWeatherHumidity(weatherboxData);
        drawIlluminance(weatherboxData);
        drawRainfall(weatherboxData);
    });
}

/**
 * 繪製「大氣溫度」圖形
 * 
 * @param {object} weatherboxData 
 */
function drawWeatherTemperature(weatherboxData){
    // var data = [];
    // var now = +new Date(1997, 9, 3);
    // var oneDay = 24 * 3600 * 1000;
    // var value = Math.random() * 1000;
    // for (var i = 0; i < 1000; i++) {
    //     data.push(randomData());
    // }
    // console.log(data);
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
    
    // setInterval(function () {
    
    //     for (var i = 0; i < 5; i++) {
    //         data.shift();
    //         data.push(randomData());
    //     }
    
    //     myChart1.setOption({
    //         series: [{
    //             data: data
    //         }]
    //     });
    // }, 1000);
    
    var myChart1 = echarts.init(document.getElementById('main1'), 'dark');
    myChart1.setOption(option1);
}


/**
 * 繪製「大氣濕度」圖形
 * 
 * @param {object} weatherboxData 
 */
function drawWeatherHumidity(weatherboxData){
    // var data = [];
    // var now = +new Date(1997, 9, 3);
    // var oneDay = 24 * 3600 * 1000;
    // var value = Math.random() * 1000;
    // for (var i = 0; i < 1000; i++) {
    //     data.push(randomData());
    // }
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
    
    // setInterval(function () {
    
    //     for (var i = 0; i < 5; i++) {
    //         data.shift();
    //         data.push(randomData());
    //     }
    
    //     myChart2.setOption({
    //         series: [{
    //             data: data
    //         }]
    //     });
    // }, 1000);
    
    var myChart2 = echarts.init(document.getElementById('main2'), 'dark');
    myChart2.setOption(option2);    
}

/**
 * 繪製「光照強度」圖形
 * 
 * @param {object} weatherboxData 
 */
function drawIlluminance(weatherboxData) {
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
    
    // setInterval(function () {
    //     option.series[0].data[0].value = (Math.random() * 100).toFixed(2) - 0;
    //     option.series[1].data[0].value = (Math.random() * 7).toFixed(2) - 0;
    //     option.series[2].data[0].value = (Math.random() * 2).toFixed(2) - 0;
    //     option.series[3].data[0].value = (Math.random() * 2).toFixed(2) - 0;
    //     myChart3.setOption(option);
    // }, 2000)
    
    var myChart3 = echarts.init(document.getElementById('main3'), 'dark');
    myChart3.setOption(option3);    
}


/**
 * 繪製「降雨量」圖形
 * 
 * @param {object} weatherboxData 
 */
function drawRainfall(weatherboxData){
    option4 = {
        title: {
            //text: '柱状图动画延迟'
        },
        /**
        legend: {
            data: ['bar', 'bar2'],
            align: 'left'
        },
        **/
        /**
        toolbox: {
            // y: 'bottom',
            feature: {
                magicType: {
                    type: ['stack', 'tiled']
                },
                dataView: {},
                saveAsImage: {
                    pixelRatio: 2
                }
            }
        },
        **/
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
    var myChart4 = echarts.init(document.getElementById('main4'), 'dark');
    myChart4.setOption(option4);     
}

/**
 * 繪製「土壤溫度」圖形
 * @param {object} sensorData 
 */
function drawSoilTemperature(sensorData){
    var dataY = [];
    
    var option5 = {
        title: {
            text: '土溫變化',
            subtext: '最後更新時間：2017-07-01 11:06:29'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['淺層土温', '深層土温']
        },
        /**
        toolbox: {
            show: true,
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                dataView: { readOnly: false },
                magicType: { type: ['line', 'bar'] },
                restore: {},
                saveAsImage: {}
            }
        },
        **/
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
    
    var myChart5 = echarts.init(document.getElementById('main5'), 'dark');
    myChart5.setOption(option5);
}

/**
 * 繪製「土壤濕度」圖形
 * 
 * @param {object} sensorData 
 */
function drawSoilHumidity(sensorData){
    var option6 = {
        title: {
            text: '濕度變化',
            subtext: '最後更新時間：2017-07-01 11:06:29'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['淺層濕度', '深層濕度']
        },
        /**
        toolbox: {
            show: true,
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                dataView: { readOnly: false },
                magicType: { type: ['line', 'bar'] },
                restore: {},
                saveAsImage: {}
            }
        },
        **/
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
    
    var myChart6 = echarts.init(document.getElementById('main6'), 'dark');
    myChart6.setOption(option6);
    
}

getAgriSensor();