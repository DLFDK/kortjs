const button = document.getElementById("button");
const kortjs = document.getElementById("kortjs");

let toggle = true;

button.addEventListener("click", ()=>{
    if(kortjs.isConnected){
        kortjs.remove();
    } else {
        document.body.append(kortjs);
    }
})