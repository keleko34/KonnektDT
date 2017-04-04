define(['./testbuttons'],function(testbuttons){
  function test(mixed,mocha,chai)
  {
    var expect = chai.expect,
        tests = {
          test_simple_create:test_simple_create,
          test_simple_bind:test_simple_bind,
          test_multi_bind:test_multi_bind
        };
    
    /* setup test buttons */
    testbuttons().onclick = function(test){
      mocha.suite.suites = [];
      tests[test]();
    };
    
    function test_simple_create()
    {
      var data = [3,{greet:"Hello"},[4,{greet:"Goodbye"}]];
      
      describe("Mixed Data", function() {
        describe("constructor", function() {
          it("Should convert all rows to observables", function() {
            var mixedData = mixed(data);
            expect(mixed.isObservable(mixedData,'0')).to.equal(true);
            expect(mixed.isObservable(mixedData,'1')).to.equal(true);
            expect(mixed.isObservable(mixedData,'2')).to.equal(true);
            
            expect(mixed.isObservable(mixedData[1],'greet')).to.equal(true);
            expect(mixed.isObservable(mixedData[2],'0')).to.equal(true);
            
            expect(mixed.isObservable(mixedData[2][1],'greet')).to.equal(true);
          });

          it("should set the data __kbname to test", function() {
            var mixedData = mixed(data,"test");
            
            expect(mixedData.__kbname).to.equal("test");
            expect(mixedData[1].__kbname).to.equal("test");
            expect(mixedData[2].__kbname).to.equal("test");
            expect(mixedData[2][1].__kbname).to.equal("test");
          });
          
          it("should set the appropriate __kbref attribute", function() {
            var mixedData = mixed(data,"test");
            
            expect(mixedData.__kbref).to.deep.equal(mixedData);
            expect(mixedData[1].__kbref).to.deep.equal(mixedData);
            expect(mixedData[2].__kbref).to.deep.equal(mixedData);
            expect(mixedData[2][1].__kbref).to.deep.equal(mixedData);
          });
          
          it("should set the appropriate __kbImmediateParent attribute", function() {
            var mixedData = mixed(data,"test");
            
            expect(mixedData.__kbImmediateParent).to.equal(null);
            expect(mixedData[1].__kbImmediateParent).to.deep.equal(mixedData);
            expect(mixedData[2].__kbImmediateParent).to.deep.equal(mixedData);
            expect(mixedData[2][1].__kbImmediateParent).to.deep.equal(mixedData[2]);
          });
        });
      });
      
      mocha.run();
    }
    
    function test_simple_bind()
    {
      var data = [3,{greet:"Hello"},[4,{greet:"Goodbye"}]];
      
      describe("Mixed Single Layer Bind", function() {
        describe("bind", function() {
          it("Should bind and update listener when a property is changed",function()
          {
            var mixedData = mixed(data,"test");
            
            mixedData.addDataUpdateListener('0',function(e){
              expect(e.value).to.equal(500);
              expect(mixedData[e.key]).to.equal(500);
              expect(mixedData[0]).to.equal(500);
            });
            
            mixedData[0] = 500;
          });
          it("Should bind and update listener when a property is added",function()
          {
            var mixedData = mixed(data,"test");
            
            mixedData.addDataUpdateListener(function(e){
              expect(e.value).to.equal(500);
              expect(mixedData[e.key]).to.equal(500);
              expect(mixedData[(mixedData.length-1)]).to.equal(500);
            });
            
            mixedData[mixedData.length] = 500;
          });
          it("Should bind and update listener when a property is removed",function()
          {
            var mixedData = mixed(data,"test");
            
            mixedData.addDataUpdateListener(function(e){
              expect(e.value).to.equal(3);
              expect(mixedData[e.key]).to.equal(undefined);
              expect(mixedData[0]).to.equal(undefined);
            });
            
            delete mixedData[0];
          }); 
          it("Should bind and preventDefault of a property",function()
          {
            var mixedData = mixed(data,"test");
            
            mixedData.addDataListener('0',function(e){
              e.preventDefault();
            });
            
            mixedData.addDataUpdateListener('0',function(e){
              expect(e.value).to.equal(500);
              expect(mixedData[e.key]).to.equal(3);
              expect(mixedData[0]).to.equal(3);
            });
            
            mixedData[0] = 500;
          });
          it("Should bind and watch all properties on a layer",function()
          {
            var mixedData = mixed(data,"test"),
                values = [500,1000,2000],
                count = 0;
            
            mixedData.addDataUpdateListener('*',function(e){
              expect(e.value).to.equal(values[count]);
              expect(e.key.toString()).to.equal(count.toString());
              count += 1;
            });
            
            mixedData[0] = values[0];
            mixedData[1] = values[1];
            mixedData[2] = values[2];
          });
        });
      });
      
      mocha.run();
    }
    
    function test_multi_bind()
    {
       
    }
  }
  return test;
});