const socket = io("http://localhost:9000"); // the / namespace/endpoint

let nsSocket = "";
socket.on("connect", () => {
  socket.on("nsList", (nsData) => {
    let nameSpacesDiv = document.querySelector(".namespaces");
    nameSpacesDiv.innerHTML = "";

    nsData.forEach((ns) => {
      nameSpacesDiv.innerHTML += `<div class="namespace" ns=${ns.endPoint} ><img src="${ns.img}" /></div>`;
    });

    Array.from(document.getElementsByClassName("namespace")).forEach((elem) => {
      elem.addEventListener("click", (e) => {
        const nsEndpoint = elem.getAttribute("ns");
        joinNs(nsEndpoint);
      });
    });
    joinNs("/wiki");
  });
});
