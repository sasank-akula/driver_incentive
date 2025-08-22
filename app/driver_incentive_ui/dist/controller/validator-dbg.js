// const validate = require("@sap/cds/lib/req/validate");

sap.ui.define(["jquery.sap.global", "sap/ui/core/Control"], function (jQuery, Control) {
	"use strict";
 
	return {
        validateDraft:function(oPayload){
            if(oPayload.IncentiveDetailAss.length===0){
                debugger
                return "reject"
            }else{
                return "approve"
            }
        },
        validateSubmit: function(oPayload) {
            const isValid = (value) => {
                if (typeof value === "string") {
                    return value.trim() !== "";
                }
        
                if (Array.isArray(value)) {
                    // Check if array is non-empty and all items are valid recursively
                    return value.length > 0 && value.every(item => isValid(item));
                }
        
                if (typeof value === "object" && value !== null) {
                    // Recursively validate all fields in nested object
                    return Object.values(value).every(val => isValid(val));
                }
        
                // Other primitive types (e.g., number, boolean) are assumed valid
                return true;
            };
            return isValid(oPayload);
        },
        validateInputs:function(oView){
            return true
        }
        
    }
})