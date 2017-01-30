define([],function(){
  function CreateKObservable(data,name,parent,scope)
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
          "postsort":[]
        },

        /* fix for events, local and global, child events and * events, copy KB lib */
        _onevent = function(e)
        {
          for(var x=0,_curr=_events[e.type],len=_curr.length;x!==len;x++)
          {
              _curr[x](e);
              if(e._stopPropogration) break;
          }
          return e._preventDefault;
        }

    /* The Main constructor */
    function Mixed(data,name,parent,scope)
    {
      data = (data === undefined ? {} : data);
      /* Object prototype extensions chained down to the function */
      if(!Object.prototype._toString)
      {
        Object.defineProperties(Object.prototype,{
          _toString:setDescriptor(Object.prototype.toString,false,true),
          typeof:setDescriptor(function(v){return ({}).toString.call(v).match(/\s([a-zA-Z]+)/)[1].toLowerCase();},false,true),
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
          count:setCustomDescriptor(count,false,true)
        });

        Object.prototype.toString = function(){
          if(this instanceof Mixed) return "[object Mixed]";
          return Object.prototype._toString.apply(this,arguments);
        }
      }
      var KObservable = {};
      KObservable.__proto__ = Mixed.prototype;

      if(!window.Proxy) return console.error("There is no support for proxy on this browser");

      var prox = new Proxy(KObservable, {set:proxySet,deleteProperty:proxyDelete}),
          keys = Object.keys(data);

      Object.defineProperties(KObservable,{
        __kbname:setDescriptor((typeof name === 'string' ? name : "default"),true,true),
        __kbref:setDescriptor((parent ? (parent.__kbref || parent) : prox),true,true),
        __kbscopeString:setDescriptor((scope || ""),true,true),
        __kbImmediateParent:setDescriptor((parent || null),true,true),
        __kblisteners:setDescriptor([]),
        __kbupdatelisteners:setDescriptor([]),
        __kbcreatelisteners:setDescriptor([]),
        __kbdeletelisteners:setDescriptor([]),
        __kbpointers:setDescriptor({}),
        length:setDescriptor(0,true)
      });

      for(var x=0,len=keys.length;x<len;x++)
      {
        prox[keys[x]] = data[keys[x]];
      }

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
      this.parent = obj.___kbImmediateParent;
      this.value = value;
      this.oldValue = oldValue;
      this.stopChange = stopChange;
    }

    function setDescriptor(value,writable,redefinable)
    {
      return {
          value:value,
          writable:!!writable,
          enumerable:false,
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
                if(!this._stopChange) this.callSubscribers(_key,_value,_oldValue);
              }
              this._stopChange = undefined;
          },
          configurable:true,
          enumerable:true
      }
    }

    function setPointer(obj,prop,desc)
    {
      return {
          get:function(){
              return obj[prop];
          },
          set:function(v){

            (this._stopChange ? obj.stopChange() : obj)[prop] = v;
            this._stopChange = undefined;
          },
          enumerable:desc.enumerable,
          configurable:desc.configurable
      }
    }


    /* create check if value is just undefined but descriptor is set */
    function proxySet(target,key,value)
    {
      if(!isObservable.call(target,key))
      {
        if(!isNaN(parseInt(key,10)))
        {
          key = parseInt(key,10);
          if(target.length <= key) target.length = (key+1);
        }
        if(target._stopChange)
        {
          target[key] = value;
          return true;
        }
        else
        {
          if(typeof value === 'object')
          {
            value = Mixed(value,target.__kbname,(target.__kbscopeString+(target.__kbscopeString.length !== 0 ? "." : "")+key),target);

            var e = new eventObject(target,key,'create',value,undefined,[],'__kbcreatelisteners',target._stopChange),
                onEvent = _onevent(e);
            if(onEvent !== true)
            {
              Object.defineProperty(target,key,setBindDescriptor(key,value));
              e.listener = '__kbupdatelisteners';
              e.type = 'postcreate'
              _onevent(e);
            }
            return (onEvent !== true);
          }
          else if(value instanceof Mixed)
          {
            var e = new eventObject(target,key,'create',value,undefined,[],'__kbcreatelisteners',target._stopChange),
                onEvent = _onevent(e);
            if(onEvent !== true)
            {
              var desc = Object.getOwnPropertyDescriptor(value.__kbImmediateParent,key);
              Object.defineProperty(target,key,setPointer(value.__kbImmediateParent,key,desc));
              e.listener = '__kbupdatelisteners';
              e.type = 'postcreate';
              _onevent(e);
            }
            return (onEvent !== true);
          }
          else
          {
            var e = new eventObject(target,key,'create',value,undefined,[],'__kbcreatelisteners',target._stopChange),
                onEvent = _onevent(e);
            if(onEvent !== true)
            {
              Object.defineProperty(target,key,setBindDescriptor(key,value));
              e.listener = '__kbupdatelisteners';
              e.type = 'postcreate';
              _onevent(e);
            }
            return (onEvent !== true);
          }
        }
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

    function proxyDelete(target,key)
    {
      /* change size */
      var e = new eventObject(target,key,'delete',value,undefined,[],'__kbdeletelisteners',target._stopChange),
          onEvent = _onevent(e);
      if(onEvent !== true)
      {
        if(typeof target[key] === 'object')
        {
          target[key] = null;
        }
        delete target[key];
        e.listener = '__kbupdatelisteners';
        e.type = 'postdelete'
        _onevent(e);
      }
      return (onEvent !== true);
    }

    /* REGION Object extensions */

    function sizeof(v)
    {
      if(this == Object.prototype && v === undefined) return console.error("No object specified in Object.prototype.sizeof");

      var cache = [];

      function recGet(obj)
      {
        var keys = Object.keys(obj),
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
      if(this == Object.prototype && v === undefined) return console.error("No value specified in Object.prototype.isObject to check");

      return (Object.prototype.typeof((v !== undefined ? (typeof v === 'object' ? v : this[v]) : this)) === 'object');
    }

    function isArray(v)
    {
      if(this == Object.prototype && v === undefined) return console.error("No value specified in Object.prototype.isArray to check");

      return (Object.prototype.typeof((v !== undefined ? (typeof v === 'object' ? v : this[v]) : this)) === 'array');
    }

    function isMixed(v)
    {
      if(this == Object.prototype && v === undefined) return console.error("No value specified in Object.prototype.isMixed to check");

      return (Object.prototype.typeof((v !== undefined ? (typeof v === 'object' ? v : this[v]) : this)) === 'mixed');
    }

    function isObservable(obj,prop)
    {
      if(this == Object.prototype && obj === undefined && prop === undefined) return console.error("No object and property specified in Object.prototype.isObservable to check");

      if(obj === undefined) return console.error("No property specified in isObservable to check");

      var desc = Object.getOwnPropertyDescriptor((obj !== undefined && typeof obj !== 'string' ? obj : this),(prop !== undefined ? prop : obj));

      return (desc ? (desc.value === undefined) : false);
    }

    function stringify(v)
    {
      if(this == Object.prototype && v === undefined) return console.error("No object was specified in Object.prototype.stringify to stringify");

        var cache = [];
        return JSON.stringify(this,function(key, value) {
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
      type = (typeof v === 'string' && type === undefined ? v : type);

      if(this == Object.prototype && v === undefined) return console.error("No object was specified in Object.prototype.getkeys");

      return Object.keys((v !== undefined && typeof v !== 'string' ? (typeof v === 'object' ? v : this[v]) : this))
      .filter(function(k){
        return ((!type) || ((type === 'object' || type === 'o')) ? (isNaN(parseInt(k,10))) : (!isNaN(parseInt(k,10))));
      });
    }

    function getIndexes(v)
    {
      if(this == Object.prototype && v === undefined) return console.error("No object was specified in Object.prototype.getIndexes");

      var _arr = (v !== undefined ? (typeof v === 'object' ? v : this[v]) : this);
      return _arr.slice()
      .map(function(v,i){return (i)})
      .filter(function(v){
        return (_arr[v] !== undefined)
      });
    }

    function keyCount()
    {
      return this.getKeys('o').length
    }

    function indexCount(v)
    {
      return (this).length;
    }

    function count(v)
    {
      return (this.keyCount + this.indexCount);
    }

    /* ENDREGION Object extensions */

    /* REGION Object methods */

    function add(key,value)
    {
      if(this[key] === 'undefined')
      {
        this[key] = value;
      }
      return this;
    }

    function set(key,value)
    {
      this[key] = value;
      return this;
    }

    function addPrototype(key,value)
    {
      if(this[key] === undefined)
      {
        Object.defineProperty(this.__proto__,key,setDescriptor(value,true,true));
      }
      else
      {
        console.error('Your attempting to add your prototype with the prop %O that already exists on %O',prop,this);
      }
      return this;
    }

    /* Handle listener sharing (done in addlistener Methods) */
    function addPointer(passobj,prop,newProp)
    {
      if(!(passobj instanceof Mixed)) passobj = Mixed(passobj.__kbname,(''),passobj,passobj);

      this[(newProp || prop)] = passobj;

      this.__kbpointers[(newProp || prop)] = passobj;

    }

    function del(key)
    {
      if(this[key] !== undefined)
      {
        delete this[key];
      }
      return this;
    }

    function move(obj,prop)
    {
      this[prop] = obj[prop];

      if(obj instanceof Mixed)
      {
        delete obj[prop];
      }
      else
      {
        obj[prop] = null;
        delete obj[prop];
      }
      return this;
    }

    function copy(obj,prop)
    {
      this[prop] = obj[prop];
      return this;
    }

    function merge(obj)
    {
      var cache = [];
      function recMerge(from,to)
      {
        var keys = (from instanceof Mixed ? from.keys('o') : Object.keys(from)),
            _curr;
        for(var x=0,len=keys.length;x<len;x++)
        {
          _curr = from[keys[x]];
          if(typeof _curr === 'object' && cache.indexOf(_curr) === -1 && to[keys[x]] !== 'undefined')
          {
            recMerge(_curr,to);
          }
          else
          {
            to[keys[x]] = _curr;
          }
        }
      }
      recMerge(obj,this);
      return this;
    }

    /* ENDREGION Object methods */

    /* REGION Array methods */

    function entries() //from array but should also be for object
    {

    }

    function copyWithin()
    {

    }

    function fill(value,start,end)
    {
      start = (start !== undefined ? Math.max(0,start) : 0);
      end = ((end !== undefined && end <= this.length) ? Math.min(this.length,Math.max(0,end)) : this.length);

      var e = new eventObject(this,_start,'fill',this[_start],undefined,arguments,'');
      if(_onevent(e) !== true)
      {
        for(var x=a.key;x<end;x++)
        {
            this[x] = value;
        }
        e.type = 'postfill';
        _onevent(e);
      }
      return this;
    }

    function pop()
    {
      var e = new eventObject(this,(this.length-1),'pop',this[(this.length-1)],undefined,arguments,'');
      if(_onevent(e) !== true)
      {
        var _ret = this[(this.length-1)];
        this.length = (this.length-1);
        e.type = 'postpop'
        _onevent(e);
        return _ret;
      }
      return null;
    }

    function push(v)
    {
      var e = new eventObject(this,(this.length),'push',v,undefined,arguments,'');
      if(_onevent(e) !== true)
      {
        this[this.length] = v;
        e.type = 'postpush';
        _onevent(e);
      }
      return this.length;
    }

    function reverse()
    {
      var e = new eventObject(this,undefined,'reverse',undefined,undefined,arguments,'');
      if(_onevent(e) !== true)
      {
        var _rev = this.slice().reverse();
        for(var x=0,len=this.length;x<len;x++)
        {
            this[x] = _rev[x];
        }
        e.type = 'postreverse';
        _onevent(e);
      }
      return this;
    }

    function shift()
    {
      var e = new eventObject(this,0,'shift',this[0],undefined,arguments,'');
      if(_onevent(e) !== true)
      {
        var _ret = this[a.key];
        for(var x=a.key,len=(this.length-1);x<len;x++)
        {
            this[x] = this[(x+1)];
        }
        this.length = (this.length-1);
        e.type = 'postshift';
        _onevent(e);
      }
      return null;
    }

    function sort()
    {
      var e = new eventObject(this,undefined,'sort',undefined,undefined,arguments,'');
      if(_onevent(e) !== true)
      {
        var _sort = this.slice();
        _sort = _sort.sort.apply(_sort,arguments);
        for(var x=0,len=this.length;x<len;x++)
        {
            this[x] = _sort[x];
        }
        e.type = 'postsort';
        _onevent(e);
      }
      return this;
    }

    function splice(index,remove,insert)
    {
      var e = new eventObject(this,index,'splice',undefined,undefined,arguments,'');
      if(_onevent(e) !== true)
      {
        var _ret = [],
            _inserts = Array.prototype.slice.call(arguments,2),
            _insertLen = (_inserts.length-2),
            _index = 0;

        if(remove !== 0 && this[((index-1)+remove)] !== undefined)
        {
          for(var x=0,len=remove;x<len;x++)
          {
            _ret.push(this[index+x]);
            for(var i=(index+x),lenI=(this.length-1);i<lenI;i++)
            {
                this[i] = this[(i+1)];
            }
            delete this[(this.length-1)];
          }
        }
        if(_insertLen !== 0)
        {
          for(var x=0,len=_insertLen;x<len;x++)
          {
              _index = (index+(Math.min(1,x)));
              for(var i=this.length,lenI=_index;i>lenI;i--)
              {
                this[i] = this[(i-1)];
              }
              this[_index] = _inserts[x];
          }
        }
        e.type = 'postsplice';
        e.listener = '';
        _onevent(e);
        return _ret;
      }
      else
      {
        return [];
      }
    }

    function toLocaleString()
    {

    }

    function unshift()
    {
      var e = new eventObject(this,0,'unshift',this[0],undefined,arguments,'');
      if(_onevent(e) !== true)
      {
        var args = Array.prototype.slice.call(arguments);
        for(var x=((this.length-1)+args.length),len=args.length;x !== -1;x--)
        {
          if(x < len)
          {
              this[x] = args[x];
          }
          else
          {
            this[x] = this[(x-args.length)];
          }
        }
        e.type = 'postunshift';
        _onevent(e);
      }
      return this.length;
    }

    /* ENDREGION Array methods */

    /* REGION Event Listeners */

    function stopChange()
    {
      this._stopChange = true;
      return this;
    }

    function addListener(type,listener)
    {

    }

    function removeListener(type,listener)
    {

    }

    function addActionListener(type,func)
    {

    }

    function removeActionListener(type,func)
    {

    }

    function addDataListener(prop,func)
    {

    }

    function removeDataListener(prop,func)
    {

    }

    function addDataCreateListener(prop,func)
    {

    }

    function removeDataCreateListener(prop,func)
    {

    }

    function addDataDeleteListener(prop,func)
    {

    }

    function removeDataDeleteListener(prop,func)
    {

    }

    function addChildDataListener(prop,func)
    {

    }

    function removeChildDataListener(prop,func)
    {

    }

    function addChildDataCreateListener(prop,func)
    {

    }

    function removeChildDataCreateListener(prop,func)
    {

    }

    function addChildDataDeleteListener(prop,func)
    {

    }

    function removeChildDataDeleteListener(prop,func)
    {

    }

    function subscribe(prop,func)
    {

    }

    function unsubscribe(prop,func)
    {

    }

    function callSubscribers(prop,value,oldValue)
    {

    }

    /* ENDREGION Event Listeners */

    Object.defineProperties(Mixed.prototype,{

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

      /* Object Methods */
      add:setDescriptor(add),
      set:setDescriptor(set),
      del:setDescriptor(del),
      addPrototype:setDescriptor(addPrototype),
      addPointer:setDescriptor(addPointer),
      move:setDescriptor(move),
      copy:setDescriptor(copy),
      merge:setDescriptor(merge),

      /* Array Methods */
      entries:setDescriptor(entries),
      copyWithin:setDescriptor(copyWithin),
      fill:setDescriptor(fill),
      pop:setDescriptor(pop),
      push:setDescriptor(push),
      reverse:setDescriptor(reverse),
      shift:setDescriptor(shift),
      sort:setDescriptor(sort),
      splice:setDescriptor(splice),
      toLocaleString:setDescriptor(toLocaleString),
      unshift:setDescriptor(unshift),

      /* Event Listeners */
      stopChange:setDescriptor(stopChange),
      callSubscribers:setDescriptor(callSubscribers)
    });

    return Mixed(data,name,parent,scope);
  }
  return CreateKObservable;
});
