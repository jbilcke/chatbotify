# Chatbotify

*Convert a dialogue document into an interactive chatbot*

This project is a weekend project to test an idea: how easy would it be
to convert chat history of a living or dead person into a chatbot?
Would it be fun to discuss with it?

## Usage

    $ npm i chatbotify

Then code your application using node, or use the command line interface

## Example

### Basic command line

    $ chatbotify examples/romeo-juliet.txt Romeo
    Romeo: oh
    Juliet: my dear?

### Basic command line with speech synthesis

    $ chatbotify examples/romeo-juliet.txt Juliet --speak
    Juliet: hey dear

For Linux you will need to install the "Festival" package, something like that:

    $ sudo apt-get install festival festvox-kallpc16k

### Code

```javascript
const { historify, chatbotify } = require('chatbotify')
const dialogue = `john: what's up?\njane: wasup'\njohn: so?\njane: what?\njohn: so?\njane: lol`
const bot = chatbotify(historify(dialogue))
const john = bot('john')
console.log(john("so?")) // { "jane": "what?" }
console.log(john("so?")) // { "jane": "lol" }
```

## Wishlist

- compute similarity word per word, to better resist to for missing words
- oh! that would be nice to reproduce the voice of the living / deceased with this: https://github.com/andabi/deep-voice-conversion
- we should be able to split the conversation into small parts
- maybe the bot should speak alone after some silence?
- use the history of the conversation for better matching the "mood"
  and better sentence allocation

  
