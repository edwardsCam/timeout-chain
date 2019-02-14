const timeouts = {}
const MARKED_FOR_DEATH = 'MarkedForDeath'

function timeoutChain(id, wait = 0, chain = [], step = 0) {
  clearTimeout(timeouts[id])

  return new Promise((resolve, reject) => {
    timeouts[id] = setTimeout(() => {
      if (timeouts[id] === MARKED_FOR_DEATH) {
        // Did not complete, but nothing went wrong. We just cancelled the chain.

        resolve(false)
      } else if (step >= chain.length) {
        // Completed successfully

        delete timeouts[id]
        resolve(true)
      } else {
        try {
          const nextCallback = () => timeoutChain(id, wait, chain, step + 1).then(resolve, reject)
          chain[step](nextCallback)
        } catch (e) {
          // Something unexpected happened. The promise should reject here.

          reject(e)
        }
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
