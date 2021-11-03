const fido = new fido2auth(
  "BASE-URL",
  "CLIENT_ID"
);
const socket = io("BASE-URL");

const approveRegister = (username, sessionId) => {
  socket.emit("join", { id: sessionId });
  fido
    .registerWithFido(username)
    .then(async (response) => {
      socket.emit("registration-response", response);
      console.log(response);
      if (response.verified) {
        await AddToAudit(response.userId, 1, "success");
       // window.location.href = "/registerSuccess";
      } else await AddToAudit(response.userId, 1, "error");
    })
    .catch(async (error) => {
      socket.emit("registration-response", error);

      alert(error);
    });
};

const approveLogin = (username, sessionId) => {
  socket.emit("join", { id: sessionId });
  fido
    .loginWithFido(username)
    .then(async (response) => {
      console.log("loginResponse", response);
      if (response.verified) {
        socket.emit("login-response", response);
        await AddToAudit(response.userId, 2, "success");
       // window.location.href = "/success";
      } else await AddToAudit(response.userId, 2, "error");
    })
    .catch(async (error) => {
      socket.emit("login-response", error);

      alert(error);
    });
};

const declineProcess = (process) => {
  socket.emit("decline-process", `${process} is Declined by User.`);
  window.close();
};

const approveDevice = (username, sessionId) => {
  socket.emit("join", { id:sessionId });
  fido
    .addDevice(username)
    .then(async (response) => {
      socket.emit("add-device-response", response);
      console.log(response);
      if (response.verified) {
        await AddToAudit(response.userId, 3, "success");
        alert("device added successfully");
        window.close();
      } else await AddToAudit(response.userId, 3, "error");
    })
    .catch(async (error) => {
      socket.emit("add-device-response", error);

      alert(error);
    });
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
