(function(){
  const canvas = document.getElementById("appCanvas");

  EventBus.on("drag:drop", pos=>{
    console.log("Dropped", pos);
  });
})();