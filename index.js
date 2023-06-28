require("./config");
const {IgApiClient} = require("instagram-private-api");
const {withRealtime} = require("instagram_mqtt");
const fs = require("fs");
const pkg = require("request-promise");
const schedule = require('node-schedule');
const axios = require('axios');
const cheerio = require("cheerio");
const express = require('express');
const { createReadStream } = require("fs");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const { oggToMp3, streamToText } = require("./lib/convertVoice");
const { antiSpam } = require('./lib/antispam')
const { removeStreams } = require("./lib/helpers");


const { viverdb } = require('./banco/1');
const { usuario, bot_inf, grupos } = require('./banco/2');
const { gerarUsuario, addBotinfo, veriNumero, verificaNome, verificaAll, semlimit, equilibrio, darlimit, niveladd, addcash, delcash, checkPremium, deletar_premium, adicionar_premium, tempo_expirado, expadd, veriCpf, addcashpix, delcashpix, verificaAllcpf } = require('./banco/3');

const { randomNumber } = require('./lib/necessita');

//iniciando banco de dados
viverdb() 

const iak = false

const { get } = pkg;

const configuration = new Configuration({
	apiKey: "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",
});
const openai = new OpenAIApi(configuration);

const ig = withRealtime(new IgApiClient())
ig.state.generateDevice("kasumi");


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

async function getMedia(url){
    let img = await axios.get(url,{responseType:"arraybuffer"})
    return img.data
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
  
(async () => {


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
let meID = loggedInUser.pk
let threads = await ig.feed.directInbox().request()




//postar
//schedule.scheduleJob("0 0 */1 * * *", async () => { 
/*const ArrayTema = ["motivação","rimas","mentalidade","reflexões","poesia","músicas","lírico","dinheiro","inspiração"]
let tema = ArrayTema[Math.floor(Math.random() * ArrayTema.length)]
//imagem
pensador(tema).then(async resultado => { 
let somenteum = resultado[Math.floor(Math.random() * resultado.length)]
//publicando...
postarfoto(somenteum.imagem, somenteum.frase + "\n\n#frases #motivação #diadia #fy #enriquece\n\nolhe a minha bio e te ensinarei a crescer 🤝")
})
console.log("imagem publicada")
})*/


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
                    await ig.entity.directThread(id).broadcastText("opa tudo bem?, mande qualquer pergunta em áudio e eu irei le responder 😁")
                }catch(err){
                    console.log(err)
                }
            }
        }
    })
    
  
 

    

ig.realtime.on("message",async (message)=> { 
if(message?.message?.user_id == meID) return
if(message.message.user_id == meID) return
const budy = message.message.text
const sender = message.message.user_id
const rg = await verificaAll(sender)
const rgcheck = await veriNumero(sender)
const isOwner = rg.admin == "sim"


if (budy && antiSpam.isFiltered(sender)) {
return reply('「 SPAM 」Espere 5 segundos para usar a IA')
}        


if (budy && !isOwner) antiSpam.addFilter(sender)

console.log(message.message.item_type)
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

const reply = (teks) => {
ig.realtime.direct.sendText({text:teks,threadId:message.message.thread_id,reply:{item_id:message.message.item_id,client_context:message.message.client_context}})                                        
};

const replyimg = async (link) => {
ig.entity.directThread(message.message.thread_id).broadcastPhoto({file: await getBuffer(link)})
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


if (budy && !budy.includes('rg') && !rgcheck){ 
reply(`opa amigão parece que você não esta registrado, mande a segunite mensagem: rg, e efetue seu registro para continuar 😉`)
return
}

if (budy == "rg") {
if (rgcheck) return reply("você  ja esta registrado, mande algum audio para eu le responder...")
let dt = await ig.user.info(sender)
let cpfgerado = await randomNumber(10)
gerarUsuario(dt.username, sender,cpfgerado)
reply(`${dt.username} seu registro foi postado! 😇`)
postarfoto(dt.hd_profile_pic_url_info.url, `@${dt.username} agora e um de nós, seja bem vindo!! 🥳`)
}
/*
if (budy == "seguir") {
const followersFeed = await ig.feed.accountFollowers(id);
  const followers = [];
  
  const e = async () => {
    let items = await followersFeed.items();
    for(let i = 0;i<1;i++){
    console.log(items[i].id_pk)
    ig.friendship.create(items[i].id_pk);
    const isMore = await followersFeed.isMoreAvailable();
      if (isMore) {
        await delay(9 * 1000)  // delay 20 sec anti ban mode
        e();
      } else {
        console.log("=====> All Followers Extracted");
      }
  };
//  await e()    
setTimeout(() => await e(), 20 * 1000)
    
}

*/



if (message.message.item_type == "voice_media") {
await reply("buscando respostas 🥳...");
const response = await openai.createCompletion({
model: "text-davinci-003",
prompt: text,
temperature: 0.7,
max_tokens: 500,
stop: ["Ai:", "Human:"],
top_p: 1,
frequency_penalty: 0.2,
presence_penalty: 0,
})
reply(response.data.choices[0].text.trim())
removeStreams(mp3Path);
//}
}else{
reply("ia off-line no momento, volte mais tarde!, você ainda pode baixar story, e publicações,  so enviar elas para mim compartilhando-as, somente publicação de contas públicas!")
}
if (message.message) {
console.log(message.message)
}

        if(message.message.item_type == "placeholder"){
          //  let clip = message.message.placeholder.placeholder
            return await reply("function download video incomparable")
        }else{
            if(message.message.item_type == "media_share"){
                if(message.message.media_share.media_type == 1){
                   let image = message.message.media_share
                   return await sendImage(image)
                }else if(message.message.media_share.media_type == 8){
                    let items = message.message.media_share.carousel_media
                    let selectedItem = items.find(i => i.id == message.message.media_share.carousel_share_child_media_id)
                    if(selectedItem.media_type == 1){
                        return await sendImage(selectedItem)
                    }else if(selectedItem.media_type == 2){
                        return await sendVideo(selectedItem)
                    }
                }
            }else if(message.message.item_type == "story_share"){
                if(message.message.story_share?.title) return await ig.realtime.direct.sendText({text:"o story que você enviou não está disponível para mim porque não estou seguindo o usuário",threadId:message.message.thread_id,reply:{item_id:message.message.item_id,client_context:message.message.client_context}})
                else if(message.message.story_share.media.media_type == 1){
                    let image = message.message.story_share.media
                    return await sendImage(image)
                 }else if(message.message.story_share.media.media_type == 2){
                     let video = message.message.story_share.media
                     return await sendVideo(video)
                 }
            }

        }


})
ig.realtime.on('error', console.error);
ig.realtime.on('close', () => console.error('RealtimeClient parou :('));
await ig.realtime.connect({irisData: threads})
})()

app.get('/', async (req, res) => {
  res.sendFile('index.html', { root: __dirname })
});

const porta = process.env.PORT || 5000;
//iniciando...

app.listen(porta, () => {
  console.log(`Aplicativo radando em: http://localhost:${porta}`);
  schedule.scheduleJob('* * * * *', () => { 
    bot_inf.findOne({ayu: 'ayu'}).then(async (botInfo) => {
    if (!botInfo) {
    addBotinfo()
//    console.log(botInfo)
   }
   })
  });
});
