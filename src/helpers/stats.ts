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
      process.env.TOKEN
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
async function _updateStats() {
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
}

_updateStats()
setInterval(async () => {
  _updateStats()
}, 24 * 60 * 60 * 1000)
