const timeouts = {}
const MARKED_FOR_DEATH = 'MarkedForDeath'

function timeoutChain(id, wait = 0, chain = [], step = 0) {
  clearTimeout(timeouts[id])

  return new Promise(resolve => {
    timeouts[id] = setTimeout(() => {
      if (step >= chain.length || timeouts[id] === MARKED_FOR_DEATH) {
        delete timeouts[id]
        resolve()
      } else {
        const nextCallback = () => timeoutChain(id, wait, chain, step + 1).then(resolve)
        chain[step](nextCallback)
      }
    }, wait)
  })
}

timeoutChain.cancel = function cancel(id) {
  timeouts[id] = MARKED_FOR_DEATH
}

export default timeoutChain
