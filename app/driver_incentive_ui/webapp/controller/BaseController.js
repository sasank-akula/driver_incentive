sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("com.cy.driverincentiveui.controller.Basecontroller", {

      
		getRouter : function () {
			return this.getOwnerComponent().getRouter();
		},

	
		getModel : function (sName) {
			return this.getView().getModel(sName);
		},

		setModel : function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		}
    });
});