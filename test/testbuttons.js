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
    
    var constructButton = document.createElement('button');
    constructButton.innerHTML = "Constructor Test";
    constructButton.onclick = testEvent('test_simple_create');
    
    var simpleBindButton = document.createElement('button');
    simpleBindButton.innerHTML = "Simple Single Layer Bind Test";
    simpleBindButton.onclick = testEvent('test_simple_bind');
    
    var multiBindButton = document.createElement('button');
    multiBindButton.innerHTML = "Multi Layer Bind Test";
    multiBindButton.onclick = testEvent('test_multi_bind');
    
    buttonList.appendChild(clearButton);
    buttonList.appendChild(constructButton);
    buttonList.appendChild(simpleBindButton);
    buttonList.appendChild(multiBindButton);
    
    return config;
  }
  
  return testbuttons;
});