const button = document.getElementById("button");
const kortjs = document.getElementById("kortjs");

let toggle = true;

button.addEventListener("click", ()=>{
    if(toggle) {
        kortjs.style.display = "block";
        toggle = false;
    } else {
        kortjs.style.display = "none";
        toggle = true;
    }
})