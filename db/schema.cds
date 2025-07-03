namespace com.cy.driver;

using {cuid,managed} from '@sap/cds/common';

type Eligibility : String enum {
    Yes;
    No;
};

entity IncentiveList : cuid,managed{
    email        : String;
    date         : Date;
    brand        : String;
    locationCode : String;
    location     : String;
    driver       : String;
    incentive    : Integer;
    orderCount   : Integer;
    gsCount      : Integer;
    eligibility  : Eligibility;
}