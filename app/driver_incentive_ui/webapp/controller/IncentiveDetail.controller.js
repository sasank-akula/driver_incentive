

sap.ui.define([
    "com/cy/driverincentiveui/controller/BaseController"
], (BaseController) => {
    "use strict";
    return BaseController.extend("com.cy.driverincentiveui.controller.IncentiveDetail", {
        onInit() {
            this.getRouter().getRoute("RouteDetail").attachPatternMatched(this._onRouteDriverIncentiveDetailMatched, this);
      },
      _onRouteDriverIncentiveDetailMatched:function(oEvent){
        var oArguments = oEvent.getParameter("arguments");
        this._oID = oArguments.ID;
        this.getModel("IncentiveItemModel").setProperty("/ID",this._oID);
        let aIncentives = this.getView().getModel("IncentiveModel").getProperty("/IncentiveType") || [];
        let oIncentives=aIncentives.map((aIncentive)=>{
          return {
            incentiveType: aIncentive.text,
            noOfOrders:0,
            incentive:0
          }
        })
        this.getView().getModel("IncentiveSummaryModel").setProperty("/items", oIncentives);
        this.getView().getModel("IncentiveSummaryModel").updateBindings(true);
      },
      onCloseMidColumn:function(){
        this.getModel("appView").setProperty("/layout","OneColumn")
        this.getRouter().navTo("RouteHome");
      },
      onExpandMidCoumn:function(oEvent){
        const current=this.getModel("appView").getProperty("/layout")
        if(current==="TwoColumnsMidExpanded"){
          this.getModel("appView").setProperty("/layout","MidColumnFullScreen")
          oEvent.getSource().setIcon("sap-icon://exit-full-screen")
        }else if(current==="MidColumnFullScreen"){
          oEvent.getSource().setIcon("sap-icon://full-screen")
          this.getModel("appView").setProperty("/layout","TwoColumnsMidExpanded")
        }  
      } ,
      onAddDriver:function(){
        var aIncentiveItem = this.getView().getModel("IncentiveItemModel").getProperty("/items") || [];
                let oIncentiveItem = {
                    EmpNo: "",
                    EmpName: "",
                    GSEmp: "",
                    IncentiveType: "",
                    OrderDelivered: 0,
                    CDMCashReceived: 0,
                    CDMIncentiveCost: 0,
                    CDMCashDeposit: 0,
                }
                aIncentiveItem.push(oIncentiveItem);
                this.getView().getModel("IncentiveItemModel").setProperty("/items", aIncentiveItem);
                this.getView().getModel("IncentiveItemModel").updateBindings(true);
      },
      onCalculate: function () {
        const oView = this.getView();
        const oItemModel = oView.getModel("IncentiveItemModel");
        const oSummaryModel = oView.getModel("IncentiveSummaryModel");
        const oHeaderModel = oView.getModel("IncentiveHeaderModel");
    
        let aIncentiveItem = oItemModel.getProperty("/items") || [];
        let aIncentives = oSummaryModel.getProperty("/items") || [];
    
        let totals = {
            totalOrderDelivered: 0,
            totalCdmCashReceived: 0,
            totalCdmIncentive: 0,
            totalCdmCashDeposit: 0
        };
    
        const incentiveConfig = {
            "KFG Driver 0.250": { rate: 0.250, key: "KFG_025" },
            "PT Driver 0.150": { rate: 0.150, key: "PT_015" },
            "3rd Party 0.100": { rate: 0.100, key: "TP_010" },
            "KFG Files 0.125": { rate: 0.125, key: "FILES_0125" },
            "KFG Day Off 0.500": { rate: 0.500, key: "DAYOFF_0500" },
            "Not Eligible 0.000": { rate: 0.000, key: "NE_000" }
        };
    
        let orderCounts = {
            KFG_025: 0, PT_015: 0, TP_010: 0,
            FILES_0125: 0, DAYOFF_0500: 0, NE_000: 0
        };
    
        aIncentiveItem.forEach(oItem => {
            const config = incentiveConfig[oItem.IncentiveType];
    
            const orderDelivered = Number(oItem.OrderDelivered || 0);
            const cashReceived = Number(oItem.CDMCashReceived || 0);
            let incentiveCost = 0;
    
            if (config) {
                incentiveCost = orderDelivered * config.rate;
                orderCounts[config.key] += orderDelivered;
            }
    
            oItem.CDMIncentiveCost = incentiveCost;
            oItem.CDMCashDeposit = incentiveCost + cashReceived;
    
            totals.totalOrderDelivered += orderDelivered;
            totals.totalCdmCashReceived += cashReceived;
            totals.totalCdmIncentive += incentiveCost;
            totals.totalCdmCashDeposit += oItem.CDMCashDeposit;
        });
        aIncentives.forEach(oSummary => {
            const config = incentiveConfig[oSummary.incentiveType];
            if (config) {
                oSummary.noOfOrders = orderCounts[config.key];
                if (config.rate > 0) {
                    oSummary.incentive = orderCounts[config.key] * config.rate;
                }
            }
        });
        oItemModel.setProperty("/items", aIncentiveItem);
        oItemModel.updateBindings(true);
    
        oHeaderModel.setData({
            totalOrderDelivered: totals.totalOrderDelivered,
            totalCdmCashRecieved: totals.totalCdmCashReceived,
            totalCdmIncentive: totals.totalCdmIncentive,
            totalCdmCashDeposit: totals.totalCdmCashDeposit
        });
        oHeaderModel.updateBindings(true);
    
        oSummaryModel.setProperty("/items", aIncentives);
        oSummaryModel.updateBindings(true);
    },
    
      onDeleteRow:function(oEvent){
        let aIncentiveItem = this.getModel("IncentiveItemModel").getProperty("/items") || [];
        let sPath=oEvent.getSource().getBindingContext("IncentiveItemModel").getPath()
        let pathArray=sPath.split("/");
        aIncentiveItem.splice(pathArray[(pathArray.length)-1],1);
        this.getView().getModel("IncentiveItemModel").setProperty("/items", aIncentiveItem);
        this.getView().getModel("IncentiveItemModel").updateBindings(true);
      }
    });
});