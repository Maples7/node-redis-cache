# API Doc of node-redis-cache
*All supported APIs are listed below:*

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

parameters:
- config: **required**. A object withe required props `key`, `expire`. The `key` can be a pure string or string[]. The `expire` is a pure integer to declare how many **seconds** after `set` operation the `value` would expire.
- value: **required**. Declare what value to set.

## .get(config, [func]) => Promise
Get value of `config.key`. **No Pipeline Support**.

parameters:
- config: **required**. A object withe required props `key`, `expire`. The `key` can be a pure string or string[]. The `expire` is a pure integer to declare how many **seconds** after `get` operation the `value` would expire.
- func: If `func` is provided, it must be a function with a Promise which has `.tap()` API returned(we highly recommend [bluebird](https://github.com/petkaantonov/bluebird)). 

To be declared, if we find the value of `config.key` in redis, it would update the expire time with `config.expire` and just return the value(wrapped in a Promise); If not and `func` is provided, we will execute `func()` and set `config.key` with the retuen of `func()`(also update expire time). If there is no `func`, a `null` would be returned(also wrapped in a Promise).

## .del(keys) => Promise(out of pipeline) | Cache instance(in pipeline)
Del values of keys. 

parameters:
- keys: **required**. It can be an array with string or string[] items. Also, it can be just a pure string.

## .hset(config, value) => Promise(out of pipeline) | Cache instance(in pipeline)
API `hset()` to `set()` is just like `hset` to `set` in redis. The only diff is there is required prop `field` in `config`. So see `.set()` API for usage. And `config.field` can be provided the same way with `config.key`.

## .hget(config, [func]) => Promise
**No Pipeline Support**. API `hget()` to `get()` is just like `hget` to `get` in redis. The only diff is there is required prop `field` in `config`. So see `.get()` API for usage. And `config.field` can be provided the same way with `config.key`.

## .hdel(keyAndFields) => Promise(out of pipeline) | Cache instance(in pipeline)
API `hdet()` to `det()` is just like `hdet` to `det` in redis.

parameters:
- keyAndFields: **required**. It can be a object with props `key`(string or string[]) and `field`(string and string[]). It also can be an array with the object items declared above. By the way, `field` is **NOT** a required prop, and while missed, API `del()` would be applied instand of this API. That means, you can delete all hash values in the same `key` once for all.    

## .hincrby(config, [increment = 1]) => Promise(out of pipeline) | Cache instance(in pipeline)
Increase the number stored at `field` in the hash stored at `key` by `increment`.

parameters:
- config: **required**. A object withe required props `key`, `field` and `expire`. The `key` and `field` can be a pure string or string[]. The `expire` is a pure integer to declare how many **seconds** after `hincrby` operation the set would expire.
- increment: declare how much to increase. Default to be `1`.

## .sadd(config, items) => Promise(out of pipeline) | Cache instance(in pipeline)
Add items to set of redis.

parameters:
- config: **required**. A object withe required props `key`, `expire`. The `key` can be a pure string or string[]. The `expire` is a pure integer to declare how many **seconds** after `sadd` operation the set would expire.
- items: **required**. A single basical type or a array of basical items.

## .smember(config, [func]) => Promise(out of pipeline) | Cache instance(in pipeline)
Get values of set labels `config.key`.

parameters:
- config: **required**. A object withe required props `key`, `expire`. The `key` can be a pure string or string[]. The `expire` is a pure integer to declare how many **seconds** after `smember` operation the set would expire.
- func: If `func` is provided, it must be a function with a Promise which has `.tap()` API returned(we highly recommend [bluebird](https://github.com/petkaantonov/bluebird)).

To be declared, if we find the value of `config.key` in redis, it would update the expire time with `config.expire` and just return the value(wrapped in a Promise); If not and `func` is provided, we will execute `func()` and set `config.key` with the retuen of `func()`(also update expire time). If there is no `func`, a `null` would be returned(also wrapped in a Promise).

## .flushdb() => Promise(out of pipeline) | Cache instance(in pipeline)
Flush the db of redis.
