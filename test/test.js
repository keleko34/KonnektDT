define(['./testbuttons'],function(testbuttons){
  function test(mixed,mocha,chai)
  {
    var expect = chai.expect,
        tests = {
          test_simple_create:test_simple_create,
          test_simple_bind:test_simple_bind,
          test_multi_bind:test_multi_bind,
          test_pointer_bind:test_pointer_bind
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
            expect(mixedData.isObservable(mixedData,'0')).to.equal(true);
            expect(mixedData.isObservable(mixedData,'1')).to.equal(true);
            expect(mixedData.isObservable(mixedData,'2')).to.equal(true);
            
            expect(mixedData.isObservable(mixedData[1],'greet')).to.equal(true);
            expect(mixedData.isObservable(mixedData[2],'0')).to.equal(true);
            
            expect(mixedData.isObservable(mixedData[2][1],'greet')).to.equal(true);
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
            
            if(!window.Proxy)
            {
              mixedData.add(mixedData.length,500);
            }
            else
            {
              mixedData[mixedData.length] = 500;
            }
          });
          it("Should bind and update listener when a property is removed",function()
          {
            var mixedData = mixed(data,"test");
            
            mixedData.addDataUpdateListener(function(e){
              expect(e.value).to.equal(3);
              expect(e.local.length).to.equal(2);
              expect(mixedData[e.key]).to.equal(undefined);
              expect(mixedData[0]).to.equal(undefined);
            });
            
            if(!window.Proxy)
            {
              mixedData.del(0);
            }
            else
            {
              delete mixedData[0];
            }
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
              expect(values).to.include.members([e.value]);
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
      var data = {test:[{test:'test'},300,{q:{why:200}}],k:200,q:{test:'something',why:{tes:{test:'cool'}}}};
      
       describe("Mixed Multi Layer Bind", function() {
        describe("bind", function() {
          it("Should bind and update listener when any sub property with 'test' updates",function()
          {
            var mixedData = mixed(data,"test"),
                parents = [mixedData.q.why.tes,mixedData.q,mixedData.test[0],mixedData];
            
            mixedData.addChildDataUpdateListener('test',function(e){
              expect(e.value).to.equal(500);
              expect(e.key).to.equal('test');
              expect(parents).to.deep.include.members([e.local]);
            });
            
            mixedData.q.why.tes.test = 500;
            mixedData.q.test = 500;
            mixedData.test[0].test = 500;
            mixedData.test = 500;
          });
          it("Should bind and update listener when any sub property from 'q.why' updates",function()
          {
            var mixedData = mixed(data,"test"),
                parents = [mixedData.q,mixedData.test[2].q];
            
            mixedData.addChildDataUpdateListener('q.why',function(e){
              expect(e.value).to.equal(500);
              expect(e.key).to.equal('why');
              expect(parents).to.deep.include.members([e.local]);
            });
            
            mixedData.q.why = 500;
            mixedData.test[2].q.why = 500;
          });
          it("Should prevent setting of any property named 'test'",function()
          {
            var mixedData = mixed(data,"test"),
                parents = [mixedData.q.why.tes,mixedData.q,mixedData.test[0],mixedData],
                values = ['cool','something','test',mixedData.test];
            
            mixedData.addChildDataListener('test',function(e){
              e.preventDefault();
            })
            .addChildDataUpdateListener('test',function(e){
              expect(values).to.include.members([e.value]);
              expect(parents).to.deep.include.members([e.local]);
            });
            
            mixedData.q.why.tes.test = 500;
            mixedData.q.test = 500;
            mixedData.test[0].test = 500;
            mixedData.test = 500;
          });
          it("Should watch for any changes to the entire object scope with '*'",function()
          {
            var mixedData = mixed(data,"test"),
                keys = ['test','why','k',1],
                values = ['test',200,200,300],
                count = 0;
            mixedData.addChildDataUpdateListener('*',function(e){
              expect(e.key).to.equal(keys[count]);
              expect(e.oldValue).to.equal(values[count]);
              expect(e.value).to.equal(500);
              count += 1;
            });
            
            mixedData.test[0].test = 500;
            mixedData.test[2].q.why = 500;
            mixedData.k = 500;
            mixedData.test[1] = 500;
            
          });
          it("Should watch for any newly created properties on the entire object",function()
          {
            var mixedData = mixed(data,"test"),
                parents = [mixedData.test,mixedData.q,mixedData.q.why.tes];
            
            mixedData.addChildDataUpdateListener('newprop',function(e){
              expect(e.event).to.equal('create');
              expect(e.key).to.equal('newprop');
              expect(['newprop',3]).to.include(e.key);
              expect(e.value).to.equal(500);
              expect(e.oldValue).to.equal(undefined);
              expect(parents).to.deep.include.members([e.local]);
            });
            
            if(!window.Proxy)
            {
              mixedData.test.add(mixedData.test.length,500);
              mixedData.q.add('newprop',500);
              mixedData.q.why.tes.add('newprop',500);
            }
            else
            {
              mixedData.test[mixedData.test.length] = 500;
              mixedData.q.newprop = 500;
              mixedData.q.why.tes.newprop = 500;
            }
          });
          it("Should watch for any deleted items on the entire object",function()
          {
              var mixedData = mixed(data,"test"),
                  parents = [mixedData.test,mixedData.q,mixedData.q.why.tes],
                  keys = ["1",'test','test'],
                  values = [300,'something','cool'],
                  ranDeleteEvent = false;
            
              mixedData.addChildDataUpdateListener('*',function(e){
                //array uses splice so we get some set events in there
                if(e.event === 'delete')
                {
                  ranDeleteEvent = true;
                  expect(parents).to.deep.include.members([e.local]);
                  expect(keys).to.deep.include.members([e.key]);
                  expect(values).to.deep.include.members([e.oldValue]);
                }
              });
              
              if(!window.Proxy)
              {
                mixedData.test.del(1);
                mixedData.q.del('test');
                mixedData.q.why.tes.del('test');
              }
              else
              {
                delete mixedData.test[1];
                delete mixedData.q.test;
                delete mixedData.q.why.tes.test;
              }
            expect(ranDeleteEvent).to.equal(true);
          });
        });
       });
      
      mocha.run();
    }
    
    function test_pointer_bind()
    {
      var dataA_A = {coolio:'super'},
          dataA_B = {coolio:'super'},
          dataA_C = {coolio:'super'},
          dataB = [
            {s:'q',test:'yay',fire:{to:{tell:'something'}}},
            {s:'g',test:'far',fire:{to:{tell:'how'}}},
            {s:'f',test:'cool',fire:{to:{tell:'why'}}}
          ];
      
       describe("Mixed Multi Layer Bind", function() {
        describe("bind", function() {
          it("Should attach a pointer dynamicly and still hold the past parent",function()
          {
            var mixedDataB = mixed(dataB,'dataB'),
                mixedDatasA = [],
                keys = ['s','test','fire'],
                keys_B = ['test','tell'];
              
              for(var x=0,len=mixedDataB.length;x<len;x++)
              {
                mixedDatasA.push(mixed({},'dataA'+x));
                
                (function(it){
                  mixedDatasA[it].addDataUpdateListener('*',function(e){
                    if(e.event === 'create')
                    {
                      expect(e.local.__kbref).to.deep.equal(mixedDataB);
                      expect(e.root).to.deep.equal(mixedDataB);
                      expect(keys).to.include.members([e.key]);
                    }
                  });
                  
                  for(var i=0,keys=Object.keys(mixedDataB[it]),lenI=keys.length;i<lenI;i++)
                  {
                    mixedDatasA[it].addPointer(mixedDataB[it],keys[i]);
                  }
                  
                  
                }(x))
              }
          });
          it("Should have the same values tied across both points",function()
          {
              var mixedDataB = mixed(dataB,'dataB'),
                  mixedDatasA = [],
                  keys_B = ['test','tell'];
            
              for(var x=0,len=mixedDataB.length;x<len;x++)
              {
                (function(it){
                  mixedDatasA.push(mixed({},'dataA'+x));
                  
                  for(var i=0,keys=Object.keys(mixedDataB[it]),lenI=keys.length;i<lenI;i++)
                  {
                    mixedDatasA[it].addPointer(mixedDataB[it],keys[i]);
                  }
                  
                  mixedDatasA[it].addDataUpdateListener('test',function(e){
                    expect(e.name).to.equal('dataB');
                    expect(e.local.__kbname).to.equal('dataB');
                    expect(e.local.__kbref).to.deep.equal(mixedDataB);
                    expect(e.root).to.deep.equal(mixedDataB);
                    expect([500,700]).to.include.members([e.value]);
                    expect(keys_B).to.include.members([e.key]);
                    expect(mixedDataB[it].test).to.equal(mixedDatasA[it].test);
                  })
                  .addDataUpdateListener('fire.to.tell',function(e){
                    expect(e.name).to.equal('dataB');
                    expect(e.local.__kbname).to.equal('dataB');
                    expect(e.local.__kbref).to.deep.equal(mixedDataB);
                    expect(e.root).to.deep.equal(mixedDataB);
                    expect([500,700]).to.include.members([e.value]);
                    expect(keys_B).to.include.members([e.key]);
                    expect(mixedDataB[it].fire.to.tell).to.equal(mixedDatasA[it].fire.to.tell);
                  });
                  
                  mixedDatasA[it].test = 500;
                  mixedDatasA[it].fire.to.tell = 500;
                  
                  mixedDataB[it].test = 700;
                  mixedDataB[it].fire.to.tell = 700;
                }(x))
              }
          })
        });
       });
      
       mocha.run();
    }
  }
  return test;
});