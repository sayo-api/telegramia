const {IgApiClient} = require("instagram-private-api");
const {withRealtime} = require("instagram_mqtt");
const fs = require("fs");
const delay = require('delay');
const ig = withRealtime(new IgApiClient())
const express = require('express');
const ms = require('ms');


const app = express();


ig.state.generateDevice("kzm");


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
  
  
(async () => {
    console.log("login iniciado")

    if (stateExists()) {
        await ig.state.deserialize(loadState());
    }

    let loggedInUser
    try{
        loggedInUser = await ig.account.currentUser()
    }catch(err){
        console.log(err)
        loggedInUser = await ig.account.login("segui_eu_de_volta_pfv","34615194")            
        const serialized = await ig.state.serialize();
        delete serialized.constants; 
        saveState(serialized);
    }
    
    console.log("Logado com sucesso na conta: " + loggedInUser.username)
    
const threads = await ig.feed.directInbox().request()        
let meID = loggedInUser.pk
    
    ig.realtime.on("receive",async(t,message) => {
        let msg = message[0]
       if(msg.topic.id == "135" && msg.topic.path == "/ig_sub_iris_response"){
            let p_threads = (await ig.feed.directPending().request()).inbox.threads
            for(let i = 0;i<p_threads.length;i++){
                let id = p_threads[i].thread_id
                console.log(id)
                try{
                    await ig.directThread.approve(id)
                    await ig.entity.directThread(id).broadcastText("oii, blz ja segue eu aii, to te seguindo ja :), postarei memes, entre muitas outras coisas...")
                }catch(err){
                    console.log(err)
                }
            }
        }
    })  
    
    

  const seguidores_via_id = await ig.feed.accountFollowers("26669533");
  const e = async () => {
  let items = await seguidores_via_id.items();
  let tema = items[Math.floor(Math.random() * items.length)]
  ig.friendship.create(tema.pk_id);
    console.log("seguindo: " + tema.username)
    const temais = await seguidores_via_id.isMoreAvailable();
      if (temais) {
        await delay(20 * 1000)
        e();        
      } else {
      return
      }
  };
  

setInterval(() => e(), 20 * 1000)

ig.realtime.on('error', console.error);
ig.realtime.on('close', () => console.error('RealtimeClient parou :('));
await ig.realtime.connect({irisData: threads})
})()  

app.get('/', async (req, res) => {
  res.send('oiiii')
});

const porta = process.env.PORT || 5000;
//iniciando...
app.listen(porta, () => console.log("site Online na porta:", porta));