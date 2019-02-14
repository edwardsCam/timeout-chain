const timeouts = {}
const MARKED_FOR_DEATH = 'MarkedForDeath'

function timeoutChain(id, wait = 0, chain = [], step = 0) {
  clearTimeout(timeouts[id])

  return new Promise((resolve, reject) => {
    timeouts[id] = setTimeout(() => {
      if (timeouts[id] === MARKED_FOR_DEATH) {
        reject(`[${id}] Chain was cancelled!`)
      } else if (step >= chain.length) {
        delete timeouts[id]
        resolve()
      } else {
        chain[step](() => (
          timeoutChain(id, wait, chain, step + 1).then(resolve, reject)
        ))
      }
    }, wait)
  })
}

function cancel(id) {
  if (timeouts[id] != null) {
    timeouts[id] = MARKED_FOR_DEATH
  }
}

export default {
  begin: timeoutChain,
  cancel,
}
