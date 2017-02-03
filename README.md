# KonnektDT
*This is a part of the Konnekt package*

#### Description
An observable data module that can be used on its own for having an observable data structure in your application

#### Install

`npm install konnektdt`

###### Start DOM
``` var mixed = KonnektDT(); //constructor
var myMixedObj = mixed(/* You can pass data here to be parsed */);```

###### Start Node
``` var mixed = require('konnektdt')(); //constructor
var myMixedObj = mixed(/* You can pass data here to be parsed */);
```

###### Simple Single Layer Events
```var myMixedObj = mixed({testkey:'test',testarr:[1,2,3],testobj:{testgreet:'hi'}});

/* All listener methods are chainable */

/* listens for a change to testkey property, prior to being set (can preventDefault) */
myMixedObj.addDataListener('testkey',function(e){ 
  console.log("testkey is changing to: %o",e.value);
  e.preventDefault(); //prevents the value from changing to the new set value *update wont fire when this is used
})

/* listens for a change to testkey property, after the value has been set (can not preventDefault) */
.addDataUpdateListener('testkey',function(e){
  console.log("testkey has changed to: %o",e.value);
})

/* '*' means listen to all changes on any property on this layer */
.addDataListener('*',function(e){
  console.log("%o is changing to %o",e.key,e.value);
})

/* You can also select properties down the tree to add listeners to */
.addDataListener('testobj.testgreet',function(e){
  console.log("testgreet is changing to: %o",e.value);
})

/* this listens for any new property creations added to this object layer */
.addDataCreateListener(function(e){
  console.log("%o is being added to %o with a value of %o",e.key,e.local,e.value);
  e.preventDefault(); //this can also prevent new additions to the object
})

/* this listens for any attempts to delete a property on this object layer */
.addDataDeleteListener(function(e){
  console.log("%o is being deleted on %o",e.key,e.local);
  e.preventDefault(); //this can also prevent deletions to the object
})

/* Each method also has an equivelant remove method, for removing the listener 
   *(note) remember to save the function to match for removal, same as standard dom events */
function func(e){
  console.log("change happening on %o to value %o",e.key,e.value);
}

myMixedObj.addDataListener('*',func)
.removeDataListener('*',func);
```

###### Complex MultiLayer Events
```var myMixedObj = mixed({testkey:'test',testarr:[1,2,3,[10,11,12,[20,21,22]]],testobj:{testgreet:'hi',testother:{testgreet:'goodbye'}}});
   
/* All listener methods are chainable */
   
/* listens for a change on all testgreet properties in this object, prior to being set (can preventDefault) */
myMixedObj.addChildDataListener('testgreet',function(e){
 console.log('testgreet is changing to: %o on layer: %o',e.value,e.local);
 e.preventDefault(); //can prevent changes to all keys with this name
})

/* listens for a change on all testgreet properties in this object, after the value has been set (can not preventDefault) */
.addChildDataUpdateListener('0',function(e){
  console.log(" index 0 has changed to: %o on layer: %o",e.value,e.local);
})

/* '*' means listen to all changes on any property on any layer in the entire object */
.addChildDataUpdateListener('*',function(e){
  console.log("%o has changed to: %o on layer: %o",e.key,e.value,e.local);
})

/* this listens for any new property creations added to any layer on the entire object */
.addChildDataCreateListener(function(e){
  console.log("%o is being added to %o with a value of %o",e.key,e.local,e.value);
  e.preventDefault(); //this can also prevent new additions
})

/* this listens for any attempts to delete a property to any layer on the entire object */
.addChildDataDeleteListener(function(e){
  console.log("%o is being deleted on %o",e.key,e.local);
  e.preventDefault(); //this can also prevent deletions
})

/* Each method also has an equivelant remove method, for removing the listener 
   *(note) remember to save the function to match for removal, same as standard dom events */
function func(e){
  console.log("change happening on %o to value %o on layer %o",e.key,e.value,e.local);
}

myMixedObj.addChildDataListener('*',func)
.removeChildDataListener('*',func);

/* These are more advanced methods that require care when using */

/* You can listen to properties that have a certain parent property name */
myMixedObj.addChildDataListener('3.0',function(e){
  console.log("%o is changing to %o on layer %o",e.key,e.value,e.local);
});

/* Explanation: 
   This basically will look at the whole object and with every layer that has a key of '3' with a sub prop of '0' it will listen to,
   ex: both of these props will be listened to
   [1,2,3,[10 <- key of 0] <- key of 3]
   [1,2,3,[10,11,12,[20 <- key of 0] <- key of 3]]
*/
```