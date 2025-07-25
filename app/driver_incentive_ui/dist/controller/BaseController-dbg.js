sap.ui.define([
    "sap/ui/core/mvc/Controller",
	"sap/ui/core/BusyIndicator"
], (Controller,BusyIndicator) => {
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
		},
		getBaseURL: function () {
            return sap.ui.require.toUrl("com/cy/driverincentiveui");
        },
		ajaxCall:function(oSettings){
			return new Promise(function (resolve, reject) {
                $.ajax(oSettings).done(function (oResponse, oType) {
                    resolve(oResponse, oType);
                }).fail(async function (oError, oType) {
                    BusyIndicator.hide();
                    reject(oError, oType);
                });
            });
		}
		
    });
});