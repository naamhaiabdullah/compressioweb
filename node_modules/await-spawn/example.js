const spawn = require('.')

const main = async () => {
  try {
    const bl = await spawn('ls', ['-al'])
    console.log(bl.toString())
  } catch (e) {
    console.log(e.stderr.toString())
  }
}

main()
