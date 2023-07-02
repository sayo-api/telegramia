require("./config");
const {IgApiClient} = require("instagram-private-api");
const {withRealtime} = require("instagram_mqtt");
const fs = require("fs");
const pkg = require("request-promise");
const schedule = require('node-schedule');
const axios = require('axios');
const cheerio = require("cheerio");
const express = require('express');
const BodyForm = require('form-data')
const util = require('util')
const yt = require("ytdl-core")
const yts = require("yt-search")

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const { get } = pkg;

const ig = withRealtime(new IgApiClient())
ig.state.generateDevice(nome_sessao);


function saveState(data) {
    fs.writeFileSync(__dirname + "/state.json",JSON.stringify(data))
    return data;
  }
  
  function stateExists() {
    if(fs.existsSync(__dirname+"/state.json")) return true
    return false;
  }
  
  function loadState() {
    let data = fs.readFileSync(__dirname+"/state.json",{encoding:"utf-8"})
    return data;
  }
  
const getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`
}

async function ytSearch(query) {
    return new Promise((resolve, reject) => {
        try {
            const cari = yts(query)
            .then((data) => {
                res = data.all
                return res
            })
            resolve(cari)
        } catch (error) {
            reject(error)
        }
        console.log(error)
    })
}

function abreviar(num) {
     if (num >= 1000000000000000000000000000000000) {
        return (num / 1000000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + ' d';
     }
     if (num >= 1000000000000000000000000000000) {
        return (num / 1000000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + ' n';
     }
     if (num >= 1000000000000000000000000000) {
        return (num / 1000000000000000000000000000).toFixed(1).replace(/\.0$/, '') + ' o';
     }     
     if (num >= 1000000000000000000000000) {
        return (num / 1000000000000000000000000).toFixed(1).replace(/\.0$/, '') + ' sep';
     }     
     
     if (num >= 1000000000000000000000) {
        return (num / 1000000000000000000000).toFixed(1).replace(/\.0$/, '') + ' sex';
     }
     if (num >= 1000000000000000000) {
        return (num / 1000000000000000000).toFixed(1).replace(/\.0$/, '') + ' qui';
     }
     if (num >= 1000000000000000) {
        return (num / 1000000000000000).toFixed(1).replace(/\.0$/, '') + ' qua';
     }     
     if (num >= 1000000000000) {
        return (num / 1000000000000).toFixed(1).replace(/\.0$/, '') + ' tri';
     }          
                
     if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + ' bi';
     }
     if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + ' mi';
     }
     if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + ' mil';
     }
     return num;
}
  
function TelegraPh (Path) {
	return new Promise (async (resolve, reject) => {
		if (!fs.existsSync(Path)) return reject(new Error("File not Found"))
		try {
			const form = new BodyForm();
			form.append("file", fs.createReadStream(Path))
			const data = await  axios({
				url: "https://telegra.ph/upload",
				method: "POST",
				headers: {
					...form.getHeaders()
				},
				data: form
			})
			return resolve("https://telegra.ph" + data.data[0].src)
		} catch (err) {
			return reject(new Error(String(err)))
		}
	})
}  

const getBuffer = async (url, options) => {
        try {
                options ? options : {}
                const res = await axios({
                        method: "get",
                        url,
                        headers: {
                                'DNT': 1,
                                'Upgrade-Insecure-Request': 1
                        },
                        ...options,
                        responseType: 'arraybuffer'
                })
                return res.data
        } catch (e) {
                console.log(`Error : ${e}`)
        }
}
  
function pensador(nome) {
return new Promise((resolve, reject) => {
  axios.get(`https://www.pensador.com/busca.php?q=${nome}`).then( tod => {
  const $ = cheerio.load(tod.data)  
  var postagem = [];
$("div.thought-card.mb-20").each((_, say) => {
    var frase = $(say).find("p").text().trim(); 
    var compartilhamentos = $(say).find("div.total-shares").text().trim(); 
    var autor = $(say).find("a").text().split("\n")[0];
    var imagem = $(say).find("div.sg-social-hidden.sg-social").attr('data-media');
    var resultado = {
      autor: autor,
      compartilhamentos: compartilhamentos,      
      imagem: imagem,
      frase: frase
    }
    postagem.push(resultado)
  })
//  console.log(tod.data)
  resolve(postagem)
  }).catch(reject)
  });
}

async function ytPlayMp4(query) {
    return new Promise((resolve, reject) => {
        try {
            const search = yts(query)
            .then((data) => {
                const url = []
                const pormat = data.all
                for (let i = 0; i < pormat.length; i++) {
                    if (pormat[i].type == 'video') {
                        let dapet = pormat[i]
                        url.push(dapet.url)
                    }
                }
                const id = yt.getVideoID(url[0])
                const yutub = yt.getInfo(`https://www.youtube.com/watch?v=${id}`)
                .then((data) => {
                    let pormat = data.formats
                    let video = []
                    for (let i = 0; i < pormat.length; i++) {
                    if (pormat[i].container == 'mp4' && pormat[i].hasVideo == true && pormat[i].hasAudio == true) {
                        let vid = pormat[i]
                        video.push(vid.url)
                    }
                   }
                    const title = data.player_response.microformat.playerMicroformatRenderer.title.simpleText
                    const thumb = data.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url
                    const channel = data.player_response.microformat.playerMicroformatRenderer.ownerChannelName
                    const views = data.player_response.microformat.playerMicroformatRenderer.viewCount
                    const published = data.player_response.microformat.playerMicroformatRenderer.publishDate
                    const result = {
                    título: title,
                    thumb: thumb,
                    canal: channel,
                    publicado: published,
                    visualizações: views,
                    segundos: data.player_response.microformat.playerMicroformatRenderer.lengthSeconds,
                    url: video[0]
                    }
                    return(result)
                })
                return(yutub)
            })
            resolve(search)
        } catch (error) {
            reject(error)
        }
        console.log(error)
    })
}

