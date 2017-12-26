'use strict'

const sentenceSimilarity = require('sentence-similarity')
const similarity = sentenceSimilarity.sentenceSimilarity
const similarityScore = sentenceSimilarity.similarityScore

const MAX_NUMBER = Number.MAX_SAFE_INTEGER

const getKeys = (obj) => Object.keys(obj).filter(_ => !_.startsWith('_')).sort()

const mean = numbers => {
  let total = 0
  for (let i = 0; i < numbers.length; i += 1) {
    total += numbers[i]
  }
  return total / numbers.length
}

const findMostSimilar = (haystack, measure) =>
  haystack.map(item => ({ item: item, distance: measure(item) }))
  .sort((a, b) => (b.distance - a.distance))

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


  const winkOpts = { f: similarityScore.winklerMetaphone, options : {threshold: 0} }

  const match = findMostSimilar(chain, candidate =>
    // count the difference between keys
    // when keys are not matching we consider it is perfect match
    blockKeys.reduce((acc, k) => {
      if (!candidate[k]) { return acc * 0 }
      const blockArr = `${block[k]}`.split(' ')
      const candidateArr = `${candidate[k]}`.split(' ')
      // note: a good match is a mean superior to 0.8
      return acc * mean(similarity(blockArr, candidateArr, winkOpts).matchScore)
    }, 1)
  )[0]
  // note: we should handle duplicate "same questions" by looking at the past
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