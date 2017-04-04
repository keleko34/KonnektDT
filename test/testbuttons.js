define([],function(){
  
  function testbuttons()
  {
    var config = {onclick:function onclick(e){}};
    
    function testEvent(name)
    {
      return function(e)
      {
        var uls = document.querySelectorAll('ul#mocha-stats');
        for(var x=0,len=uls.length;x<len;x++)
        {
          uls[x].parentElement.removeChild(uls[x]);
        }
        config.onclick(name);
      }
    }
    
    
    var buttonList = document.querySelector('.Button_list');
    
    var clearButton = document.createElement('button');
    clearButton.innerHTML = "Clear Tests";
    clearButton.onclick = function(e)
    {
      var uls = document.querySelectorAll('ul');
      for(var x=0,len=uls.length;x<len;x++)
      {
        uls[x].parentElement.removeChild(uls[x]);
      }
    }
    
    window._Proxy = window.Proxy;
    var useProxyButton = document.createElement('button'),
        useProxy = (!!window._Proxy);
    useProxyButton.innerHTML = "Use Proxy: "+(useProxy ? 'on' : 'off');
    useProxyButton.onclick = function()
    {
      if(!!window._Proxy)
      {
        useProxy = !useProxy;
        useProxyButton.innerHTML = "Use Proxy: "+(useProxy ? 'on' : 'off');
        if(useProxy)
        {
          window.Proxy = window._Proxy;
        }
        else
        {
          window.Proxy = undefined;
        }
      }
    }
    
    var tests = '<h2>Tests</h2><div class="Button_list__TestList"></div>',
        testContainer = document.createElement('div');
    testContainer.innerHTML = tests;
    var testList = testContainer.querySelector('.Button_list__TestList');
    
    var constructButton = document.createElement('button');
    constructButton.innerHTML = "Constructor Test";
    constructButton.onclick = testEvent('test_simple_create');
    
    var simpleBindButton = document.createElement('button');
    simpleBindButton.innerHTML = "Simple Single Layer Bind Test";
    simpleBindButton.onclick = testEvent('test_simple_bind');
    
    var multiBindButton = document.createElement('button');
    multiBindButton.innerHTML = "Multi Layer Bind Test";
    multiBindButton.onclick = testEvent('test_multi_bind');
    
    var pointerBindButton = document.createElement('button');
    pointerBindButton.innerHTML = "Pointer Bind Test";
    pointerBindButton.onclick = testEvent('test_pointer_bind');
    
    buttonList.appendChild(clearButton);
    buttonList.appendChild(useProxyButton);
    buttonList.appendChild(testContainer);
    
    /* tests */
    testList.appendChild(constructButton);
    testList.appendChild(simpleBindButton);
    testList.appendChild(multiBindButton);
    testList.appendChild(pointerBindButton);
    
    return config;
  }
  
  return testbuttons;
});