async function getMedia(url){
    let img = await axios.get(url,{responseType:"arraybuffer"})
    return img.data
}
  
(async () => {

//iniciar sessão e salvar sessão {
if (stateExists()) {
await ig.state.deserialize(loadState());
}
let loggedInUser
try{
loggedInUser = await ig.account.currentUser()
console.log("conectado")
}catch(err){
console.log(err)
loggedInUser = await ig.account.login(bot,senha)
const serialized = await ig.state.serialize();
delete serialized.constants; 
saveState(serialized);
}

//id do bot
const meID = loggedInUser.pk
//box
const threads = await ig.feed.directInbox().request()



// ACEITAR AUTOMATICAMENTE MENSAGENS
ig.realtime.on("receive",async(t,message) => {
let msg = message[0]
// console.log(msg)
if(msg.topic.id == "135" && msg.topic.path == "/ig_sub_iris_response"){
let p_threads = (await ig.feed.directPending().request()).inbox.threads
for(let i = 0;i<p_threads.length;i++){
let id = p_threads[i].thread_id
console.log(id)
try{
await ig.directThread.approve(id)
await ig.entity.directThread(id).broadcastText(aceitar_msg)
}catch(err){
console.log(err)
}
}
}
})


const postarfoto = async (img, legenda) => {       
const imageBuffer = await get({
url: img,
encoding: null, 
})
await ig.publish.photo({
file: imageBuffer,
caption: legenda,
})
};

const postarvideo = async (link, link2, legenda) => {       
const videoBuffer = await get({
url: link,
encoding: null, 
})
const videoBufferThumb = await get({
url: link2,
encoding: null, 
})
await ig.publish.video({
video: videoBuffer,
coverImage: videoBufferThumb,
caption: legenda,
})
};

//postar a cada 1 hora
schedule.scheduleJob("0 0 */1 * * *", async () => { 
try {
const ArrayTema = ["motivação status 30 segundos","edit anime 30 segundos","edit amv ","reflexões status 30 segundos","status musica","status lirick","status funk","30 segundos edit","edit 30 segundos"]
let tema = ArrayTema[Math.floor(Math.random() * ArrayTema.length)]
ytPlayMp4(tema).then(async result => {
console.log(result.segundos)
if (result.segundos <= 60) {
postarvideo(result.url, "https://telegra.ph/file/2dd43a5f5765bb273c441.jpg", `postagem diaria de videos, quer ter um engajamento ou automatizar seu Instagram? olhe minha bio e ja segue!!\n\n #fy #fyp #motivação #mentemilionaria #sigma #edit #anime #motivação #status\n\ncreditos: ${result.canal}`)
}else{
console.log("video grande")
}
})
} catch {
console.log("erro") 
}
console.log("video publicado")
})


//detectar mensagens!
ig.realtime.on("message",async (message)=> { 
try {
if(message.message.user_id == meID) return
if(!message.message.item_type == "text") return
const sender = message.message.user_id
//const infouser = await ig.user.info(sender)
//const pushname = infouser.username
const budy = message.message.text
const args = budy.split(/ +/).slice(1)
const q = args.join(' ')
const isCmd = budy.startsWith(prefix)
const command = isCmd ? budy.slice(prefix.length).trim().split(' ').shift().toLowerCase(): ''

const telegraup = async (link) => {       
ran = getRandom('.jpg')
buff = await getBuffer(link)
fs.writeFileSync(ran, buff)
anu = await TelegraPh(ran)
return util.format(anu)
}



const reply = (teks) => {
ig.realtime.direct.sendText({text:teks,threadId:message.message.thread_id,reply:{item_id:message.message.item_id,client_context:message.message.client_context}})                                        
};

const replyimg = async (link) => {
ig.entity.directThread(message.message.thread_id).broadcastPhoto({file: await getMedia(link)})
};


const sendVideo = async (clip) => {
let video = clip.video_versions[0]
await ig.realtime.direct.sendText({text:"baixando...",threadId:message.message.thread_id,reply:{item_id:message.message.item_id,client_context:message.message.client_context}})
let vid = await getMedia(video.url)
return await ig.entity.directThread(message.message.thread_id).broadcastVideo({video:vid})
}
const sendImage = async (image) => {
await ig.realtime.direct.sendText({text:"baixando...",threadId:message.message.thread_id,reply:{item_id:message.message.item_id,client_context:message.message.client_context}})
let img = await getMedia(image.image_versions2.candidates[0].url)
return await ig.entity.directThread(message.message.thread_id).broadcastPhoto({file:img})
}

//sessão comandos
switch (command) {

case "menu": {
reply("Opaa, bem vindo, sou uma ia que faz postagem automaticamente, quer me adquirir?, compre aqui, ai te ensinarei passo a passo de como instalar")
}
break
case "publicar": {

}
break
}
} catch (e) {
const isError = String(e)
console.log(isError)
}
})

//iniciando o realtime {
ig.realtime.on('error', console.error);
ig.realtime.on('close', () => console.error('RealtimeClient parou :('));
await ig.realtime.connect({irisData: threads})
})()

//site
app.get('/', async (req, res) => {
  res.sendFile('index.html', { root: __dirname })
});



const porta = process.env.PORT || 5000;
//iniciando...
app.listen(porta, () => console.log("site Online na porta:", porta));
