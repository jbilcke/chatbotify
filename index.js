'use strict'

const damerauLevenshtein = require('talisman/metrics/distance/damerau-levenshtein')

const MAX_NUMBER = Number.MAX_SAFE_INTEGER

const getKeys = (obj) => Object.keys(obj).filter(_ => !_.startsWith('_')).sort()

const findMostSimilar = (haystack, measure) =>
  haystack.map(item => ({ item: item, distance: measure(item) }))
  .sort((a, b) => {
    const distance = a.distance - b.distance
    if (distance !== 0) { return distance }
    return 0
  })

const historify = text => {
  let current = ''
  return text
    .split('\n')
    // .filter(splits => splits.length >= 2) // let's leave empty spaces
    .map(line => {
      const easy = line.match(/^([a-zA-Z]+):\s+(.*)$/)
      const res = {}
      if (easy) {
        current = easy[1]
        res[current] = easy[2]
      } else {
        res[current] = line
      }
      return res
    })
}

const guess = ({ chain, history, block }) => {

  const blockKeys = getKeys(block)

  const match = findMostSimilar(chain, candidate =>
    // count the difference between keys
    // when keys are not matching we consider it is perfect match
    blockKeys.reduce((acc, k) => {
      const distance = candidate[k]
        ? Math.abs(damerauLevenshtein(block[k], candidate[k]))
        : MAX_NUMBER
      return acc + distance
    }, 0)
  )[0] // note: we should handle duplicate "same questions" by looking at the past
  // to solve this, we can for instance give a score to each one based on the
  // similarity of previous events

  if (!(match && match.item && typeof match.item._id === 'number' && match.item._id < chain.length)) {return {}}
  match.item._usage++
  
  // now we look for the first block we find that is missing one of our current
  // block's facets
  const response = chain.slice(match.item._id + 1).find(next => blockKeys.some(k => typeof next[k] === 'undefined'))

  /*
  console.log('DEBUG:' + JSON.stringify({
    block: block,
    match: match,
    chain: chain.slice(match.item._id + 1, match.item._id + 5),
    response: response,
  }))
  */

  if (!response) {return {}}

  const result = {/* toString: () => '...' */}
  const dataKeys = getKeys(response)
  if (!dataKeys.length) { return {} }

  // try to find the text, otherwise fallback to the first key
  const bestKey = dataKeys[0]
  //result.toString = () => response[bestKey]

  // always populate with what we found
  dataKeys.map(_ => (result[_] = response[_]))

  return result
}

const chatbotify = (chain, history = []) => {

  chain = chain.map((_, i) => ({_id: i, _usage: 0, ..._}))

  return input => {
    if (typeof input === 'string') {
      return rest => {
        let block = {}
        if (typeof rest === 'string') {
          block[input] = rest 
        } else {
          block = {...block, ...rest}
        }
        return guess({
          chain,
          history,
          block
        })
      }
    } else {
      return guess({
        chain,
        history,
        block: input
      })
    }
  }
}

module.exports = { historify, chatbotify }