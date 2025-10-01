sap.ui.define([
  "com/cy/driverincentiveui/controller/BaseController",
  "sap/ui/core/BusyIndicator",
  "sap/ui/core/library",
  "sap/m/MessageBox",
  'sap/m/MessagePopover',
  'sap/m/MessageItem',
  'sap/m/MessageToast',
  "sap/ui/core/Messaging",
  'sap/ui/core/message/Message',
  'sap/ui/core/message/MessageType',
  'sap/ui/core/Element',
  "com/cy/driverincentiveui/controller/validator",
  "sap/ui/core/Fragment"
], (BaseController, BusyIndicator, library, MessageBox, MessagePopover, MessageItem, MessageToast, Messaging, MessageType, Elementvalidator, Fragment) => {
  "use strict";
  return BaseController.extend("com.cy.driverincentiveui.controller.IncentiveDetail", {
    onInit() {
      this.getRouter().getRoute("RouteDetail").attachPatternMatched(this._onRouteDriverIncentiveDetailMatched, this);
    },
    _onRouteDriverIncentiveDetailMatched: async function (oEvent) {
      const oView = this.getView();
      oView.setModel(Messaging.getMessageModel(), "message");
      var oArguments = oEvent.getParameter("arguments");
      this._oID = oArguments.ID;
      if (this._oID != "NEW") {
        var oModel = this.getModel();
        var sPath = "/IncentiveHeader('" + this._oID + "')";
        var oContext = oModel.bindContext(sPath, undefined, { $expand: "IncentiveDetailAss,IncentiveSummaryAss" });
        var oDetail = await oContext.requestObject().then(function (oData) {
          return oData;
        })
        console.log(oDetail)
        this.getModel("LocalModel").setProperty("/enabled", oDetail.Status != "Draft" ? false : true);
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
        this.getModel("IncentiveHeaderModel").setData({ "ID": "NEW", "Status": "Draft" });
      }
      this.resetValueStates("SimpleFormChange480_12120Dual", "_IDGenTable1")
      sap.ui.getCore().getMessageManager().removeAllMessages();
      this.getModel("IncentiveHeaderModel").setProperty("/ID", this._oID);
    },

    resetValueStates: function (sFormId, sTableId) {
      // --- Reset SimpleForm controls ---
      let oForm = this.byId(sFormId);
      if (oForm) {
        oForm.getContent().forEach(oControl => {
          if (oControl.setValueState) {
            oControl.setValueState("None");
          }
        });
      }

      // --- Reset Table controls ---
      let oTable = this.byId(sTableId);
      if (oTable) {
        oTable.getItems().forEach(oItem => {
          oItem.getCells().forEach(oCell => {
            if (oCell.setValueState) {
              oCell.setValueState("None");
            }
          });
        });
      }
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
    },
    onCalculate: async function () {
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

      oHeaderModel.setProperty("/OrderDeliveredTotal", totals.totalOrderDelivered);
      oHeaderModel.setProperty("/CDMCashReceivedTotal", parseFloat(totals.totalCdmCashReceived).toFixed(2));
      oHeaderModel.setProperty("/CDMIncentiveCostTotal", parseFloat(totals.totalCdmIncentive).toFixed(2));
      oHeaderModel.setProperty("/CDMCashDepositTotal", parseFloat(totals.totalCdmCashDeposit).toFixed(2));
      oSummaryModel.setProperty("/items", aIncentives);

    },
    onDeleteRow: function (oEvent) {
      let aIncentiveItem = this.getModel("IncentiveItemModel").getProperty("/items") || [];
      let sPath = oEvent.getSource().getBindingContext("IncentiveItemModel").getPath()
      let pathArray = sPath.split("/");
      aIncentiveItem.splice(pathArray[(pathArray.length) - 1], 1);
      this.getView().getModel("IncentiveItemModel").setProperty("/items", aIncentiveItem);
    },
    onSubmit: async function (oEvent, oAction) {
      var headerModel = this.getModel("IncentiveHeaderModel").getData();
      var summary = this.getModel("IncentiveSummaryModel").getData().items
      var item = this.getModel("IncentiveItemModel").getData().items
      var oModel = this.getModel()
      var ID = headerModel.ID
      var oBindings = oModel.bindList("/IncentiveHeader", null, [], [])
      let valid = this.validateDetails(["SimpleFormChange480_12120Dual", "_IDGenTable1"])
      await this.onCalculate();
      if (item.length === 0) {
        MessageBox.warning("Add atleast one Driver Detail")
        return
      }
      if (valid) {
        var oPayload = {
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
          "Status": oAction === 'Draft' ? 'Draft' : "Submitted",
          "Eligibility": headerModel.Eligibility,
          "IncentiveDetailAss": item,
          "IncentiveSummaryAss": summary
        }

        if (ID != 'NEW') {
          var oSettings = {
            url: this.getBaseURL()+"/odata/v4/incentive/IncentiveHeader('"+ ID +"')",

            // url: "/odata/v4/incentive/IncentiveHeader('" + ID + "')",
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(oPayload)
          }
          this.ajaxCall(oSettings).then((oResponse) => {
            BusyIndicator.hide();
            if (oAction == "Draft") {
              MessageBox.success("Record saved to draft")
            } else {
              MessageBox.success("Record Submitted")
              this.sbpaCall(oResponse.ID)
              this.getModel("LocalModel").setProperty("/enabled", false)
            }
          }).catch(() => {
            MessageBox.error("Something went wrong")
          })
        } else {
          var oResult = oBindings.create(oPayload)
          oResult.created().then(() => {
            let oResponse = oResult.getObject()
            MessageBox.success("Record created Successfully")
            if (oAction == "SUBMIT") {

              this.getModel("LocalModel").setProperty("/enabled", false)
              this.sbpaCall(oResponse.ID)
            }
            this.getModel("IncentiveHeaderModel").setProperty("/ID", oResponse.ID);
            this.getModel("IncentiveHeaderModel").setProperty("/Status", oResponse.Status);
          })
        }
      }
      else {
        MessageBox.warning("Fill all required Fields");
      }
      this.getModel().refresh();
    },
    sbpaCall: function (ID) {
      const payload = {
        definitionId: "us10.javaprojects-l4nwqft8.driverincentive3.driver_incentive",
        context: {
          "ID": ID
        }
      }
      const appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");

      const appPath = appId.replaceAll(".", "/");

      const appModPath = jQuery.sap.getModulePath(appPath);
      const wfUrl = "/workflow/rest/v1/workflow-instances";
      $.ajax({
        url: appModPath+wfUrl,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(payload),
        success: function () {
          MessageBox.success("Process triggered successfully!");
        },
        error: function (err) {
          MessageBox.error("Failed to trigger process");
        }
      });

    },
    onEmployeeSearch: function (oEvent) {
      var empid = oEvent.getSource().getValue()
      oEvent.getSource().getParent().getCells()[0].setValue(oEvent.getSource().getValue());
      var sPath = "/EmployeeDetails('" + empid + "')";
      var oContext = this.getModel().bindContext(sPath, undefined);
      oContext.requestObject().
        then(function (oData) {
          oEvent.getSource().getParent().getCells()[1].setText(oData.Name);
        })
        .catch(() => {
          MessageBox.warning("Enter Valid Employee ID");
        });
    },
    onShowMessages: async function (oEvent) {
      const oSourceControl = oEvent.getSource();
      if (!this.oMessagePopover) {
        this.oDialog ??= await this.loadFragment({
          name: "com.cy.driverincentiveui.view.fragments.MessagePopOver",
          controller: this
        });
      }
      this.oDialog.openBy(oSourceControl);
    },
    validateDetails: function (controls) {
      let bValid = true;

      sap.ui.getCore().getMessageManager().removeAllMessages();

      controls.forEach((control) => {
        let oControl = (typeof control === "object") ? control : this.byId(control);
        let sType = oControl.getMetadata().getName();
        if (sType === "sap.ui.layout.form.SimpleForm") {
          let oFormElements = oControl.getContent();

          for (let i = 0; i < oFormElements.length; i++) {
            let oField = oFormElements[i];

            if (
              (oField instanceof sap.m.Input ||
                oField instanceof sap.m.ComboBox ||
                oField instanceof sap.m.DatePicker ||
                oField instanceof sap.m.Select) && oField.getRequired()
            ) {
              let sValue = oField.getValue?.() || oField.getSelectedKey?.();
              if (!sValue || sValue.trim() === "") {
                let oLabels = oField.getLabels?.();
                let oLabel = (oLabels && oLabels.length > 0)
                  ? oLabels[0].getText()
                  : "Field";
                Messaging.addMessages(new sap.ui.core.message.Message({
                  id: "StoreDetails",
                  message: oLabel + " is required",
                  type: sap.ui.core.MessageType.Error,
                  target: oField.getId(),
                  processor: this.getOwnerComponent().getModel("IncentiveHeaderModel")
                }));
                oField.setValueState(sap.ui.core.ValueState.Error);
                oField.setValueStateText(oLabel + " is required");
                bValid = false;
              } else {
                oField.setValueState(sap.ui.core.ValueState.None);
                oField.setValueStateText("");
              }
            }
          }
        }
        else if (sType === "sap.m.Table") {
          let aItems = oControl.getItems();
          aItems.forEach((oItem, rowIndex) => {
            let aCells = oItem.getCells();

            aCells.forEach((oCell, colIndex) => {
              if (
                (oCell instanceof sap.m.Input ||
                  oCell instanceof sap.m.ComboBox ||
                  oCell instanceof sap.m.DatePicker ||
                  oCell instanceof sap.m.Select) && oCell.getRequired()
              ) {
                let sValue = oCell.getValue?.() || oCell.getSelectedKey?.();

                if (!sValue || sValue.trim() === "" || sValue.trim() === "0") {
                  let colName = oControl.getColumns()[colIndex].getHeader().getText()
                  Messaging.addMessages(new sap.ui.core.message.Message({
                    id: "Driver Details",
                    message: `${colName} is required at Row ${rowIndex + 1}`,
                    type: sap.ui.core.MessageType.Error,
                    target: oCell.getId(),
                    processor: this.getOwnerComponent().getModel("IncentiveHeader")
                  }));
                  if (oCell.setValueState) {
                    oCell.setValueState(sap.ui.core.ValueState.Error);
                    oCell.setValueStateText(`This ${colName} is required`);
                  }
                  bValid = false;
                } else if (oCell.setValueState) {
                  oCell.setValueState(sap.ui.core.ValueState.None);
                  oCell.setValueStateText("");
                }
              }
            });
          });
        }
      })
      return bValid;
    },
    onActivepress: function (oEvent) {
      const oItem = oEvent.getParameter("item");

      const oContext = oItem.getBindingContext("message");
      const oMessageData = oContext.getObject();

      if (oMessageData.target) {
        const oControl = sap.ui.getCore().byId(oMessageData.target);
        if (oControl && oControl.focus) {
          oControl.focus();
        }
      }

    },
    setValueStateNone: function (oEvent) {

      let oControl = oEvent.getSource(); // the actual input control
      let oValue = oEvent.getParameter("value") || oControl.getValue?.() || oControl.getSelectedKey?.();

      if (!oValue || oValue.trim() === "") {
        oControl.setValueState("Error");
      } else {
        oControl.setValueState("None");
      }
    }


  });
});