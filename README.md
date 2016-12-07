# node-redis-cache
A clean redis cache lib based on [ioredis](https://github.com/luin/ioredis).

# Features
- Make cache much easier
- Multiple ES6 features are applied
- Most of the APIs support [pipeline](https://github.com/luin/ioredis#pipelining)
- The Promise lib in your own code must support `.tap()`, we highly recommend [bluebird](https://github.com/petkaantonov/bluebird)
- Chain style usage, whenever in or not in a pipeline
- When you query data from database, it can be auto-saved in cache without your own extra operation, making next queries much faster. 

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

# API Doc
[API Doc of node-redis-cache](doc/api_doc.md)

# Practice Project
[Maples7/weibo - Github](https://github.com/Maples7/weibo)

# ChangeLog
[Change Log of node-redis-cache](doc/CHANGELOG.md)

# Join Me
I'll keep updating APIs of redis to satisfy multiple needs. And you are welcomed to join me to make it better: Fork -> Edit -> Pull Request.

Also, any issues are welcomed, I'm all ears. 

:D 

# Test
> $ npm run test    

*Make sure you have installed [Redis](https://redis.io/) and [mocha](https://mochajs.org/) before that.*

# License
MIT
