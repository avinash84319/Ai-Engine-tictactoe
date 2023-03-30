game.find({}).sort({_id:-1}).limit(1).then((found)=>{
                if(found.length==0){
                    gameid=0;
                }
                gameid=found.gameno+1;
            });
            console.log(gameid);