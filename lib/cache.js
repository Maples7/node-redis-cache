const Redis = require('ioredis');
const _ = require('lodash');

let client = null;

function createClient() {
    // keep there is always ONLY one connection with redis
    return client || (client = new Redis(...arguments));
}

function parseKey(key) {
    if (_.isArray(key)) {
        key = key.join(':');
    }
    if (!_.isString(key)) {
        throw new TypeError('Argument `key` and `field` must be a pure string or string[].');
    }
    return key;
}

function validateConfig(config, props) {
    if (!props.every(prop => !!config[prop])) {
        throw new TypeError('Argument `config` is invalid for missing prop(s).');
    }
    if (config.key) {
        config.key = parseKey(config.key);
    }
    if (config.field) {
        config.field = parseKey(config.field);
    }
}

module.exports = class Cache {
    constructor() {
        this._client = createClient(...arguments);
        this._lazyRun = false;
        this._tasks = [];
    }

    pipeline() {
        let newCache = new Cache();
        newCache._lazyRun = true;
        return newCache;
    }

    run() {
        this._lazyRun = false;
        return this._client.multi(this._tasks).exec()
            .tap(results => {
                this._tasks = [];
            });
    }

    flushdb() {
        if (this._lazyRun) {
            this._tasks.push(['flushdb']);
            return this;
        } else {
            return this._client.flushdb();
        }
    }

    _handleExpire(key, expire) {
        if (this._lazyRun) {
            this._tasks.push(['expire', key, expire]);
            return this;
        } else {
            return this._client.expire(key, expire);
        }
    }

    /**************************************************************
     ************************ Sting Type **************************
     **************************************************************/

    set(config, value) {
        validateConfig(config, ['key', 'expire']);
        if (this._lazyRun) {
            this._tasks.push(['set', config.key, JSON.stringify(value)]);
            return this._handleExpire(config.key, config.expire);
        } else {
            return this._client.set(config.key, JSON.stringify(value))
                .then(() => this._handleExpire(config.key, config.expire));
        }
    }

    // No pipeline
    get(config, func) {
        validateConfig(config, ['key', 'expire']);
        if (func && !_.isFunction(func)) {
            throw new TypeError('Aruguments `func` must be a function');
        }
        return this._client.get(config.key).then(result => {
            if (result) {
                this._handleExpire(config.key, config.expire);
                return JSON.parse(result);
            } else {
                if (func) {
                    return func().tap(result => this.set(config, result));
                } else {
                    return null;
                }
            }
        });
    }

    del(keys) {
        if (!_.isArray(keys)) {
            keys = [keys];
        }
        let tasks = keys.map(key => {
            key = parseKey(key);
            return ['del', key];
        });
        if (this._lazyRun) {
            this._tasks = _.concat(this._tasks, tasks);
            return this;
        } else {
            return this._client.multi(tasks).exec();
        }
    }

    /**************************************************************
     ************************* Hash Type **************************
     **************************************************************/

    hset(config, value) {
        validateConfig(config, ['key', 'field', 'expire']);
        if (this._lazyRun) {
            this._tasks.push(['hset', config.key, config.field, JSON.stringify(value)]);
            return this._handleExpire(config.key, config.expire);
        } else {
            return this._client.hset(config.key, config.field, JSON.stringify(value))
                .then(() => this._handleExpire(config.key, config.expire));
        }
    }

    // No pipeline
    hget(config, func) {
        validateConfig(config, ['key', 'field', 'expire']);
        if (func && !_.isFunction(func)) {
            throw new TypeError('Aruguments `func` must be a function');
        }
        return this._client.hget(config.key, config.field).then(result => {
            if (result) {
                this._handleExpire(config.key, config.expire);
                return JSON.parse(result);
            } else {
                if (func) {
                    return func().tap(result => this.hset(config, result));
                } else {
                    return null;
                }
            }
        });
    }

    hdel(keyAndFields) {
        if (!_.isArray(keyAndFields)) {
            keyAndFields = [keyAndFields];
        }
        let tasks = keyAndFields.map(keyAndField => {
            validateConfig(keyAndField, ['key']);
            if (keyAndField.field) {
                keyAndField.field = parseKey(keyAndField.field);
                return ['hdel', keyAndField.key, keyAndField.field];
            } else {
                return ['del', keyAndField.key];
            }
        });

        if (this._lazyRun) {
            this._tasks = _.concat(this._tasks, tasks);
            return this;
        } else {
            return this._client.multi(tasks).exec();
        }
    }

    hincrby(config, increment = 1) {
        validateConfig(config, ['key', 'field', 'expire']);
        if (this._lazyRun) {
            this._tasks.push(['hincrby', config.key, config.field, increment]);
            return this._handleExpire(config.key, config.expire);
        } else {
            return this._client.hincrby(config.key, config.field, increment)
                .then(() => this._handleExpire(config.key, config.expire));
        }
    }

    /**************************************************************
     ************************** Set Type **************************
     **************************************************************/

    sadd(config, items) {
        validateConfig(config, ['key', 'expire']);
        if (this._lazyRun) {
            this._tasks.push(['sadd', config.key, items]);
            return this._handleExpire(config.key, config.expire);
        } else {
            return this._client.sadd(config.key, items)
                .then(() => this._handleExpire(config.key, config.expire));;
        }
    }

    // No pipeline
    smembers(config, func) {
        validateConfig(config, ['key', 'expire']);
        if (func && !_.isFunction(func)) {
            throw new TypeError('Aruguments `func` must be a function');
        }

        return this._client.smembers(config.key).then(result => {
            if (result.length) {
                this._handleExpire(config.key, config.expire);
                return result;
            } else {
                return func ? func().tap(result => this.sadd(config, result)) : null;
            }
        });
    }
};
