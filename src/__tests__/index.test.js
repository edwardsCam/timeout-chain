import { assert, createSinonSuite } from '@inst/career-test-utils'
import Subject from '../index'

describe('career-development-plan::utils::timeoutChain', function() {
  const sinon = createSinonSuite(this)
  let stubs

  beforeEach(function() {
    sinon.useFakeTimers()
    stubs = {
      first: sinon.stub(),
      second: sinon.stub(),
      third: sinon.stub(),
    }
  })

  afterEach(function() {
    sinon.clock.restore()
  })

  it('immediately resolves if list is empty', function() {
    const prom = Subject('test')
    sinon.clock.tick()
    return prom
  })

  it('calls each step in the chain, in order', function() {
    const chain = [
      done => {
        assert.notCalled(stubs.first)
        assert.notCalled(stubs.second)
        assert.notCalled(stubs.third)
        stubs.first()
        done()
      },
      done => {
        assert.called(stubs.first)
        assert.notCalled(stubs.second)
        assert.notCalled(stubs.third)
        stubs.second()
        done()
      },
      done => {
        assert.called(stubs.first)
        assert.called(stubs.second)
        assert.notCalled(stubs.third)
        stubs.third()
        done()
      },
      done => {
        assert.called(stubs.first)
        assert.called(stubs.second)
        assert.called(stubs.third)
        done()
      },
    ]
    const prom = Subject('test', 0, chain)
    sinon.clock.tick(chain.length)
    return prom
  })

  it('waits the timeout before calling each next step', function() {
    const chain = [
      done => {
        stubs.first()
        done()
      },
      done => {
        stubs.second()
        done()
      },
      done => {
        stubs.third()
        done()
      },
    ]
    const TIME = 100
    const prom = Subject('test', TIME, chain)

    assert.notCalled(stubs.first)
    assert.notCalled(stubs.second)
    assert.notCalled(stubs.third)

    sinon.clock.tick(TIME / 2)
    assert.notCalled(stubs.first)
    assert.notCalled(stubs.second)
    assert.notCalled(stubs.third)

    sinon.clock.tick(TIME)
    assert.called(stubs.first)
    assert.notCalled(stubs.second)
    assert.notCalled(stubs.third)

    sinon.clock.tick(TIME)
    assert.called(stubs.first)
    assert.called(stubs.second)
    assert.notCalled(stubs.third)

    sinon.clock.tick(TIME)
    assert.called(stubs.first)
    assert.called(stubs.second)
    assert.called(stubs.third)

    sinon.clock.tick(TIME)

    return prom
  })

  it('allows you to start the chain at any step', function() {
    const chain = [
      done => {
        stubs.first()
        done()
      },
      done => {
        stubs.second()
        done()
      },
      done => {
        stubs.third()
        done()
      },
    ]
    const prom = Subject('test', 0, chain, 1)

    assert.notCalled(stubs.first)
    assert.notCalled(stubs.second)
    assert.notCalled(stubs.third)

    sinon.clock.tick()
    assert.notCalled(stubs.first)
    assert.called(stubs.second)
    assert.notCalled(stubs.third)

    sinon.clock.tick(1)
    assert.notCalled(stubs.first)
    assert.called(stubs.second)
    assert.called(stubs.third)

    sinon.clock.tick(1)

    return prom
  })

  it('clears previous chains if you call the same id multiple times', function() {
    const chain = [
      done => {
        stubs.first()
        done()
      },
      done => {
        stubs.second()
        done()
      },
      done => {
        stubs.third()
        done()
      },
    ]

    Subject('test', 100, chain)

    sinon.clock.tick(100)
    assert.equal(1, stubs.first.callCount)
    assert.notCalled(stubs.second)
    assert.notCalled(stubs.third)

    const prom = Subject('test', 100, chain)

    sinon.clock.tick()
    assert.equal(1, stubs.first.callCount)
    assert.notCalled(stubs.second)
    assert.notCalled(stubs.third)

    sinon.clock.tick(100)
    assert.equal(2, stubs.first.callCount)
    assert.equal(1, stubs.second.callCount)
    assert.notCalled(stubs.third)

    sinon.clock.tick(100)
    assert.equal(2, stubs.first.callCount)
    assert.equal(2, stubs.second.callCount)
    assert.equal(1, stubs.third.callCount)

    sinon.clock.tick(100)
    assert.equal(2, stubs.first.callCount)
    assert.equal(2, stubs.second.callCount)
    assert.equal(2, stubs.third.callCount)

    sinon.clock.tick(100)

    return prom
  })
})
