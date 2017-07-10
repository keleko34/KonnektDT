define([],function(){
  function CreateKonnektDT(data,name,parent,scope)
  {
    var _events = {
          "set":[],
          "postset":[],
          "create":[],
          "postcreate":[],
          "delete":[],
          "postdelete":[],
          "splice":[],
          "postsplice":[],
          "push":[],
          "postpush":[],
          "pop":[],
          "postpop":[],
          "shift":[],
          "postshift":[],
          "unshift":[],
          "postunshift":[],
          "fill":[],
          "postfill":[],
          "reverse":[],
          "postreverse":[],
          "sort":[],
          "postsort":[],
          "addlistener":[],
          "postaddlistener":[],
          "removelistener":[],
          "postremovelistener":[],
          "addchildlistener":[],
          "postaddchildlistener":[],
          "removechildlistener":[],
          "postremovechildlistener":[]
        },
        
        _ignoreList = ['__proto__','_stopChange'],
        
        _loopEvents = function(events,e)
        {
            if(!e._stopPropogration && events)
            {
              for (var x = 0, len = events.length; x !== len; x++) 
              {
                  events[x](e);
                  if (e._stopPropogration) break;
              }
            }
        },

        _onevent = function(e)
        {
          if(e.listener)
          {
            var _local = e.local[e.listener],
                _child = e.local[(e.listener.replace('__kb','__kbparent'))];
            
            /* Local */
            if(isObject.call(_local))
            {
              _loopEvents(_local[e.key],e);
              _loopEvents(_local['*'],e);
            }
            else
            {
              _loopEvents(_local,e);
            }
            
            /* Child */
            if(isObject.call(_child))
            {
              _loopEvents(_child[e.key],e);
              _loopEvents(_child['*'],e);
            }
            else
            {
              _loopEvents(_child,e);
            }
          }
          
          _loopEvents(e.local.__kbref.__kbevents[e.type],e);
          
          return e._preventDefault;
        },
        
        /* Re-used methods: for speed increase we scope them rather than fetching props each run */
        ArrSort = Array.prototype.sort,
        ArrSlice = Array.prototype.slice,
        typeChecker,
        getDesc = Object.getOwnPropertyDescriptor;

    if(!Object.prototype._toString) Object.prototype._toString = Object.prototype.toString;
    if(!Object._keys) Object._keys = Object.keys;

    Object.prototype.toString = function(){
      if(this instanceof Mixed) return "[object Mixed]";
      return Object.prototype._toString.apply(this,arguments);
    }

    Object.keys = function(v,type){
      return Object._keys(v)
      .filter(function(k){
        return ((!type) || ((type === 'object' || type === 'o')) ? (isNaN(parseInt(k,10))) : (type === 'all' ? true : (!isNaN(parseInt(k,10)))));
      });
    };
    
    typeChecker = ({}).toString;
    
    /* The Main constructor */
    function Mixed(data,name,parent,scope)
    {
      data = (data === undefined ? {} : data);
      /* Object prototype extensions chained down to the function */;

      var KonnektDT = {};

      var prox = (!!window.Proxy ? new Proxy(KonnektDT, {set:proxySet,deleteProperty:proxyDelete}) : KonnektDT),
          keys = Object.keys(data,'all');

      Object.defineProperties(KonnektDT,{
        __kbname:setDescriptor((typeof name === 'string' ? name : "default"),true,true),
        __kbref:setDescriptor((parent ? (parent.__kbref || parent) : prox),true,true),
        __kbscopeString:setDescriptor((scope || ""),true,true),
        __kbImmediateParent:setDescriptor((parent || null),true,true),
        __kbsubscribers:setDescriptor({}),
        __kbparentsubscribers:setDescriptor({}),
        __kblisteners:setDescriptor({}),
        __kbupdatelisteners:setDescriptor({}),
        __kbparentlisteners:setDescriptor({}),
        __kbparentupdatelisteners:setDescriptor({}),
        __kbcreatelisteners:setDescriptor([]),
        __kbdeletelisteners:setDescriptor([]),
        __kbparentcreatelisteners:setDescriptor([]),
        __kbparentdeletelisteners:setDescriptor([]),
        __kbmethodlisteners:setDescriptor([]),
        __kbmethodupdatelisteners:setDescriptor([]),
        __kbpointers:setDescriptor({}),
        __kbevents:setDescriptor(_events),
        __kbsetindex:setDescriptor(0,true),
        __kbproto:setDescriptor({}),
        length:setDescriptor(0,true),
        __kbnonproxy:setDescriptor(KonnektDT,false,true),
        __kbproxy:setDescriptor(prox,false,true),
        _stopChange:setDescriptor(false,true)
      });
      
      KonnektDT.__proto__ = Mixed.prototype;

      for(var x=0,len=keys.length;x<len;x++)
      {
        prox.set(keys[x],data[keys[x]]);
      }
      
      /* clear listeners */
      KonnektDT.__kbevents.addlistener = [];
      KonnektDT.__kbevents.removelistener = [];
      
      KonnektDT.addActionListener('addlistener',function(e){
        if(typeof e.arguments[0] === 'string' && e.local.__kbpointers[e.arguments[0]] !== undefined)
        {
          var localPointer = e.local.__kbpointers[e.arguments[0]],
              localLayer = localPointer.point.getLayer(localPointer.keys);
          if(localLayer[e.arguments[0]] !== undefined)
          {
            localLayer[e.arguments[2]](e.arguments[0],e.arguments[1]);
          }
          else if(localLayer[localPointer.keys.split('.').pop()] !== undefined)
          {
            localLayer[e.arguments[2]](localPointer.keys.split('.').pop(),e.arguments[1]);
          }
        }
      })
      .addActionListener('removelistener',function(e){
        if(typeof e.arguments[0] === 'string' && e.local.__kbpointers[e.arguments[0]] !== undefined)
        {
           var localPointer = e.local.__kbpointers[e.arguments[0]],
               localLayer = localPointer.point.getLayer(localPointer.keys);
          if(localLayer[e.arguments[0]] !== undefined)
          {
            localLayer[e.arguments[2]](e.arguments[0],e.arguments[1]);
          }
          else if(localLayer[localPointerkeys.split('.').pop()] !== undefined)
          {
            localLayer[e.arguments[2]](localPointer.keys.split('.').pop(),e.arguments[1]);
          }
        }
      })

      return prox;
    }

    /* Helper methods and the main proxy Methods */
    function eventObject(obj,key,type,value,oldValue,args,listener,stopChange)
    {
      this.stopPropogation = function(){this._stopPropogration = true;}
      this.preventDefault = function(){this._preventDefault = true;}
      this.local = obj;
      this.key = key;
      this.arguments = args;
      this.event = type;
      this.type = type;
      this.listener = listener;
      this.name = obj.__kbname;
      this.root = obj.__kbref;
      this.scope = obj.__kbscopeString;
      this.parent = obj.__kbImmediateParent;
      this.value = value;
      this.oldValue = oldValue;
      this.stopChange = stopChange;
    }

    function setDescriptor(value,writable,redefinable,enumerable)
    {
      return {
          value:value,
          writable:!!writable,
          enumerable:!!enumerable,
          configurable:!!redefinable
      }
    }

    function setCustomDescriptor(func,writable,redefinable)
    {
      return {
        get:function(){
          return func.call(this);
        },
        set:function(v){if(!!writable) func = v;},
        enumerable:false,
        configurable:!!redefinable
      }
    }

    function setBindDescriptor(key,value)
    {
      var _value = value,
          _oldValue = value,
          _key = key,
          _set = function(v,e)
          {
              _oldValue = _value;
              _value = v;
            if(!e.stopChange)
            {
              e.listener = '__kbupdatelisteners';
              e.type = 'postset';
              _onevent(e);
            }
          };
      return {
          get:function(){
              return _value;
          },
          set:function(v)
          {
              var e = new eventObject(this,_key,'set',v,_value,arguments,'__kblisteners',this._stopChange);
              if(_onevent(e) !== true)
              {
                 _set(v,e);
                this.callSubscribers(this.__kbref,this,_key,_value,_oldValue,this._stopChange);
              }
              this._stopChange = false;
          },
          configurable:true,
          enumerable:true
      }
    }

    function setPointer()
    {
      var points = Array.prototype.slice.call(arguments),
          obj = points.shift();
      
      return {
          get:function(){
              return points.reduce(function(o,p){
                return o[p];
              },obj);
          },
          set:function(v){
            var local = points.slice(0,(points.length-1)).reduce(function(o,p){
                  return o[p];
                },obj);
            (this._stopChange ? local.stopChange() : local)[points[(points.length-1)]] = v;
            this._stopChange = false;
          },
          enumerable:true,
          configurable:true
      }
    }

    function parseParentListenersToNewObjects(mixed,target)
    {
      var listeners = [
        {listener:'__kbparentlisteners',action:'addChildListener'},
        {listener:'__kbparentupdatelisteners',action:'addChildUpdateListener'},
        {listener:'__kbparentcreatelisteners',action:'addChildCreateListener'},
        {listener:'__kbparentdeletelisteners',action:'addChildDeleteListener'}],
          keys = [],
          _currListener;
      
      for(var x=0,len=listeners.length;x<len;x++)
      {
        _currListener = mixed[listeners[x].listener];
        if(isObject.call(_currListener))
        {
          keys = Object.keys(_currListener);
          for(var i=0,lenI=keys.length;i<lenI;i++)
          {
            for(var z=0,lenZ=_currListener[keys[i]].length;z<lenZ;z++)
            {
              target[listeners[x].method](keys[i],_currListener[keys[i]][z]);
            }
          }
        }
        else
        {
          for(var i=0,lenI=_currListener.length;i<lenI;i++)
          {
            target[listeners[x].method](_currListener[i]);
          } 
        }
      }
    }
    
    /* needs looked into if even necessary */
    function parsePointerEvents(target,key)
    {
      var events = [
        {listener:'__kblisteners',method:'addDataListener'},
        {listener:'__kbupdatelisteners',method:'addDataUpdateListener'}
      ],
      keys = [],
      _currListener;
      if(target[key] && target[key].__kbImmediateParent)
      {
        for(var x=0,len=events.length;x<len;x++)
        {
          _currListener = target[events[x].listener];
          keys = Object.keys(_currListener);
          for(var i=0,lenI=keys.length;i<lenI;i++)
          {
            if(key === keys[x])
            {
              for(var z=0,lenZ=_currListener[keys[x]].length;z<lenZ;z++)
              {
                  if(target[key].__kbImmediateParent[events[x].listener][key] === undefined) target[key].__kbImmediateParent[events[x].listener][key] = [];
                  target[key].__kbImmediateParent[events[x].listener][key].push(_currListener[keys[x]][z]);
              }
            }
          }
        }
      }
      parseParentListenersToNewObjects(target,target[key]);
    }
    
    /* create check if value is just undefined but descriptor is set */
    function proxySet(target,key,value)
    {
      var _isObservable = isObservable(target, key);
      if(!_isObservable && key !== 'length' && key !== '__kbsetindex')
      {
        target.set(key,value);
      }
      else if(_isObservable && typeof value === 'object' && !isMixed(value))
      {
        target.set(key, value);
      }
      else
      {
        if(key === 'length')
        {
          if(value > target.length && target[(value-1)] !== undefined)
          {
            target.length = value;
          }
          else if(value < target.length)
          {
            for(var x=value,len=(target.length);x<len;x++)
            {
              if(target[x]) delete target[x];
            }
            target.length = value;
          }
        }
        else
        {
          target[key] = value;
        }
        return true;
      }
    }
    
    /* Need to handle removing parentListeners prior to removal */
    function proxyDelete(target,key)
    {
      target.del(key);
      return true;
    }
    
    function handleNewProperty(target,key,value)
    {
      var _layer = this.__kbnonproxy,
          _isMixed = isMixed(value),
          _isObject = isObject(value),
          _isArray = isArray(value);
      
      if(_isMixed && value.__kbname !== target.__kbname)
      {
        if(value.__kbname === 'default')
        {
          target.merge(value,key);
        }
        else if(!target.__kbpointers[key])
        {
          target.addPointer(value,key);
        }
      }
      else
      {
        var e = new eventObject(this,key,'create',value,undefined,[],'__kbcreatelisteners',this._stopChange),
            onEvent = _onevent(e),
            keyNum = parseInt(key,10);
        
        if(onEvent !== true)
        {
          if((_isObject || _isArray) && Object.keys(value,'all').length !== 0)
          {
            handleNewProperty.call(this,target,key,{});
            for(var x=0,keys=Object.keys(value,'all'),len=keys.length;x<len;x++)
            {
              handleNewProperty.call(this[key],target[key],keys[x],value[keys[x]]);
            }
          }
          else
          {
            if(_isObject || _isArray)
            {
              value = new Mixed(value,target.__kbname,target,target.__kbscopeString+(target.__kbscopeString.length !== 0 ? "." : "")+key);
              parseParentListenersToNewObjects(target,value);
            }
            Object.defineProperty(target,key,setBindDescriptor(key,value));
            if(!isNaN(keyNum) && target.length <= keyNum) target.length = (keyNum+1);
            e.listener = '__kbupdatelisteners';
            e.type = 'postcreate';
            _onevent(e);
          }
        }
      }
    }
    
    /* replaces the use of using a proxy to run the parser through */
    function recSet(obj,key,value,stopChange)
    {
      var _isMixed = isMixed(value),
          _isObject = isObject(value),
          _isArray = isArray(value);
      
      if(_isMixed && value.__kbname !== obj.__kbname)
      {
        if(value.__kbname === 'default')
        {
          obj.merge(value,key);
        }
        else if(!obj.__kbpointers[key])
        {
          obj.addPointer(value,key);
        }
      }
      else if(obj[key] === undefined)
      {
        if(_ignoreList.indexOf(key) === -1)
        {
          handleNewProperty.call(this,obj,key,value);
        }
        else
        {
          (!!stopChange ? obj.stopChange() : obj)[key] = value;
        }
      }
      else
      {
        if(_isObject || _isArray)
        {
          for(var x=0,keys=Object.keys(value,'all'),len=keys.length;x<len;x++)
          {
            recSet.call(this[key],obj[key],keys[x],value[keys[x]],stopChange);
          }
        }
        else
        {
          (!!stopChange ? obj.stopChange() : obj)[key] = value;
        }
      }
    }
    
    function ignoreCreate(name)
    {
      if(_ignoreList.indexOf(name) === -1) _ignoreList.push(name);
      return this;
    }

    /* REGION Object extensions */
    
    function type(v)
    {
      return typeChecker.call(v).replace(/(\[object\s|\])/g,'').toLowerCase();
    }
    
    function sizeof(v)
    {
      var cache = [];

      function recGet(obj)
      {
        var keys = Object.keys(obj,'all'),
            count = 0,
            _curr = undefined;

        for(var x=0,len=keys.length;x<len;x++)
        {
          _curr = obj[keys[x]];
          if(typeof _curr === 'object' && _curr !== undefined && _curr !== null)
          {
            if(cache.indexOf(_curr) === -1)
            {
              cache.push(_curr);
              count += recGet(_curr);
            }
          }
          else if(typeof _curr === 'string')
          {
            count += (_curr.length * 2);
          }
          else if(typeof _curr === 'number')
          {
            count += 8;
          }
          else if(typeof _curr === 'boolean')
          {
            count += 4;
          }
          else if(typeof _curr === 'function')
          {
            count += (_curr.toString().length * 2);
          }
          count += (keys[x].length * 2);
        }
        return count;
      }

      return recGet((v || this))+" Bytes (Rough estimate)";
    }

    function isObject(v)
    {
      return (type((v !== undefined ? v : this)) === 'object');
    }

    function isArray(v)
    {
      return (type((v !== undefined ? v : this)) === 'array');
    }

    function isMixed(v)
    {
      return (type((v !== undefined ? v : this)) === 'mixed');
    }

    function isObservable(obj,prop)
    {
      var desc = getDesc(obj,prop);
      return (desc ? (desc.value === undefined) : false);
    }

    function stringify(v)
    {
        var cache = [];
        return JSON.stringify((v || this),function(key, value) {
            if(isArray(value) || isObject(value))
            {
                if (cache.indexOf(value) !== -1)
                {
                    return;
                }
                cache.push(value);
            }
            return value;
        });
    }

    function getKeys(v,type)
    {
      type = (typeof v === 'string' ? v : (!type ? 'object' : type));
      v = (typeof v === 'string' || v === undefined ? this : v);

      return Object.keys(v,type);
    }

    function getIndexes(v)
    {
      v = (v !== undefined ? (typeof v === 'object' ? v : this[v]) : this);
      
      var _ret = [];
      for(var x=0,len=v.length;x<len;x++)
      {
        if(v[x] !== undefined) _ret[_ret.length] = x;
      }
      
      return _ret
    }

    function keyCount()
    {
      return this.getKeys('object').length;
    }

    function indexCount()
    {
      return (this).length;
    }

    function count()
    {
      return (this.keyCount + this.indexCount);
    }
    
    function parse(json,func)
    {
      var layer = this.__kbnonproxy,
          
          /* This makes sure the selection is not inside a "" string as a value */
          /* 
          notInString = '(?=(?:[^"]|"[^"]*")*$)',
          startObject = '\\{'+notInString,
          endObject = '\\}'+notInString,
          startKey1 = '\\{\\"',
          startKey2 = '\\,\\"'+notInString,
          startArr = '\\['+notInString,
          endArr = '\\]'+notInString,
          nextIndex = '\\,'+notInString,
          startValue = '\\"\\:',
          endValue = '\\"\\}',
          regEx = new RegExp('('+startKey1+'|'+startKey2+'|'+startArr+'|'+endArr+'|'+startValue+'|'+endValue+'|'+startObject+'|'+nextIndex+'|'+endObject+')'),
          */
          regEx = /({"|,"(?=(?:[^"]|"[^"]*")*$)|\[(?=(?:[^"]|"[^"]*")*$)|\](?=(?:[^"]|"[^"]*")*$)|":|"}|{(?=(?:[^"]|"[^"]*")*$)|,(?=(?:[^"]|"[^"]*")*$)|}(?=(?:[^"]|"[^"]*")*$))/;
          
          split = json.split(regEx).filter(Boolean),
          UKeys = [],
          isKey = false,
          isValue = false,
          scope = '';
      
      function parseValue(val)
      {
        var i = parseFloat(val,10),
            b = (val === 'true'),
            l1 = val.indexOf('"'),
            l2 = val.lastIndexOf('"');
        if(!isNaN(i) && i.toString().length === val.length)
        {
          return i;
        }
        else if(b || val === 'false')
        {
          return b;
        }
        else
        {
          if(l1 === 0 && l2 !== 0)
          {
            val = val.substring(1,(val.length-1));
          }
          else
          {
            val = val.substring(1,val.length);
          }
        }
        return val;
      }
      
      /* looking for: {" or ": ," }*/
      for(var x=1,len=split.length,currKey,prevKey,futureKey,UKey;x<len;x++)
      {
        currKey = split[x];
        prevKey = split[(x-1)];
        futureKey = split[(x+1)];
        UKey = UKeys[(UKeys.length-1)];
        
        /* we have a new object */
        if((prevKey === '":' && currKey === '{"') || (prevKey === '":' && currKey === '['))
        {
          scope += (scope.length !== 0 ? '.' : '')+UKey;
          if(!layer[UKey]) layer.set(UKey,(func ? func(UKey,{},scope,layer) : {}));
          layer = layer[UKey];
          UKeys.pop();
        }
        
        /* we have an array index */
        else if(prevKey === '[' || (prevKey === ',' && layer.length !== 0))
        {
          if(currKey === '{' || currKey === '{"')
          {
            scope += (scope.length !== 0 ? '.' : '')+layer.__kbsetindex;
            if(typeof layer[layer.__kbsetindex] !== 'object') layer.set(layer.__kbsetindex,(func ? func(layer.length,{},scope,layer) : {}));
            layer.__kbsetindex += 1;
            layer = layer[(layer.__kbsetindex-1)];
          }
          else
          {
            layer.set(layer.__kbsetindex,(func ? func(layer.length,parseValue(currKey),scope,layer) : parseValue(currKey)));
            layer.__kbsetindex += 1;
          }
        }
        
        /* we have a value */
        else if(prevKey === '":')
        {
          layer.set(UKey,(func ? func(UKey,parseValue(currKey),scope,layer) : parseValue(currKey)));
          UKeys.pop();
        }
        
        /* we have a key */
        else if(prevKey === '{"' || (prevKey === ',' && futureKey === '":'))
        {
          UKeys[UKeys.length] = currKey.replace(/\"/g,'');
        }
        
        /* we go out of current object */
        else if((prevKey === '}' || prevKey === ']') && currKey !== undefined)
        {
          scope = (scope.indexOf('.') !== -1 ? scope.substring(0,(scope.lastIndexOf('.')-1)) : '');
          layer = layer.__kbImmediateParent;
        }
      }
      return this;
    }
    
    function parseReplace(json,obj)
    {
      return parse.call((obj || this),json);
    }

    /* ENDREGION Object extensions */

    /* REGION Object methods */
    
    function add(key,value)
    {
      set.call(this,key,value);
      return this;
    }

    function set(key,value)
    {
      if(typeof key === 'number') key = key.toString();
      var _layer = (key.indexOf('.') !== -1 ? this.__kbnonproxy.setLayer(key) : this.__kbnonproxy);
      if(key.indexOf('.') !== -1) key = key.split('.').pop();
      
      var e = new eventObject(this,key,'set',value,(this[key]),arguments,'__kbmethodlisteners'),
          onEvent = _onevent(e);
      
      if(onEvent !== true)
      {
        recSet.call(this,_layer,key,value,this._stopChange);
        this.stopChange = undefined;
        e.type = 'postset';
        e.listener = '__kbmethodupdatelisteners';
        _onevent(e);
      }
      return this;
    }
    
    /* Always return Proxy if used `.get` and `.getlayer` both apply this rule */
    function get(key)
    {
      if(typeof key === 'number') key = key.toString();
      var _layer = (key.indexOf('.') !== -1 ? this.getLayer(key) : this);
      if(key.indexOf('.') !== -1) key = key.split('.').pop();
      if(_layer)
      {
        return _layer[key];
      }
      else
      {
        console.warn('Module: KonnektDT, Method: get, nothing exists on %o with the key %o',this,key);
      }
    }

    function exists(key)
    {
      function recCheck(keys,layer)
      {
        if(keys.length !== 1)
        {
          return (layer[keys[0]] !== undefined ? recCheck(keys.slice(1,keys.length),layer[keys[0]]) : false);
        }
        else
        {
          return (layer[keys[0]] !== undefined);
        }
      }

      return (recCheck(key.split('.'),this.__kbnonproxy));
    }

    function addPrototype(key,value)
    {
      var _layer = (key.indexOf('.') !== -1 ? this.__kbnonproxy.setLayer(key) : this.__kbnonproxy);
      if(key.indexOf('.') !== -1) key = key.split('.').pop();
      if(_layer[key] === undefined)
      {
        Object.defineProperty(_layer.__proto__,key,setDescriptor(value,true,true));
      }
      else
      {
        console.error('Your attempting to add your prototype with the prop %O that already exists on %O',prop,_layer);
      }
      return this;
    }

    /* Handle listener sharing (done in addlistener Methods) */
    function addPointer()
    {
      var points = Array.prototype.slice.call(arguments), 
          passobj = points.shift(),
          prop = (passobj.exists(points.join('.')) ? points[(points.length-1)] : points.pop());
      
      if(!(passobj instanceof Mixed)) passobj = new Mixed(passobj,passobj.__kbname);
      
      var e = new eventObject(this,prop,'create',passobj[prop],undefined,[],'__kbcreatelisteners',this._stopChange),
          _layer = this.__kbnonproxy;
          e.root = passobj.__kbref.__kbproxy;
      
          if(_onevent(e) !== true)
          {         
            Object.defineProperty(_layer,prop,setPointer.apply(_layer,[passobj].concat(points)));
            
            _layer.__kbpointers[prop] = {keys:points.join('.'),point:passobj};
            parsePointerEvents(_layer,prop);
            e.listener = '__kbupdatelisteners';
            e.type = 'postcreate';
            _onevent(e);
          }
      return this;
    }
    
    /* handles all deleting */
    function del(key,bypass)
    {
      var _isNumber = (typeof key === 'number' || !isNaN(parseInt(key,10)));
      if(_isNumber) key = key.toString();
      var _layer = (key.indexOf('.') !== -1 ? this.getLayer(key) : this),
          _localProp = key.split('.').pop();
      
      if(!!_layer && _layer[_localProp] !== undefined)
      {
        if(_isNumber && _layer.length > parseInt(key,10) && !bypass)
        {
          _layer = _layer.__kbnonproxy;
          
          _layer.splice(_localProp,1);
        }
        else
        {
          var eM = new eventObject(_layer,key,'delete',_layer[_localProp],undefined,[],'__kbmethodlisteners'),
          onMEvent = _onevent(eM);
          var e = new eventObject(_layer,key,'delete',_layer[_localProp],undefined,[],'__kbdeletelisteners',this._stopChange),
            onEvent = _onevent(e);

          if(onEvent !== true && onMEvent !== true)
          {
            _layer = _layer.__kbnonproxy;
            
            Object.defineProperty(_layer,_localProp,setDescriptor(undefined,true,true,false));
            delete _layer[_localProp];
            
            if(_isNumber && _layer.length > parseInt(key,10) && bypass) _layer.length = (_layer.length-1);
            
            eM.type = 'postdelete';
            eM.listener = '__kbmethodupdatelisteners';
            _onevent(eM);
            
            e.listener = '__kbupdatelisteners';
            e.type = 'postdelete';
            e.oldValue = e.value;
            e.value = undefined;
            _onevent(e);
          } 
        }
      }
      return this;
    }

    function move(obj,prop)
    {
      this.__kbnonproxy.set(prop,obj[prop]);

      if(!isMixed(obj))
      {
        obj[prop] = null;
        delete obj[prop];
      }
      else
      {
        obj.del(prop);
      }
      return this;
    }

    function copy(obj,key)
    {
      var _layer = this.__kbnonproxy;
      if(!isMixed(obj))
      {
        _layer.set(key,obj[key]);
      }
      else
      {
        if(obj.__kbname === 'default')
        {
          _layer.merge(obj[key],key);
        }
        else
        {
          _layer.addPointer(obj,key);
        }
      }
      return this;
    }
    
    function merge(obj,key)
    {
      var cache = [],
          _layer = this.__kbnonproxy;
      function recMerge(from,to)
      {
        var keys = (isMixed(from) ? from.keys('object') : Object.keys(from)),
            _curr;
        for(var x=0,len=keys.length;x<len;x++)
        {
          _curr = from[keys[x]];
          if(typeof _curr === 'object' && cache.indexOf(_curr) === -1 && to[keys[x]] !== 'undefined')
          {
            recMerge(_curr,to);
          }
          else if(to[keys[x]] === undefined)
          {
            to.set(keys[x],(typeof _curr === 'object' ? {} : _curr));
          }
        }
      }
      if(key && _layer[key] === undefined) _layer.set(key,{});
      recMerge(obj,(key ? _layer[key] : _layer));
      return this;
    }
    
    function replace(obj,key)
    {
      var cache = [],
          _layer = this.__kbnonproxy;
      function recReplace(from,to)
      {
        var keys = (isMixed(from) ? from.keys('object') : Object.keys(from)),
            _curr;
        _curr = from[keys[x]];
        if(typeof _curr === 'object' && cache.indexOf(_curr) === -1 && to[keys[x]] !== 'undefined')
        {
          recReplace(_curr,to);
        }
        else
        {
          to.set(keys[x],(typeof _curr === 'object' ? {} : _curr));
        }
      }
      if(key && _layer[key] === undefined) _layer.set(key,{});
      recReplace(obj,(key ? _layer[key] : _layer));
      return this;
    }

    /* ENDREGION Object methods */

    /* REGION Array methods */

    function copyWithin(target,start,end)
    {
      start = (start || 0);
      end = (end || 0);
      
      var e = new eventObject(this,target,'copyWithin',this[target],undefined,arguments,'__kbmethodlisteners'),
          _layer = this.__kbnonproxy;
      
      if(_onevent(e) !== true && target < _layer.length)
      {
        target = (target < 0 ? (_layer.length-1) : target);
        start = (start < _layer.length ? start : (_layer.length-1));
        end = (end < _layer.length ? end : (_layer.length-1));
        start = (start < 0 ? (_layer.length-1) : start);
        end = (start < 0 ? (_layer.length-1) : end);
        
        for(var x=start;x<=end;x++)
        {
          _layer.set((target+(x-start)),_layer[x]);
        }
        e.type = 'postcopyWithin';
        e.listener = '__kbmethodupdatelisteners'
        _onevent(e);
      }
      return this;
    }

    function fill(value,start,end)
    {
      start = (start !== undefined ? Math.max(0,start) : 0);
      end = ((end !== undefined && end <= this.length) ? Math.min(this.length,Math.max(0,end)) : this.length);

      var e = new eventObject(this,_start,'fill',this[_start],undefined,arguments,'__kbmethodlisteners'),
          _layer = this.__kbnonproxy;
      
      if(_onevent(e) !== true)
      {
        for(var x=a.key;x<end;x++)
        {
            _layer[x] = value;
        }
        e.type = 'postfill';
        e.listener = '__kbmethodupdatelisteners';
        _onevent(e);
      }
      return this;
    }

    function pop()
    {
      var e = new eventObject(this,(this.length-1),'pop',this[(this.length-1)],undefined,arguments,'__kbmethodlisteners'),
          _layer = this.__kbnonproxy;
      if(_onevent(e) !== true)
      {
        var _ret = _layer[(_layer.length-1)];
        _layer.del((this.length-1));
        e.type = 'postpop';
        e.listener = '__kbmethodupdatelisteners'
        _onevent(e);
        return _ret;
      }
      return null;
    }

    function push(v)
    {
      var e = new eventObject(this,(this.length),'push',v,undefined,arguments,'__kbmethodlisteners'),
          _layer = this.__kbnonproxy;
      if(_onevent(e) !== true)
      {
        _layer.set(_layer.length,v);
        e.type = 'postpush';
        e.listener = '__kbmethodupdatelisteners';
        _onevent(e);
      }
      return this.length;
    }

    function reverse()
    {
      var e = new eventObject(this,undefined,'reverse',undefined,undefined,arguments,'__kbmethodlisteners'),
          _layer = this.__kbnonproxy;
      if(_onevent(e) !== true)
      {
        var left = null,
            right = null,
            length = _layer.length;
        for (left = 0; left < length / 2; left += 1)
        {
            right = length - 1 - left;
            var temporary = _layer[left];
            _layer[left] = _layer[right];
            _layer[right] = temporary;
            temporary = null;
        }
        e.type = 'postreverse';
        e.listener = '__kbmethodupdatelisteners';
        _onevent(e);
      }
      return this;
    }

    function shift()
    {
      var e = new eventObject(this,0,'shift',this[0],undefined,arguments,'__kbmethodlisteners'),
          _layer = this.__kbnonproxy;
      if(_onevent(e) !== true)
      {
        var _ret = _layer[a.key];
        for(var x=a.key,len=(this.length-1);x<len;x++)
        {
            _layer[x] = _layer[(x+1)];
        }
        _layer.del((this.length-1));
        e.type = 'postshift';
        e.listener = '__kbmethodupdatelisteners';
        _onevent(e);
      }
      return null;
    }

    function sort()
    {
      var e = new eventObject(this,undefined,'sort',undefined,undefined,arguments,'__kbmethodlisteners'),
          _layer = this.__kbnonproxy;
      if(_onevent(e) !== true)
      {
        var _arrCopy = ArrSlice.call(_layer);
        ArrSort.apply(_arrCopy,arguments);
        for(var x=0,len=_arrCopy.length;x<len;x++)
        {
          _layer[x] = _arrCopy[x];
        }
        e.type = 'postsort';
        e.listener = '__kbmethodupdatelisteners';
        _onevent(e);
      }
      return this;
    }

    function splice(index,remove,insert)
    {
      index = (typeof index === 'string' ? parseInt(index,10) : index);
      
      var e = new eventObject(this,index,'splice',undefined,undefined,arguments,'__kbmethodlisteners'),
          _layer = this.__kbnonproxy,
          _hasProxy = !!window.Proxy;
      if(_onevent(e) !== true)
      {
        var _ret = [],
            _inserts = Array.prototype.slice.call(arguments,2),
            _insertLen = (_inserts.length-2),
            _index = 0;

        if(remove !== 0 && _layer[((index-1)+remove)] !== undefined)
        {
          for(var x=0,len=remove;x<len;x++)
          {
            _ret.push(_layer[index+x]);
            for(var i=(index+x),lenI=(this.length-1);i<lenI;i++)
            {
                _layer[i] = _layer[(i+1)];
            }
            _layer.del((_layer.length-1),true)
          }
        }
        if(_insertLen !== 0)
        {
          for(var x=0,len=_insertLen;x<len;x++)
          {
              _index = (index+(Math.min(1,x)));
              for(var i=_layer.length,lenI=_index;i>lenI;i--)
              {
                _layer.set(i,_layer[(i-1)]);
              }
              _layer.set(_index,_inserts[x]);
          }
        }
        e.type = 'postsplice';
        e.listener = '__kbmethodupdatelisteners';
        _onevent(e);
        return _ret;
      }
      else
      {
        return [];
      }
    }

    function unshift()
    {
      var e = new eventObject(this,0,'unshift',this[0],undefined,arguments,'__kbmethodlisteners'),
          _layer = this.__kbnonproxy;
      if(_onevent(e) !== true)
      {
        var args = Array.prototype.slice.call(arguments);
        for(var x=((_layer.length-1)+args.length),len=args.length;x !== -1;x--)
        {
          if(x < len)
          {
              _layer.set(x,args[x]);
          }
          else
          {
            _layer.set(x,_layer[(x-args.length)]);
          }
        }
        e.type = 'postunshift';
        e.listener = '__kbmethodupdatelisteners';
        _onevent(e);
      }
      return this.length;
    }

    /* ENDREGION Array methods */

    /* REGION Event Listeners */

    function stopChange()
    {
      this.__kbnonproxy._stopChange = true;
      return this;
    }
    
    function splitScopeString(scopeString)
    {
      return scopeString.split('.');
    }
    
    function setLayer(scopeString)
    {
      var scope = splitScopeString(scopeString);
      function rec(scope)
      {
        var key = scope[0];

        if(this[key] === undefined && (scope.length-1) !== 0) this[key] = Mixed({},this.__kbname,this,this.__kbscopeString+"."+key);

        if(!isMixed(this[key])) return this;

        if((scope.length-1) !== 0)
        {
          scope.shift();
          return rec.call(this[key],scope);
        }
        return this[key];
      }
      return rec.call(this,scope);
    }

    function getLayer(scopeString)
    {
      var scope = splitScopeString(scopeString);
      function rec(scope)
      {
        var key = scope[0];
        
        if(this[key] === undefined && (scope.length-1) !== 0) return null;

        if(!isMixed(this[key])) return this;
        
        if((scope.length-1) !== 0)
        {
          scope.shift();
          return rec.call(this[key],scope);
        }
        return this[key];
      }
      return rec.call(this,scope);
    }
    
    function addListener(type,listener)
    {
      return function(prop,func)
      {
        arguments = Array.prototype.slice.call(arguments);
        arguments.push(type);
        var _listeners = this[listener],
            e = new eventObject(this,listener,'addlistener',_listeners,undefined,arguments,''),
            _layer = this.__kbnonproxy;
        
        if(typeof prop === 'string' && splitScopeString(prop).length !== 1)
        {
          var scopeString = splitScopeString(prop);
          prop = scopeString.pop();
          scopeString = scopeString.join(".");
          e.local = this.getLayer(scopeString);
          _listeners = e.local[listener];
          e.value = _listeners;
        }
        
        if(_onevent(e) !== true)
        {
          if(isObject.call(_listeners))
          {
            if(_listeners[prop] === undefined) _listeners[prop] = [];
            _listeners[prop].push(func);
            e.type ='postaddlistener'
            _onevent(e);
          }
          else if(isArray.call(_listeners))
          {
            if(typeof prop === 'function')
            {
              _listeners.push(prop);
              e.type ='postaddlistener'
              _onevent(e);
            }
          }
        }
        return this;
      }
    }

    function removeListener(type,listener)
    {
      return function(prop,func)
      {
        arguments = Array.prototype.slice.call(arguments);
        arguments.push(type);
        var _listeners = this[listener],
            e = new eventObject(this,listener,'removelistener',_listeners,undefined,arguments,''),
            _layer = this.__kbnonproxy;
        
        if(typeof prop === 'string' && splitScopeString(prop).length !== 1)
        {
          var scopeString = splitScopeString(prop);
          scopeString.pop();
          scopeString.join(".");
          e.local = this.getLayer(scopeString);
          _listeners = e.local[listener];
          e.value = _listeners;
          
          prop = splitScopeString(prop).pop();
        }
        
        if(_onevent(e) !== true)
        {
          if(isObject.call(_listeners))
          {
            if(_listeners[prop] !== undefined)
            {
              for(var x=0,len=_listeners[prop].length;x<len;x++)
              {
                if(_listeners[prop][x].toString() === func.toString())
                {
                  _listeners[prop].splice(x,1);
                  e.type = 'postremovelistener';
                  _onevent(e);
                  break;
                }
              }
            }
          }
          else if(isArray.call(_listeners))
          {
            if(typeof prop === 'function')
            {
              for(var x=0,len=_listeners.length;x<len;x++)
              {
                if(_listeners[x].toString() === prop.toString())
                {
                  _listeners.splice(x,1);
                  e.type = 'postremovelistener';
                  _onevent(e);
                  break;
                }
              }
            }
          }
        }
        return this;
      }
    }

    function addActionListener(type,func)
    {
      var _layer = this.__kbnonproxy;
      if(_layer.__kbref.__kbevents[type] !== undefined)
      {
        _layer.__kbref.__kbevents[type].push(func);
      }
      return this;
    }

    function removeActionListener(type,func)
    {
      var _layer = this.__kbnonproxy;
      if(_layer.__kbref.__kbevents[type] !== undefined)
      {
        for(var x=0,len=_layer.__kbref.__kbevents[type];x<len;x++)
        {
          if(_layer.__kbref.__kbevents[type][x].toString() === func.toString())
          {
            _layer.__kbref.__kbevents[type].splice(x,1);
            break;
          }
        }
      }
      return this;
    }
    
    function addChildListener(type,listener)
    {
      function recAddListener(prop,func,listener)
      {
        var children = Object.keys(this,'all').filter((function(p){
          return (isMixed.call(this[p]));
        }).bind(this));
        
        var _local = this,
            _locProp = prop;
        if(typeof prop === 'string' && splitScopeString(prop).length !== 1)
        {
          var scopeString = splitScopeString(prop);
          _locProp = scopeString.pop();
          scopeString = scopeString.join(".");
          
          _local = this.getLayer(scopeString);
          if(_local[listener][_locProp] === undefined) _local[listener][_locProp] = [];
          _local[listener][_locProp].push(func);
        }
        
        if(isObject.call(_local[listener]))
        {
          if(_local[listener][_locProp] === undefined) _local[listener][_locProp] = [];
          _local[listener][_locProp].push(func);
          
          var localPointer = _local.__kbpointers[_locProp],
              localLayer = localPointer.point.getLayer(localPointer.keys);
          if(localLayer[_locProp] !== undefined)
          {
            if(localLayer[listener][_locProp] === undefined) localLayer[listener][_locProp] = [];
            localLayer[listener][_locProp].push(_func);
          }
        }
        else
        {
          _local[listener].push(func);
        }

        for(var x=0,len=children.length;x<len;x++)
        {
          recAddListener.call(this[children[x]],prop,func,listener);
        }
      }
      
      return function(prop,func)
      {
        arguments = Array.prototype.slice.call(arguments);
        arguments.push(type);
        var e = new eventObject(this,listener,'addchildlistener',undefined,undefined,arguments,'');
        if(_onevent(e) !== true)
        {
          recAddListener.call(this.__kbnonproxy,prop,func,listener);
          e.type = 'postaddchildlistener';
          _onevent(e);
        }
        return this;
      }
    }
    
    function removeChildListener(type,listener)
    {
      function recRemoveListener(prop,func,listener)
      {
        var children = Object.keys(this,'all').filter((function(p){
          return (isMixed.call(this[p]));
        }).bind(this));
        
        var _local = this,
            _locProp = prop;
        if(typeof prop === 'string' && splitScopeString(prop).length !== 1)
        {
          var scopeString = splitScopeString(prop);
          _locProp = scopeString.pop();
          scopeString.join(".");
          
          _local = this.getLayer(scopeString);
          if(_local[listener][prop] !== undefined)
          {
            for(var x=0,len=_local[listener][prop].length;x<len;x++)
            {
              if(_local[listener][prop][x].toString() === func.toString())
              {
                _local[listener][prop].splice(x,1);
                break;
              }
            }
          }
        }
        
        if(isObject.call(_local[listener]))
        {
          if(_local[listener][_locProp] !== undefined)
          {
            for(var x=0,len=_local[listener][_locProp].length;x<len;x++)
            {
              if(_local[listener][_locProp][x].toString() === func.toString())
              {
                _local[listener][_locProp].splice(x,1);
                break;
              }
            }
            if(_local.__kbpointers.indexOf(_locProp) !== -1)
            {
              var localPointer = _local.__kbpointers[_locProp],
              localLayer = localPointer.point.getLayer(localPointer.keys);
              if(localLayer[listener][_locProp] !== undefined)
              {
                for(var x=0,len=localLayer[listener][_locProp].length;x<len;x++)
                {
                  if(localLayer[listener][_locProp][x].toString() === func.toString())
                  {
                    localLayer[listener][_locProp].splice(x,1);
                    break;
                  }
                } 
              }
            }
          }
        }
        else
        {
          for(var x=0,len=_local[listener].length;x<len;x++)
          {
            if(_local[listener][x].toString() === func.toString())
            {
              _local[listener].splice(x,1);
              break;
            }
          }
        }

        for(var x=0,len=children.length;x<len;x++)
        {
          recRemoveListener.call(this[children[x]],prop,func,listener);
        }
      }
      
      return function(prop,func)
      {
        arguments = Array.prototype.slice.call(arguments);
        arguments.push(type);
        var e = new eventObject(this,listener,'removechildlistener',undefined,undefined,arguments,'');
        if(_onevent(e) !== true)
        {
          recRemoveListener.call(this.__kbnonproxy,prop,func,listener);
          e.type = 'postremovechildlistener';
          _onevent(e);
        }
        return this;
      }
    }

    function subscribe(prop,func)
    {
      var _split = prop.split('.'),
          _key = _split.pop(),
          _layer = (_split.length !== 0 ? this.__kbnonproxy.getLayer(_split.join('.')) : this.__kbnonproxy);
      
      if(_layer.__kbsubscribers[_key] === undefined) _layer.__kbsubscribers[_key] = [];
      _layer.__kbsubscribers[_key].push(func);
      return this;
    }
    
    function subscribeDeep(prop,func)
    {
      var _multi = (prop.indexOf('*') !== -1),
          _split = prop.split('.'),
          _preSplit = _split.slice(0,_split.indexOf('*')),
          _multiSplit = (_split.indexOf('*') !== -1 ? _split.slice(_split.indexOf('*'),_split.length) : []),
          _multiSplitSingle = (_multiSplit.length === 1),
          _key = _split.pop(),
          _layer = (_split.length !== 0 ? this.__kbnonproxy.getLayer(_split.join('.')) : this.__kbnonproxy);
      function recsubscribe(local,key)
      {
        var children = Object.keys(local,'all').filter((function(p){
          return (isMixed.call(local[p]));
        }).bind(local));
        
        if(local[key] !== undefined || key === '*')
        {
          if(local.__kbparentsubscribers[key] === undefined) local.__kbparentsubscribers[key] = [];
          local.__kbparentsubscribers[key].push(func);
        }
        for(var x=0,len=children.length;x<len;x++)
        {
          recsubscribe(local[children[x]],key);
        }
      }
      
      if(!_multi)
      {
        recsubscribe(_layer,_key);
      }
      else
      {
        if(!_multiSplitSingle)
        {
          _multiSplit.shift();
          _layer.subscribeDeep(_multiSplit.join('.'),func);
        }
        else
        {
          recsubscribe(_layer,'*');
        }
      }
      return this;
    }

    function unsubscribe(prop,func)
    {
      var _multi = (prop === '*'),
          _split = prop.split('.'),
          _key = _split.pop(),
          _layer = (_split.length !== 0 ? this.__kbnonproxy.getLayer(_split.join('.')) : this.__kbnonproxy);
      if(_layer.__kbsubscribers[_key] !== undefined)
      {
        for(var x=0,len=_layer.__kbsubscribers[_key].length;x<len;x++)
        {
          if(_layer.__kbsubscribers[_key][x].toString() === func.toString())
          {
            _layer.__kbsubscribers[_key].splice(x,1);
            break;
          }
        }
      }
      return this;
    }
    
    function unsubscribeDeep(prop,func)
    {
      var _multi = (prop.indexOf('*') !== -1),
          _split = prop.split('.'),
          _preSplit = _split.slice(0,_split.indexOf('*')),
          _multiSplit = (_split.indexOf('*') !== -1 ? _split.slice(_split.indexOf('*'),_split.length) : []),
          _multiSplitSingle = (_multiSplit.length === 1),
          _key = _split.pop(),
          _layer = (_split.length !== 0 ? this.__kbnonproxy.getLayer(_split.join('.')) : this.__kbnonproxy);
      function recunsibscribe(local,key)
      {
        var children = Object.keys(local,'all').filter((function(p){
          return (isMixed.call(local[p]) && !(local[p] instanceof HTMLElement));
        }).bind(local));
        
        if(local[key] !== undefined || key === '*')
        {
          if(local.__kbparentsubscribers[key] !== undefined)
          {
            for(var x=0,len=local.__kbparentsubscribers[key].length;x<len;x++)
            {
              if(local.__kbparentsubscribers[key][x].toString() === func.toString()) local.__kbparentsubscribers[key].splice(x,1);
            }
          }
        }
        for(var x=0,len=children.length;x<len;x++)
        {
          recunsibscribe(local[children[x]],key);
        }
      }
      
      if(!_multi)
      {
        recunsibscribe(_layer,_key);
      }
      else
      {
        if(!_multiSplitSingle)
        {
           _multiSplit.shift();
          _layer.unsubscribeDeep(_multiSplit.join('.'),func);
        }
        else
        {
          recunsibscribe(_layer,'*');
        }
      }
      return this;
    }

    function callSubscribers(kbref,obj,prop,value,oldValue,stopChange)
    {
      var _layer = this.__kbnonproxy;
      if(_layer.__kbsubscribers[prop] !== undefined)
      {
        for(var x=0,len = _layer.__kbsubscribers[prop].length;x<len;x++)
        {
          _layer.__kbsubscribers[prop][x].call(this,{
            key:prop,
            value:value,
            oldValue:oldValue,
            stopChange:stopChange,
            local:obj,
            kbref:kbref
          });
        }
      }
      if(_layer.__kbparentsubscribers[prop] !== undefined)
      {
        for(var x=0,len = _layer.__kbparentsubscribers[prop].length;x<len;x++)
        {
          _layer.__kbparentsubscribers[prop][x].call(this,{
            key:prop,
            value:value,
            oldValue:oldValue,
            stopChange:stopChange,
            local:obj,
            kbref:kbref
          });
        }
      }
      if(_layer.__kbsubscribers['*'] !== undefined)
      {
        for(var x=0,len = _layer.__kbsubscribers['*'].length;x<len;x++)
        {
          _layer.__kbsubscribers['*'][x].call(this,{
            key:prop,
            value:value,
            oldValue:oldValue,
            stopChange:stopChange,
            local:obj,
            kbref:kbref
          });
        }
      }
      if(_layer.__kbparentsubscribers['*'] !== undefined)
      {
        for(var x=0,len = _layer.__kbparentsubscribers['*'].length;x<len;x++)
        {
          _layer.__kbparentsubscribers['*'][x].call(this,{
            key:prop,
            value:value,
            oldValue:oldValue,
            stopChange:stopChange,
            local:obj,
            kbref:kbref
          });
        }
      }
      return this;
    }
    
    function callAllSubscribers()
    {
      var _layer = this.__kbnonproxy;
      
      function loop(local,subs,key)
      {
        for(var x=0,len=subs.length;x<len;x++)
        {
          subs[x].call(local,{
            key:key,
            value:local[key],
            oldValue:local[key],
            stopChange:false,
            local:local,
            kbref:local.__kbref,
            initial:true
          });
        }
      }
      
      function recCall(local)
      {
        var subscribers = Object.keys(local.__kbsubscribers),
            parentSubscribers = Object.keys(local.__kbparentsubscribers);
        
        for(var x=0,len=subscribers.length;x<len;x++)
        {
          if(local.__kbsubscribers[subscribers[x]].length !== 0)
          {
            if(subscribers[x] === '*')
            {
              for(var i=0,keys=Object.keys(local),lenn=keys.length;i<lenn;i++)
              {
                loop(local,local.__kbsubscribers[subscribers[x]],keys[i]);
              }
            }
            else
            {
              loop(local,local.__kbsubscribers[subscribers[x]],subscribers[x]);
            }
          }
        }
        
        for(var x=0,len=parentSubscribers.length;x<len;x++)
        {
          if(local.__kbparentsubscribers[parentSubscribers[x]].length !== 0)
          {
            if(parentSubscribers[x] === '*')
            {
              for(var i=0,keys=Object.keys(local),lenn=keys.length;i<lenn;i++)
              {
                loop(local,local.__kbparentsubscribers[parentSubscribers[x]],keys[i]);
              }
            }
            else
            {
              loop(local,local.__kbparentsubscribers[parentSubscribers[x]],parentSubscribers[x]);
            }
          }
        }
      }
      recCall(_layer);
      return this;
    }

    /* ENDREGION Event Listeners */

    Object.defineProperties(Mixed.prototype,{
      
      /* Helper methods */
      typeof:setDescriptor(type,false,true),
      sizeof:setDescriptor(sizeof,false,true),
      isObject:setDescriptor(isObject,false,true),
      isArray:setDescriptor(isArray,false,true),
      isMixed:setDescriptor(isMixed,false,true),
      isObservable:setDescriptor(isObservable,false,true),
      stringify:setDescriptor(stringify,false,true),
      getKeys:setDescriptor(getKeys,false,true),
      getIndexes:setDescriptor(getIndexes,false,true),
      keyCount:setCustomDescriptor(keyCount,false,true),
      indexCount:setCustomDescriptor(indexCount,false,true),
      count:setCustomDescriptor(count,false,true),
      
      /* Non destructive Array methods */
      concat:setDescriptor(Array.prototype.concat),
      every:setDescriptor(Array.prototype.every),
      filter:setDescriptor(Array.prototype.filter),
      find:setDescriptor(Array.prototype.find),
      findIndex:setDescriptor(Array.prototype.findIndex),
      forEach:setDescriptor(Array.prototype.forEach),
      includes:setDescriptor(Array.prototype.includes),
      indexOf:setDescriptor(Array.prototype.indexOf),
      join:setDescriptor(Array.prototype.join),
      lastIndexOf:setDescriptor(Array.prototype.lastIndexOf),
      map:setDescriptor(Array.prototype.map),
      reduce:setDescriptor(Array.prototype.reduce),
      reduceRight:setDescriptor(Array.prototype.reduceRight),
      slice:setDescriptor(Array.prototype.slice),
      some:setDescriptor(Array.prototype.some),
      entries:setDescriptor(Array.prototype.entries),
      toLocaleString:setDescriptor(Array.prototype.toLocaleString),
      
      parse:setDescriptor(parse,true),
      parseReplace:setDescriptor(parseReplace,true),

      /* Object Methods */
      add:setDescriptor(add),
      set:setDescriptor(set),
      get:setDescriptor(get),
      del:setDescriptor(del),
      exists:setDescriptor(exists),
      addPrototype:setDescriptor(addPrototype),
      addPointer:setDescriptor(addPointer),
      move:setDescriptor(move),
      copy:setDescriptor(copy),
      merge:setDescriptor(merge),
      replace:setDescriptor(replace),

      /* Array Methods */
      copyWithin:setDescriptor(copyWithin),
      fill:setDescriptor(fill),
      pop:setDescriptor(pop),
      push:setDescriptor(push),
      reverse:setDescriptor(reverse),
      shift:setDescriptor(shift),
      sort:setDescriptor(sort),
      splice:setDescriptor(splice),
      unshift:setDescriptor(unshift),
      
      /* Helpers */
      getLayer:setDescriptor(getLayer),
      setLayer:setDescriptor(setLayer),
      ignoreCreate:setDescriptor(ignoreCreate),
      
      /* Event Listeners */
      addActionListener:setDescriptor(addActionListener),
      removeActionListener:setDescriptor(removeActionListener),
      subscribe:setDescriptor(subscribe),
      unsubscribe:setDescriptor(unsubscribe),
      subscribeDeep:setDescriptor(subscribeDeep),
      unsubscribeDeep:setDescriptor(unsubscribeDeep),
      callSubscribers:setDescriptor(callSubscribers),
      callAllSubscribers:setDescriptor(callAllSubscribers),
      stopChange:setDescriptor(stopChange)
    });
    
    
    Object.defineProperties(Mixed.prototype,{
      
      /* Standard Data Listeners as a single layer */
      addDataListener:setDescriptor(addListener('addDataListener','__kblisteners')),
      removeDataListener:setDescriptor(removeListener('removeDataListener','__kblisteners')),
      addDataUpdateListener:setDescriptor(addListener('addDataUpdateListener','__kbupdatelisteners')),
      removeDataUpdateListener:setDescriptor(removeListener('removeDataUpdateListener','__kbupdatelisteners')),
      addDataCreateListener:setDescriptor(addListener('addDataCreateListener','__kbcreatelisteners')),
      removeDataCreateListener:setDescriptor(removeListener('removeDataCreateListener','__kbcreatelisteners')),
      addDataDeleteListener:setDescriptor(addListener('addDataDeleteListener','__kbdeletelisteners')),
      removeDataDeleteListener:setDescriptor(removeListener('removeDataDeleteListener','__kbdeletelisteners')),
      addDataMethodListener:setDescriptor(addListener('addDataMethodListener','__kbmethodlisteners')),
      removeDataMethodListener:setDescriptor(removeListener('removeDataMethodListener','__kbmethodlisteners')),
      addDataMethodUpdateListener:setDescriptor(addListener('addDataMethodUpdateListener','__kbmethodupdatelisteners')),
      removeDataMethodUpdateListener:setDescriptor(removeListener('removeDataMethodUpdateListener','__kbmethodupdatelisteners')),
      
      /* MultiLayer Child Listeners */
      addChildDataListener:setDescriptor(addChildListener('addChildDataListener','__kbparentlisteners')),
      removeChildDataListener:setDescriptor(removeChildListener('removeChildDataListener','__kbparentlisteners')),
      addChildDataUpdateListener:setDescriptor(addChildListener('addChildDataUpdateListener','__kbparentupdatelisteners')),
      removeChildDataUpdateListener:setDescriptor(removeChildListener('removeChildDataUpdateListener','__kbparentupdatelisteners')),
      addChildDataCreateListener:setDescriptor(addChildListener('addChildDataCreateListener','__kbparentcreatelisteners')),
      removeChildDataCreateListener:setDescriptor(removeChildListener('removeChildDataCreateListener','__kbparentcreatelisteners')),
      addChildDataDeleteListener:setDescriptor(addChildListener('addChildDataDeleteListener','__kbparentdeletelisteners')),
      removeChildDataDeleteListener:setDescriptor(removeChildListener('removeChildDataDeleteListener','__kbparentdeletelisteners')),
    });

    return Mixed;
  }
  return CreateKonnektDT;
});
