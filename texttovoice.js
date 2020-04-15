//初始设置
var speed = 1;
var language = 'ch-CN';
var voiceList = [[],[]];
var spSynUtt;
var spSynts = window.speechSynthesis;
//浏览器语言包可能会刷不出来,多刷几次
var speaktTimer = setInterval(function(){
  if(spSynts.getVoices()){//获取到语言包清除定时器
    clearInterval(speaktTimer);
    for(let item of spSynts.getVoices()){
      //将语言包存入变量中
      voiceList[0].push(item.name);
      voiceList[1].push(item.lang);
      //向语言select动态添加p标签
      var cP = document.createElement('p');
      cP.className = 'langSelectOption';
      cP.innerText = item.name + '(' + item.lang + ')';
      cP.setAttribute('data-lang',item.lang);
      $('#langSelectBox').append(cP)
    }
  }
},100);
//获取文本
  var myTxt = null;
  function getFile(){
    spSynts.cancel();//删除所有的讲话
    $('#start').css({'display':'block'});//初始化播放按钮
    $('#pause').css({'display':'none'});
    var read=document.querySelector('#chose')
    ,file=read.files;
    var reader = new FileReader();
    $('#txtname').text(file[0].name);//在显示框里显示当前文件名称
    window.localStorage.setItem('txtName',file[0].name);//添加给缓存
    reader.readAsText(file[0],'gb2312');//'gb2312'防止乱码
    reader.onload=function(){//文件加载完之后在执行操作
      myTxt = reader.result;//将文件保存给一个变量
      translateSound(myTxt);
      window.localStorage.setItem('txt',myTxt);
    }
  }
//获取本地缓存数据
  var locstoTxt = window.localStorage.getItem('txt');
  var locstoName = window.localStorage.getItem('txtName');
  var locstoIndex = window.localStorage.getItem('endIndex');
  locstoName?  $('#txtname').text(locstoName):null;
  if (locstoTxt) {
    var goOn = locstoTxt.slice(locstoIndex,locstoTxt.length);
    translateSound(goOn);
  }
//文本转换语音
  function translateSound(myTxt){
    spSynUtt = new SpeechSynthesisUtterance(myTxt);//创建SpeechSynthesisUtterance实例
    //设置音量,倍速,语言
    let volume = $('#volumeContor')[0].getAttribute('data-percent')||0.5;
    let rate = $('#rateSelect span')[0].innerText === '倍速'? 1 : $('#rateSelect span')[0].innerText;
    spSynUtt.volume = volume;
    spSynUtt.rate =  rate;
    //播放停止按钮
    $('#start').on('click',function(){
      this.style.display = 'none';
      $('#pause').css({'display':'block'});
      end? spSynts.speak(spSynUtt):null;//当前的语音合成之后再合成
      spSynts.resume();
    });
    $('#pause').on('click',function(){
      this.style.display = 'none';
      $('#start').css({'display':'block'})
      spSynts.pause();
    });
    //语音合成状态处理
    let end = true;
    spSynUtt.addEventListener('start',function(ev){//开始合成时触发
      end = false;
    })
    spSynUtt.addEventListener('end',function(ev){//合成结束时触发
      spSynts.cancel();
      $('#start').css({'display':'block'});
      $('#pause').css({'display':'none'});
      end = true;
    })
    spSynUtt.addEventListener('pause',function(ev){//暂停时触发
      window.localStorage.setItem('endIndex',ev.charIndex);
      console.log(ev);
    });
    spSynUtt.addEventListener('resume',function(ev){//重新开始时触发
      var endIndex = window.localStorage.getItem('endIndex');
      myTxt = myTxt.slice(endIndex,myTxt.length);
    });
  }
  window.onbeforeunload = function(){
    spSynts.pause();
    spSynts.cancel();
  }
//用户设置
//点击显示
  $('#volume').click(function(){//点击显示音量
    $('#volumeBox').css({'display':'block'})
  });
  $('#rateSelect').click(function(){//显示rate
    $('#rateSelect span').text('');
    $('#rateSelectBox').css({'display':'block'});
  })
  $('#langSelect').click(function(){//点击显示语言
    $('#hiddenscroll').css({'display':'block'});
  })
//音量设置
  $('#volumeBox').on('click',function(el){
    $('#volumeBox').css({'display':'block'});//点击音量控制的时候也保持显示
    var ev = el||window.event;
    //获取高度设置百分比
    var currentClentY = ev.clientY;//当前点击y坐标
    var volumePointtoTop = $('#contor')[0].offsetTop -$(document).scrollTop();//元素距离视窗顶部距离(因为这里的父级有定位是relative)
    var contorHeight = $('#volumeBox')[0].offsetHeight;//音量条高度
    var contorPoint = $('#volumePoint')[0].offsetHeight;//音量调上的调节圆点高度
    var volumePointTop = currentClentY - volumePointtoTop + contorHeight - contorPoint/2;//音量调节圆点距离顶部距离
    if (volumePointTop < 0) {
      volumePointTop = 0
    }
    if(volumePointTop > contorHeight){
      volumePointTop = contorHeight;
    }
    $('#volumePoint')[0].style.top = volumePointTop + 'px';//设置音量调节按钮距离顶部距离
    var pointPercent =(contorHeight-volumePointTop)/contorHeight;//音量控制按钮所在位置跟整个音量控制器的比例
    this.setAttribute('data-percent',pointPercent);//存入到自定义属性中
    spSynUtt? spSynUtt.volume = pointPercent:null;//设置音量
    return false
  })
//设置倍速
  $('.rateSelectOption').on('click',function(){
    let rate = this.innerText;
    $('#rateSelect span').text(rate);
    $('#rateSelectBox').css({'display':'none'});
    spSynUtt? spSynUtt.rate = rate:null;//实例存在的时候才修改速度
    return false;
  })
//设置语言
  let langchose = function(){//点击选择
    var lang = this.getAttribute('data-lang');
    $('#langSelect span').text(lang);
    $('#hiddenscroll').css({'display':'none'});
    spSynUtt? spSynUtt.lang = lang:null;//修改语言
    return false;
  }
  var langtimer = setInterval(()=>{//因为语言包是动态生成的,需要等渲染好之后再操作
    if($('.langSelectOption').length !== 0){
      clearInterval(langtimer);
      $('.langSelectOption').on('click',langchose)
    }
  },500)
//在点击页面的时候下拉框消失,注意要在时间捕获阶段触发
  document.addEventListener('click',function(ev){
    $('#volumeBox').css({'display':'none'});
    if($('#rateSelect span').text()===''){//速度
      $('#rateSelectBox').css({'display':'none'});
      $('#rateSelect span').text('倍速');
    }
    $('#hiddenscroll').css({'display':'none'});
  },true)
