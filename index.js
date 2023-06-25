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
                    await ig.entity.directThread(id).broadcastText("opa tudo bem?")
                }catch(err){
                    console.log(err)
                }
            }
        }
    })

ig.realtime.on("message",async (message)=> { 
if(message?.message?.user_id == meID) return
const budy = message.message.text

if (message.item_type == "voice_media") {

reply("sua mensagem foi recebida, aguarde a resposta...");
const oggPath = await oggToMp3.createOgg(message.message.voice_media.media.audio.audio_src, message.message.item_id);
const mp3Path = await oggToMp3.convertToMp3(oggPath, message.message.item_id); 
const text = await streamToText.transcription(mp3Path); 
await reply(`oque entendi no áudio que você mandou: ${text}`);
await reply("buscando respostas 🥳...");
const res = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        text,
})
reply(res.data.choices[0].message)
removeStreams(mp3Path);

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
