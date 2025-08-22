// Complete Field Group Validation Implementation
sap.ui.define([
    "sap/ui/core/ValueState",
    "sap/m/MessageBox"
], function (ValueState, MessageBox) {
    "use strict";

    return {
        ValidateForm: function (that, formId) {
            debugger
            var partValidation = formId !== undefined ? true : false;
            var isToSetFocusFlag = true;
            var firstInvalidControl = null;
            // Reset all validation states
            this.resetValidStates(that);
            var isInvalid = false;

            var oControls = that.getView().getControlsByFieldGroupId("fgInput");
            oControls.forEach(function (oControl) {
                debugger
                try {
                    if (partValidation && oControl.getId().indexOf(formId) === -1) {
                        return;
                    }
                    if (!this.validateControl(oControl, "fgInput")) {
                        isInvalid = this.setErrorState(oControl, that) || isInvalid;
                    }
                } catch (e) {
                    console.error("Error validating input control:", e);
                }
            }.bind(this));



        },
        validateControl: function (oControl, fieldGrpID) {
            debugger
            if (fieldGrpID === "fgInput" && typeof oControl.getValue === 'function') {
                return _validateInputControl(oControl) && oControl.getValue().length > 0
            }
            else if (fieldGrpID === "fgCombo" && typeof oControl.getSelectedKey === 'function') {
                return _validateInputControl(oControl) && oControl.getSelectedKey().length > 0
            }
            else if(fieldGrpID === "fgDate" && typeof oControl.getValue() === 'function'){
                return _validateInputControl(oControl) && oControl.getSelectedKey().length > 0
            }
        },
        _validateInputControl: function (oControl) {
            debugger
            if (!oControl.getEnabled() || !oControl.getVisible()) {
                return false;
            }
            return true;
        },
        setErrorState: function (oControl, that) {
            debugger
            if (oControl.setValueState) {
                oControl.setValueState(ValueState.Error);
 
                // Set appropriate error message
                var errorMessage = this._getErrorMessage(oControl);
                if (oControl.setValueStateText) {
                    oControl.setValueStateText(errorMessage);
                }
            }
            return true;
        },
        resetValidStates:function(that){
            var oControls = that.getView().getControlsByFieldGroupId("fgInput");
            oControls.forEach((oControl)=>{
                oControl.setValueState(ValueState.None);
            })
        }

    };
});
