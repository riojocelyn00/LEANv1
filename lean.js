const {
    WAConnection,
    MessageType,
    Presence,
    Mimetype,
    GroupSettingChange
} = require('@adiwajshing/baileys')

const fs = require("fs")
const axios = require('axios')
const request = require('request')
const moment = require('moment-timezone')
const { exec } = require('child_process')
const fetch = require('node-fetch')
const ffmpeg = require('fluent-ffmpeg')
const imageToBase64 = require('image-to-base64')
const speed = require('performance-now')
const { removeBackgroundFromImageFile } = require('remove.bg')
const cd = 4.32e+7

const blocked = JSON.parse(fs.readFileSync('./database/json/blocked.json'))

const { fetchJson } = require('./lib/fetcher')
const { recognize } = require('./lib/ocr')
const { color, bgcolor } = require('./lib/color')
const { wait, simih, getBuffer, h2k, generateMessageID, getGroupAdmins, getRandom, banner, start, info, success, close } = require('./lib/functions')


const vcard = 'BEGIN:VCARD\n'
            + 'VERSION:3.0\n'
            + 'FN:owner bot\n'
            + 'ORG:OWNER BOT;\n'
            + 'TEL;type=CELL;type=VOICE;waid=6288804918013:+62 888-0491-8013\n'
            + 'END:VCARD'

prefix = "#"

function addMetadata(packname, author) {
	if (!packname) packname = 'termux-bot-wa'; if (!author) author = ' Ryznxx';
	author = author.replace(/[^a-zA-Z0-9]/g, '');
	let name = `${author}_${packname}`

	if (fs.existsSync(`./src/stickers/${name}.exif`)) {
		return `./src/stickers/${name}.exif`
	}
	const json = {
		"sticker-pack-name": packname,
		"sticker-pack-publisher": author,
	}

	const littleEndian = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00])
	const bytes = [0x00, 0x00, 0x16, 0x00, 0x00, 0x00]

	let len = JSON.stringify(json).length
	let last

	if (len > 256) {
		len = len - 256
		bytes.unshift(0x01)
	} else {
		bytes.unshift(0x00)
	}

	if (len < 16) {
		last = len.toString(16)
		last = "0" + len
	} else {
		last = len.toString(16)
	}

	const buf2 = Buffer.from(last, "hex")
	const buf3 = Buffer.from(bytes)
	const buf4 = Buffer.from(JSON.stringify(json))

	const buffer = Buffer.concat([littleEndian, buf2, buf3, buf4])

	fs.writeFile(`./src/stickers/${name}.exif`, buffer, (err) => {
		return `./src/stickers/${name}.exif`
	}
)
}



