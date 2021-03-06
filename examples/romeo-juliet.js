nst fs = require('fs')
const readline = require('readline')
const { historify, chatbotify } = require('../index')

const file = "./romeo-juliet.txt"
const eventKey = "Romeo"

const bot = chatbotify(historify(fs.readFileSync(file, "utf-8")))(eventKey)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const chat = () =>
  rl.question(`${eventKey}: `, text => {
    const reply = bot(text)
    const response = Object.entries(reply).map(_ => _.join(': ')).join(', ')
    console.log(response)
    if (text == 'stop') { return rl.close() }
    chat()
  })
chat()
