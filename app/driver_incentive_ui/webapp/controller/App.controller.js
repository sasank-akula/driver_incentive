// sap.ui.define([
//   "sap/ui/core/mvc/Controller",
//   "sap/ui/model/json/JSONModel"
// ], function (Controller, JSONModel) {
//   "use strict";

//   return Controller.extend("com.cy.driverincentiveui.controller.App", {

//     onInit: function () {
//       var oViewModel = new JSONModel({
//         busy: true,
//         delay: 0,
//         layout: "OneColumn",
//         previousLayout: "",
//         actionButtonsInfo: {
//           midColumn: { fullScreen: true },
//           smallScreenMode: true
//         }
//       });
//       this.getView().setModel(oViewModel, "appView");
//     },
//     _startCall: function (meetingUrl) {
//       const oComponent = this.getOwnerComponent();

//       if (oComponent._callFrame) return;

//       const host = this.byId("dailyHost");
//       if (!host || !host.getDomRef()) {
//         console.error("Daily host not ready");
//         return;
//       }

//       oComponent._callFrame = window.Daily.createFrame(
//         host.getDomRef(),
//         {
//           showLeaveButton: true,
//           showFullscreenButton: true
//         }
//       );

//       oComponent._callFrame.join({ url: meetingUrl });

//       console.log("✅ Daily call JOINED");
//     }
//     ,

//     /* =========================
//        PiP DRAG LOGIC (FIXED)
//        ========================= */
//     _enablePipDrag: function () {
//       if (this._pipDragEnabled) return; // ⛔ prevent duplicate binding
//       this._pipDragEnabled = true;

//       const oPip = this.byId("globalCallContainer");
//       const oHeader = this.byId("pipHeader");
//       const oModel = this.getOwnerComponent().getModel("cvi");

//       const pipDom = oPip.getDomRef();
//       const headerDom = oHeader.getDomRef();

//       if (!pipDom || !headerDom) {
//         console.error("PiP DOM not ready");
//         return;
//       }

//       let dragging = false;
//       let offsetX = 0;
//       let offsetY = 0;

//       headerDom.onmousedown = (e) => {
//         const rect = pipDom.getBoundingClientRect();
//         offsetX = e.clientX - rect.left;
//         offsetY = e.clientY - rect.top;
//         dragging = true;
//         document.body.style.userSelect = "none";
//       };

//       document.onmousemove = (e) => {
//         if (!dragging) return;

//         const left = e.clientX - offsetX + "px";
//         const top = e.clientY - offsetY + "px";

//         oModel.setProperty("/pip/left", left);
//         oModel.setProperty("/pip/top", top);

//         pipDom.style.left = left;
//         pipDom.style.top = top;
//       };

//       document.onmouseup = () => {
//         dragging = false;
//         document.body.style.userSelect = "";
//       };

//       console.log("✅ PiP drag ENABLED");
//     }
//     ,
//     /* =========================
//        APPLY POSITION TO DOM
//        ========================= */
//     _applyPipPosition: function () {
//       const oPip = this.byId("globalCallContainer");
//       const oModel = this.getOwnerComponent().getModel("cvi");

//       if (!oPip || !oPip.getDomRef()) return;

//       const dom = oPip.getDomRef();
//       dom.style.left = oModel.getProperty("/pip/left");
//       dom.style.top = oModel.getProperty("/pip/top");
//     },

//     /* =========================
//        HELP BUTTON
//        ========================= */
//     onNeedHelp: function () {
//       const oModel = this.getOwnerComponent().getModel("cvi");

//       // 1️⃣ set model flags
//       oModel.setProperty("/hasMeeting", true);
//       oModel.setProperty("/meetingUrl", "https://tavus.daily.co/c6106420520504aa");

//       // 2️⃣ wait for PiP to render
//       setTimeout(() => {
//         this._applyPipPosition();
//         this._enablePipDrag();
//         this._startCall(oModel.getProperty("/meetingUrl"));
//       }, 0);
//     }
//     ,

