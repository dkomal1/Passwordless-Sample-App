const fido = new fido2auth(
  "BASE-URL",
  "CLIENT_ID"
);
const socket = io("BASE-URL");


function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

const generateRandomId = () =>{
  const rString = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  return rString;

}


socket.on("register-client-response", async (data) => {
  ////console.log(JSON.stringify(data, null, 2));
  $("#RegisterModal").modal("hide");
  if (data.verified) {
    window.location.href = "/registerSuccess";
  } else {
    alert(JSON.stringify(data, null, 2));
  }
});


socket.on("add-device-client-response", async (data) => {
  ////console.log(JSON.stringify(data, null, 2));
  $("#RegisterModal").modal("hide");
  if (data.verified) {
    alert("Device added Successfully")
  } else {
    alert(JSON.stringify(data, null, 2));
  }
});

socket.on("login-client-response", async (data) => {
  //console.log(JSON.stringify(data, null, 2));
  $("#LoginModal").modal("hide");
  if (data.verified) {
    window.location.href = "/success";
  } else {
    alert(JSON.stringify(data, null, 2));
  }
});

socket.on("decline-process-response", (data) => {
  $("#RegisterModal").modal("hide");
  $("#LoginModal").modal("hide");
  alert(data);
});

const registerFun = async () => {
  //console.log("regn session id",sessionId);
  const qrImg = document.getElementById("qrImg");
  qrImg.src = "#";

  const id = generateRandomId();
  const username = this.username.value;
  //console.log(username);
  if (this.authMethod.value == 1) {
    fido
      .registerWithFido(username)
      .then(async (response) => {
        if (response.verified) {
          await AddToAudit(response.userId, 1, "success");

          window.location.href = "/registerSuccess";
        } else await AddToAudit(response.userId, 1, "error");
      })
      .catch(async (error) => {
        alert(error);
      });
  } else if (this.authMethod.value == 2) {
    generateQR(username, 1, "web", id);
    socket.emit("join", { id});
  } else if (this.authMethod.value == 3) {
    generateQR(username, 1, "app", id);
    $("#RegisterModal").modal("show");
    socket.emit("join", { id});
  } else alert("not done yet");
};

const loginFun = async () => {
  //console.log("login session id",sessionId);
  const username = this.username.value;
  const qrImg = document.getElementById("qrImg");
  qrImg.src = "#";
const id = generateRandomId()
  if (this.authMethod.value == 1) {
    fido
      .loginWithFido(username)
      .then(async (response) => {
        if (response.verified) {
          await AddToAudit(response.userId, 2, "success");
          window.location.href = "/success";
        } else await AddToAudit(response.userId, 2, "error");
      })
      .catch(async (error) => {
        alert(error);
      });
  } else if (this.authMethod.value == 2) {
    generateQR(username, 2, "web", id);
    socket.emit("join", { id});
  } else if (this.authMethod.value == 3) {
    generateQR(username, 2, "app", id);
    $("#loginModal").modal("show");
    socket.emit("join", { id});
  } else alert("not done yet");
};

const generateQR = async (username, type, platform = "web", id) => {
  const qrImg = document.getElementById("qrImg");
  qrImg.src = "#";
  const success = async (position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const ua = detect.parse(navigator.userAgent);
    const reqTime = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    let path;

    if (type == 1) path = `${location.origin}/registerToken`;
    else if (type == 2) path = `${location.origin}/loginToken`;
    else path = `${location.origin}/addDevice`;

    const userDetails = {
      latitude,
      longitude,
      device: `${ua.os.name},${ua.browser.name}`,
      username,
      type,
      platform,
      id,
      reqTime,
      path,
    };
    //console.log(userDetails);

    fido
      .generateQR(userDetails)
      .then((response) => {
        //console.log(response);
        qrImg.src = response.url;

        console.log({accessToken:response.accessToken});

        if (type === 2) $("#loginModal").modal("show");
        else $("#RegisterModal").modal("show");
      })
      .catch((error) => alert(error));
  };

  function error() {
    alert("Unable to retrieve your location");
  }

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
  } else {
    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
    });
  }
};

const addDevice = async (sessionId) => {
  //console.log("regn session id",sessionId);
  const qrImg = document.getElementById("qrImg");
  qrImg.src = "#";

  const username = this.username.value;
  //console.log(username);
  if (this.authMethod.value == 1) {
    fido
      .addDevice(username)
      .then(async (response) => {
        if (response.verified) {
          await AddToAudit(response.userId, 3, "success");

          alert("new device added successfully");
        } else await AddToAudit(response.userId, 3, "error");
      })
      .catch(async (error) => {
        alert(error);
      });
  } else if (this.authMethod.value == 2) {
    generateQR(username, 3, "web", sessionId);
    socket.emit("join", { id: `${sessionId}_${username}` });
  } else if (this.authMethod.value == 3) {
    generateQR(username, 3, "app", sessionId);
    $("#RegisterModal").modal("show");
    socket.emit("join", { id: `${sessionId}_${username}` });
  } else alert("not done yet");
};

const AddToAudit = async (userId, type, label) => {
  const ispAPI = await fetch("https://ipapi.co/json");

  const data = await ispAPI.json();
  const ua = detect.parse(navigator.userAgent);
  data.time = new Date();
  (data.browser = ua.browser.name), (data.device = ua.os.name);
  data.label = label;
  fido.Audit({ userId, data, type });
};
