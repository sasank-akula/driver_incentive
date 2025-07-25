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
        validateSubmit:function(oPayload){
            Object.entries(oPayload).forEach(([key, value]) => {
                
              debugger
            });
            
        }
    }
})