# timeout-chain

Lightweight, dependency-free utility for creating a chain of time-based callbacks.

Useful for animation sequences or anything where you want to guarantee some amount of time passing between steps.

1. do `task a`, wait `1 second`, then
1. do `task b`, wait `1 second`, then
1. do `task c`

---

## Example (React)

```javascript
timeoutChain.begin('showingSteps', 500, [
  done => {
    console.log('starting step one')
    this.setState({ finishedStepOne: true }, done)
  },
  done => {
    console.log('500ms later, starting step two')
    this.setState({ finishedStepTwo: true }, done)
  },
  done => {
    console.log('500ms after that, starting step three')
    this.setState({ finishedStepThree: true }, done)
  },
]).then(didComplete => {
  if (didComplete) {
    console.log('completed the chain!')
  } else {
    console.log('the chain was cancelled before it could finish, but nothing unexpected happened!')
  }
})
```

Takes a list of functions that have a `done` callback as the only argument.
Call `done()` when you're ready to begin the timeout to start the chain's next step.
You can chain asynchronous things like `setState` or an http request if you like - you have a guarantee that you'll always have at least `<wait>` ms between steps.

---

## Signature

### `begin()`

`timeoutChain.begin(id, wait = 0, chain = [], step = 0)`

* `id`: A unique identifier for this chain. This is needed to ensure that only one invocation of a chain
        is happening at any given time.
* `wait`: Time in ms to wait before starting each step.
* `chain`: A list of functions to be called on each step. Each function should take a callback as
           its only argument, and it should invoke that callback when it's ready to continue to the
           next step.
* `step`: The index in the chain to begin execution at.

Returns a promise that resolves or rejects under these conditions:
  1. Resolves with `true` if the chain completes without a hitch,
  2. Resolves with `false` if the chain is cancelled,
  3. Rejects if anything explodes during the chain.

```javascript
timeoutChain.begin('myChain', 250, []).then(
  didComplete => { ... },
  err => { ... }
)
```

### `cancel()`

`timeoutChain.cancel(id)`

Use this to cancel the invocation of the chain.
The `timeoutChain()` promise will immediately resolve with `false` after calling cancel.
If you are using timeoutChain with React, it is recommended that you always cancel the timeoutChain
in `componentWillUnmount`.

```javascript
timeoutChain.cancel('theDoomedChain')
```

---

#### A note on why the `id` parameter is needed:

At any given time, there is only one chain in execution per unique id.
This means that if you make multiple calls to timeoutChain with the same `id`,
only the most recent chain will execute, and any previous chains with that id will be cancelled.
This makes chains somewhat idempotent, as you can be sure you'll only hit the end of _one_ invocation
of your chain. (note that steps will still be repeated if, for instance, you allow two steps to happen,
then start a new chain from the beginning. It will call those first two steps again.)

To illustrate this, consider the following:

```javascript
function funcThatNeverExecutes() {
  // This is never reached!
  // The next chain is called before this one could finish, and it got replaced.
  console.info('sadface')
}

function funcThatExecutes() {
  // This does complete!
  // And it only gets called once, even though we started another chain before this.
  console.info('this is the chain that finished')
}

timeoutChain.begin('test', 100, listOfSteps).then(funcThatNeverExecutes)
timeoutChain.begin('test', 100, listOfSteps).then(funcThatExecutes)
```
