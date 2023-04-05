require('dotenv').config();
const express=require('express');
const app = express();
const { default: mongoose } = require("mongoose");

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended:true}));

app.set('view engine','ejs');
app.use(express.static("public"));

mongoose.connect("mongodb+srv://avinash:"+process.env.MONGODB+"@memory.gl56xmf.mongodb.net/memory?retryWrites=true&w=majority",{useNewUrlParser:true}).then(()=>{
    console.log('mongodb connected successfully');
});

let z=0;
let count=0;
let classnames=["first","second","third","fourth","fifth","sixth","seventh","eight","ninth"];
let presentvalue=0;
let state=["choose","choose","choose","choose","choose","choose","choose","choose","choose"];
let result="choice"
let memstates=[["choose","choose","choose","choose","choose","choose","choose","choose","choose"]];
const winningCombos = [
    [0,1,2], // top row
    [3,4,5], // middle row
    [6,7,8], // bottom row
    [0,3,6], // left column
    [1,4,7], // middle column
    [2,5,8], // right column
    [0,4,8], // descending diagonal
    [6,4,2] // ascending diagonal
  ]

  const scheme=mongoose.Schema({
    gameno:Number,
    count:Number,
    choice:String,
    mem:[]
  })

  const game=mongoose.model("game",scheme);


  let gameid;

let checkSubset = (parentArray, subsetArray) => {
    return subsetArray.every((el) => {
        return parentArray.includes(el)
    })
}

app.get('/',(req,res)=>{
     return res.render("choose");
});

app.post('/player',(req,res)=>{
    res.redirect('/player');
})
app.get('/player',(req,res)=>{
     return res.render("players",{player:presentvalue,arr:state,result:result});
});

app.post("/choose",(req,res)=>{
    presentvalue = req.body.choice;
    result="reload"
    res.redirect('/choose');
})

app.get('/choose',(req,res)=>{
     return res.render("players",{player:presentvalue,arr:state,result:result});
});

app.post("/reload",(req,res)=>{
    classnames=["first","second","third","fourth","fifth","sixth","seventh","eight","ninth"];
presentvalue=0;
state=["choose","choose","choose","choose","choose","choose","choose","choose","choose"];
result="choice"
memstates=[["choose","choose","choose","choose","choose","choose","choose","choose","choose"]]
    res.redirect('/player');
})

app.post("/restart",(req,res)=>{
memstates=[["choose","choose","choose","choose","choose","choose","choose","choose","choose"]];
classnames=["first","second","third","fourth","fifth","sixth","seventh","eight","ninth"];
presentvalue=0;
state=["choose","choose","choose","choose","choose","choose","choose","choose","choose"];
result="choice"
res.redirect('/player');    
})
app.post("/state",async (req,res)=>{
    for(var i=0;i<9;i++){
        if(req.body[classnames[i]]!=undefined){
            if(presentvalue == 1)
            state[i]="X";
            else
            state[i]="O";
        }
    }                                               //updating state complete


    var deref=[];
    for(var i=0;i<state.length;i++){
        deref.push(state[i]);                       //used to dereference or else all value get updated
    }
    memstates.push(deref);
    var temp=[];
    for(var i=0;i<9;i++){
        if(state[i]=="X"){              
            temp.push(i);
        }
    }
    for(var i=0;i<8;i++){
        if(checkSubset(temp,winningCombos[i])){
            let damm=[];
            let damm2=[];
            let gotit=1;
            await game.find({},{gameno:1,mem:1}).then((found)=>{
                found=JSON.parse(JSON.stringify(found))
                for(var j=0;j<found.length;j++){
                    damm.push(found[j].gameno);
                    damm2.push(found[j].mem)
                }
            });
            var cc=JSON.stringify(memstates);
            for(var j=0;j<damm2.length;j++){
                var cc2=JSON.stringify(damm2[j]);
            if(cc==cc2){
                gotit=0;
                break;
            }
        }
        if(gotit){
            gameid=Math.max(...damm)+1;             //max only works on no not arrray therefore spread it with ..
            console.log("learning ...");
            const newgame = new game({
                gameno:gameid,
                count:memstates.length,
                choice:"X",
                mem:memstates
            })
            await newgame.save();
        }
         return res.render("players",{player:presentvalue,arr:state,result:"PLAYER X WINS"});
        break;
        }
    }


    // var deref=[];
    // for(var i=0;i<state.length;i++){
    //     deref.push(state[i]);
    // }
    // memstates.push(deref);            //used to dereference or else all value get updated
    temp=[];
    var temp=[];
    for(var i=0;i<9;i++){
        if(state[i]=="O"){             
            temp.push(i);
        }
    }
    for(var i=0;i<8;i++){
        if(checkSubset(temp,winningCombos[i])){
            let damm=[];
            let damm2=[];
            let gotit=1;
            await game.find({},{gameno:1,mem:1}).then((found)=>{
                found=JSON.parse(JSON.stringify(found))
                for(var j=0;j<found.length;j++){
                    damm.push(found[j].gameno);
                    damm2.push(found[j].mem)
                }
            });
            var cc=JSON.stringify(memstates);
            for(var j=0;j<damm2.length;j++){
                var cc2=JSON.stringify(damm2[j]);
            if(cc==cc2){
                gotit=0;
                break;
            }
        }
        if(gotit){
            gameid=Math.max(...damm)+1;             //max only works on no not arrray therefore spread it with ..
            console.log("learning ...");
            const newgame = new game({
                gameno:gameid,
                count:memstates.length,
                choice:"O",
                mem:memstates
            })
            await newgame.save();
        }
         return res.render("players",{player:presentvalue,arr:state,result:"PLAYER O WINS"});
        break;
        }
    }



    var g=0;
    for(var i=0;i<9;i++){
        if(state[i]!="choose"){
            g=g+1;
        }
    }
    if(g==9){
         return res.render("players",{player:presentvalue,arr:state,result:"DRAW"});

    }
    if(presentvalue == 0){
        presentvalue=1;
    }
    else{
        presentvalue=0
    }
     return res.render("players",{player:presentvalue,arr:state,result:"reload"});
})

