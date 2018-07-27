# timeout-chain

Lightweight, dependency-free utility for creating a chain of time-based promises, e.g.

1. do `x`, wait `1 second`, then
1. do `y`, wait `1 second`, then
1. do `z`

Takes a list of functions that take a `done` callback as the only argument.
Call `done()` on each step in the chain to begin the next timeout and move into the next step.
This callback allows you to do async things like `setState` or an http request if you like.

At any given time, there is only one chain per unique id in execution.
This means that if you call the same chain (or, rather, call a chain with the same `id`)
multiple times, even if previous chains have not completed yet, all previous chains will be cancelled,
and the _newest_ one will continue on as the only chain.

To illustrate this, consider the following:

```javascript
timeoutChain('test', 100, listOfSteps).then(() => {
  // This is never reached!
  // The next chain is called before this one could finish, and it got replaced.
  console.info('sadface')
})
timeoutChain('test', 100, listOfSteps).then(() => {
  // This does complete!
  // And it only gets called once, even though we started another chain before this.
  console.info('this is the chain that finished')
})
```

This makes chains somewhat idempotent, as you can be sure you'll only hit the end of _one_ invocation
of your chain. (note that steps will still be repeated if, for instance, you allow two steps to happen,
then start a new chain from the beginning. It will call those first two steps again.)

## Signature

`timeoutChain(id, wait = 0, chain = [], step = 0)`

* `id`: A unique identifier for this chain. This is needed to ensure that only one invocation of a chain
        is happening at any given time.
* `wait`: Time in ms to wait before starting each step.
* `chain`: A list of functions to be called on each step. Each function should take a callback as
           its only argument, and it should invoke that callback when it's ready to continue to the
           next step.
* `step`: The index in the chain to begin execution at.

## Example usage

```javascript
const animationFuncs = [
  done => this.setState({ showStepOne: true }, done),
  done => this.setState({ showStepTwo: true }, done),
  done => {
    doSomethingElseSync()
    done()
  },
]

// every 500ms, call the next function in the chain
timeoutChain('showingSteps', 500, animationFuncs).then(() => {
  console.info('completed the chain!')
})

...

// skip the first step, instead start at index 1
timeoutChain('showingSteps', 500, animationFuncs, 1).then(() => {
  console.info('completed the tail of the chain!')
})
```
