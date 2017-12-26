# Chatbotify

*Convert a dialogue document into an interactive chatbot*

This project is a weekend project to test an idea: how easy would it be
to convert chat history of a living or dead person into a chatbot?
Would it be fun to discuss with it?

## Usage

    $ npm i chatbotify

Then code your application using node, or use the command line interface

## Example

### Command line

    $ chatbotify examples/romeo-juliet.txt Romeo
    Romeo: oh
    Juliet: my dear?

### Code

```javascript
const { historify, chatbotify } = require('chatbotify')
const dialogue = `john: what's up?\njane: wasup'\njohn: so?\njane: what?\njohn: so?\njane: lol`
const bot = chatbotify(historify(dialogue))
const john = bot('john')
console.log(john("so?")) // { "jane": "what?" }
console.log(john("so?")) // { "jane": "lol" }
```

## Known bugs

- if we type "oh" as romeo, the response is from romeo too..

## Wishlist

- oh! that would be nice to reproduce the voice of the living / deceased with this: https://github.com/andabi/deep-voice-conversion
- we should be able to split the conversation into small parts
- maybe the bot should speak alone after some silence?
- use the history of the conversation for better matching the "mood"
  and better sentence allocation

  
