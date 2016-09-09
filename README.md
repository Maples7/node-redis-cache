# node-redis-cache
A clean redis cache lib based on [ioredis](https://github.com/luin/ioredis).

# Features
- Make cache much easier
- Multiple ES6 features are applied
- Most of the APIs support [pipeline](https://github.com/luin/ioredis#pipelining)
- The Promise lib in your own code must support `.tap()`, we highly recommend [bluebird](https://github.com/petkaantonov/bluebird)
- Chain style usage, whenever in or not in a pipeline
- When query data from database, it can be auto-saved in cache without your own extra operation, making next queries much faster. 

# Usage
> $ npm install node-redis-cache --save

## Example
What we export from the package is a Class, so you can use it like this in your own code:
```js
let cache = new (require('node-redis-cache'))();
let Promise = require('bluebird');

cache.get({
    key: 'test1',
    expire: 600
}, () => Promise.resolve('value1'));

cache.hget({
    key: 'test2',
    field: 'field',
    expire: 600 
}, () => Promise.resolve('value2'));
``` 

If you want to `new` a Cache instance, the parameters you can pass to the constructor is totally the same with [ioredis](https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options)(also with the same call pattern).

# APIs
## .pipeline() => Cache instance
Lunch a pipeline instance. It should be used with `.run` in pairs.

Usage example:
```js
cache.pipeline().del('test1').hdel({
    key: 'test2',
    field: 'field'
}).run().then(() => console.log('Done'));
```

See [pipeline](https://github.com/luin/ioredis#pipelining) for more information.

**Attention**: To avoid mistakes, API `get` and `hget` are not supporting pipeline usage. So if you use these APIs while runing a pipeline instance, the tasks from these APIs will execute immediately and not add to the pipeline tasks. What's more, if you add `set` operation in a pipeline and want to `get` the same key just after that before `.run()`, you will not get what you want to `set`. The reason is distinct.

## .run() => Promise
Execute all tasks in this pipeline instance. See `.pipeline()` API. 

**Attention**: We use [multi()](https://github.com/luin/ioredis#transaction) in the lib code to implement pipeline function, so any task in the pipeline fails, all tasks would **NOT** be executed.

## .set(config, value) => Promise(out of pipeline) | Cache instance(in pipeline)
Set `config.key` with `value` in redis.
### parameters
- config: **required**. A object withe required props `key`, `expire`. The `key` can be a pure string or string[]. The `expire` is a pure integer to declare how many **seconds** after `set` operation the `value` would expire.
- value: **required**. Declare what value to set.

## .get(config, func) => Promise
Get value of `config.key`. **No Pipeline Support**.
### parameters
- config: **required**. A object withe required props `key`, `expire`. The `key` can be a pure string or string[]. The `expire` is a pure integer to declare how many **seconds** after `set` operation the `value` would expire.
- func: If `func` is provided, it must be a function with a Promise which has `.tap()` API returned(we highly recommend [bluebird](https://github.com/petkaantonov/bluebird)). 

To be declared, if we find the value of `config.key` in redis, it would update the expire time with `config.expire` and just return the value(wrapped in a Promise); It not and `func` is provided, we will execute `func()` and set `config.key` with the retuen of `func()`. If not `func`, a `null` would be returned(also wrapped in a Promise).

## .del(keys) => Promise(out of pipeline) | Cache instance(in pipeline)
Del values of keys. 
### parameters
- keys: **required**. It can be an array with string or string[] items. Also, it can be just a pure string.

## .hset(config, value) => Promise(out of pipeline) | Cache instance(in pipeline)
API `hset()` to `set()` is just like `hset` to `set` in redis. The only diff is there is required prop `field` in `config`. So see `.set()` API for usage. And `config.field` can be provided the same way with `config.key`.

## .hget(config, func) => Promise
**No Pipeline Support**. API `hget()` to `get()` is just like `hget` to `get` in redis. The only diff is there is required prop `field` in `config`. So see `.get()` API for usage. And `config.field` can be provided the same way with `config.key`.

## .hdel(keyAndFileds) => Promise(out of pipeline) | Cache instance(in pipeline)
API `hdet()` to `det()` is just like `hdet` to `det` in redis. 
### parameters
- keyAndFileds: It can be a object with props `key`(string or string[]) and `field`(string and string[]). It also can be an array with the object items declared above. By the way, `field` is **NOT** a required prop, and while missed, API `del()` would be applied instand of this API. That means, you can delete all hash values in the same `key` once for all.    

## .flushdb() => Promise(out of pipeline) | Cache instance(in pipeline)
Flush the db of redis.

# ChangeLog
## V 0.0.2 - 2016.09.09
* update README
* fix a bug in exmaple code

## V 0.0.1 - 2016.09.09
* finish the basical lib

# Join Me
I'll keep updating APIs of redis to satisfy multiple needs. And you are welcomed to join me to make it better: Fork -> Edit -> Pull Request.

Also, any issues are welcomed, I'm all ears. 

:D 

# License
MIT
