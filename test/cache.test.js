'use strict';

const Cache = require('../index.js');
const should = require('should');
const Promise = require('bluebird');

describe('Auto Unit Tests', () => {
  let cache;

  before(() => {
    cache = new Cache();
  });

  describe('Test String Type', () => {
    let testCase = {
      key: 'test1',
      expire: 600,
      value: 'value1'
    };

    it('expect key `' + testCase.key + '` to be `' + testCase.value + '` in redis', () =>
      cache.get(testCase, () => Promise.resolve(testCase.value))
        .should.be.finally.equal(testCase.value)
        .then(() =>
          cache.get(testCase)
            .should.be.finally.equal(testCase.value)
        ).then(() =>
          cache.del(testCase.key)
        )
    );

    it('del key `' + testCase.key + '` in redis', () =>
      cache.set(testCase, testCase.value)
        .then(() => cache.del(testCase.key))
        .then(() =>
          cache.get(testCase)
            .should.be.finally.equal(null)
        )
    );

    it('del a few keys in one call', () =>
      cache.set(testCase, testCase.val)
        .then(() => cache.del([testCase.key]))
        .then(() =>
          cache.get(testCase)
            .should.be.finally.equal(null)
        )
    );
  });

  describe('Test Hash Type', () => {
    let testCase = {
      key: 'test2',
      field: 'field',
      expire: 600,
      value: {
        a: "I'm a",
        b: "I'm b"
      }
    };

    it('expect a js object in redis with key `' + testCase.key + '` and field `' + testCase.field + '`', () =>
      cache.hget(testCase, () => Promise.resolve(testCase.value))
        .then(val => val.should.be.eql(testCase.value))
        .then(() =>
          cache.hget(testCase).then(val => val.should.be.eql(testCase.value))
        ).then(() =>
          cache.hdel(testCase)
        )
    );

    it('hincrby 1 with key `' + testCase.key + '` field `' + testCase.field + '`', () =>
      cache.hincrby(testCase)
        .should.be.finally.equal(1)
        .then(() =>
          cache.hdel(testCase)
        )
    );

    it('del field `' + testCase.field + '` in key `' + testCase.key + '` in redis', () =>
      cache.hset(testCase, testCase.value)
        .then(() => cache.hdel(testCase))
        .then(() =>
          cache.hget(testCase)
            .should.be.finally.equal(null)
        )
    );

    it('del all fields in key `' + testCase.key + '` in redis', () =>
      cache.hset(testCase, testCase.value)
        .then(() => cache.hdel({ key: testCase.key }))
        .then(() =>
          cache.hget(testCase)
            .should.be.finally.equal(null)
        )
    );

    it('del keyAndFields Array in one call', () =>
      cache.hset(testCase, testCase.value)
        .then(() => cache.hdel([testCase]))
        .then(() =>
          cache.hget(testCase)
            .should.be.finally.equal(null)
        )
    );
  });

  describe('Test Set Type', () => {
    let testCase = {
      key: ['test', '3'],
      expire: 600,
      items: [1, '2', 3]
    };

    it('sadd and smembers `' + testCase.items.toString() + '` to Set `' + testCase.key.join(':') + '` in redis', () =>
      cache.smembers(testCase, () => Promise.resolve(testCase.items))
        .then(val => val.map(v => v.toString()).should.be.eql(testCase.items.map(v => v.toString())))
        .then(() =>
          cache.smembers(testCase)
            .then(val => val.map(v => v.toString()).should.be.eql(testCase.items.map(v => v.toString())))
        ).then(() =>
          cache.del(testCase.key)
        )
    );

    it('smembers without func', () =>
      cache.smembers(testCase).should.be.finally.equal(null)
    )
  });

  describe('Test flushdb()', () => {
    it('flushdb without Error', () =>
      cache.flushdb()
    )
  });

  describe('Test pipeline function', () => {
    let testCase = {
      key: 'test4',
      expire: 600,
      field: 'fd',
      value: 've',
      items: ['1', 2, 4]
    };

    it('run pipeline well', () =>
      cache.pipeline()
        .set(testCase, testCase.value).del(testCase.key)
        .hset(testCase, testCase.value).hdel(testCase)
        .hincrby(testCase).hdel(testCase)
        .sadd(testCase, testCase.items).del(testCase.key)
        .flushdb()
        .run()
    );
  });

  describe('Test Error Cases', () => {
    it('throw TypeError for key', () =>
      Promise.resolve().then(() =>
        cache.set({
          key: 1,
          expire: 600
        })
      ).should.be.rejectedWith(TypeError)
    );

    it('throw TypeError for config', () =>
      Promise.resolve().then(() =>
        cache.set({
          key: 'test5'
        })
      ).should.be.rejectedWith(TypeError)
    );

    it('throw TypeError for func in .get()', () =>
      Promise.resolve().then(() =>
        cache.get({
          key: 'test6',
          expire: 600
        }, 'func is not a Function Type')
      ).should.be.rejectedWith(TypeError)
    );

    it('throw TypeError for func in .hget()', () =>
      Promise.resolve().then(() =>
        cache.hget({
          key: 'test7',
          field: 'fd',
          expire: 600
        }, 'func is not a Function Type')
      ).should.be.rejectedWith(TypeError)
    );

    it('throw TypeError for func in .smembers()', () =>
      Promise.resolve().then(() =>
        cache.smembers({
          key: 'test8',
          expire: 600
        }, 'func is not a Function Type')
      ).should.be.rejectedWith(TypeError)
    );
  });
});
