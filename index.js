'use strict'

const damerauLevenshtein = require('talisman/metrics/distance/damerau-levenshtein')

const MAX_NUMBER = Number.MAX_SAFE_INTEGER

const getKeys = (obj) => Object.keys(obj).filter(_ => !_.startsWith('_')).sort()

const search = (haystack, measure) =>
  haystack.map(item => ({ item: item, distance: measure(item) }))
  .sort((a, b) => {
    const distance = a.distance - b.distance
    if (distance !== 0) { return distance }
    const usage = a.item._usage - b.item._usage
    if (usage !== 0) { return usage }
    return 0
  })[0]

const historify = text => text
  .split('\n')
  .map(_ => _.trim().split(':'))
  // .filter(splits => splits.length >= 2) // let's leave empty spaces
  .map(splits => {
    const res = {}
    res[splits.shift().trim()] = splits.map(i => i.trim()).join(' ')
    return res
  })

const guess = ({ database, history, event }) => {

  const eventKeys = getKeys(event)

  // TODO: if we have a collision, we should prioritize and pick
  // the response that best fit the history

  const match = search(database, item =>
    // count the difference between keys
    // when keys are not matching we consider it is perfect match
    eventKeys.reduce((acc, _) => (
      acc + Math.abs(damerauLevenshtein(event[_], item[_] || ''))
    ), 0)
  )
  
  if (!(match && match.item && typeof match.item._id === 'number' && match.item._id < database.length)) {return {}}
  match.item._usage++
  
  const response = database[match.item._id + 1]
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

const chatbotify = (database, history = []) => {

  database = database.map((_, i) => ({_id: i, _usage: 0, ..._}))

  return input => {
    if (typeof input === 'string') {
      return rest => {
        let event = {}
        if (typeof rest === 'string') {
          event[input] = rest 
        } else {
          event = {...event, ...rest}
        }
        return guess({
          database,
          history,
          event
        })
      }
    } else {
      return guess({
        database,
        history,
        event: input
      })
    }
  }
}

module.exports = { historify, chatbotify }