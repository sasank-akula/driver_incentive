namespace com.cy.driver;

using {
    cuid,
    managed
} from '@sap/cds/common';

entity IncentiveHeader : cuid {
    Brand                 : String(20);
    Location              : String(20);
    MOD_Emp               : String(20);
    EmployeeName          : String(30);
    DateofBusiness        : Date;
    LocationCode          : String(20);
    OrderDeliveredTotal   : Integer;
    CDMCashReceivedTotal  : Decimal(10, 2);
    CDMIncentiveCostTotal : Decimal(10, 2);
    CDMCashDepositTotal   : Decimal(10, 2);
    Status                : String enum {
        Draft;
        Submitted;
        Approved_by_manager;
        Approved_by_finance;
        Rejected_by_manager;
        Rejected_by_finance;
    };
    Eligibility           : String enum {
        Yes;
        No;
    };
    IncentiveDetailAss    : Composition of many IncentiveDetails
                                on IncentiveDetailAss.header = $self;
    IncentiveSummaryAss   : Composition of many IncentiveSummary
                                on IncentiveSummaryAss.header = $self;
}

entity IncentiveDetails : cuid {
    EmpNo            : Association to EmployeeDetails;
    EmpName          : String(20);
    GSEmp            : String;
    IncentiveType    : String(20);
    OrderDelivered   : Integer;
    CDMCashReceived  : Decimal(10, 2);
    CDMIncentiveCost : Decimal(10, 2);
    CDMCashDeposit   : Decimal(10, 2);
    header           : Association to IncentiveHeader;
}

entity IncentiveSummary : cuid, managed {
    IncentiveType : String(20);
    NoOfOrders    : Integer;
    Incentive     : Decimal(10, 2);
    header        : Association to IncentiveHeader;
}

entity EmployeeDetails : cuid, managed {
    Name        : String(20);
    Email       : String;
    Phone       : String;
    Address     : String;
    DOB         : Date;
    DOJ         : Date;
    Status      : String enum {
        Active;
        Resigned;
    };
    Designation : String enum {
        Driver;
        Manager;
        Admin;
    };
    ManagerID   : Association to EmployeeDetails;
}

entity Brand {
    key Name : String;
        Text : String;
}

entity Location {
    key Name : String;
        Text : String;
}

entity IncentiveType {
    key Name : String;
        Text : String;
}
