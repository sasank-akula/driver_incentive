sap.ui.define([
  "com/cy/driverincentiveui/controller/BaseController",
  "sap/m/MessageBox"
], (BaseController,MessageBox) => {
  "use strict";
  return BaseController.extend("com.cy.driverincentiveui.controller.IncentiveDetail", {
    onInit() {
      this.getRouter().getRoute("RouteDetail").attachPatternMatched(this._onRouteDriverIncentiveDetailMatched, this);
    },
    _onRouteDriverIncentiveDetailMatched: async function (oEvent) {
      var oArguments = oEvent.getParameter("arguments");
      this._oID = oArguments.ID;
      if (this._oID != "NEW") {
        var oModel = this.getModel();
        var sPath = "/IncentiveHeader('" + this._oID + "')";
        var oContext = oModel.bindContext(sPath, undefined, { $expand: "IncentiveDetailAss,IncentiveSummaryAss" });
        var oDetail = await oContext.requestObject().then(function (oData) {
          return oData;
        })
        this.getModel("IncentiveHeaderModel").setData(oDetail)

        this.getModel("IncentiveItemModel").setProperty("/items", oDetail.IncentiveDetailAss);
       
        this.getModel("IncentiveSummaryModel").setProperty("/items", oDetail.IncentiveSummaryAss);
        
      } else {
        let aIncentives = ["KFG Driver 0.250", "PT Driver 0.150", "3rd Party 0.100", "KFG Files 0.125", "KFG Day Off 0.500", "Not Eligible 0.000"]
        let oIncentives = aIncentives.map((aIncentive) => {
          return {
            IncentiveType: aIncentive,
            NoOfOrders: 0,
            Incentive: 0
          }
        })
        this.getModel("IncentiveSummaryModel").setProperty("/items", oIncentives);
        this.getModel("IncentiveItemModel").setProperty("/items", []);
        this.getModel("IncentiveHeaderModel").setData({});
      }
      this.getModel("IncentiveHeaderModel").setProperty("/IncentiveRequestNo", this._oID);
      this.getView().getModel("IncentiveItemModel").updateBindings(true);
      this.getView().getModel("IncentiveHeaderModel").updateBindings(true);
      this.getView().getModel("IncentiveSummaryModel").updateBindings(true);
    },
    onCloseMidColumn: function () {
      this.getModel("appView").setProperty("/layout", "OneColumn")
      this.getRouter().navTo("RouteHome");
      this.getModel().refresh()
    },
    onExpandMidCoumn: function (oEvent) {
      const current = this.getModel("appView").getProperty("/layout")
      if (current === "TwoColumnsMidExpanded") {
        this.getModel("appView").setProperty("/layout", "MidColumnFullScreen")
        oEvent.getSource().setIcon("sap-icon://exit-full-screen")
      } else if (current === "MidColumnFullScreen") {
        oEvent.getSource().setIcon("sap-icon://full-screen")
        this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded")
      }
    },
    onAddDriver: function () {
      var aIncentiveItem = this.getView().getModel("IncentiveItemModel").getProperty("/items") || [];
      let oIncentiveItem = {
        EmpNo_ID: "",
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
      const oItemModel = this.getModel("IncentiveItemModel");
      const oSummaryModel = this.getModel("IncentiveSummaryModel");
      const oHeaderModel = this.getModel("IncentiveHeaderModel");

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
          incentiveCost = Number((orderDelivered * config.rate).toFixed(2));
          orderCounts[config.key] += orderDelivered;
        }

        oItem.CDMIncentiveCost = incentiveCost;
        oItem.CDMCashDeposit = incentiveCost + cashReceived;
        //header model
        totals.totalOrderDelivered += orderDelivered;
        totals.totalCdmCashReceived += cashReceived;
        totals.totalCdmIncentive += incentiveCost;
        totals.totalCdmCashDeposit += oItem.CDMCashDeposit;
      });
   
      //summary model
      aIncentives.forEach(oSummary => {
        const config = incentiveConfig[oSummary.IncentiveType];
        if (config) {
          oSummary.NoOfOrders = orderCounts[config.key];
          if (config.rate > 0) {
            oSummary.Incentive = Number((orderCounts[config.key] * config.rate).toFixed(2));
          }
        }

      });


      oItemModel.setProperty("/items", aIncentiveItem);
      oItemModel.updateBindings(true);

      oHeaderModel.setProperty("/OrderDeliveredTotal",totals.totalOrderDelivered);
      oHeaderModel.setProperty("/CDMCashReceivedTotal",totals.totalCdmCashReceived);
      oHeaderModel.setProperty("/CDMIncentiveCostTotal",totals.totalCdmIncentive);
      oHeaderModel.setProperty("/CDMCashDepositTotal",totals.totalCdmCashDeposit);
      oHeaderModel.updateBindings(true);
      oSummaryModel.setProperty("/items", aIncentives);
      oSummaryModel.updateBindings(true);
    },
    onDeleteRow: function (oEvent) {
      let aIncentiveItem = this.getModel("IncentiveItemModel").getProperty("/items") || [];
      let sPath = oEvent.getSource().getBindingContext("IncentiveItemModel").getPath()
      let pathArray = sPath.split("/");
      aIncentiveItem.splice(pathArray[(pathArray.length) - 1], 1);
      this.getView().getModel("IncentiveItemModel").setProperty("/items", aIncentiveItem);
      this.getView().getModel("IncentiveItemModel").updateBindings(true);
    },
    onSubmit: function () {
      var headerModel = this.getModel("IncentiveHeaderModel").getData();
      var summary = this.getModel("IncentiveSummaryModel").getData().items
      var item = this.getModel("IncentiveItemModel").getData().items
      var oModel = this.getModel()
      // for (var i = 0; i < item.length; i++) {
      //   delete item[i].ID;
      //   delete item[i].createdBy;
      //   delete item[i].createdAt;
      //   delete item[i].modifiedBy;
      //   delete item[i].modifiedAt;
      // }
      // for (var i = 0; i < summary.length; i++) {
      //   delete summary[i].ID;
      //   delete summary[i].createdBy;
      //   delete summary[i].createdAt;
      //   delete summary[i].modifiedBy;
      //   delete summary[i].modifiedAt;
      // }
      var oBindings = oModel.bindList("/IncentiveHeader", null, [], [])
     
      var payload={
        "Brand": headerModel.Brand,
        "Location": headerModel.Location,
        "MOD_Emp": headerModel.MOD_Emp,
        "EmployeeName": headerModel.EmployeeName,
        "DateofBusiness": headerModel.DateofBusiness,
        "LocationCode": headerModel.LocationCode,
        "OrderDeliveredTotal": headerModel.OrderDeliveredTotal,
        "CDMCashReceivedTotal": headerModel.CDMCashReceivedTotal,
        "CDMIncentiveCostTotal": headerModel.CDMIncentiveCostTotal,
        "CDMCashDepositTotal": headerModel.CDMCashDepositTotal,
        "Status": "Submitted",
        "IncentiveRequestNo": "",
        "IncentiveDetailAss": item,
        "IncentiveSummaryAss": summary
      }
      
      var oResult = oBindings.create(payload)

      oResult.created().then(() => {
        let oResponse=oResult.getObject()
        MessageBox.alert("Record created Successfully")
        this.getModel("IncentiveHeaderModel").setProperty("/IncentiveRequestNo",oResponse.ID);
        this.getModel("IncentiveHeaderModel").setProperty("/Status",oResponse.Status);
        this.getView().getModel("IncentiveHeaderModel").updateBindings(true);
        console.log(oResponse)
      })
    }
  });
});