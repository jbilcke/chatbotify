const { historify, chatbotify } = require('./index')

const dialogue = `john: what's up?\njane: wasup'\njohn: so?\njane: what?\njohn: so?\njane: lol`

test('historify', () => {
  expect(historify(dialogue)).toEqual([
   {john: "what's up?"},
   {jane: "wasup'"},
   {john: "so?"},
   {jane: "what?"},
   {john: "so?"},
   {jane: "lol"}
  ])
})

test('chatbotify: using plain events', () => {

  const bot = chatbotify(historify(dialogue))

  expect(bot({ john: "so?" })).toEqual({ jane: "what?" })
  expect(bot({ john: "whats up" })).toEqual({ jane: "wasup'"})
  expect(bot({ john: "so?" })).toEqual({ jane: "lol"})
  expect(bot({ john: "so?" })).toEqual({ jane: "what?"})
})


test('chatbotify: using a partial function', () => {

  const bot = chatbotify(historify(dialogue))

  const john = bot('john') // to automatically send { "john": "*" } events

  expect(john("so?").jane).toBe("what?")
  expect(john("whats up").jane).toBe("wasup'")
  expect(john("so?").jane).toBe("lol")
  expect(john("so?").jane).toBe("what?")
})

