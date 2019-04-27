const checkInstallButton = document.getElementById("checkInstallButton");
checkInstallButton.addEventListener("click", checkInstall);

const refreshPageButton = document.getElementById("refreshPageButton");
refreshPageButton.addEventListener("click", refreshPage);

const connectedSection = document.getElementById("connectedSection");
connectedSection.style.display = "none";

const errorSection = document.getElementById("errorSection");
errorSection.style.display = "none";

let domainName = "";


function checkInstall() {
  console.log("test");
  return fetch("/checkinstall/").then(res => {
    console.log(res);
    if (res.status === 200) {
      //awesome the token is working!
        connectedSection.style.display = "block";

      } else {
        errorSection.style.display = "block";

      }
    return Promise.resolve();
  });
}


function refreshPage(){
 location.reload(); 

}


function getDomain(){
  console.log("test");
 return fetch("/domainname/")
    .then(res => res.json())
    .then(resJson => {
      if (resJson.error) {
          console.log(resJson.error);
        

      } else {
        console.log(resJson.message);
        domainName = resJson.message;
        console.log("domain name " + domainName);
      }
      return Promise.resolve();
    });
}

getDomain();


  function clipboard(element) {
    let copyText = document.getElementById(element);
    copyText.select();
    document.execCommand("Copy");
  }

  function generateEnv() {
    let clientId = document.getElementById('discordToken').value || '<Your token value here>';
    let env = `string text line 1
 string text line 2`;
    var env = '# slack app credentials\nclientId=' + clientId;
    document.getElementById('env_file').value = env;
  }

generateEnv();