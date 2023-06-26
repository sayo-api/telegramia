require("./config");
const {IgApiClient} = require("instagram-private-api");
const {withRealtime} = require("instagram_mqtt");
const fs = require("fs");
const pkg = require("request-promise");
const schedule = require('node-schedule');
const axios = require('axios');
const cheerio = require("cheerio");
const express = require('express');
const { Configuration, OpenAIApi } = require("openai");

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const { oggToMp3, streamToText } = require("./lib/convertVoice");
const { removeStreams } = require("./lib/helpers");


const { viverdb } = require('./banco/1');
const { usuario, bot_inf, grupos } = require('./banco/2');
const { gerarUsuario, veriNumero, verificaNome, verificaAll, semlimit, equilibrio, darlimit, niveladd, addcash, delcash, checkPremium, deletar_premium, adicionar_premium, tempo_expirado, expadd, veriCpf, addcashpix, delcashpix, verificaAllcpf } = require('./banco/3');

//iniciando banco de dados
viverdb() 

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
const budy = message.message.text
const sender = message.message.user_id
const rg = await verificaAll(sender)
const rgcheck = await veriNumero(sender)


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


if (budy && !budy.includes('rg') && !rgcheck){ 
reply(`opa amigão parece que você não esta registrado, mande a segunite mensagem: rg, e efetue seu registro para continuar 😉`)
return
}

if (message.message.item_type == "voice_media") {
console.log(message.message.voice_media.media.audio.audio_src)
reply("sua mensagem foi recebida, aguarde a resposta...");
const oggPath = await oggToMp3.createOgg(message.message.voice_media.media.audio.audio_src, message.message.item_id);
const mp3Path = await oggToMp3.convertToMp3(oggPath, message.message.item_id); 
const text = await streamToText.transcription(mp3Path); 
await reply(`oque entendi no áudio que você mandou: ${text}`);
/*if (text.includes("Arte" || "arte")) {
await reply("criando sua arte 🥳...");
const response = await openai.createImage({
prompt: text,
n: 1,
size: "512x512",
});
replyimg(response.data.data[0].url)
}else{*/
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
app.listen(porta, () => console.log("site Online na porta:", porta));
