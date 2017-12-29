const { sentenceSimilarity, similarityScore } = require('sentence-similarity')

const isDefined = input => typeof input !== 'undefined',
      isString  = input => typeof input === 'string',
      isNumber  = input => typeof input === 'number',
      getKeys   = input => typeof input !== 'object' ? [] : Object.keys(input).filter(_ => !_.startsWith('_')).sort(),
      getWords  = input => isDefined(input) ? input.toString().split(' ') : []
      
const mean = (numbers, total = 0) => {
  for (let i = 0; i < numbers.length; i += 1) { total += numbers[i] }
  return numbers.length < 1 ? total : total / numbers.length
}

const meanDifference = (a, b) => mean(sentenceSimilarity(
  getWords(a), getWords(b), { f: similarityScore.winklerMetaphone, options: { threshold: 0 } }
).matchScore)

const findMostSimilar = (arr, measure) =>
  arr.map(item => ({ item, d: measure(item) })).sort((a, b) => b.d - a.d).map(({ item }) => item)

const guess = ({ blockchain, history, block }) => {
  const blockKeys = getKeys(block)
  const match = findMostSimilar(blockchain, candi => blockKeys.reduce((acc, k) => (
    acc * (candi[k] ? meanDifference(block[k], candi[k]) : 0) // good match == mean > 0.8
  ), 1))[0]
  if (!(match && match._id < blockchain.length)) { return {} }
  match._usage++
  const result = blockchain.slice(match._id + 1).find(b => blockKeys.some(k => !isDefined(b[k])))
  return getKeys(result).reduce((acc, key) => ({ ...acc, [key]: result[key] }), {})
}

exports.chatbotify = (blockchain, history = []) => (
  blockchain = blockchain.map((block, index) => ({_id: index, _usage: 0, ...block})),
  input => isString(input)
    ? (rest, block={}) => guess({ blockchain, history, block: isString(rest) ? {[input]:rest} : {...block,...rest} })
    : guess({ blockchain, history, block: input }))

exports.historify = (text, current='') => text.split('\n').map(line => (
  [ignored, key, value] = line.match(/^([a-z]+)\s*:\s+(.*)$/i) || [null, current, line],
  {[current = key]: value} ))