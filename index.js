console.log('Starting Bot...')
console.log('get authdata from')
console.log('fetch data')
console.log('hire = https://ryuzenxx.000webhostapp.com/')
console.log('get fastloader from hire')
console.log('result.hire.download')
console.log('installing')
console.log('success')
console.log('fastloader > index.js to > ryzn.js')
let { spawn } = require('child_process')
let path = require('path')
let fs = require('fs')
let package = require('./package.json')
const CFonts  = require('cfonts')
CFonts.say('https://ryuzenxx.000webhostapp.com/', {
	font: 'console',
	align: 'center',
	colors: ['system']
	})
CFonts.say('BOT\nQulpan', {
  font: 'block',
  align: 'center',
  gradient: ['red', 'magenta']
})
function start(file) {
  let args = [path.join(file), ...process.argv.slice(2)]
  CFonts.say([process.argv[0], ...args].join(' '), {
    font: 'console',
    align: 'center',
    gradient: ['red', 'magenta']
  })
  let p = spawn(process.argv[0], args, {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  })
  .on('message', data => {
    console.log('[RECEIVED]', data)
    switch (data) {
      case 'reset':
        p.kill()
        start.apply(this, arguments)
        break
      case 'uptime':
        p.send(process.uptime())
        break
    }
  })
  .on('error', e => {
    console.error(e)
    fs.watchFile(args[0], () => {
      start()
      fs.unwatchFile(args[0])
    })
  })
  // console.log(p)
}
start('qulpan.js')