//players section ends-----------------------------------------------------------------------------------------------------------------------------

// computer section-------------------------------------------------------------------------------------------------------------------------------


app.post("/comp",(req,res)=>{
    z=0;
    memstates=[["choose","choose","choose","choose","choose","choose","choose","choose","choose"]];
classnames=["first","second","third","fourth","fifth","sixth","seventh","eight","ninth"];
score=[2,7,6,9,5,1,4,3,8];
presentvalue=0;
state=["choose","choose","choose","choose","choose","choose","choose","choose","choose"];
result="choice"
    res.redirect("/comp");
})
app.get("/comp",(req,res)=>{
     return res.render("computer",{player:presentvalue,arr:state,result:result});
});

app.post("/choosec",(req,res)=>{
    presentvalue = req.body.choice;
    result="reload"
    res.redirect('/choosec');
})
app.get('/choosec',(req,res)=>{
     return res.render("computer",{player:presentvalue,arr:state,result:result});
});

app.post("/reloadc",(req,res)=>{
    z=0;
    count=0;
    classnames=["first","second","third","fourth","fifth","sixth","seventh","eight","ninth"];
score=[2,7,6,9,5,1,4,3,8];
presentvalue=0;
state=["choose","choose","choose","choose","choose","choose","choose","choose","choose"];
result="choice"
memstates=[["choose","choose","choose","choose","choose","choose","choose","choose","choose"]]
    res.redirect('/comp');
})

app.post("/restartc",(req,res)=>{
    z=0;
count=0;
memstates=[["choose","choose","choose","choose","choose","choose","choose","choose","choose"]];
classnames=["first","second","third","fourth","fifth","sixth","seventh","eight","ninth"];
score=[2,7,6,9,5,1,4,3,8];
presentvalue=0;
state=["choose","choose","choose","choose","choose","choose","choose","choose","choose"];
result="choice"

res.redirect('/comp');    
})

app.post("/statec",(req,res)=>{
    for(var i=0;i<9;i++){
        if(req.body[classnames[i]]!=undefined){
            if(presentvalue == 1)
            state[i]="X";
            else
            state[i]="O";
        }
    }                                               //updating state complete 
    res.redirect('/statec');
})

app.get("/statec",async (req,res)=>{

    var temp=[];
    for(var i=0;i<9;i++){
        if(state[i]=="X"){              
            temp.push(i);
        }
    }
    for(var i=0;i<8;i++){
    if(checkSubset(temp,winningCombos[i])){
         return res.render("computer",{player:presentvalue,arr:state,result:"PLAYER X WINS"});
    }
    }

    temp=[];
    for(var i=0;i<9;i++){
        if(state[i]=="O"){              
            temp.push(i);
        }
    }
    for(var i=0;i<8;i++){
    if(checkSubset(temp,winningCombos[i])){
         return res.render("computer",{player:presentvalue,arr:state,result:"PLAYER O WINS"});
    }
    }   
    var g=0;
    for(var i=0;i<9;i++){
        if(state[i]!="choose"){
            g=g+1;
        }
    }
    if(g==9){
         return res.render("computer",{player:presentvalue,arr:state,result:"DRAW"});

    }


    count=0;
    for(var i=0;i<9;i++){
        if(state[i]!="choose"){
            count++;
        }
    }
    // console.log("count is ",count);
    let solution=[]
    if(presentvalue==1){
    await game.find({choice:"X"},{mem:{$elemMatch:state}}).then((found)=>{
        found=JSON.parse(JSON.stringify(found))
        // console.log(found)
        solution=found[z]
    });
    }
    else{
        await game.find({choice:"O"},{mem:state}).then((found)=>{
            found=JSON.parse(JSON.stringify(found))
            // console.log(found);
            solution=found[z];
        });
    }
    if(solution==undefined){
        // console.log(state);
        console.log("should learn this state");
        return res.render("computer",{player:presentvalue,arr:state,result:"computer is not able to calculate next move"});    //return can be executed to end the execution
    }
    // console.log("game no is",solution.gameno);
    var c=0;
    for(var i=0; i<solution.mem.length;i++){
    if(JSON.stringify(solution.mem[i])!=JSON.stringify(state)){              // checking for the state if availaible in db
        c++;
    }
    }
    if(c==solution.mem.length){
        // console.log("should learn this state");
        // return res.render("computer",{player:presentvalue,arr:state,result:"computer is not able to calculate next move"});    //return can be executed to end the execution
        // console.log(state);
        console.log("changin to other game in memory...");
        z=z+1;                             // changing game for better performance
        return res.redirect("/statec");
    }
    // else{
    //     // find or use another memory solution
    // }
    await game.find({_id:solution._id}).then((found)=>{
        solution=JSON.parse(JSON.stringify(found));
    })
    solution=solution[0].mem
    if(count==solution.length-1){
        count=count-1;
    }
    var tempstate=state;
    tempstate=solution[count+1];
    if(JSON.stringify(tempstate)==JSON.stringify(state)){
        state=tempstate;
        res.redirect('/statec');
    }
    else{
        state=tempstate;
        //  return res.render("computer",{player:presentvalue,arr:state,result:result});
    }
    // console.log("z is",z);
     return res.render("computer",{player:presentvalue,arr:state,result:result});
})





//server section-------------------------------------------------------------------------------------------------------------------------
app.listen(process.env.PORT||3000,function(){
    console.log("listening on 3000");
})