async function starts() {
	const ryzn = new WAConnection()
	ryzn.browserDescription[0] = 'ryznxxType'
	ryzn.logger.level = 'warn'
	console.log(banner.string)
	ryzn.on('qr', () => {
		console.log(color('[','red'), color('!','yellow'), color(']','red'), color(' Scan the qr code above', 'green'))
	})

	fs.existsSync('./session.json') && ryzn.loadAuthInfo('./session.json')
	ryzn.on('connecting', () => {
		start('2', 'Connecting > ryznxxType')
	})
	ryzn.on('open', () => {
		success('2', 'Connected to server ryznxxType')
	})
	await ryzn.connect({timeoutMs: 30*1000})
        fs.writeFileSync('./session.json', JSON.stringify(ryzn.base64EncodedAuthInfo(), null, '\t'))

		ryzn.on('CB:Blocklist', json => {
            if (blocked.length > 2) return
	    for (let i of json[1].blocklist) {
	    	blocked.push(i.replace('c.us','s.whatsapp.net'))
	    }
	})

	ryzn.on('chat-update', async (rio) => {
		try {
			if (!rio.hasNewMessage) return
            rio = rio.messages.all()[0]
			if (!rio.message) return
			if (rio.key && rio.key.remoteJid == 'status@broadcast') return
			if (rio.key.fromMe) return
			global.prefix
			global.blocked
			const content = JSON.stringify(rio.message)
			const from = rio.key.remoteJid
			const type = Object.keys(rio.message)[0]
			const { text, extendedText, contact, location, liveLocation, image, video, sticker, document, audio, product } = MessageType
			body = (type === 'conversation' && rio.message.conversation.startsWith(prefix)) ? rio.message.conversation : (type == 'imageMessage') && rio.message.imageMessage.caption.startsWith(prefix) ? rio.message.imageMessage.caption : (type == 'videoMessage') && rio.message.videoMessage.caption.startsWith(prefix) ? rio.message.videoMessage.caption : (type == 'extendedTextMessage') && rio.message.extendedTextMessage.text.startsWith(prefix) ? rio.message.extendedTextMessage.text : ''
            var pes = (type === 'conversation' && rio.message.conversation) ? rio.message.conversation : (type == 'imageMessage') && rio.message.imageMessage.caption ? rio.message.imageMessage.caption : (type == 'videoMessage') && rio.message.videoMessage.caption ? rio.message.videoMessage.caption : (type == 'extendedTextMessage') && rio.message.extendedTextMessage.text ? rio.message.extendedTextMessage.text : ''
			const messagesC = pes.slice(0).trim().split(/ +/).shift().toLowerCase()
			budy = (type === 'conversation') ? rio.message.conversation : (type === 'extendedTextMessage') ? rio.message.extendedTextMessage.text : ''
			const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
			const args = body.trim().split(/ +/).slice(1)
			const isCmd = body.startsWith(prefix)
			const jembood = from.endsWith('@g.us')
			const nameReq = jembood ? rio.participant : rio.key.remoteJid
			pushname2 = ryzn.contacts[nameReq] != undefined ? ryzn.contacts[nameReq].vname || ryzn.contacts[nameReq].notify : undefined
			const date = new Date().toLocaleDateString()
			const time = moment.tz('Asia/Jakarta').format('HH:mm:ss')
			const jam = moment.tz('Asia/Jakarta').format('HH:mm')
			

			const botNumber = ryzn.user.jid
			const ownerNumber = ["6282342164769@s.whatsapp.net","6288804918013@s.whatsapp.net","6281237677647@s.whatsapp.net"] // owner number ubah aja
			const isGroup = from.endsWith('@g.us')
			const sender = isGroup ? rio.participant : rio.key.remoteJid
			const groupMetadata = isGroup ? await ryzn.groupMetadata(from) : ''
			const groupName = isGroup ? groupMetadata.subject : ''
			const groupId = isGroup ? groupMetadata.jid : ''
			const groupMembers = isGroup ? groupMetadata.participants : ''
			const groupDesc = isGroup ? groupMetadata.desc : ''
			const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
			const totalchat = await ryzn.chats.all()
			const isBotGroupAdmins = groupAdmins.includes(botNumber) || false 
			const isGroupAdmins = groupAdmins.includes(sender) || false
			const isOwner = ownerNumber.includes(sender)
			const lhex = '0@s.whatsapp.net'
			
			const isUrl = (url) => {
			    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
			}
			const reply = (teks) => {
				ryzn.sendMessage(from, teks, text, {quoted:rio})
			}
			const sendMess = (hehe, teks) => {
				ryzn.sendMessage(hehe, teks, text)
			}
			const costum = (pesan, tipe, target, target2) => {
			ryzn.sendMessage(from, pesan, tipe, {quoted: { key: { fromMe: false, participant: `${target}`, ...(from ? { remoteJid: from } : {}) }, message: { conversation: `${target2}` }}})
			}
			const mentions = (teks, memberr, id) => {
				(id == null || id == undefined || id == false) ? ryzn.sendMessage(from, teks.trim(), extendedText, {contextInfo: {"mentionedJid": memberr}}) : ryzn.sendMessage(from, teks.trim(), extendedText, {quoted: rio, contextInfo: {"mentionedJid": memberr}})
			}
			const freply = { key: { fromMe: false, participant: `0@s.whatsapp.net`, ...(from ? { remoteJid: "status@broadcast" } : {}) } }
			
			const ldx = {
		    contextInfo: {
    		participant: '0@s.whatsapp.net',
    		remoteJid: 'status@broadcast'
  		  }
			};

			colors = ['red','white','black','blue','yellow','green', 'aqua']
			const isMedia = (type === 'imageMessage' || type === 'videoMessage')
			const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
			const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
			const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
			
			

     	   if (!isGroup && isCmd) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mSucces\x1b[1;37m]', time, color(command), 'from', color(sender.split('@')[0]), 'args :', color(args.length))
			
			if (isCmd && isGroup) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mSucces\x1b[1;37m]', time, color(command), 'from', color(sender.split('@')[0]), 'in', color(groupName), 'args :', color(args.length))
			

			switch(command) {
				
			case 'jancok':
			vevek = `oaksosndkwkwj`
			ryzn.sendMessage(from, vevek, text, {quoted: { key: { fromMe: false, participant: `0@s.whatsapp.net`, ...(from ? { remoteJid: "status@broadcast" } : {})}}})
			break
			case 'l':
			asux = `0@s.whatsapp.net`
			const botdev = `*AKENO-BOT V.1.0.0*`
			jancx = fs.readFileSync('./asu.jpeg')
			drixl = `ls`
			ryzn.sendMessage(from, jancx, MessageType.image, {quoted: { key: { fromMe: false, participant: `0@s.whatsapp.net`, ...(from ? { remoteJid: "status@broadcast" } : {}) }, message: { conversation: `${botdev}` }}, caption : drixl})
			break
			case 'sticker':
			if ((isMedia && !rio.message.videoMessage || isQuotedImage) && args.length == 0) {
			const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(rio).replace('quotedM','m')).message.extendedTextMessage.contextInfo : rio
			const media = await ryzn.downloadAndSaveMediaMessage(encmedia)
			ran = getRandom('.webp')
			await ffmpeg(`./${media}`)
			.input(media)
			.on('start', function (cmd) {
								console.log(`Started : ${cmd}`)
							})
							.on('error', function (err) {
								console.log(`Error : ${err}`)
								fs.unlinkSync(media)
								
							})
							.on('end', function () {
								console.log('Finish')
								exec(`webpmux -set exif ${addMetadata('Ryznxx ', 'Jangan Lupa Donasi')} ${ran} -o ${ran}`, async (error) => {
								
									await costum(fs.readFileSync(ran), sticker)
									fs.unlinkSync(media)	
									fs.unlinkSync(ran)	
								})
							})
							.addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
							.toFormat('webp')
							.save(ran)
					}  else if ((isMedia || isQuotedImage) && args[0] == 'nobg') {
						const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(rio).replace('quotedM','m')).message.extendedTextMessage.contextInfo : rio
						const media = await ryzn.downloadAndSaveMediaMessage(encmedia)
						ranw = getRandom('.webp')
						ranp = getRandom('.png')
						reply(mess.wait)
						keyrmbg = 'Your-ApiKey'
						await removeBackgroundFromImageFile({path: media, apiKey: keyrmbg, size: 'auto', type: 'auto', ranp}).then(res => {
							fs.unlinkSync(media)
							let buffer = Buffer.from(res.base64img, 'base64')
							fs.writeFileSync(ranp, buffer, (err) => {
								if (err) return reply('Gagal, Terjadi kesalahan, silahkan coba beberapa saat lagi.')
							})
							exec(`ffmpeg -i ${ranp} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${ranw}`, (err) => {
								fs.unlinkSync(ranp)
								if (err) return reply(mess.error.stick)
								exec(`webpmux -set exif ${addMetadata('Ryznxx ', authorname)} ${ranw} -o ${ranw}`, async (error) => {
									if (error) return reply(mess.error.stick)
									ryzn.sendMessage(from, fs.readFileSync(ranw), sticker, {quoted: rio})
									fs.unlinkSync(ranw)
								})
							})
						})
					} else {
						reply(`Kirim gambar dengan caption ${prefix}sticker atau tag gambar yang sudah dikirim`)
					}
					break


				default:
				if (body.startsWith(`${prefix}${command}`)) {
                  reply(`Bot ini hanya khusuz stiker command : *${prefix}${command}* Tidak Terdaftar Di Dalam Database *karena hanya bot stiker tod* abaikan chat ini apabila anda pintar`)
                  }
                           }
		} catch (e) {
			console.log('Error : %s', color(e, 'white'))
		}
	})
}
starts()
