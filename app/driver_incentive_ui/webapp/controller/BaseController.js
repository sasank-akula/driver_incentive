sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("com.cy.driverincentiveui.controller.Basecontroller", {

        getModel: function (sName) {
            return this.getOwnerComponent().getModel(sName);
        }
            
        });
    });