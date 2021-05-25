import { getBotUsers } from './getBotUsers'
import { getShieldy } from './shieldy'

export let stats: any = {}

async function updateStats() {
  console.info('Started updating')
  const start = new Date()

  try {
    stats.shieldy = await getShieldy()
    const shieldyUsers = await getBotUsers(
      '@shieldy_bot',
      process.env.SHIELDY,
      process.env.SHIELDY_TOKEN
    )
    stats.shieldy.userCount = shieldyUsers
  } catch (err) {
    console.log(err)
  }

  const end = new Date()
  console.info(
    `Finished updating in ${(end.getTime() - start.getTime()) / 1000}s`
  )
}

let updating = false
updateStats()
setInterval(async () => {
  if (updating) {
    return
  }
  try {
    updating = true
    await updateStats()
  } catch (err) {
    console.error(err)
  } finally {
    updating = false
  }
}, 10 * 60 * 1000)
