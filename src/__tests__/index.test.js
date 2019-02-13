import sinon from 'sinon'
import timeoutChain from '../index'

describe('timeout-chain', function() {
  let stubs

  beforeEach(function() {
    sinon.useFakeTimers()
    stubs = {
      first: sinon.fake(),
      second: sinon.fake(),
      third: sinon.fake(),
    }
  })

  afterEach(function() {
    sinon.clock.restore()
  })

  it('immediately resolves if list is empty', function() {
    const prom = timeoutChain('test')
    sinon.clock.tick()
    return prom
  })

  it('calls each step in the chain, in order', function() {
    const chain = [
      done => {
        sinon.assert.notCalled(stubs.first)
        sinon.assert.notCalled(stubs.second)
        sinon.assert.notCalled(stubs.third)
        stubs.first()
        done()
      },
      done => {
        sinon.assert.called(stubs.first)
        sinon.assert.notCalled(stubs.second)
        sinon.assert.notCalled(stubs.third)
        stubs.second()
        done()
      },
      done => {
        sinon.assert.called(stubs.first)
        sinon.assert.called(stubs.second)
        sinon.assert.notCalled(stubs.third)
        stubs.third()
        done()
      },
      done => {
        sinon.assert.called(stubs.first)
        sinon.assert.called(stubs.second)
        sinon.assert.called(stubs.third)
        done()
      },
    ]
    const prom = timeoutChain('test', 0, chain)
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
    const prom = timeoutChain('test', TIME, chain)

    sinon.assert.notCalled(stubs.first)
    sinon.assert.notCalled(stubs.second)
    sinon.assert.notCalled(stubs.third)

    sinon.clock.tick(TIME / 2)
    sinon.assert.notCalled(stubs.first)
    sinon.assert.notCalled(stubs.second)
    sinon.assert.notCalled(stubs.third)

    sinon.clock.tick(TIME)
    sinon.assert.called(stubs.first)
    sinon.assert.notCalled(stubs.second)
    sinon.assert.notCalled(stubs.third)

    sinon.clock.tick(TIME)
    sinon.assert.called(stubs.first)
    sinon.assert.called(stubs.second)
    sinon.assert.notCalled(stubs.third)

    sinon.clock.tick(TIME)
    sinon.assert.called(stubs.first)
    sinon.assert.called(stubs.second)
    sinon.assert.called(stubs.third)

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
    const prom = timeoutChain('test', 0, chain, 1)

    sinon.assert.notCalled(stubs.first)
    sinon.assert.notCalled(stubs.second)
    sinon.assert.notCalled(stubs.third)

    sinon.clock.tick()
    sinon.assert.notCalled(stubs.first)
    sinon.assert.called(stubs.second)
    sinon.assert.notCalled(stubs.third)

    sinon.clock.tick(1)
    sinon.assert.notCalled(stubs.first)
    sinon.assert.called(stubs.second)
    sinon.assert.called(stubs.third)

    sinon.clock.tick(1)

    return prom
  })

  it('clears previous chains if you call the same id multiple times', function() {
    const TIME = 50

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

    timeoutChain('test', TIME, chain)

    sinon.clock.tick(TIME)
    expect(stubs.first.callCount).toBe(1)
    sinon.assert.notCalled(stubs.second)
    sinon.assert.notCalled(stubs.third)

    const prom = timeoutChain('test', TIME, chain)

    sinon.clock.tick(TIME)
    expect(stubs.first.callCount).toBe(2)
    sinon.assert.notCalled(stubs.second)
    sinon.assert.notCalled(stubs.third)

    sinon.clock.tick(TIME)
    expect(stubs.first.callCount).toBe(2)
    expect(stubs.second.callCount).toBe(1)
    sinon.assert.notCalled(stubs.third)

    sinon.clock.tick(TIME)
    expect(stubs.first.callCount).toBe(2)
    expect(stubs.second.callCount).toBe(1)
    expect(stubs.third.callCount).toBe(1)

    sinon.clock.tick(TIME)

    return prom
  })

  it('lets you cancel the chain', function() {
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

    const prom = timeoutChain('test', 50, chain)

    sinon.clock.tick(50)
    expect(stubs.first.callCount).toBe(1)
    sinon.assert.notCalled(stubs.second)
    sinon.assert.notCalled(stubs.third)

    timeoutChain.cancel('test')

    sinon.clock.tick(50)
    expect(stubs.first.callCount).toBe(1)
    sinon.assert.notCalled(stubs.second)
    sinon.assert.notCalled(stubs.third)

    sinon.clock.tick(50)
    expect(stubs.first.callCount).toBe(1)
    sinon.assert.notCalled(stubs.second)
    sinon.assert.notCalled(stubs.third)

    sinon.clock.tick(50)
    expect(stubs.first.callCount).toBe(1)
    sinon.assert.notCalled(stubs.second)
    sinon.assert.notCalled(stubs.third)

    return prom
  })
})
