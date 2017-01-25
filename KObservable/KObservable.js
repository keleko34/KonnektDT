define([],function(){
  function CreateKObservable()
  {
    var events = {
          "set":[],
          "postset":[],
          "add":[],
          "postadd":[],
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
        };

    /* The Main constructor */
    function Mixed(name,parent,scope,data)
    {
      /* Object prototype extensions chained down to the function */
      if(!Object.prototype._toString)
      {
        Object.defineProperties(Object.prototype,{
          _toString:setDescriptor(Object.prototype.toString,false,true),
          typeof:setDescriptor(function(v){return ({}).toString.call(v).match(/\s([a-zA-Z]+)/)[1].toLowerCase();},false,true),
          sizeof:setDescriptor(sizeof,false,true),
          isObject:setDescriptor(isObject,false,true),
          isArray:setDescriptor(isArray,false,true),
          isObservable:setDescriptor(isObservable,false,true),
          stringify:setDescriptor(stringify,false,true),
          keys:setDescriptor(keys,false,true),
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
      KObservable.__proto__ = MixedObject.prototype;

      if(!window.Proxy) return console.error("There is no support for proxy on this browser");

      var prox = new Proxy(KObservable, {set:proxySet,deleteProperty:proxyDelete}),
          keys = Object.keys(data);

      Object.defineProperties(KObservable,{
        __kbname:setDescriptor((typeof name === 'string' ? name : "default"),true,true),
        __kbref:setDescriptor((parent ? (parent.__kbref || parent) : prox),true,true),
        __kbscopeString:setDescriptor((scope || ""),true,true),
        __kbImmediateParent:setDescriptor((parent || null),true,true)
      });

      for(var x=0,len=keys.length;x<len;x++)
      {
        prox[keys[x]] = data[keys];
      }

      return prox;
    }

    function eventObject(obj,key,value,oldValue,action,listener,args,stopChange)
    {
      this.stopPropogation = function(){this._stopPropogration = true;}
      this.preventDefault = function(){this._preventDefault = true;}
      this.local = obj;
      this.key = key;
      this.arguments = args;
      this.event = action;
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
          return func();
        },
        set:function(v){if(!!writable) func = v;},
        enumerable:false,
        configurable:!!redefinable
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

    function proxySet(target,key,value)
    {
      if(typeof target[key] === 'undefined')
      {
        var isIndex = !isNaN(parseInt(key,10));
        if(target._stopChange)
        {
          target[key] = value;
        }
        else if(isIndex)
        {
          key = parseInt(key,10);
          if(target.length <= key) target.length = (key+1);
        }
        else
        {
          if(typeof value === 'object')
          {
            value = Mixed(target.__kbname,(target.__kbscopeString+"."+key),target.__kbImmediateParent,value);
          }
          else if(value instanceof Mixed)
          {
            target.addPointer(key,value);
          }
          else
          {
            target.addBindable(key,value);
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
      }
    }

    function proxyDelete(target,key)
    {
      /* change size */

      return true;
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

      return (Object.prototype.typeof((v !== undefined ? v : this)) === 'object');
    }

    function isArray(v)
    {
      if(this == Object.prototype && v === undefined) return console.error("No value specified in Object.prototype.isArray to check");

      return (Object.prototype.typeof((v !== undefined ? v : this)) === 'array');
    }

    function isObservable(obj,prop)
    {
      if(this == Object.prototype && obj === undefined && prop === undefined) return console.error("No object and property specified in Object.prototype.isObservable to check");

      if(obj === undefined)
      {
        console.error("No property specified in isObservable to check");
      }
      return (Object.getOwnPropertyDescriptor((obj !== undefined && typeof obj !== 'string' ? obj : this),(prop !== undefined ? prop : obj)).value === undefined);
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

    function keys(v,type)
    {
      if(this == Object.prototype && v === undefined) return console.error("No object was specified in Object.prototype.keys");

      return Object.keys((v !== undefined ? v : this))
      .filter(function(k){
        return (!type) || ((type === 'object' || type === 'o') ? (isNaN(parseInt(k,10))) : (!isNaN(parseInt(k,10))));
      });
    }

    function keyCount()
    {
      return this.keys(this).length
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

    function add(prop,value)
    {

    }

    function addPrototype(prop,value)
    {
      if(this[prop] === undefined)
      {
        Object.defineProperty(this.__proto__,prop,setDescriptor(value,true,true));
      }
      else
      {
        console.error('Your attempting to add your prototype with the prop: ',prop,' that already exists');
      }
      return this;
    }

    function addPointer(obj,prop,newProp) /* Handle listener sharing, possibly add property saying this is a pointer and the pointed object */
    {
      var desc = Object.getOwnPropertyDescriptor(obj,prop);
      Object.defineProperty(this,(newProp || prop),setPointer(obj,prop,desc));
    }

    function merge(v)
    {

    }

    function entries() //from array but should also be for object
    {

    }

    function copyWithin()
    {

    }

    function fill()
    {

    }

    function pop()
    {

    }

    function push()
    {

    }

    function reverse()
    {

    }

    function shift()
    {

    }

    function sort()
    {

    }

    function splice()
    {

    }

    function toLocaleString()
    {

    }

    function unshift()
    {

    }

    /* Event Listeners */

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

    Mixed.prototype.concat = Array.prototype.concat;
    Mixed.prototype.every = Array.prototype.every;
    Mixed.prototype.filter = Array.prototype.filter;
    Mixed.prototype.find = Array.prototype.find;
    Mixed.prototype.findIndex = Array.prototype.findIndex;
    Mixed.prototype.forEach = Array.prototype.forEach;
    Mixed.prototype.includes = Array.prototype.includes;
    Mixed.prototype.indexOf = Array.prototype.indexOf;
    Mixed.prototype.join = Array.prototype.join;
    Mixed.prototype.lastIndexOf = Array.prototype.lastIndexOf;
    Mixed.prototype.map = Array.prototype.map;
    Mixed.prototype.reduce = Array.prototype.reduce;
    Mixed.prototype.reduceRight = Array.prototype.reduceRight;
    Mixed.prototype.slice = Array.prototype.slice;
    Mixed.prototype.some = Array.prototype.some;
    Mixed.prototype.length = 0;

    return Mixed();
  }
  return CreateKObservable;
}
