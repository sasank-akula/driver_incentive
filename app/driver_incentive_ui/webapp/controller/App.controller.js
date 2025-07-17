sap.ui.define([ 
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("com.cy.driverincentiveui.controller.App", {

		onInit : function () {
	
			var oViewModel = new JSONModel({
				busy : true,
				delay : 0,
				layout : "OneColumn",
				previousLayout : "",
				actionButtonsInfo : {
					midColumn : {
						fullScreen : true
					},
					smallScreenMode: true
				}
			});
			this.getView().setModel(oViewModel, "appView");
		}

	});
});