//     /* =========================
//        LIFECYCLE
//        ========================= */
//     onAfterRendering: function () {

//     },

//     /* =========================
//        DAILY CALL
//        ========================= */


//     onEndCall: function () {
//       const oComponent = this.getOwnerComponent();

//       if (oComponent._callFrame) {
//         oComponent._callFrame.destroy();
//         oComponent._callFrame = null;
//       }

//       const oModel = oComponent.getModel("cvi");
//       oModel.setProperty("/hasMeeting", false);
//       oModel.setProperty("/meetingUrl", null);
//     }
//   });
// });



sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/base/Log"
], function (Controller, JSONModel, Log) {
  "use strict";

  return Controller.extend("com.cy.driverincentiveui.controller.App", {
    onInit: function () {
      const oViewModel = new JSONModel({
        busy: true,
        delay: 0,
        layout: "OneColumn",
        previousLayout: "",
        actionButtonsInfo: {
          midColumn: { fullScreen: true },
          smallScreenMode: true
        }
      });
      this.getView().setModel(oViewModel, "appView");

      this._pipDragEnabled = false;
      this._callFrame = null;
    },

    _startCall: function (meetingUrl) {
      debugger
      if (this._callFrame) {
        return;
      }

      if (!window.Daily) {
        Log.error("Daily SDK not loaded");
        return;
      }

      const host = this.byId("dailyHost");
      if (!host || !host.getDomRef()) {
        Log.error("Daily host not ready");
        return;
      }

      this._callFrame = window.Daily.createFrame(host.getDomRef(), {
        allowMultipleCallInstances: true,
        iframeStyle: {
          width: '100%',
          height: '100%',
        },
        showLeaveButton: true,
        showFullscreenButton: true
      });

      this._callFrame.join({ url: meetingUrl });
      this._callFrame.once("joined-meeting", () => {
        console.log("✅ Joined meeting");
        this._callFrame.startScreenShare();
        this._attachDailyEvents();
      });
      const oModel = this.getOwnerComponent().getModel("cvi");
      oModel.setProperty("/showHelp", false);
      Log.info("Daily call joined");
    },
    _attachDailyEvents: function () {
      if (!this._callFrame) {
        return;
      }

      // User clicks "Leave"
      this._callFrame.on("left-meeting", () => {

        this.onEndCall();
      });

      // Host ends the call
      this._callFrame.on("call-ended", () => {

        this.onEndCall();
      });

      // Network / unexpected error
      this._callFrame.on("error", () => {
        this.onEndCall();
      });
    },

    _onResize: function () {
      const oPip = this.byId("globalCallContainer");
      const oModel = this.getOwnerComponent().getModel("cvi");

      if (!oPip || !oPip.getDomRef()) return;

      const pipDom = oPip.getDomRef();
      const rect = pipDom.getBoundingClientRect();

      const maxLeft = window.innerWidth - rect.width;
      const maxTop = window.innerHeight - rect.height;

      const left = Math.min(parseInt(rect.left, 10), maxLeft);
      const top = Math.min(parseInt(rect.top, 10), maxTop);

      pipDom.style.left = left + "px";
      pipDom.style.top = top + "px";

      oModel.setProperty("/pip/left", left + "px");
      oModel.setProperty("/pip/top", top + "px");
    }
    ,

    /* =========================
       ENABLE PiP DRAG
       ========================= */
    _enablePipDrag: function () {
      if (this._pipDragEnabled) return;
      this._pipDragEnabled = true;

      const oPip = this.byId("globalCallContainer");
      const oHeader = this.byId("pipHeader");
      const oModel = this.getOwnerComponent().getModel("cvi");

      const pipDom = oPip && oPip.getDomRef();
      const headerDom = oHeader && oHeader.getDomRef();

      if (!pipDom || !headerDom) return;

      let dragging = false;
      let offsetX = 0;
      let offsetY = 0;

      const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

      this._onMouseMove = (e) => {
        if (!dragging) return;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const pipRect = pipDom.getBoundingClientRect();

        let left = e.clientX - offsetX;
        let top = e.clientY - offsetY;

        // ✅ Clamp inside viewport
        left = clamp(left, 0, viewportWidth - pipRect.width);
        top = clamp(top, 0, viewportHeight - pipRect.height);

        const leftPx = left + "px";
        const topPx = top + "px";

        pipDom.style.left = leftPx;
        pipDom.style.top = topPx;

        oModel.setProperty("/pip/left", leftPx);
        oModel.setProperty("/pip/top", topPx);
      };

      this._onMouseUp = () => {
        dragging = false;
        document.body.style.userSelect = "";
      };

      headerDom.addEventListener("mousedown", (e) => {
        const rect = pipDom.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        dragging = true;
        document.body.style.userSelect = "none";
      });

      document.addEventListener("mousemove", this._onMouseMove);
      document.addEventListener("mouseup", this._onMouseUp);
    }
    ,
    /* =========================
       APPLY PiP POSITION
       ========================= */
    _applyPipPosition: function () {
      const oPip = this.byId("globalCallContainer");
      const oModel = this.getOwnerComponent().getModel("cvi");

      if (!oPip || !oPip.getDomRef()) return;

      const dom = oPip.getDomRef();
      dom.style.left = oModel.getProperty("/pip/left") || "20px";
      dom.style.top = oModel.getProperty("/pip/top") || "20px";
    },

    /* =========================
       HELP BUTTON
       ========================= */
    onNeedHelp: async function () {
      const oModel = this.getOwnerComponent().getModel("cvi");
      try {
        sap.ui.core.BusyIndicator.show(0);
        var oAction = this.getOwnerComponent().getModel().bindContext("/getConversation(...)");
        oAction.setParameter("replica", "rf4703150052");
        oAction.setParameter("persona", "p0da71fc1ce1");
        await oAction.execute();
        const oResult = oAction.getBoundContext().getObject();
        const meetingUrl = oResult.value.conversation_url;
        // this.getOwnerComponent().getModel("cvi").setProperty("/meetingUrl", meetingUrl);
        // const meetingUrl = "https://tavus.daily.co/cd332df88ad914ef"
        oModel.setProperty("/hasMeeting", true);
        oModel.setProperty("/meetingUrl", meetingUrl);
        debugger
        const oPip = this.byId("globalCallContainer");
        oPip.addEventDelegate({
          onAfterRendering: () => {
            this._applyPipPosition();
            this._enablePipDrag();
            debugger
            this._startCall(oModel.getProperty("/meetingUrl"));
            this._boundResize = this._onResize.bind(this);
            window.addEventListener("resize", this._boundResize);
          }
        });
        sap.m.MessageToast.show("Conversation Request successfully!");
      } catch (e) {
        sap.m.MessageToast.show("Failed to start Tavus conversation");
      } finally {
        sap.ui.core.BusyIndicator.hide();
      }
    },

    /* =========================
       END CALL
       ========================= */
    onEndCall: function () {
      if (this._callFrame) {
        this._callFrame.destroy();
        this._callFrame = null;
      }

      document.removeEventListener("mousemove", this._onMouseMove);
      document.removeEventListener("mouseup", this._onMouseUp);

      this._pipDragEnabled = false;
      if (this._boundResize) {
        window.removeEventListener("resize", this._boundResize);
        this._boundResize = null;
      }

      const oModel = this.getOwnerComponent().getModel("cvi");
      oModel.setProperty("/hasMeeting", false);
      oModel.setProperty("/meetingUrl", null);
      oModel.setProperty("/showHelp", true);
      oModel.setProperty("/pip/left", "70%");
      oModel.setProperty("/pip/top", "60%");
      Log.info("Call ended and cleaned up");
    }

  });
});

