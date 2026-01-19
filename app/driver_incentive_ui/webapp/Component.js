sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/cy/driverincentiveui/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("com.cy.driverincentiveui.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            this.setModel(new sap.ui.model.json.JSONModel({
                hasMeeting: false,
                meetingUrl: null,
                showHelp: true, 
                pip: {
                    left: "70%",
                    top: "60%"
                }
            }), "cvi");


            this._callFrame = null;

            // enable routing
            this.getRouter().initialize();
        }
    });
});