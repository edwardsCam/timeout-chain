const timeouts = {}

export default function timeoutChain(id, wait = 0, chain = [], step = 0) {
  if (!timeouts[id]) timeouts[id] = {}
  clearTimeout(timeouts[id][step])

  return new Promise(resolve => {
    timeouts[id][step] = setTimeout(() => {
      if (step >= chain.length) {
        timeouts[id] = {}
        resolve()
      } else {
        const nextCallback = () => timeoutChain(id, wait, chain, step + 1).then(resolve)
        chain[step](nextCallback)
      }
    }, wait)
  })
}
