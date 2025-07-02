sap.ui.define([
    "com/cy/driverincentiveui/controller/BaseController",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
   "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
], (BaseController, Spreadsheet, exportLibrary,Filter,FilterOperator) => {
    "use strict";
    const EdmType = exportLibrary.EdmType;
    return BaseController.extend("com.cy.driverincentiveui.controller.Home", {

        onInit() {

        },
        onSearch:function(){                 
            var that = this    
            var oFilterbar = this.byId("filterbar") 
            var aFilterItems= oFilterbar.getAllFilterItems();
           var aFilters=[]
           
            aFilterItems.forEach((aFilterItem) => {
                var sPropertyName = aFilterItem.getName();
               var sValue=aFilterItem.getControl().getValue();
               if (sValue) {
                
                if (sPropertyName === 'date') {
                    // use correct '-' in split get it from debugger
                    var aDateParts = sValue.split(' - ');
                    var sStartDateString = aDateParts[0];
                    var sEndDateString = aDateParts[1];
                    var oStartDate = new Date(sStartDateString);
                    var oEndDate = new Date(sEndDateString);
                    var sFormattedStartDate = that.formatDate(oStartDate);
                    var sFormattedEndDate = that.formatDate(oEndDate);
                    var oStartDateFilter = new Filter(sPropertyName, FilterOperator.BT, sFormattedStartDate, sFormattedEndDate);
                    aFilters.push(oStartDateFilter);
                } else {
                    var oFilter = new Filter(sPropertyName, "Contains", sValue);
                    aFilters.push(oFilter);
                }
            }
            });
            var oTable = this.byId("idIncentiveTable");
                var oBinding = oTable.getBinding("items");
                // let aFilter = [new Filter({
                //     filters: aFilters,
                //     and: false
                // })]
                oBinding.filter(aFilters);
        },

        formatDate: function (date) {
            var month = '' + (date.getMonth() + 1);
            var day = '' + date.getDate();
            var year = date.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [year, month, day].join('-');
        },
        onExport: function () {
            if (!this._oTable) {
                this._oTable = this.byId("idIncentiveTable");
            }

            const oTable = this._oTable;
            const oRowBinding = oTable.getBinding("items");
            const aCols = this.createColumnConfig();
            const oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: "Level"
                },
                dataSource: oRowBinding,
                fileName: "Table export sample.xlsx",
                worker: false 
            };

            const oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        },
        createColumnConfig: function () {
            const aCols = [];

            aCols.push({
                property: "ID",
                label: "ID",
                type: EdmType.String
            });

            aCols.push({
                property: "date",
                label: "Date",
                type: EdmType.String
            });

            aCols.push({
                property: "brand",
                label: "Brand",
                type: EdmType.String
            });

            aCols.push({
                property: "locationCode",
                label: "Location Code",
                type: EdmType.String
            });

            aCols.push({
                property: "location",
                label: "Location",
                type: EdmType.String
            });

            aCols.push({
                property: "driver",
                label: "Driver",
                type: EdmType.String
            });

            aCols.push({
                property: "incentive",
                label: "Incentive",
                type: EdmType.Number,
                scale: 2,
                delimiter: true
            });

            aCols.push({
                property: "orderCount",
                label: "Order Count",
                type: EdmType.Number,
                scale: 0
            });

            aCols.push({
                property: "gsCount",
                label: "GS Count",
                type: EdmType.Number,
                scale: 0
            });

            aCols.push({
                property: "eligibility",
                label: "Eligibility",
                type: EdmType.String
            });

            return aCols;
        }

    });
});