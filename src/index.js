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
        const nextCallback = () => timeoutChain(id, wait, chain, step + 1).then(resolve, reject)
        chain[step](nextCallback)
      }
    }, wait)
  })
}

timeoutChain.cancel = function cancel(id) {
  if (timeouts[id] != null) {
    timeouts[id] = MARKED_FOR_DEATH
  }
}

export default timeoutChain
