import { createConnection } from 'mongoose'
const Telegraf = require('telegraf')

export async function getBotUsers(
  name: string,
  mongo: string,
  telegramToken: string,
  idFieldName = 'id',
  chatCollectionName = 'chats'
) {
  console.log(`+ getting number of users for ${name}`)
  const connection = await createConnection(mongo, {
    useNewUrlParser: true,
  })
  const Chat = connection.collection(chatCollectionName)
  const chatCount = await Chat.find().count()
  console.log(`+ got ${chatCount} chats for ${name}, getting objects`)
  const projection = { _id: 0 }
  projection[idFieldName] = 1
  const chats = await Chat.find({}, { projection }).toArray()
  console.log(`+ got the objects for ${name}, calculating...`)
  const bot = new Telegraf(telegramToken, {
    channelMode: true,
  })
  let successes = 0
  for (let i = 0; i < chats.length; i += 100) {
    console.log(`+ ${name}`, `${i}/${chats.length} (${successes})`)
    const chatsToSend = chats.slice(i, i + 100)
    const promises = []
    for (const chat of chatsToSend) {
      promises.push(
        new Promise(async (res) => {
          try {
            const id = parseInt(chat[idFieldName], 10)
            // Don't even check private chats
            if (id > 0) {
              res(1)
              return
            }
            const count = await bot.telegram.getChatMembersCount(id)
            res(count)
          } catch (err) {
            res(0)
          }
        })
      )
    }
    successes += (await Promise.all(promises)).reduce((p, c) => p + c, 0)
    await delay(1)
  }
  await connection.close()
  console.log(`+ got ${successes} users for ${name}`)
  return successes
}

function delay(seconds) {
  return new Promise<void>((res) => {
    setTimeout(() => {
      res()
    }, seconds * 1000)
  })
}
